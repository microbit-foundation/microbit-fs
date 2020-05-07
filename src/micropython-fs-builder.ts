/**
 * Builds and reads a micro:bit MicroPython File System from Intel Hex data.
 *
 * Follows this implementation:
 * https://github.com/bbcmicrobit/micropython/blob/v1.0.1/source/microbit/filesystem.c
 *
 * How it works:
 * The File system size is calculated based on the UICR data addded to the
 * MicroPython final hex to determine the limits of the filesystem space.
 * Based on how many space there is available it calculates how many free
 * chunks it can fit, each chunk being of CHUNK_LEN size in bytes.
 * There is one spare page which holds persistent configuration data that is
 * used by MicroPython for bulk erasing, so we also mark it as such here.
 *
 * Each chunk is enumerated with an index number. The first chunk starts with
 * index 1 (as value 0 is reserved to indicate a Freed chunk) at the bottom of
 * the File System (lowest address), and the indexes increase sequentially.
 * Each chunk consists of a one byte marker at the head and a one tail byte.
 * The byte at the tail is a pointer to the next chunk index.
 * The head byte marker is either one of the values in the ChunkMarker enum, to
 * indicate the a special type of chunk, or a pointer to the previous chunk
 * index.
 * The special markers indicate whether the chunk is the start of a file, if it
 * is Unused, if it is Freed (same as unused, but not yet erased) or if this
 * is the start of a flash page used for Persistent Data (bulk erase operation).
 *
 * A file consists of a double linked list of chunks. The first chunk in a
 * file, indicated by the FileStart marker, contains the data end offset for
 * the last chunk and the file name.
 *
 * (c) 2019 Micro:bit Educational Foundation and the microbit-fs contributors.
 * SPDX-License-Identifier: MIT
 */
import MemoryMap from 'nrf-intel-hex';

import { bytesToStr, concatUint8Array, strToBytes } from './common';
import { AppendedBlock, isAppendedScriptPresent } from './micropython-appended';
import { getHexMapUicrData } from './uicr';

const enum ChunkMarker {
  Freed = 0,
  PersistentData = 0xfd,
  FileStart = 0xfe,
  Unused = 0xff,
}

const enum ChunkFormatIndex {
  Marker = 0,
  EndOffset = 1,
  NameLength = 2,
  Tail = 127,
}

/** Sizes for the different parts of the file system chunks. */
const CHUNK_LEN = 128;
const CHUNK_MARKER_LEN = 1;
const CHUNK_TAIL_LEN = 1;
const CHUNK_DATA_LEN = CHUNK_LEN - CHUNK_MARKER_LEN - CHUNK_TAIL_LEN;
const CHUNK_HEADER_END_OFFSET_LEN = 1;
const CHUNK_HEADER_NAME_LEN = 1;

const MAX_FILENAME_LENGTH = 120;

/** Flash values for the micro:bit nRF microcontroller. */
const FLASH_PAGE_SIZE = 1024;
const FLASH_END = 0x40000;

/** Size of pages with specific functions. */
const CALIBRATION_PAGE_SIZE = FLASH_PAGE_SIZE;

/**
 * Scans the file system area inside the Intel Hex data a returns a list of
 * available chunks.
 *
 * @param intelHexMap - Memory map for the MicroPython Intel Hex.
 * @returns List of all unused chunks.
 */
function getFreeChunks(intelHexMap: MemoryMap): number[] {
  const freeChunks: number[] = [];
  const startAddress: number = getStartAddress(intelHexMap);
  const endAddress: number = getLastPageAddress(intelHexMap);
  let chunkAddr = startAddress;
  let chunkIndex = 1;
  while (chunkAddr < endAddress) {
    const marker = intelHexMap.slicePad(chunkAddr, 1, ChunkMarker.Unused)[0];
    if (marker === ChunkMarker.Unused || marker === ChunkMarker.Freed) {
      freeChunks.push(chunkIndex);
    }
    chunkIndex++;
    chunkAddr += CHUNK_LEN;
  }
  return freeChunks;
}

/**
 * Calculates from the input Intel Hex where the MicroPython runtime ends and
 * return that as the start of the filesystem area.
 *
 * @param intelHexMap - Memory map for the MicroPython Intel Hex.
 * @returns Filesystem start address
 */
function getStartAddress(intelHexMap: MemoryMap): number {
  const uicrData = getHexMapUicrData(intelHexMap);
  const startAddress = uicrData.runtimeEndAddress;
  // Ensure the start address aligns with the page size
  if (startAddress % FLASH_PAGE_SIZE) {
    throw new Error(
      'File system start address from UICR does not align with flash page size.'
    );
  }
  return startAddress;
}

/**
 * Calculates the end address for the filesystem.
 *
 * Start from the end of flash, or from the top of appended script if
 * one is included in the Intel Hex data.
 * Then move one page up as it is used for the magnetometer calibration data.
 *
 * @param intelHexMap - Memory map for the MicroPython Intel Hex.
 * @returns End address for the filesystem.
 */
function getEndAddress(intelHexMap: MemoryMap): number {
  let endAddress = FLASH_END;
  if (isAppendedScriptPresent(intelHexMap)) {
    endAddress = AppendedBlock.StartAdd;
  }
  return endAddress - CALIBRATION_PAGE_SIZE;
}

/**
 * Calculates the address for the last page available to the filesystem.
 *
 * @param intelHexMap - Memory map for the MicroPython Intel Hex.
 * @returns Memory address where the last filesystem page starts.
 */
function getLastPageAddress(intelHexMap: MemoryMap): number {
  return getEndAddress(intelHexMap) - FLASH_PAGE_SIZE;
}

/**
 * If not present already, it sets the persistent page in flash.
 *
 * This page can be located right below right on top or below the filesystem
 * space.
 *
 * @param intelHexMap - Memory map for the MicroPython Intel Hex.
 */
function setPersistentPage(intelHexMap: MemoryMap): void {
  // TODO: This could be the first or the last page. Check first if it exists,
  // if it doesn't then randomise its location.
  intelHexMap.set(
    getLastPageAddress(intelHexMap),
    new Uint8Array([ChunkMarker.PersistentData])
  );
}

/**
 * Calculate the flash memory address from the chunk index.
 *
 * @param intelHexMap - Memory map for the MicroPython Intel Hex.
 * @param chunkIndex - Index for the chunk to calculate.
 * @returns Address in flash for the chunk.
 */
function chuckIndexAddress(intelHexMap: MemoryMap, chunkIndex: number): number {
  // Chunk index starts at 1, so we need to account for that in the calculation
  return getStartAddress(intelHexMap) + (chunkIndex - 1) * CHUNK_LEN;
}

/**
 * Class to contain file data and generate its MicroPython filesystem
 * representation.
 */
class FsFile {
  private _filename: string;
  private _filenameBytes: Uint8Array;
  private _dataBytes: Uint8Array;
  private _fsDataBytes: Uint8Array;

  /**
   * Create a file.
   *
   * @param filename - Name for the file.
   * @param data - Byte array with the file data.
   */
  constructor(filename: string, data: Uint8Array) {
    this._filename = filename;
    this._filenameBytes = strToBytes(filename);
    if (this._filenameBytes.length > MAX_FILENAME_LENGTH) {
      throw new Error(
        `File name "${filename}" is too long ` +
          `(max ${MAX_FILENAME_LENGTH} characters).`
      );
    }
    this._dataBytes = data;
    // Generate a single byte array with the filesystem data bytes.
    // When MicroPython uses up to the last byte of the last chunk it will
    // still consume the next chunk, and leave it blank
    // To replicate the same behaviour we add an extra 0xFF to the data block
    const fileHeader = this._generateFileHeaderBytes();
    this._fsDataBytes = new Uint8Array(
      fileHeader.length + this._dataBytes.length + 1
    );
    this._fsDataBytes.set(fileHeader, 0);
    this._fsDataBytes.set(this._dataBytes, fileHeader.length);
    this._fsDataBytes[this._fsDataBytes.length - 1] = 0xff;
  }

  /**
   * Generate an array of file system chunks for all this file content.
   *
   * @throws {Error} When there are not enough chunks available.
   *
   * @param freeChunks - List of available chunks to use.
   * @returns An array of byte arrays, one item per chunk.
   */
  getFsChunks(freeChunks: number[]): Uint8Array[] {
    // Now form the chunks
    const chunks = [];
    let freeChunksIndex = 0;
    let dataIndex = 0;
    // Prepare first chunk where the marker indicates a file start
    let chunk = new Uint8Array(CHUNK_LEN).fill(0xff);
    chunk[ChunkFormatIndex.Marker] = ChunkMarker.FileStart;
    let loopEnd = Math.min(this._fsDataBytes.length, CHUNK_DATA_LEN);
    for (let i = 0; i < loopEnd; i++, dataIndex++) {
      chunk[CHUNK_MARKER_LEN + i] = this._fsDataBytes[dataIndex];
    }
    chunks.push(chunk);

    // The rest of the chunks follow the same pattern
    while (dataIndex < this._fsDataBytes.length) {
      freeChunksIndex++;
      if (freeChunksIndex >= freeChunks.length) {
        throw new Error(`Not enough space for the ${this._filename} file.`);
      }
      // The previous chunk has to be followed by this one, so add this index
      const previousChunk = chunks[chunks.length - 1];
      previousChunk[ChunkFormatIndex.Tail] = freeChunks[freeChunksIndex];

      chunk = new Uint8Array(CHUNK_LEN).fill(0xff);
      // This chunk Marker points to the previous chunk
      chunk[ChunkFormatIndex.Marker] = freeChunks[freeChunksIndex - 1];
      // Add the data to this chunk
      loopEnd = Math.min(this._fsDataBytes.length - dataIndex, CHUNK_DATA_LEN);
      for (let i = 0; i < loopEnd; i++, dataIndex++) {
        chunk[CHUNK_MARKER_LEN + i] = this._fsDataBytes[dataIndex];
      }
      chunks.push(chunk);
    }
    return chunks;
  }

  /**
   * Generate a single byte array with the filesystem data for this file.
   *
   * @param freeChunks - List of available chunks to use.
   * @returns A byte array with the data to go straight into flash.
   */
  getFsBytes(freeChunks: number[]): Uint8Array {
    const chunks = this.getFsChunks(freeChunks);
    const chunksLen = chunks.length * CHUNK_LEN;
    const fileFsBytes = new Uint8Array(chunksLen);
    for (let i = 0; i < chunks.length; i++) {
      fileFsBytes.set(chunks[i], CHUNK_LEN * i);
    }
    return fileFsBytes;
  }

  /**
   * @returns Size, in bytes, of how much space the file takes in the filesystem
   *     flash memory.
   */
  getFsFileSize(): number {
    const chunksUsed = Math.ceil(this._fsDataBytes.length / CHUNK_DATA_LEN);
    return chunksUsed * CHUNK_LEN;
  }

  /**
   * Generates a byte array for the file header as expected by the MicroPython
   * file system.
   *
   * @return Byte array with the header data.
   */
  private _generateFileHeaderBytes(): Uint8Array {
    const headerSize =
      CHUNK_HEADER_END_OFFSET_LEN +
      CHUNK_HEADER_NAME_LEN +
      this._filenameBytes.length;
    const endOffset = (headerSize + this._dataBytes.length) % CHUNK_DATA_LEN;
    const fileNameOffset: number = headerSize - this._filenameBytes.length;
    // Format header byte array
    const headerBytes: Uint8Array = new Uint8Array(headerSize);
    headerBytes[ChunkFormatIndex.EndOffset - 1] = endOffset;
    headerBytes[ChunkFormatIndex.NameLength - 1] = this._filenameBytes.length;
    for (let i = fileNameOffset; i < headerSize; ++i) {
      headerBytes[i] = this._filenameBytes[i - fileNameOffset];
    }
    return headerBytes;
  }
}

/**
 * @returns Size, in bytes, of how much space the file would take in the
 *     MicroPython filesystem.
 */
function calculateFileSize(filename: string, data: Uint8Array): number {
  const file = new FsFile(filename, data);
  return file.getFsFileSize();
}

/**
 * Adds a byte array as a file to a MicroPython Memory Map.
 *
 * @throws {Error} When the invalid file name is given.
 * @throws {Error} When the the file doesn't have any data.
 * @throws {Error} When there are issues calculating the file system boundaries.
 * @throws {Error} When there is no space left for the file.
 *
 * @param intelHexMap - Memory map for the MicroPython Intel Hex.
 * @param filename - Name for the file.
 * @param data - Byte array for the file data.
 * @returns MicroPython Memory map with the file in the filesystem.
 */
function addMemMapFile(
  intelHexMap: MemoryMap,
  filename: string,
  data: Uint8Array
): MemoryMap {
  if (!filename) throw new Error('File has to have a file name.');
  if (!data.length) throw new Error(`File ${filename} has to contain data.`);

  const freeChunks = getFreeChunks(intelHexMap);
  if (freeChunks.length === 0) {
    throw new Error('There is no storage space left.');
  }
  const chunksStartAddress = chuckIndexAddress(intelHexMap, freeChunks[0]);
  // Create a file, generate and inject filesystem data.
  const fsFile = new FsFile(filename, data);
  const fileFsBytes = fsFile.getFsBytes(freeChunks);
  intelHexMap.set(chunksStartAddress, fileFsBytes);
  setPersistentPage(intelHexMap);
  return intelHexMap;
}

/**
 * Adds a byte array as a file in the MicroPython filesystem.
 *
 * @throws {Error} When the invalid file name is given.
 * @throws {Error} When the the file doesn't have any data.
 * @throws {Error} When there are issues calculating the file system boundaries.
 * @throws {Error} When there is no space left for the file.
 *
 * @param intelHex - MicroPython Intel Hex string.
 * @param filename - Name for the file.
 * @param data - Byte array for the file data.
 * @returns MicroPython Intel Hex string with the file in the filesystem.
 */
function addIntelHexFile(
  intelHex: string,
  filename: string,
  data: Uint8Array
): string {
  // filename and data checked in addMemMapFile
  let intelHexMap: MemoryMap = MemoryMap.fromHex(intelHex);
  intelHexMap = addMemMapFile(intelHexMap, filename, data);
  return intelHexMap.asHexString() + '\n';
}

/**
 * Adds a hash table of filenames and byte arrays as files to the MicroPython
 * filesystem.
 *
 * @throws {Error} When the an invalid file name is given.
 * @throws {Error} When the a file doesn't have any data.
 * @throws {Error} When there are issues calculating the file system boundaries.
 * @throws {Error} When there is no space left for a file.
 *
 * @param intelHex - MicroPython Intel Hex string.
 * @param files - Hash table with filenames as the key and byte arrays as the
 *     value.
 * @returns MicroPython Intel Hex string with the file in the filesystem.
 */
function addIntelHexFiles(
  intelHex: string,
  files: { [filename: string]: Uint8Array },
  returnBytes: boolean = false
): string | Uint8Array {
  let intelHexMap: MemoryMap = MemoryMap.fromHex(intelHex);
  Object.keys(files).forEach((filename) => {
    intelHexMap = addMemMapFile(intelHexMap, filename, files[filename]);
  });
  return returnBytes
    ? intelHexMap.slicePad(0, FLASH_END)
    : intelHexMap.asHexString() + '\n';
}

/**
 * Reads the filesystem included in a MicroPython Intel Hex string.
 *
 * @throws {Error} When multiple files with the same name encountered.
 * @throws {Error} When a file chunk points to an unused chunk.
 * @throws {Error} When a file chunk marker does not point to previous chunk.
 * @throws {Error} When following through the chunks linked list iterates
 *     through more chunks and used chunks (sign of an infinite loop).
 *
 * @param intelHex - The MicroPython Intel Hex string to read from.
 * @returns Dictionary with the filename as key and byte array as values.
 */
function getIntelHexFiles(
  intelHex: string
): { [filename: string]: Uint8Array } {
  const hexMap: MemoryMap = MemoryMap.fromHex(intelHex);
  const startAddress: number = getStartAddress(hexMap);
  const endAddress: number = getLastPageAddress(hexMap);

  // TODO: endAddress as the getLastPageAddress works now because this
  // library uses the last page as the "persistent" page, so the filesystem does
  // end there. In reality, the persistent page could be the first or the last
  // page, so we should get the end address as the magnetometer page and then
  // check if the persistent marker is present in the first of last page and
  // take that into account in the memory range calculation.
  // Note that the persistent marker is only present at the top of the page

  // Iterate through the filesystem to collect used chunks and file starts
  const usedChunks: { [index: number]: Uint8Array } = {};
  const startChunkIndexes: number[] = [];
  let chunkAddr = startAddress;
  let chunkIndex = 1;
  while (chunkAddr < endAddress) {
    const chunk = hexMap.slicePad(chunkAddr, CHUNK_LEN, ChunkMarker.Unused);
    const marker = chunk[0];
    if (
      marker !== ChunkMarker.Unused &&
      marker !== ChunkMarker.Freed &&
      marker !== ChunkMarker.PersistentData
    ) {
      usedChunks[chunkIndex] = chunk;
      if (marker === ChunkMarker.FileStart) {
        startChunkIndexes.push(chunkIndex);
      }
    }
    chunkIndex++;
    chunkAddr += CHUNK_LEN;
  }

  // Go through the list of file-starts, follow the file chunks and collect data
  const files: { [filename: string]: Uint8Array } = {};
  for (const startChunkIndex of startChunkIndexes) {
    const startChunk = usedChunks[startChunkIndex];
    const endChunkOffset = startChunk[ChunkFormatIndex.EndOffset];
    const filenameLen = startChunk[ChunkFormatIndex.NameLength];
    // 1st byte is the marker, 2nd is the offset, 3rd is the filename length
    let chunkDataStart = 3 + filenameLen;
    const filename = bytesToStr(startChunk.slice(3, chunkDataStart));
    if (files.hasOwnProperty(filename)) {
      throw new Error(`Found multiple files named: ${filename}.`);
    }
    files[filename] = new Uint8Array(0);
    let currentChunk = startChunk;
    let currentIndex = startChunkIndex;
    // Chunks are basically a double linked list, so invalid data could create
    // an infinite loop. No file should traverse more chunks than available.
    let iterations = Object.keys(usedChunks).length + 1;
    while (iterations--) {
      const nextIndex = currentChunk[ChunkFormatIndex.Tail];
      if (nextIndex === ChunkMarker.Unused) {
        // The current chunk is the last
        files[filename] = concatUint8Array(
          files[filename],
          currentChunk.slice(chunkDataStart, 1 + endChunkOffset)
        );
        break;
      } else {
        files[filename] = concatUint8Array(
          files[filename],
          currentChunk.slice(chunkDataStart, ChunkFormatIndex.Tail)
        );
      }
      const nextChunk = usedChunks[nextIndex];
      if (!nextChunk) {
        throw new Error(
          `Chunk ${currentIndex} points to unused index ${nextIndex}.`
        );
      }
      if (nextChunk[ChunkFormatIndex.Marker] !== currentIndex) {
        throw new Error(
          `Chunk index ${nextIndex} did not link to previous chunk index ${currentIndex}.`
        );
      }
      currentChunk = nextChunk;
      currentIndex = nextIndex;
      // Start chunk data has a unique start, all others start after marker
      chunkDataStart = 1;
    }
    if (iterations <= 0) {
      // We iterated through chunks more often than available chunks
      throw new Error('Malformed file chunks did not link correctly.');
    }
  }

  return files;
}

/**
 * Calculate the MicroPython filesystem size.
 *
 * @param intelHex - The MicroPython Intel Hex string.
 * @returns Size of the filesystem in bytes.
 */
function getIntelHexFsSize(intelHex: string): number {
  const intelHexMap: MemoryMap = MemoryMap.fromHex(intelHex);
  const startAddress: number = getStartAddress(intelHexMap);
  const endAddress = getEndAddress(intelHexMap);
  // One extra page is used as persistent page
  return endAddress - startAddress - FLASH_PAGE_SIZE;
}

export {
  addIntelHexFile,
  addIntelHexFiles,
  calculateFileSize,
  getIntelHexFiles,
  getIntelHexFsSize,
};

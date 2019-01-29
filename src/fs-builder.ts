import MemoryMap from 'nrf-intel-hex';

import { isAppendedScriptPresent, UserCodeBlock } from './appended-script';
import { bytesToStr, cleanseOldHexFormat, strToBytes } from './common';

const enum ChunkMarker {
  Freed = 0,
  PersistentData = 253,
  FileStart = 254,
  Unused = 255,
}

const enum ChunkSizes {
  All = 128,
  Marker = 1,
  Tail = 1,
  EndOffset = 1,
  NameLength = 1,
  Data = All - Marker - Tail,
}

const enum ChunkFormatIndex {
  Marker = 0,
  EndOffset = 1,
  NameLength = 2,
  Tail = ChunkSizes.All - 1,
}

/** Flash values for the micro:bit nRF microcontroller. */
const FLASH_PAGE_SIZE = 1024;
const FLASH_END = 0x40000;

/** Size of pages with specific functions. */
const CALIBRATION_PAGE_SIZE = FLASH_PAGE_SIZE;

// ----------------------------------------------------------------------------
// Temporary maintained state pointing to the next available chunk.
// TODO: Remove once nextAvailableChunk() is updated.
// Chosen by fair dice roll, guaranteed to be random.
const FS_START_CHUNK = 0x01;
let FS_NEXT_AVAILABLE_CHUNK = FS_START_CHUNK;

function fsIncreaseChunkIndex(numberOfChunks: number): void {
  FS_NEXT_AVAILABLE_CHUNK += numberOfChunks;
  const unusedMap: MemoryMap = new MemoryMap();
  // Check if we are over the filesystem area
  if (
    chuckIndexAddress(unusedMap, FS_NEXT_AVAILABLE_CHUNK) >=
    getEndAddress(unusedMap)
  ) {
    throw new Error('There is no more space in the file system.');
  }
}

function resetFileSystem(): void {
  FS_NEXT_AVAILABLE_CHUNK = FS_START_CHUNK;
}

// Massive hack! Use temporarily for predictable start point for tests.
// Will need to regenerate test data for other initial chunks
export function testResetFileSystem(): void {
  FS_NEXT_AVAILABLE_CHUNK = 0x2b;
}
// ----------------------------------------------------------------------------

/**
 * Navigate through the Intel Hex memory map scanning through the file system
 * and finding the next available chunk.
 *
 * TODO: Update to scan input hex.
 *
 * @param intelHexMap - Memory map for the MicroPython Intel Hex.
 * @returns Next available filesystem chunk.
 */
function nextAvailableChunk(intelHexMap: object): number {
  // TODO: Check if we have run out of memory.
  return FS_NEXT_AVAILABLE_CHUNK;
}

/**
 * Calculates from the input Intel Hex where the MicroPython runtime ends and
 * return that as the start of the filesystem area.
 *
 * TODO: Actually calculate this.
 *
 * @param intelHexMap - Memory map for the MicroPython Intel Hex.
 * @returns Filesystem start address
 */
function getStartAddress(intelHexMap: object): number {
  // TODO: For this first implementation the start address is manually
  // calculated and written down here.
  return 0x38c00;
}

/**
 * Calculates the end address for the filesystem.
 *
 * Start from the end of flash or from the top of appended script if
 * one is included in the Intel Hex data.
 * Then one page is used at the end of this space for the magnetometer
 * calibration data, and one page by the filesystem as the persistent page.
 *
 * @param intelHexMap - Memory map for the MicroPython Intel Hex.
 * @returns End address for the filesystem.
 */
function getEndAddress(intelHexMap: object): number {
  let endAddress = FLASH_END;
  // TODO: isAppendedScriptPresent is not yet implemented
  if (isAppendedScriptPresent(intelHexMap)) {
    endAddress = UserCodeBlock.StartAdd;
  }
  return endAddress - CALIBRATION_PAGE_SIZE;
}

/**
 * Calculates the address for the last page available to the filesystem.
 *
 * @param intelHexMap - Memory map for the MicroPython Intel Hex.
 * @returns Memory address where the last filesystem page starts.
 */
function getLastPageAddress(intelHexMap: object): number {
  return getEndAddress(intelHexMap) - FLASH_PAGE_SIZE;
}

/**
 * Get the start address for the persistent page in flash.
 *
 * This page is located right below the end of the filesystem space.
 *
 * @param intelHexMap - Memory map for the MicroPython Intel Hex.
 * @returns Start address for the filesystem persistent page.
 */
function getPersistentPageAddress(intelHexMap: object): number {
  // TODO: This could be the first or the last page. Randomise if it doesn't
  // exists.
  return getLastPageAddress(intelHexMap);
}

/**
 * Calculate the flash memory address from the chunk index.
 *
 * @param intelHexMap - Memory map for the MicroPython Intel Hex.
 * @param chunkIndex - Index for the chunk to calculate.
 * @returns Address in flash for the chunk.
 */
function chuckIndexAddress(intelHexMap: object, chunkIndex: number): number {
  // Chunk index starts at 1, so we need to account for that in the calculation
  return getStartAddress(intelHexMap) + (chunkIndex - 1) * ChunkSizes.All;
}

/** Contain file data and create its filesystem representation. */
class FsFile {
  private _filename: string;
  private _dataBytes: Uint8Array;
  private _fsDataBytes: Uint8Array;

  constructor(filename: string, data: Uint8Array) {
    this._filename = filename;
    this._dataBytes = data;
    // Generate a single byte array with the filesystem data bytes.
    const fileHeader = this.generateFileHeaderBytes();
    this._fsDataBytes = new Uint8Array(
      fileHeader.length + this._dataBytes.length
    );
    this._fsDataBytes.set(fileHeader, 0);
    this._fsDataBytes.set(this._dataBytes, fileHeader.length);
  }

  /**
   * Generates a byte array for the file header as expected by the MicroPython
   * file system.
   *
   * @return Byte array with the header data.
   */
  generateFileHeaderBytes(): Uint8Array {
    const headerSize: number =
      ChunkSizes.EndOffset + ChunkSizes.NameLength + this._filename.length;
    const endOffset: number =
      (headerSize + this._dataBytes.length) % ChunkSizes.Data;
    const fileNameOffset: number = headerSize - this._filename.length;
    // Format header byte array
    const headerBytes: Uint8Array = new Uint8Array(headerSize);
    headerBytes[ChunkFormatIndex.EndOffset - 1] = endOffset;
    headerBytes[ChunkFormatIndex.NameLength - 1] = this._filename.length;
    for (let i = fileNameOffset; i < headerSize; ++i) {
      // TODO: use strToBytes instead
      headerBytes[i] = this._filename.charCodeAt(i - fileNameOffset);
    }
    return headerBytes;
  }

  /**
   * Takes a file name and a byte array of data to add to the file system, and
   * converts it into an array of file system chunks, each a byte array.
   *
   * @param chunkIndex - Index of the first chunk where this data will be
   *     store.
   * @returns An array of byte arrays, one item per chunk.
   */
  getFsChunks(chunkIndex: number): Uint8Array[] {
    // Now form the chunks
    const chunks = [];
    let dataIndex = 0;
    // First case is an exception, where the marker indicates file start
    let chunk = new Uint8Array(ChunkSizes.All).fill(0xff);
    chunk[ChunkFormatIndex.Marker] = ChunkMarker.FileStart;
    let loopEnd = Math.min(this._fsDataBytes.length, ChunkSizes.Data);
    for (let i = 0; i < loopEnd; i++, dataIndex++) {
      chunk[ChunkSizes.Marker + i] = this._fsDataBytes[dataIndex];
    }
    chunks.push(chunk);

    // The rest follow the same pattern
    while (dataIndex < this._fsDataBytes.length) {
      chunk = new Uint8Array(ChunkSizes.All).fill(0xff);
      // This chunk points to the previous, increase index for this chunk
      chunk[ChunkFormatIndex.Marker] = chunkIndex++;
      // At each loop iteration we know the previous chunk has to be
      // followed by this one, so add this index to the previous
      // chunk "next chunk" field at the tail
      chunks[chunks.length - 1][ChunkFormatIndex.Tail] = chunkIndex;
      // Add the data to this chunk
      loopEnd = Math.min(this._fsDataBytes.length - dataIndex, ChunkSizes.Data);
      for (let i = 0; i < loopEnd; i++, dataIndex++) {
        chunk[ChunkSizes.Marker + i] = this._fsDataBytes[dataIndex];
      }
      chunks.push(chunk);
    }
    return chunks;
  }

  getFsBytes(chunkIndex: number): Uint8Array {
    const chunks = this.getFsChunks(chunkIndex);
    // TODO: remove the need to do this
    fsIncreaseChunkIndex(chunks.length);

    const chunksLen = chunks.length * ChunkSizes.All;
    const fileFsBytes = new Uint8Array(chunksLen);
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < chunks.length; i++) {
      fileFsBytes.set(chunks[i], ChunkSizes.All * i);
    }
    return fileFsBytes;
  }
}

/**
 * Adds a byte array as a file in the MicroPython filesystem.
 *
 * @param intelHex - MicroPython Intel Hex string.
 * @param filename - Name for the file.
 * @param data - Byte array for the file data.
 * @returns MicroPython Intel Hex string with the file in the filesystem.
 */
function addFileToIntelHex(
  intelHex: string,
  filename: string,
  data: Uint8Array
): string {
  if (!filename) throw new Error('File has to have a file name.');
  if (!data.length) throw new Error('File has to contain data.');

  const intelHexClean = cleanseOldHexFormat(intelHex);
  const intelHexMap: MemoryMap = MemoryMap.fromHex(intelHexClean);
  // Find next available chunk and its flash address
  const chunkIndex = nextAvailableChunk(intelHexMap);
  const startAddress = chuckIndexAddress(intelHexMap, chunkIndex);
  // Create a file, generate and inject filesystem data.
  const fsFile = new FsFile(filename, data);
  const fileFsBytes = fsFile.getFsBytes(chunkIndex);
  intelHexMap.set(startAddress, fileFsBytes);
  // Ensure persistent page marker is present
  intelHexMap.set(
    getPersistentPageAddress(intelHexMap),
    new Uint8Array([ChunkMarker.PersistentData])
  );
  return intelHexMap.asHexString() + '\n';
}

export { resetFileSystem, addFileToIntelHex };

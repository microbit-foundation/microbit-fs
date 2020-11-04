/**
 * Filesystem management for MicroPython hex files.
 *
 * (c) 2019 Micro:bit Educational Foundation and the microbit-fs contributors.
 * SPDX-License-Identifier: MIT
 */
import { FsInterface } from './fs-interface';
import {
  MpFsBuilderCache,
  createMpFsBuilderCache,
  generateHexWithFiles,
  addIntelHexFiles,
  calculateFileSize,
  getIntelHexFiles,
} from './micropython-fs-builder';
import { SimpleFile } from './simple-file';

interface MpFsBuilderCacheWithId extends MpFsBuilderCache {
  boardId: number;
}

export interface IntelHexWithId {
  hex: string;
  boardId: number;
}

/**
 * Manage filesystem files in one or multiple MicroPython hex files.
 *
 * @public
 */
export class MicropythonFsHex implements FsInterface {
  private _uPyFsBuilderCache: MpFsBuilderCacheWithId[] = [];
  private _files: { [id: string]: SimpleFile } = {};
  private _storageSize: number = 0;

  /**
   * File System manager constructor.
   *
   * At the moment it needs a MicroPython hex string without files included.
   * Multiple MicroPython images can be provided to generate a Universal Hex.
   *
   * @param intelHex - MicroPython Intel Hex string or an array of Intel Hex
   *    strings with their respective board IDs.
   */
  constructor(
    intelHex: string | IntelHexWithId[],
    { maxFsSize = 0 }: { maxFsSize?: number } = {}
  ) {
    const hexWithIdArray: IntelHexWithId[] = Array.isArray(intelHex)
      ? intelHex
      : [
          {
            hex: intelHex,
            boardId: 0x0000,
          },
        ];

    // Generate and store the MicroPython Builder caches
    let minFsSize = Infinity;
    hexWithIdArray.forEach((hexWithId) => {
      if (!hexWithId.hex) {
        throw new Error('Invalid MicroPython hex.');
      }
      const builderCache = createMpFsBuilderCache(hexWithId.hex);
      const thisBuilderCache: MpFsBuilderCacheWithId = {
        originalIntelHex: builderCache.originalIntelHex,
        originalMemMap: builderCache.originalMemMap,
        uPyEndAddress: builderCache.uPyEndAddress,
        uPyIntelHex: builderCache.uPyIntelHex,
        fsSize: builderCache.fsSize,
        boardId: hexWithId.boardId,
      };
      this._uPyFsBuilderCache.push(thisBuilderCache);
      minFsSize = Math.min(minFsSize, thisBuilderCache.fsSize);
    });
    this.setStorageSize(maxFsSize || minFsSize);

    // Check if there are files in any of the input hex
    this._uPyFsBuilderCache.forEach((builderCache) => {
      const hexFiles = getIntelHexFiles(builderCache.originalMemMap);
      if (Object.keys(hexFiles).length) {
        throw new Error(
          'There are files in the MicropythonFsHex constructor hex file input.'
        );
      }
    });
  }

  /**
   * Create a new file and add it to the file system.
   *
   * @throws {Error} When the file already exists.
   * @throws {Error} When an invalid filename is provided.
   * @throws {Error} When invalid file data is provided.
   *
   * @param filename - Name for the file.
   * @param content - File content to write.
   */
  create(filename: string, content: string | Uint8Array): void {
    if (this.exists(filename)) {
      throw new Error('File already exists.');
    }
    this.write(filename, content);
  }

  /**
   * Write a file into the file system. Overwrites a previous file with the
   * same name.
   *
   * @throws {Error} When an invalid filename is provided.
   * @throws {Error} When invalid file data is provided.
   *
   * @param filename - Name for the file.
   * @param content - File content to write.
   */
  write(filename: string, content: string | Uint8Array): void {
    this._files[filename] = new SimpleFile(filename, content);
  }

  append(filename: string, content: string): void {
    if (!filename) {
      throw new Error('Invalid filename.');
    }
    if (!this.exists(filename)) {
      throw new Error(`File "${filename}" does not exist.`);
    }
    // TODO: Implement this.
    throw new Error('Append operation not yet implemented.');
  }

  /**
   * Read the text from a file.
   *
   * @throws {Error} When invalid file name is provided.
   * @throws {Error} When file is not in the file system.
   *
   * @param filename - Name of the file to read.
   * @returns Text from the file.
   */
  read(filename: string): string {
    if (!filename) {
      throw new Error('Invalid filename.');
    }
    if (!this.exists(filename)) {
      throw new Error(`File "${filename}" does not exist.`);
    }
    return this._files[filename].getText();
  }

  /**
   * Read the bytes from a file.
   *
   * @throws {Error} When invalid file name is provided.
   * @throws {Error} When file is not in the file system.
   *
   * @param filename - Name of the file to read.
   * @returns Byte array from the file.
   */
  readBytes(filename: string): Uint8Array {
    if (!filename) {
      throw new Error('Invalid filename.');
    }
    if (!this.exists(filename)) {
      throw new Error(`File "${filename}" does not exist.`);
    }
    return this._files[filename].getBytes();
  }

  /**
   * Delete a file from the file system.
   *
   * @throws {Error} When invalid file name is provided.
   * @throws {Error} When the file doesn't exist.
   *
   * @param filename - Name of the file to delete.
   */
  remove(filename: string): void {
    if (!filename) {
      throw new Error('Invalid filename.');
    }
    if (!this.exists(filename)) {
      throw new Error(`File "${filename}" does not exist.`);
    }
    delete this._files[filename];
  }

  /**
   * Check if a file is already present in the file system.
   *
   * @param filename - Name for the file to check.
   * @returns True if it exists, false otherwise.
   */
  exists(filename: string): boolean {
    return this._files.hasOwnProperty(filename);
  }

  /**
   * Returns the size of a file in bytes.
   *
   * @throws {Error} When invalid file name is provided.
   * @throws {Error} When the file doesn't exist.
   *
   * @param filename - Name for the file to check.
   * @returns Size file size in bytes.
   */
  size(filename: string): number {
    if (!filename) {
      throw new Error(`Invalid filename: ${filename}`);
    }
    if (!this.exists(filename)) {
      throw new Error(`File "${filename}" does not exist.`);
    }
    return calculateFileSize(
      this._files[filename].filename,
      this._files[filename].getBytes()
    );
  }

  /**
   * @returns A list all the files in the file system.
   */
  ls(): string[] {
    const files: string[] = [];
    Object.values(this._files).forEach((value) => files.push(value.filename));
    return files;
  }

  /**
   * Sets a storage size limit. Must be smaller than available space in
   * MicroPython.
   *
   * @param {number} size - Size in bytes for the filesystem.
   */
  setStorageSize(size: number): void {
    let minFsSize = Infinity;
    this._uPyFsBuilderCache.forEach((builderCache) => {
      minFsSize = Math.min(minFsSize, builderCache.fsSize);
    });

    if (size > minFsSize) {
      throw new Error(
        'Storage size limit provided is larger than size available in the MicroPython hex.'
      );
    }
    this._storageSize = size;
  }

  /**
   * The available filesystem total size either calculated by the MicroPython
   * hex or the max storage size limit has been set.
   *
   * @returns Size of the filesystem in bytes.
   */
  getStorageSize(): number {
    return this._storageSize;
  }

  /**
   * @returns The total number of bytes currently used by files in the file system.
   */
  getStorageUsed(): number {
    return Object.values(this._files).reduce(
      (accumulator, current) => accumulator + this.size(current.filename),
      0
    );
  }

  /**
   * @returns The remaining storage of the file system in bytes.
   */
  getStorageRemaining(): number {
    return this.getStorageSize() - this.getStorageUsed();
  }

  /**
   * Read the files included in a MicroPython hex string and add them to this
   * instance.
   *
   * @throws {Error} When there are no files to import in the hex.
   * @throws {Error} When there is a problem reading the files from the hex.
   * @throws {Error} When a filename already exists in this instance (all other
   *     files are still imported).
   *
   * @param intelHex - MicroPython hex string with files.
   * @param overwrite - Flag to overwrite existing files in this instance.
   * @param formatFirst - Erase all the previous files before importing. It only
   *     erases the files after there are no error during hex file parsing.
   * @returns A filename list of added files.
   */
  importFilesFromIntelHex(
    intelHex: string,
    {
      overwrite = false,
      formatFirst = false,
    }: { overwrite?: boolean; formatFirst?: boolean } = {}
  ): string[] {
    const files = getIntelHexFiles(intelHex);
    if (!Object.keys(files).length) {
      throw new Error('Hex does not have any files to import');
    }

    if (formatFirst) {
      this._files = {};
    }
    const existingFiles: string[] = [];
    Object.keys(files).forEach((filename) => {
      if (!overwrite && this.exists(filename)) {
        existingFiles.push(filename);
      } else {
        this.write(filename, files[filename]);
      }
    });
    // Only throw the error at the end so that all other files are imported
    if (existingFiles.length) {
      throw new Error(`Files "${existingFiles}" from hex already exists.`);
    }
    return Object.keys(files);
  }

  /**
   * Generate a new copy of the MicroPython Intel Hex with the files in the
   * filesystem included.
   *
   * @throws {Error} When a file doesn't have any data.
   * @throws {Error} When there are issues calculating file system boundaries.
   * @throws {Error} When there is no space left for a file.
   *
   * @returns A new string with MicroPython and the filesystem included.
   */
  getIntelHex(boardId?: number): string {
    if (this.getStorageRemaining() < 0) {
      throw new Error('There is no storage space left.');
    }
    const files: { [filename: string]: Uint8Array } = {};
    Object.values(this._files).forEach((file) => {
      files[file.filename] = file.getBytes();
    });

    if (boardId === undefined) {
      if (this._uPyFsBuilderCache.length === 1) {
        return generateHexWithFiles(this._uPyFsBuilderCache[0], files);
      } else {
        throw new Error(
          'The Board ID must be specified if there are multiple MicroPythons.'
        );
      }
    }

    for (const builderCache of this._uPyFsBuilderCache) {
      if (builderCache.boardId === boardId) {
        return generateHexWithFiles(builderCache, files);
      }
    }
    // If we reach this point we could not find the board ID
    throw new Error('Board ID requested not found.');
  }

  /**
   * Generate a byte array of the MicroPython and filesystem data.
   *
   * @throws {Error} When a file doesn't have any data.
   * @throws {Error} When there are issues calculating file system boundaries.
   * @throws {Error} When there is no space left for a file.
   *
   * @returns A Uint8Array with MicroPython and the filesystem included.
   */
  getIntelHexBytes(boardId?: number): Uint8Array {
    if (this.getStorageRemaining() < 0) {
      throw new Error('There is no storage space left.');
    }
    const files: { [filename: string]: Uint8Array } = {};
    Object.values(this._files).forEach((file) => {
      files[file.filename] = file.getBytes();
    });

    if (boardId === undefined) {
      if (this._uPyFsBuilderCache.length === 1) {
        return addIntelHexFiles(
          this._uPyFsBuilderCache[0].originalMemMap,
          files,
          true
        ) as Uint8Array;
      } else {
        throw new Error(
          'The Board ID must be specified if there are multiple MicroPythons.'
        );
      }
    }
    for (const builderCache of this._uPyFsBuilderCache) {
      if (builderCache.boardId === boardId) {
        return addIntelHexFiles(
          builderCache.originalMemMap,
          files,
          true
        ) as Uint8Array;
      }
    }
    // If we reach this point we could not find the board ID
    throw new Error('Board ID requested not found.');
  }
}

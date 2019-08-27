/** Manage files in a MicroPython hex file. */
import { FsInterface } from './fs-interface';
import {
  addIntelHexFiles,
  calculateFileSize,
  getIntelHexFiles,
  getIntelHexFsSize,
} from './micropython-fs-builder';
import { SimpleFile } from './simple-file';

export class MicropythonFsHex implements FsInterface {
  private _intelHex: string;
  private _files: { [id: string]: SimpleFile } = {};

  /**
   * File System manager constructor.
   * At the moment it needs a MicroPython hex string without a files included.
   *
   * TODO: If files are already in input hex file, deal with them somehow.
   *
   * @param intelHex - MicroPython Intel Hex string.
   */
  constructor(intelHex: string) {
    this._intelHex = intelHex;
    this.importFilesFromIntelHex(this._intelHex);
    if (this.ls().length) {
      throw new Error(
        'There are files in the MicropythonFsHex constructor hex file input.'
      );
    }
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
      throw new Error('Invalid filename.');
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
   * Calculate the MicroPython filesystem total size.
   *
   * @returns Size of the filesystem in bytes.
   */
  getStorageSize(): number {
    return getIntelHexFsSize(this._intelHex);
  }

  /**
   * @returns The total number of bytes currently used by files in the file system.
   */
  getStorageUsed(): number {
    let total: number = 0;
    Object.values(this._files).forEach(
      (value) => (total += this.size(value.filename))
    );
    return total;
  }

  /**
   * @returns The remaining storage of the file system in bytes.
   */
  getStorageRemaining(): number {
    let total: number = 0;
    const capacity: number = this.getStorageSize();
    Object.values(this._files).forEach(
      (value) => (total += this.size(value.filename))
    );
    return capacity - total;
  }

  /**
   * Read the files included in a MicroPython hex string and add them to this
   * instance.
   *
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
    if (formatFirst) {
      delete this._files;
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
   * Generate a new copy of the MicroPython Intel Hex with the filesystem
   * included.
   *
   * @throws {Error} When a file doesn't have any data.
   * @throws {Error} When there are issues calculating file system boundaries.
   * @throws {Error} When there is no space left for a file.
   *
   * @param intelHex - Optionally provide a different Intel Hex to include the
   *    filesystem into.
   * @returns A new string with MicroPython and the filesystem included.
   */
  getIntelHex(intelHex?: string): string {
    const finalHex = intelHex || this._intelHex;
    const files: { [filename: string]: Uint8Array } = {};
    Object.values(this._files).forEach((file) => {
      files[file.filename] = file.getBytes();
    });
    return addIntelHexFiles(finalHex, files) as string;
  }

  /**
   * Generate a byte array of the MicroPython and filesystem data.
   *
   * @throws {Error} When a file doesn't have any data.
   * @throws {Error} When there are issues calculating file system boundaries.
   * @throws {Error} When there is no space left for a file.
   *
   * @param intelHex - Optionally provide a different Intel Hex to include the
   *    filesystem into.
   * @returns A Uint8Array with MicroPython and the filesystem included.
   */
  getIntelHexBytes(intelHex?: string): Uint8Array {
    const finalHex = intelHex || this._intelHex;
    const files: { [filename: string]: Uint8Array } = {};
    Object.values(this._files).forEach((file) => {
      files[file.filename] = file.getBytes();
    });
    return addIntelHexFiles(finalHex, files, true) as Uint8Array;
  }
}

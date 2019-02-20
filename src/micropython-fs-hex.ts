/** Manage files in a MicroPython hex file. */
import { FsInterface } from './fs-interface';
import { addIntelHexFile, getIntelHexFiles } from './micropython-fs-builder';
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
   * @returns A list all the files in the file system.
   */
  ls(): string[] {
    const files: string[] = [];
    Object.values(this._files).forEach((value) => files.push(value.filename));
    return files;
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
    overwrite?: boolean,
    formatFirst?: boolean
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
   * @throws {Error} When the file doesn't have any data.
   * @throws {Error} When there are issues calculating file system boundaries.
   * @throws {Error} When there is no space left for the file.
   *
   * @param intelHex - Optionally provide a different Intel Hex to include the
   *    filesystem into.
   * @returns A new Intel Hex string with the filesystem included.
   */
  getIntelHex(intelHex?: string): string {
    let finalHex = intelHex || this._intelHex;
    Object.values(this._files).forEach((file) => {
      finalHex = addIntelHexFile(finalHex, file.filename, file.getBytes());
    });
    return finalHex;
  }
}

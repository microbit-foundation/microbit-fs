/** Manage files in a MicroPython hex file. */
import { addFileToIntelHex } from './fs-builder';
import { FsInterface } from './fs-interface';
import { SimpleFile } from './simple-file';

export class FileSystem implements FsInterface {
  private _intelHex: string;
  private _files: { [id: string]: SimpleFile } = {};

  /**
   * File System manager constructor.
   *
   * @param intelHex - MicroPython Intel Hex string.
   */
  constructor(intelHex: string) {
    this._intelHex = intelHex;
    // TODO: Read present file system in Intel Hex and populate files here
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

  addFilesFromIntelHex(intelHex: string): void {
    // TODO: Implement this.
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
      finalHex = addFileToIntelHex(finalHex, file.filename, file.getBytes());
    });
    return finalHex;
  }
}

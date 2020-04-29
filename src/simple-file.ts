/**
 * Class to represent a very simple file.
 *
 * (c) 2019 Micro:bit Educational Foundation and the microbit-fs contributors.
 * SPDX-License-Identifier: MIT
 */
import { bytesToStr, strToBytes } from './common';

export class SimpleFile {
  filename: string;
  private _dataBytes: Uint8Array;

  /**
   * Create a SimpleFile.
   *
   * @throws {Error} When an invalid filename is provided.
   * @throws {Error} When invalid file data is provided.
   *
   * @param filename - Name for the file.
   * @param data - String or byte array with the file data.
   */
  constructor(filename: string, data: string | Uint8Array) {
    if (!filename) {
      throw new Error('File was not provided a valid filename.');
    }
    if (!data) {
      throw new Error(`File ${filename} does not have valid content.`);
    }
    this.filename = filename;
    if (typeof data === 'string') {
      this._dataBytes = strToBytes(data);
    } else if (data instanceof Uint8Array) {
      this._dataBytes = data;
    } else {
      throw new Error('File data type must be a string or Uint8Array.');
    }
  }

  getText(): string {
    return bytesToStr(this._dataBytes);
  }

  getBytes(): Uint8Array {
    return this._dataBytes;
  }
}

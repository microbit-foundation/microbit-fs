import { bytesToStr, strToBytes } from './common';

export class SimpleFile {
  filename: string;
  private _dataBytes: Uint8Array;

  constructor(filename: string, data: string | Uint8Array) {
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

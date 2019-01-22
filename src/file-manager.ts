import { bytesToStr, strToBytes } from './common';
import { addFileToIntelHex } from './fs-builder';

interface FsInterface {
  write(filename: string, content: string): void;
  append(filename: string, content: string): void;
  read(filename: string): string;
  readBytes(filename: string): Uint8Array;
  remove(filename: string): void;
  exists(filename: string): boolean;
  ls(): string[];
}

class SimpleFile {
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

// TODO: Max filename size
// tslint:disable-next-line:max-classes-per-file
class FileSystem implements FsInterface {
  private _intelHex: string;
  private _files: { [id: string]: SimpleFile } = {};

  constructor(intelHex: string) {
    this._intelHex = intelHex;

    // TODO: Read present file system in Intel Hex and populate files here
  }

  write(filename: string, content: string | Uint8Array): void {
    this._files[filename] = new SimpleFile(filename, content);
  }

  append(filename: string, content: string): void {
    // TODO: Append content to existing file
    // TODO: Do we throw error if file does not exists, or create it?
    // tslint:disable-next-line:no-console
    console.log('append() method unimplemented.');
  }

  read(filename: string): string {
    // TODO: Own error message when file does not exists
    return this._files[filename].getText();
  }

  readBytes(filename: string): Uint8Array {
    // TODO: Own error message when file does not exists
    return this._files[filename].getBytes();
  }

  remove(filename: string): void {
    // TODO: Check if file exists first
    delete this._files[filename];
  }

  exists(filename: string): boolean {
    return this._files.hasOwnProperty(filename);
  }

  ls(): string[] {
    const files: string[] = [];
    Object.values(this._files).forEach((value) => files.push(value.filename));
    return files;
  }

  getIntelHex(): string {
    let finalHex = this._intelHex;
    Object.values(this._files).forEach((file) => {
      finalHex = addFileToIntelHex(finalHex, file.filename, file.getBytes());
    });
    return finalHex;
  }
}

export { FileSystem };

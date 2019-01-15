import { bytesToStr, strToBytes } from './common';

interface FsInterface {
  create(filename: string, content?: string): void;
  write(filename: string, content: string): void;
  append(filename: string, content: string): void;
  read(filename: string): string;
  readBytes(filename: string): Uint8Array;
  remove(filename: string): void;
  ls(): string[];
}

class SimpleFile {
  filename: string;
  data: Uint8Array;

  constructor(filename: string, data: string | Uint8Array) {
    this.filename = filename;
    if (typeof data === 'string') {
      this.data = strToBytes(data);
    } else {
      this.data = data;
    }
  }

  getText(): string {
    return bytesToStr(this.data);
  }

  getBytes(): Uint8Array {
    return this.data;
  }
}

// tslint:disable-next-line:max-classes-per-file
class FileSystem implements FsInterface {
  private _intelHex: string;
  private _files: { [id: string]: SimpleFile } = {};

  constructor(intelHex: string) {
    this._intelHex = intelHex;
  }

  create(filename: string, content?: string): void {
    // TODO: Create an empty file, with optional content
    // TODO: Throw error if file already exists
    // tslint:disable-next-line:no-console
    console.log('create() method unimplemented.');
  }

  write(filename: string, content: string | Uint8Array): void {
    this._files[filename] = new SimpleFile(filename, content);
  }

  append(filename: string, content: string): void {
    // TODO: Append content to existing file
    // TODO: Throw error if file does not exists
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

  ls(): string[] {
    const files: string[] = [];
    Object.values(this._files).forEach((value) => files.push(value.filename));
    return files;
  }

  getIntelHex(): string {
    // TODO: Generate filesystem and inject into Intel Hex string
    return this._intelHex;
  }
}

export { FileSystem };

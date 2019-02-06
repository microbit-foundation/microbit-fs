import { addFileToIntelHex } from './fs-builder';
import { FsInterface } from './fs-interface';
import { SimpleFile } from './simple-file';

export class FileSystem implements FsInterface {
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

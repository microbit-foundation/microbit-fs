/**
 * An interface to define multiple types of file systems.
 *
 * (c) 2019 Micro:bit Educational Foundation and the microbit-fs contributors.
 * SPDX-License-Identifier: MIT
 */
export interface FsInterface {
  write(filename: string, content: string): void;
  append(filename: string, content: string): void;
  read(filename: string): string;
  readBytes(filename: string): Uint8Array;
  remove(filename: string): void;
  exists(filename: string): boolean;
  size(filename: string): number;
  ls(): string[];
}

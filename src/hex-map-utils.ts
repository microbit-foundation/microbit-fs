/**
 * Utilities for retrieving data from MemoryMap instances from the nrf-intel-hex
 * library.
 */
import MemoryMap from 'nrf-intel-hex';

import { bytesToStr } from './common';

/**
 * Reads a 64 bit little endian number from an Intel Hex memory map.
 *
 * Any missing data in that address range that is not contained inside the
 * MemoryMap is filled with 0xFF.
 *
 * @param intelHexMap - Memory map of the Intel Hex data.
 * @param address - Start address of the 32 bit number.
 * @returns Number with the unsigned integer representation of those 8 bytes.
 */
export function getUint64(intelHexMap: MemoryMap, address: number): number {
  const uint64Data: Uint8Array = intelHexMap.slicePad(address, 8, 0xff);
  // Typed arrays use the native endianness, force little endian with DataView
  return new DataView(uint64Data.buffer).getUint32(0, true /* little endian */);
}

/**
 * Reads a 32 bit little endian number from an Intel Hex memory map.
 *
 * Any missing data in that address range that is not contained inside the
 * MemoryMap is filled with 0xFF.
 *
 * @param intelHexMap - Memory map of the Intel Hex data.
 * @param address - Start address of the 32 bit number.
 * @returns Number with the unsigned integer representation of those 4 bytes.
 */
export function getUint32(intelHexMap: MemoryMap, address: number): number {
  const uint32Data: Uint8Array = intelHexMap.slicePad(address, 4, 0xff);
  // Typed arrays use the native endianness, force little endian with DataView
  return new DataView(uint32Data.buffer).getUint32(0, true /* little endian */);
}

/**
 * Reads a 16 bit little endian number from an Intel Hex memory map.
 *
 * Any missing data in that address range that is not contained inside the
 * MemoryMap is filled with 0xFF.
 *
 * @param intelHexMap - Memory map of the Intel Hex data.
 * @param address - Start address of the 16 bit number.
 * @returns Number with the unsigned integer representation of those 2 bytes.
 */
export function getUint16(intelHexMap: MemoryMap, address: number): number {
  const uint16Data: Uint8Array = intelHexMap.slicePad(address, 2, 0xff);
  // Typed arrays use the native endianness, force little endian with DataView
  return new DataView(uint16Data.buffer).getUint16(0, true /* little endian */);
}

/**
 * Reads a 8 bit number from an Intel Hex memory map.
 *
 * If the data is not contained inside the MemoryMap it returns 0xFF.
 *
 * @param intelHexMap - Memory map of the Intel Hex data.
 * @param address - Start address of the 16 bit number.
 * @returns Number with the unsigned integer representation of those 2 bytes.
 */
export function getUint8(intelHexMap: MemoryMap, address: number): number {
  const uint16Data: Uint8Array = intelHexMap.slicePad(address, 1, 0xff);
  return uint16Data[0];
}

/**
 * Decodes a UTF-8 null terminated string stored in the Intel Hex data at
 * the indicated address.
 *
 * @param intelHexMap - Memory map of the Intel Hex data.
 * @param address - Start address for the string.
 * @returns String read from the Intel Hex data.
 */
export function getString(intelHexMap: MemoryMap, address: number): string {
  const memBlock = intelHexMap.slice(address).get(address);
  let iStrEnd = 0;
  while (iStrEnd < memBlock.length && memBlock[iStrEnd] !== 0) iStrEnd++;
  if (iStrEnd === memBlock.length) {
    // Could not find a null character to indicate the end of the string
    return '';
  }
  const stringBytes = memBlock.slice(0, iStrEnd);
  return bytesToStr(stringBytes);
}

/**
 * Interprets the data stored in the UICR memory space.
 *
 * For more info:
 * https://microbit-micropython.readthedocs.io/en/latest/devguide/hexformat.html
 *
 * (c) 2019 Micro:bit Educational Foundation and the microbit-fs contributors.
 * SPDX-License-Identifier: MIT
 */
import MemoryMap from 'nrf-intel-hex';

import { bytesToStr } from './common';

const UICR_START: number = 0x10001000;
const UICR_CUSTOMER_OFFSET: number = 0x80;
const UICR_CUSTOMER_UPY_OFFSET: number = 0x40;
const UICR_UPY_START: number =
  UICR_START + UICR_CUSTOMER_OFFSET + UICR_CUSTOMER_UPY_OFFSET;

const UPY_MAGIC_HEADER: number = 0x17eeb07c;
const UPY_DELIMITER: number = 0xffffffff;

const UPY_MAGIC_LEN: number = 4;
const UPY_END_MARKER_LEN: number = 4;
const UPY_PAGE_SIZE_LEN: number = 4;
const UPY_START_PAGE_LEN: number = 2;
const UPY_PAGES_USED_LEN: number = 2;
const UPY_DELIMITER_LEN: number = 4;
const UPY_VERSION_LEN: number = 4;

/** UICR Customer area addresses for MicroPython specific data. */
enum MicropythonUicrAddress {
  MagicValue = UICR_UPY_START,
  EndMarker = MagicValue + UPY_MAGIC_LEN,
  PageSize = EndMarker + UPY_END_MARKER_LEN,
  StartPage = PageSize + UPY_PAGE_SIZE_LEN,
  PagesUsed = StartPage + UPY_START_PAGE_LEN,
  Delimiter = PagesUsed + UPY_PAGES_USED_LEN,
  VersionLocation = Delimiter + UPY_DELIMITER_LEN,
  End = VersionLocation + UPY_VERSION_LEN,
}

/** MicroPython data stored in the UICR Customer area. */
interface MicropythonUicrData {
  flashPageSize: number;
  runtimeStartPage: number;
  runtimeStartAddress: number;
  runtimeEndUsed: number;
  runtimeEndAddress: number;
  versionAddress: number;
  version: string;
}

/**
 * Reads a 32 bit little endian number from an Intel Hex memory map.
 *
 * @param intelHexMap - Memory map of the Intel Hex data.
 * @param address - Start address of the 32 bit number.
 * @returns Number with the unsigned integer representation of those 4 bytes.
 */
function getUint32FromIntelHexMap(
  intelHexMap: MemoryMap,
  address: number
): number {
  const uint32Data: Uint8Array = intelHexMap.slicePad(address, 4, 0xff);
  // Typed arrays use the native endianness, force little endian with DataView
  return new DataView(uint32Data.buffer).getUint32(0, true /* little endian */);
}

/**
 * Reads a 16 bit little endian number from an Intel Hex memory map.
 *
 * @param intelHexMap - Memory map of the Intel Hex data.
 * @param address - Start address of the 16 bit number.
 * @returns Number with the unsigned integer representation of those 2 bytes.
 */
function getUint16FromIntelHexMap(
  intelHexMap: MemoryMap,
  address: number
): number {
  const uint16Data: Uint8Array = intelHexMap.slicePad(address, 2, 0xff);
  // Typed arrays use the native endianness, force little endian with DataView
  return new DataView(uint16Data.buffer).getUint16(0, true /* little endian */);
}

/**
 * Decodes a UTF-8 null terminated string stored in the Intel Hex data at
 * the indicated address.
 *
 * @param intelHexMap - Memory map of the Intel Hex data.
 * @param address - Start address for the string.
 * @returns String read from the Intel Hex data.
 */
function getStringFromIntelHexMap(
  intelHexMap: MemoryMap,
  address: number
): string {
  const memBlock = intelHexMap.slice(address).get(address);
  let i = 0;
  for (i = 0; i < memBlock.length && memBlock[i] !== 0; i++);
  if (i === memBlock.length) {
    // Could not find a null character to indicate the end of the string
    return '';
  }
  const stringBytes = memBlock.slice(0, i);
  return bytesToStr(stringBytes);
}

/**
 * Check if the magic number for the MicroPython UICR data is present in the
 * Intel Hex memory map.
 *
 * @param intelHexMap - Memory map of the Intel Hex data.
 * @return True if the magic number matches, false otherwise.
 */
function confirmMagicValue(intelHexMap: MemoryMap): boolean {
  const readMagicHeader: number = getUint32FromIntelHexMap(
    intelHexMap,
    MicropythonUicrAddress.MagicValue
  );
  return readMagicHeader === UPY_MAGIC_HEADER;
}

/**
 * Reads the UICR data that contains the flash page size.
 *
 * @param intelHexMap - Memory map of the Intel Hex data.
 * @returns The size of each flash page size.
 */
function getPageSize(intelHexMap: MemoryMap): number {
  const pageSize: number = getUint32FromIntelHexMap(
    intelHexMap,
    MicropythonUicrAddress.PageSize
  );
  // Page size is stored as a log base 2
  return Math.pow(2, pageSize);
}

/**
 * Reads the UICR data that contains the start page of the MicroPython runtime.
 *
 * @param intelHexMap - Memory map of the Intel Hex data.
 * @returns The start page number of the MicroPython runtime.
 */
function getStartPage(intelHexMap: MemoryMap): number {
  return getUint16FromIntelHexMap(
    intelHexMap,
    MicropythonUicrAddress.StartPage
  );
}

/**
 * Reads the UICR data that contains the address of the location in flash where
 * the MicroPython version is stored.
 *
 * @param intelHexMap - Memory map of the Intel Hex data.
 * @returns The address of the location in flash where the MicroPython version
 * is stored.
 */
function getPagesUsed(intelHexMap: MemoryMap): number {
  return getUint16FromIntelHexMap(
    intelHexMap,
    MicropythonUicrAddress.PagesUsed
  );
}

/**
 * Reads the UICR data that contains the number of flash pages used by the
 * MicroPython runtime.
 *
 * @param intelHexMap - Memory map of the Intel Hex data.
 * @returns The number of pages used by the MicroPython runtime.
 */
function getVersionLocation(intelHexMap: MemoryMap): number {
  return getUint32FromIntelHexMap(
    intelHexMap,
    MicropythonUicrAddress.VersionLocation
  );
}

/**
 * Reads the UICR data from an Intel Hex map and retrieves the MicroPython data.
 *
 * @throws {Error} When the Magic Header is not present.
 *
 * @param intelHexMap - Memory map of the Intel Hex data.
 * @returns Object with the decoded UICR MicroPython data.
 */
function getHexMapUicrData(intelHexMap: MemoryMap): MicropythonUicrData {
  const uicrMap = intelHexMap.slice(UICR_UPY_START);
  if (!confirmMagicValue(uicrMap)) {
    throw new Error('Could not find valid MicroPython UICR data.');
  }
  const pageSize: number = getPageSize(uicrMap);
  const startPage: number = getStartPage(uicrMap);
  const pagesUsed: number = getPagesUsed(uicrMap);
  const versionAddress: number = getVersionLocation(uicrMap);
  const version: string = getStringFromIntelHexMap(intelHexMap, versionAddress);

  return {
    flashPageSize: pageSize,
    runtimeStartPage: startPage,
    runtimeStartAddress: startPage * pageSize,
    runtimeEndUsed: pagesUsed,
    runtimeEndAddress: pagesUsed * pageSize,
    versionAddress,
    version,
  };
}

/**
 * Reads the UICR data from an Intel Hex string and retrieves the MicroPython
 * data.
 *
 * @throws {Error} When the Magic Header is not present.
 *
 * @param intelHex - MicroPython Intel Hex string.
 * @returns Object with the decoded UICR MicroPython data.
 */
function getIntelHexUicrData(intelHex: string): MicropythonUicrData {
  return getHexMapUicrData(MemoryMap.fromHex(intelHex));
}

export { MicropythonUicrData, getHexMapUicrData, getIntelHexUicrData };

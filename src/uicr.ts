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

import * as hexMapUtil from './hex-map-utils';

const DEVICE_INFO = [
  {
    deviceVersion: 1,
    magicHeader: 0x17eeb07c,
    flashSize: 0x40000,
  },
  {
    deviceVersion: 2,
    magicHeader: 0x47eeb07c,
    flashSize: 0x80000,
  },
];

const UICR_START: number = 0x10001000;
const UICR_CUSTOMER_OFFSET: number = 0x80;
const UICR_CUSTOMER_UPY_OFFSET: number = 0x40;
const UICR_UPY_START: number =
  UICR_START + UICR_CUSTOMER_OFFSET + UICR_CUSTOMER_UPY_OFFSET;

const UPY_DELIMITER: number = 0xffffffff;
const UPY_REGIONS_TERMINATOR: number = 0x00000000;

const UPY_MAGIC_LEN: number = 4;
const UPY_END_MARKER_LEN: number = 4;
const UPY_PAGE_SIZE_LEN: number = 4;
const UPY_START_PAGE_LEN: number = 2;
const UPY_PAGES_USED_LEN: number = 2;
const UPY_DELIMITER_LEN: number = 4;
const UPY_VERSION_LEN: number = 4;
const UPY_REGIONS_TERMINATOR_LEN: number = 4;

/** UICR Customer area addresses for MicroPython specific data. */
enum MicropythonUicrAddress {
  MagicValue = UICR_UPY_START,
  EndMarker = MagicValue + UPY_MAGIC_LEN,
  PageSize = EndMarker + UPY_END_MARKER_LEN,
  StartPage = PageSize + UPY_PAGE_SIZE_LEN,
  PagesUsed = StartPage + UPY_START_PAGE_LEN,
  Delimiter = PagesUsed + UPY_PAGES_USED_LEN,
  VersionLocation = Delimiter + UPY_DELIMITER_LEN,
  RegionsTerminator = VersionLocation + UPY_REGIONS_TERMINATOR_LEN,
  End = RegionsTerminator + UPY_VERSION_LEN,
}

/** MicroPython data stored in the UICR Customer area. */
interface MicropythonUicrData {
  flashPageSize: number;
  flashSize: number;
  runtimeStartPage: number;
  runtimeStartAddress: number;
  runtimeEndUsed: number;
  runtimeEndAddress: number;
  uicrStartAddress: number;
  uicrEndAddress: number;
  versionAddress: number;
  version: string;
  deviceVersion: number;
}

/**
 * Check if the magic number for the MicroPython UICR data is present in the
 * Intel Hex memory map.
 *
 * @param intelHexMap - Memory map of the Intel Hex data.
 * @return True if the magic number matches, false otherwise.
 */
function confirmMagicValue(intelHexMap: MemoryMap): boolean {
  const readMagicHeader = getMagicValue(intelHexMap);
  for (const device of DEVICE_INFO) {
    if (device.magicHeader === readMagicHeader) {
      return true;
    }
  }
  return false;
}

/**
 * Reads the UICR data that contains the Magic Value that indicates the
 * MicroPython presence in the hex data.
 *
 * @param intelHexMap - Memory map of the Intel Hex data.
 * @returns The Magic Value from UICR.
 */
function getMagicValue(intelHexMap: MemoryMap): number {
  return hexMapUtil.getUint32(intelHexMap, MicropythonUicrAddress.MagicValue);
}

/**
 * Reads the UICR data from an Intel Hex map and detects the device version.
 *
 * @param intelHexMap - Memory map of the Intel Hex data.
 * @returns The micro:bit board version.
 */
function getDeviceVersion(intelHexMap: MemoryMap): number {
  const readMagicHeader = getMagicValue(intelHexMap);
  for (const device of DEVICE_INFO) {
    if (device.magicHeader === readMagicHeader) {
      return device.deviceVersion;
    }
  }
  throw new Error('Cannot find device version, unknown UICR Magic value');
}

/**
 * Reads the UICR data from an Intel Hex map and retrieves the flash size.
 *
 * @param intelHexMap - Memory map of the Intel Hex data.
 * @returns The micro:bit flash size.
 */
function getFlashSize(intelHexMap: MemoryMap): number {
  const readMagicHeader = getMagicValue(intelHexMap);
  for (const device of DEVICE_INFO) {
    if (device.magicHeader === readMagicHeader) {
      return device.flashSize;
    }
  }
  throw new Error('Cannot find flash size, unknown UICR Magic value');
}

/**
 * Reads the UICR data that contains the flash page size.
 *
 * @param intelHexMap - Memory map of the Intel Hex data.
 * @returns The size of each flash page size.
 */
function getPageSize(intelHexMap: MemoryMap): number {
  const pageSize: number = hexMapUtil.getUint32(
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
  return hexMapUtil.getUint16(intelHexMap, MicropythonUicrAddress.StartPage);
}

/**
 * Reads the UICR data that contains the number of flash pages used by the
 * MicroPython runtime.
 *
 * @param intelHexMap - Memory map of the Intel Hex data.
 * @returns The number of pages used by the MicroPython runtime.
 */
function getPagesUsed(intelHexMap: MemoryMap): number {
  return hexMapUtil.getUint16(intelHexMap, MicropythonUicrAddress.PagesUsed);
}

/**
 * Reads the UICR data that contains the address of the location in flash where
 * the MicroPython version is stored.
 *
 * @param intelHexMap - Memory map of the Intel Hex data.
 * @returns The address of the location in flash where the MicroPython version
 * is stored.
 */
function getVersionLocation(intelHexMap: MemoryMap): number {
  return hexMapUtil.getUint32(
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
  const flashPageSize: number = getPageSize(uicrMap);
  const flashSize: number = getFlashSize(uicrMap);
  const startPage: number = getStartPage(uicrMap);
  const pagesUsed: number = getPagesUsed(uicrMap);
  const versionAddress: number = getVersionLocation(uicrMap);
  const version: string = hexMapUtil.getString(intelHexMap, versionAddress);
  const deviceVersion: number = getDeviceVersion(uicrMap);

  return {
    flashPageSize,
    flashSize,
    runtimeStartPage: startPage,
    runtimeStartAddress: startPage * flashPageSize,
    runtimeEndUsed: pagesUsed,
    runtimeEndAddress: pagesUsed * flashPageSize,
    uicrStartAddress: MicropythonUicrAddress.MagicValue,
    uicrEndAddress: MicropythonUicrAddress.End,
    versionAddress,
    version,
    deviceVersion,
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

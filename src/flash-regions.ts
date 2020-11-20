/**
 * Interprets the Flash Regions Table stored in flash.
 *
 * The micro:bit flash layout is divided in flash regions, each containing a
 * different type of data (Nordic SoftDevice, MicroPython, bootloader, etc).
 * One of the regions is dedicated to the micro:bit filesystem, and this info
 * is used by this library to add the user files into a MicroPython hex File.
 *
 * The Flash Regions Table stores a data table at the end of the last flash page
 * used by the MicroPython runtime.
 * The table contains a series of 16-byte rows with info about each region
 * and it ends with a 16-byte table header with info about the table itself.
 * All in little-endian format.
 *
 * ```
 * |                                                               | Low address
 * | ID| HT|1ST_PAG| REGION_LENGTH | HASH_DATA                     | Row 1
 * | ID| HT|1ST_PAG| REGION_LENGTH | HASH_DATA                     | ...
 * | ID| HT|1ST_PAG| REGION_LENGTH | HASH_DATA                     | Row N
 * | MAGIC_1       | VER   | T_LEN |REG_CNT| P_SIZE| MAGIC_2       | Header
 * |---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---| Page end
 * |0x0|0x1|0x2|0x3|0x4|0x5|0x6|0x7|0x8|0x9|0xa|0xb|0xc|0xd|0xe|0xf|
 * |---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
 * ```
 *
 * More information about how this data is added to the MicroPython Intel Hex
 * file can be found in the MicroPython for micro:bit v2 repository:
 *   https://github.com/microbit-foundation/micropython-microbit-v2/blob/40e9bb687eb561cf590d151c6afa35efbcd4fec0/src/addlayouttable.py
 *
 * @packageDocumentation
 *
 * (c) 2020 Micro:bit Educational Foundation and the microbit-fs contributors.
 * SPDX-License-Identifier: MIT
 */
import MemoryMap from 'nrf-intel-hex';

import { DeviceMemInfo, DeviceVersion } from './device-mem-info';
import * as hexMapUtil from './hex-map-utils';

interface RegionRow {
  id: number;
  startPage: number;
  lengthBytes: number;
  hashType: number;
  hashData: number;
  hashPointerData: string;
}

interface TableHeader {
  pageSizeLog2: number;
  pageSize: number;
  regionCount: number;
  tableLength: number;
  version: number;
  startAddress: number;
  endAddress: number;
}

// Sizes for each of the fields in the Flash Regions Table header
const MAGIC2_LEN_BYTES = 4;
const P_SIZE_LOG2_LEN_BYTES = 2;
const NUM_REG_LEN_BYTES = 2;
const TABLE_LEN_LEN_BYTES = 2;
const VERSION_LEN_BYTES = 2;
const MAGIC_1_LEN_BYTES = 4;

/**
 * Offset for each of the Table header fields, starting from the end of the row.
 *
 * These are the fields stored in each row for each of the regions, and
 * any additional region data from the Region interface is derived from this.
 *
 * |0x00|..|..|0x03|0x04|0x05|0x06|0x07|0x08|0x09|0x0a|0x0b|0x0c|..|..|0x0f|
 * |----|--|--|----|----|----|----|----|----|----|----|----|----|--|--|----|
 * | MAGIC_1       | VERSION |TABLE_LEN|REG_COUNT| P_SIZE  | MAGIC_2       |
 */
enum RegionHeaderOffset {
  magic2 = MAGIC2_LEN_BYTES,
  pageSizeLog2 = magic2 + P_SIZE_LOG2_LEN_BYTES,
  regionCount = pageSizeLog2 + NUM_REG_LEN_BYTES,
  tableLength = regionCount + TABLE_LEN_LEN_BYTES,
  version = tableLength + VERSION_LEN_BYTES,
  magic_1 = version + MAGIC_1_LEN_BYTES,
}

// Magic numbers to identify the Flash Regions Table in flash
const REGION_HEADER_MAGIC_1 = 0x597f30fe;
const REGION_HEADER_MAGIC_2 = 0xc1b1d79d;

// Sizes for each of the fields in each Region row from the Flash Regions Table
const REGION_ID_BYTES = 1;
const REGION_HASH_TYPE_BYTES = 1;
const REGION_START_PAGE_BYTES = 2;
const REGION_LEN_BYTES = 4;
const REGION_HASH_DATA_BYTES = 8;

/**
 * Offset for each of the Region row fields, starting from the end of the row.
 *
 * These are the fields stored in each row for each of the regions, and
 * any additional region data from the Region interface is derived from this.
 *
 * |0x00|0x01|0x02|0x03|0x04|0x05|0x06|0x07|0x08|..|..|..|..|..|..|0x0f|
 * |----|----|----|----|----|----|----|----|----|--|--|--|--|--|--|----|
 * | ID | HT |1ST_PAGE | REGION_LENGTH     | HASH_DATA                 |
 */
enum RegionRowOffset {
  hashData = REGION_HASH_DATA_BYTES,
  lengthBytes = hashData + REGION_LEN_BYTES,
  startPage = lengthBytes + REGION_START_PAGE_BYTES,
  hashType = startPage + REGION_HASH_TYPE_BYTES,
  id = hashType + REGION_ID_BYTES,
}
const REGION_ROW_LEN_BYTES = RegionRowOffset.id;

/**
 * The "hash type" field in a region row indicates how to interpret the "hash
 * data" field.
 */
enum RegionHashType {
  /** The hash data is empty. */
  empty = 0,
  /** The full hash data field is used as a hash of the region in flash */
  data = 1,
  /** The 4 LSB bytes of the hash data field are used as a pointer  */
  pointer = 2,
}

/** Indicates the data contain in each of the different regions */
enum RegionId {
  softDevice = 1,
  microPython = 2,
  fs = 3,
}

/**
 * .
 *
 * @param iHexMap - .
 * @returns {TableHeader}
 */
function getTableHeader(iHexMap: MemoryMap): TableHeader {
  let endAddress = 0;
  for (let i = 4096; i <= 0x80000; i += 4096) {
    if (
      iHexMap.getUint32(i - RegionHeaderOffset.magic2, true) ===
        REGION_HEADER_MAGIC_2 &&
      iHexMap.getUint32(i - RegionHeaderOffset.magic_1, true) ===
        REGION_HEADER_MAGIC_1
    ) {
      endAddress = i;
      break;
    }
  }
  const version = hexMapUtil.getUint16(
    iHexMap,
    endAddress - RegionHeaderOffset.version
  );
  const tableLength = hexMapUtil.getUint16(
    iHexMap,
    endAddress - RegionHeaderOffset.tableLength
  );
  const regionCount = hexMapUtil.getUint16(
    iHexMap,
    endAddress - RegionHeaderOffset.regionCount
  );
  const pageSizeLog2 = hexMapUtil.getUint16(
    iHexMap,
    endAddress - RegionHeaderOffset.pageSizeLog2
  );
  const pageSize = Math.pow(2, pageSizeLog2);
  const startAddress = endAddress - RegionHeaderOffset.magic_1;

  return {
    pageSizeLog2,
    pageSize,
    regionCount,
    tableLength,
    version,
    endAddress,
    startAddress,
  };
}

/**
 * .
 *
 * @param iHexMap - .
 * @param rowEndAddress - .
 * @returns The Region info from the row.
 */
function getRegionRow(iHexMap: MemoryMap, rowEndAddress: number): RegionRow {
  const id = hexMapUtil.getUint8(iHexMap, rowEndAddress - RegionRowOffset.id);
  const hashType = hexMapUtil.getUint8(
    iHexMap,
    rowEndAddress - RegionRowOffset.hashType
  );
  const hashData: number | string = hexMapUtil.getUint64(
    iHexMap,
    rowEndAddress - RegionRowOffset.hashData
  );
  let hashPointerData = '';
  if (hashType === RegionHashType.pointer) {
    // Pointer to a string in the hex is only 4 bytes instead of 8
    hashPointerData = hexMapUtil.getString(iHexMap, hashData & 0xffffffff);
  }
  const startPage = hexMapUtil.getUint16(
    iHexMap,
    rowEndAddress - RegionRowOffset.startPage
  );
  const lengthBytes = hexMapUtil.getUint32(
    iHexMap,
    rowEndAddress - RegionRowOffset.lengthBytes
  );

  return {
    id,
    startPage,
    lengthBytes,
    hashType,
    hashData,
    hashPointerData,
  };
}

/**
 * Reads the UICR data from an Intel Hex map and retrieves the MicroPython data.
 *
 * @throws {Error} When the Magic Header is not present.
 *
 * @param intelHexMap - Memory map of the Intel Hex data.
 * @returns Object with the decoded UICR MicroPython data.
 */
function getHexMapUicrData(iHexMap: MemoryMap): DeviceMemInfo {
  const tableHeader = getTableHeader(iHexMap);
  const regionRows: { [id: string]: RegionRow } = {};
  for (let i = 0; i < tableHeader.regionCount; i++) {
    const rowEndAddress = tableHeader.startAddress - i * REGION_ROW_LEN_BYTES;
    const regionRow = getRegionRow(iHexMap, rowEndAddress);
    regionRows[regionRow.id] = regionRow;
  }

  if (!regionRows.hasOwnProperty(RegionId.microPython)) {
    throw new Error(
      'Could not find a MicroPython region in the regions table.'
    );
  }
  if (!regionRows.hasOwnProperty(RegionId.fs)) {
    throw new Error(
      'Could not find a File System region in the regions table.'
    );
  }
  // Have to manually set the start at address 0 even if regions don't cover it
  const runtimeStartAddress = 0;

  let runtimeEndAddress =
    regionRows[RegionId.microPython].startPage * tableHeader.pageSize +
    regionRows[RegionId.microPython].lengthBytes;
  // The table is placed at the end of the last page used by MicroPython and we
  // need to include it
  runtimeEndAddress = tableHeader.endAddress;
  const uPyVersion = regionRows[RegionId.microPython].hashPointerData;
  const fsStartAddress =
    regionRows[RegionId.fs].startPage * tableHeader.pageSize;
  const fsEndAddress = fsStartAddress + regionRows[RegionId.fs].lengthBytes;

  return {
    flashPageSize: tableHeader.pageSize,
    flashSize: 512 * 1024,
    flashStartAddress: 0,
    flashEndAddress: 512 * 1024,
    runtimeStartAddress,
    runtimeEndAddress,
    fsStartAddress,
    fsEndAddress,
    uPyVersion,
    deviceVersion: DeviceVersion.two,
  };
}

/**
 * Reads the UICR data from an Intel Hex string and retrieves the MicroPython
 * data.
 *
 * @throws {Error} When the Magic Header is not present.
 *
 * @param intelHex - MicroPython Intel Hex string.
 * @returns .
 */
function getIntelHexUicrData(intelHex: string): DeviceMemInfo {
  return getHexMapUicrData(MemoryMap.fromHex(intelHex));
}

export { getHexMapUicrData, getIntelHexUicrData };

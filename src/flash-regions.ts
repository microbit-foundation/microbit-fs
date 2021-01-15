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
 *   https://github.com/microbit-foundation/micropython-microbit-v2/blob/v2.0.0-beta.3/src/addlayouttable.py
 *
 * @packageDocumentation
 *
 * (c) 2020 Micro:bit Educational Foundation and the microbit-fs contributors.
 * SPDX-License-Identifier: MIT
 */
import MemoryMap from 'nrf-intel-hex';

import { DeviceMemInfo, DeviceVersion } from './device-mem-info';
import { areUint8ArraysEqual } from './common';
import * as hexMapUtil from './hex-map-utils';

/** Indicates the data contain in each of the different regions */
enum RegionId {
  /** Soft Device is the data blob containing the Nordic Bluetooth stack. */
  softDevice = 1,
  /** Contains the MicroPython runtime. */
  microPython = 2,
  /** Contains the MicroPython microbit filesystem reserved flash. */
  fs = 3,
}

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

/**
 * The data stored in a Region row from the Flash Regions table.
 */
interface RegionRow {
  /** The Region ID, as described in the RegionId enum. */
  id: RegionId;
  /** The flash page where this Region starts. */
  startPage: number;
  /** Length of the region in bytes. */
  lengthBytes: number;
  /** Identifies the type of data contained in the Hash Data field. */
  hashType: RegionHashType;
  /** Hash Data can be one of the types indicated in the RegionHashType enum. */
  hashData: number;
  /** When Hash Data is a pointer, this variable holds the pointed string. */
  hashPointerData: string;
}

/**
 * The Flash Regions Table ends with a Header containing information about the
 * table itsel.
 */
interface TableHeader {
  /** The flash page size in log2 format. */
  pageSizeLog2: number;
  /** The flash page size in bytes. */
  pageSize: number;
  /** The number of regions described in the table. */
  regionCount: number;
  /** The length in bytes of the table, excluding this header. */
  tableLength: number;
  /** The Flash Regions Table format version. */
  version: number;
  /** The address of this table header (useful for calculation row offsets). */
  startAddress: number;
  /** The end address of this table header. */
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
  magic1 = version + MAGIC_1_LEN_BYTES,
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
 * Iterates through the provided Intel Hex Memory Map and tries to find the
 * Flash Regions Table header, by looking for the magic values at the end of
 * each flash page.
 *
 * TODO: Indicate here what errors can be thrown.
 *
 * @param iHexMap - Intel Hex memory map to scan for the Flash Regions Table.
 * @param pSize - Flash page size to scan at the end of each page.
 * @returns The table header data.
 */
function getTableHeader(iHexMap: MemoryMap, pSize: number = 1024): TableHeader {
  let endAddress = 0;
  const magic1ToFind = new Uint8Array(
    new Uint32Array([REGION_HEADER_MAGIC_1]).buffer
  );
  const magic2ToFind = new Uint8Array(
    new Uint32Array([REGION_HEADER_MAGIC_2]).buffer
  );
  const mapEntries = iHexMap.paginate(pSize, 0xff).entries();
  for (let iter = mapEntries.next(); !iter.done; iter = mapEntries.next()) {
    if (!iter.value) continue;
    const blockByteArray: Uint8Array = iter.value[1];
    const subArrayMagic2 = blockByteArray.subarray(-RegionHeaderOffset.magic2);
    if (
      areUint8ArraysEqual(subArrayMagic2, magic2ToFind) &&
      areUint8ArraysEqual(
        blockByteArray.subarray(
          -RegionHeaderOffset.magic1,
          -(RegionHeaderOffset.magic1 - MAGIC_1_LEN_BYTES)
        ),
        magic1ToFind
      )
    ) {
      const pageStartAddress: number = iter.value[0];
      endAddress = pageStartAddress + pSize;
      break;
    }
  }
  // TODO: Throw an error if table is not found.

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
  const startAddress = endAddress - RegionHeaderOffset.magic1;

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
 * Parses a Region rows from a Flash Regions Table inside the Intel Hex memory
 * map, which ends at the provided rowEndAddress.
 *
 * Since the Flash Regions Table is placed at the end of a page, we iterate
 * from the end to the beginning.
 *
 * @param iHexMap - Intel Hex memory map to scan for the Flash Regions Table.
 * @param rowEndAddress - Address at which the row ends (same as the address
 *    where the next row or table header starts).
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
 * Reads the Flash Regions Table data from an Intel Hex map and retrieves the
 * MicroPython DeviceMemInfo data.
 *
 * @throws {Error} When the Magic Header is not present.
 * @throws {Error} When the MicroPython or FS regions are not found.
 *
 * @param intelHexMap - Memory map of the Intel Hex to scan.
 * @returns Object with the parsed data from the Flash Regions Table.
 */
function getHexMapFlashRegionsData(iHexMap: MemoryMap): DeviceMemInfo {
  // TODO: There is currently have some "internal" knowledge here and it's
  // scanning the flash knowing the page size is 4 KBs
  const tableHeader = getTableHeader(iHexMap, 4096);
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
 * Reads the Flash Regions Table data from an Intel Hex map and retrieves the
 * MicroPython DeviceMemInfo data.
 *
 * @throws {Error} When the Magic Header is not present.
 * @throws {Error} When the MicroPython or FS regions are not found.
 *
 * @param intelHex - MicroPython Intel Hex string.
 * @returns Object with the parsed data from the Flash Regions Table.
 */
function getIntelHexFlashRegionsData(intelHex: string): DeviceMemInfo {
  return getHexMapFlashRegionsData(MemoryMap.fromHex(intelHex));
}

export { getHexMapFlashRegionsData, getIntelHexFlashRegionsData };

/**
 * Module to add and remove Python scripts into and from a MicroPython hex.
 *
 * (c) 2019 Micro:bit Educational Foundation and the microbit-fs contributors.
 * SPDX-License-Identifier: MIT
 */
import MemoryMap from 'nrf-intel-hex';

import { bytesToStr, strToBytes } from './common';

/** User script located at specific flash address. */
enum AppendedBlock {
  StartAdd = 0x3e000,
  Length = 8 * 1024,
  EndAdd = StartAdd + Length,
}

/** User code header */
const enum AppendedHeader {
  Byte0 = 0,
  Byte1 = 1,
  CodeLengthLsb = 2,
  CodeLengthMsb = 3,
  Length = 4,
}

/** Start of user script marked by "MP" + 2 bytes for the script length. */
const HEADER_START_BYTE_0 = 77; // 'M'
const HEADER_START_BYTE_1 = 80; // 'P'

/** How many bytes per Intel Hex record line. */
const HEX_RECORD_DATA_LEN = 16;

/**
 * Marker placed inside the MicroPython hex string to indicate where to
 * inject the user Python Code.
 */
const HEX_INSERTION_POINT = ':::::::::::::::::::::::::::::::::::::::::::\n';

/**
 * Removes the old insertion line the input Intel Hex string contains it.
 *
 * @param intelHex - String with the intel hex lines.
 * @returns The Intel Hex string without insertion line.
 */
export function cleanseOldHexFormat(intelHex: string): string {
  return intelHex.replace(HEX_INSERTION_POINT, '');
}

/**
 * Parses through an Intel Hex string to find the Python code at the
 * allocated address and extracts it.
 *
 * @param intelHex - Intel Hex block to scan for the code.
 * @return Python code.
 */
function getIntelHexAppendedScript(intelHex: string): string {
  let pyCode: string = '';
  const hexFileMemMap: MemoryMap = MemoryMap.fromHex(intelHex);
  // Check that the known flash location has user code
  if (hexFileMemMap.has(AppendedBlock.StartAdd)) {
    const pyCodeMemMap = hexFileMemMap.slice(
      AppendedBlock.StartAdd,
      AppendedBlock.Length
    );
    const codeBytes = pyCodeMemMap.get(AppendedBlock.StartAdd);
    if (
      codeBytes[AppendedHeader.Byte0] === HEADER_START_BYTE_0 &&
      codeBytes[AppendedHeader.Byte1] === HEADER_START_BYTE_1
    ) {
      pyCode = bytesToStr(codeBytes.slice(AppendedHeader.Length));
      // Clean null terminators at the end
      pyCode = pyCode.replace(/\0/g, '');
    }
  }
  return pyCode;
}

/**
 * When the user code is inserted into the flash known location it needs to be
 * packed with a header. This function outputs a byte array with a fully formed
 * User Code Block.
 *
 * @param dataBytes - Array of bytes to include in the User Code block.
 * @returns Byte array with the full User Code Block.
 */
function createAppendedBlock(dataBytes: Uint8Array): Uint8Array {
  let blockLength = dataBytes.length + AppendedHeader.Length;
  // Old DAPLink versions need padding on the last record to fill the line
  if (blockLength % HEX_RECORD_DATA_LEN) {
    blockLength += HEX_RECORD_DATA_LEN - (blockLength % HEX_RECORD_DATA_LEN);
  }
  const blockBytes: Uint8Array = new Uint8Array(blockLength).fill(0x00);
  // The user script block has to start with "MP" marker + script length
  blockBytes[0] = HEADER_START_BYTE_0;
  blockBytes[1] = HEADER_START_BYTE_1;
  blockBytes[2] = dataBytes.length & 0xff;
  blockBytes[3] = (dataBytes.length >> 8) & 0xff;
  blockBytes.set(dataBytes, AppendedHeader.Length);
  return blockBytes;
}

/**
 * Converts the Python code into the Intel Hex format expected by
 * MicroPython and injects it into a Intel Hex string containing a marker.
 *
 * TODO: Throw error if filesystem is using the penultimate page already.
 *
 * @param intelHex - Single string of Intel Hex records to inject the code.
 * @param pyStr - Python code string.
 * @returns Intel Hex string with the Python code injected.
 */
function addIntelHexAppendedScript(intelHex: string, pyCode: string): string {
  const codeBytes: Uint8Array = strToBytes(pyCode);
  const blockBytes: Uint8Array = createAppendedBlock(codeBytes);
  if (blockBytes.length > AppendedBlock.Length) {
    throw new RangeError('Too long');
  }
  // Convert to Intel Hex format
  const intelHexClean = cleanseOldHexFormat(intelHex);
  const intelHexMap: MemoryMap = MemoryMap.fromHex(intelHexClean);
  intelHexMap.set(AppendedBlock.StartAdd, blockBytes);
  // Older versions of DAPLink need the file to end in a new line
  return intelHexMap.asHexString() + '\n';
}

/**
 * Checks the Intel Hex memory map to see if there is an appended script.
 *
 * @param intelHexMap - Memory map for the MicroPython Intel Hex.
 * @returns True if appended script is present, false otherwise.
 */
function isAppendedScriptPresent(intelHex: MemoryMap | string): boolean {
  let intelHexMap: MemoryMap;
  if (typeof intelHex === 'string') {
    const intelHexClean = cleanseOldHexFormat(intelHex);
    intelHexMap = MemoryMap.fromHex(intelHexClean);
  } else {
    intelHexMap = intelHex;
  }
  const headerMagic = intelHexMap.slicePad(AppendedBlock.StartAdd, 2, 0xff);
  return (
    headerMagic[0] === HEADER_START_BYTE_0 &&
    headerMagic[1] === HEADER_START_BYTE_1
  );
}

export {
  AppendedBlock,
  addIntelHexAppendedScript,
  getIntelHexAppendedScript,
  isAppendedScriptPresent,
};

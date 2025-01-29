/**
 * Retrieves the device information stored inside a MicroPython hex file.
 *
 * (c) 2020 Micro:bit Educational Foundation and the microbit-fs contributors.
 * SPDX-License-Identifier: MIT
 */
import MemoryMap from 'nrf-intel-hex';

import { DeviceMemInfo, DeviceVersion } from './device-mem-info.js';
import * as flashRegions from './flash-regions.js';
import * as uicr from './uicr.js';

/**
 * Attempts to retrieve the device memory data from an MicroPython Intel Hex
 * memory map.
 *
 * @param {MemoryMap} intelHexMap MicroPython Intel Hex memory map to scan.
 * @returns {DeviceMemInfo} Device data.
 */
function getHexMapDeviceMemInfo(intelHexMap: MemoryMap): DeviceMemInfo {
  let errorMsg = '';
  try {
    return uicr.getHexMapUicrData(intelHexMap);
  } catch (err) {
    errorMsg += (err as Error).message + '\n';
  }
  try {
    return flashRegions.getHexMapFlashRegionsData(intelHexMap);
  } catch (err) {
    throw new Error(errorMsg + (err as Error).message);
  }
}

/**
 * Attempts to retrieve the device memory data from an MicroPython Intel Hex.
 *
 * @param intelHex - MicroPython Intel Hex string.
 * @returns {DeviceMemInfo} Device data.
 */
function getIntelHexDeviceMemInfo(intelHex: string): DeviceMemInfo {
  return getHexMapDeviceMemInfo(MemoryMap.fromHex(intelHex));
}

export type { DeviceMemInfo, DeviceVersion };

export { getHexMapDeviceMemInfo, getIntelHexDeviceMemInfo };

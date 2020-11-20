/**
 * .
 *
 * (c) 2020 Micro:bit Educational Foundation and the microbit-fs contributors.
 * SPDX-License-Identifier: MIT
 */
import MemoryMap from 'nrf-intel-hex';

import { DeviceMemInfo, DeviceVersion } from './device-mem-info';
import * as flashRegions from './flash-regions';
import * as uicr from './uicr';

function getHexMapDeviceMemInfo(intelHexMap: MemoryMap): DeviceMemInfo {
  let errorMsg = '';
  try {
    return uicr.getHexMapUicrData(intelHexMap);
  } catch (err) {
    errorMsg += err.message + '\n';
  }
  try {
    return flashRegions.getHexMapUicrData(intelHexMap);
  } catch (err) {
    throw new Error(errorMsg + err.message);
  }
}

/**
 * .
 *
 * @param intelHex - MicroPython Intel Hex string.
 * @returns .
 */
function getIntelHexDeviceMemInfo(intelHex: string): DeviceMemInfo {
  return getHexMapDeviceMemInfo(MemoryMap.fromHex(intelHex));
}

export {
  DeviceMemInfo,
  DeviceVersion,
  getHexMapDeviceMemInfo,
  getIntelHexDeviceMemInfo,
};

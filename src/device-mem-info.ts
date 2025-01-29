/*
 * (c) 2020 Micro:bit Educational Foundation and the microbit-fs contributors.
 * SPDX-License-Identifier: MIT
 */

/**
 * This interface represents the data about the device target contained within a
 * MicroPython hex file.
 *
 * This data is stored in different formats depending on the MicroPython port,
 * V1 uses the UICR location, and V2 uses a table stored in flash.
 */
export interface DeviceMemInfo {
  /** Size of a single flash page, in bytes. */
  flashPageSize: number;
  /** Full flash size in bytes. */
  flashSize: number;
  /** Start address for the flash memory. */
  flashStartAddress: number;
  /** End address for the flash memory. */
  flashEndAddress: number;
  /** Start address in flash where the MicroPython runtime starts. */
  runtimeStartAddress: number;
  /** End address in flash where the MicroPython runtime starts. */
  runtimeEndAddress: number;
  /** Start address in flash where the MicroPython filesystem starts. */
  fsStartAddress: number;
  /** End address in flash where the MicroPython filesystem starts. */
  fsEndAddress: number;
  /** MicroPython version string. */
  uPyVersion: string;
  /** Device targeted by this hex file. */
  deviceVersion: DeviceVersion;
}

/**
 * Represents the micro:bit Version the hex file targets.
 */
export type DeviceVersion = 'V1' | 'V2';

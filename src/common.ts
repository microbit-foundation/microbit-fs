/**
 * General utilities.
 */

import encoding from 'text-encoding';

/**
 * String placed inside the MicroPython hex string to indicate where to
 * paste the Python Code
 */
const HEX_INSERTION_POINT = ':::::::::::::::::::::::::::::::::::::::::::\n';

/**
 * Removes the old insertion line the input Intel Hex string contains it.
 * @param intelHex String with the intel hex lines.
 * @returns The Intel Hex string without insertion line.
 */
export function cleanseOldHexFormat(intelHex: string): string {
  return intelHex.replace(HEX_INSERTION_POINT, '');
}

/**
 * Converts a string into a byte array of characters.
 * @param str - String to convert to bytes.
 * @returns A byte array with the encoded data.
 */
export function strToBytes(str: string): Uint8Array {
  const encoder = new encoding.TextEncoder();
  return encoder.encode(str);
}

/**
 * Converts a byte array into a string of characters.
 * @param byteArray - Array of bytes to convert.
 * @returns String output from the conversion.
 */
export function bytesToStr(byteArray: Uint8Array): string {
  const decoder = new encoding.TextDecoder();
  return decoder.decode(byteArray);
}

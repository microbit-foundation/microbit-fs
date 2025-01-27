/**
 * General utilities.
 *
 * (c) 2019 Micro:bit Educational Foundation and the microbit-fs contributors.
 * SPDX-License-Identifier: MIT
 */

/**
 * Converts a string into a byte array of characters.
 * @param str - String to convert to bytes.
 * @returns A byte array with the encoded data.
 */
export function strToBytes(str: string): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(str);
}

/**
 * Converts a byte array into a string of characters.
 * @param byteArray - Array of bytes to convert.
 * @returns String output from the conversion.
 */
export function bytesToStr(byteArray: Uint8Array): string {
  const decoder = new TextDecoder();
  return decoder.decode(byteArray);
}

/**
 * Concatenates two Uint8Arrays.
 *
 * @param first - The first array to concatenate.
 * @param second - The second array to concatenate.
 * @returns New array with both inputs concatenated.
 */
export const concatUint8Array = (first: Uint8Array, second: Uint8Array) => {
  const combined: Uint8Array = new Uint8Array(first.length + second.length);
  combined.set(first);
  combined.set(second, first.length);
  return combined;
};

/**
 * Compares two Uint8Array.
 *
 * @param first - The first array to compare.
 * @param second - The second array to compare.
 * @returns Boolean indicating if they are equal.
 */
export const areUint8ArraysEqual = (first: Uint8Array, second: Uint8Array) => {
  if (first.length !== second.length) return false;
  for (let i = 0; i < first.length; i++) {
    if (first[i] !== second[i]) return false;
  }
  return true;
};

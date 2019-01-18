/**
 * General utilities.
 */

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
 * TODO: Update to encode to UTF-8 correctly.
 * @param str - String to convert to bytes.
 * @returns A byte array with the encoded data.
 */
export function strToBytes(str: string): Uint8Array {
  const data: Uint8Array = new Uint8Array(str.length);
  for (let i: number = 0; i < str.length; i++) {
    // TODO: This will only keep the LSB from the UTF-16 code points
    data[i] = str.charCodeAt(i);
  }
  return data;
}

/**
 * Converts a byte array into a string of characters.
 * TODO: This currently only deals with single byte characters, so needs to
 *       be expanded to support UTF-8 characters longer than 1 byte.
 * @param byteArray - Array of bytes to convert.
 * @returns String output from the conversion.
 */
export function bytesToStr(byteArray: Uint8Array): string {
  const result: string[] = [];
  byteArray.forEach((element) => result.push(String.fromCharCode(element)));
  return result.join('');
}

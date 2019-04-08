/**
 * General utilities.
 */
/**
 * Removes the old insertion line the input Intel Hex string contains it.
 *
 * @param intelHex - String with the intel hex lines.
 * @returns The Intel Hex string without insertion line.
 */
export declare function cleanseOldHexFormat(intelHex: string): string;
/**
 * Converts a string into a byte array of characters.
 * @param str - String to convert to bytes.
 * @returns A byte array with the encoded data.
 */
export declare function strToBytes(str: string): Uint8Array;
/**
 * Converts a byte array into a string of characters.
 * @param byteArray - Array of bytes to convert.
 * @returns String output from the conversion.
 */
export declare function bytesToStr(byteArray: Uint8Array): string;
/**
 * Concatenates two Uint8Arrays.
 *
 * @param first - The first array to concatenate.
 * @param second - The second array to concatenate.
 * @returns New array with both inputs concatenated.
 */
export declare const concatUint8Array: (first: Uint8Array, second: Uint8Array) => Uint8Array;
//# sourceMappingURL=common.d.ts.map
/**
 * General utilities.
 */
import { TextDecoderLite, TextEncoderLite } from 'text-encoder-lite';
/**
 * Marker placed inside the MicroPython hex string to indicate where to
 * inject the user Python Code.
 */
var HEX_INSERTION_POINT = ':::::::::::::::::::::::::::::::::::::::::::\n';
/**
 * Removes the old insertion line the input Intel Hex string contains it.
 *
 * @param intelHex - String with the intel hex lines.
 * @returns The Intel Hex string without insertion line.
 */
export function cleanseOldHexFormat(intelHex) {
    return intelHex.replace(HEX_INSERTION_POINT, '');
}
/**
 * Converts a string into a byte array of characters.
 * @param str - String to convert to bytes.
 * @returns A byte array with the encoded data.
 */
export function strToBytes(str) {
    var encoder = new TextEncoderLite();
    return encoder.encode(str);
}
/**
 * Converts a byte array into a string of characters.
 * @param byteArray - Array of bytes to convert.
 * @returns String output from the conversion.
 */
export function bytesToStr(byteArray) {
    var decoder = new TextDecoderLite();
    return decoder.decode(byteArray);
}
/**
 * Concatenates two Uint8Arrays.
 *
 * @param first - The first array to concatenate.
 * @param second - The second array to concatenate.
 * @returns New array with both inputs concatenated.
 */
export var concatUint8Array = function (first, second) {
    var combined = new Uint8Array(first.length + second.length);
    combined.set(first);
    combined.set(second, first.length);
    return combined;
};
//# sourceMappingURL=common.js.map
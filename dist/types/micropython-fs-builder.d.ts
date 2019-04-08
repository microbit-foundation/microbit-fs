/**
 * @returns Size, in bytes, of how much space the file would take in the
 *     MicroPython filesystem.
 */
declare function calculateFileSize(filename: string, data: Uint8Array): number;
/**
 * Adds a byte array as a file in the MicroPython filesystem.
 *
 * @throws {Error} When the invalid file name is given.
 * @throws {Error} When the the file doesn't have any data.
 * @throws {Error} When there are issues calculating the file system boundaries.
 * @throws {Error} When there is no space left for the file.
 *
 * @param intelHex - MicroPython Intel Hex string.
 * @param filename - Name for the file.
 * @param data - Byte array for the file data.
 * @returns MicroPython Intel Hex string with the file in the filesystem.
 */
declare function addIntelHexFile(intelHex: string, filename: string, data: Uint8Array): string;
/**
 * Adds a hash table of filenames and byte arrays as files to the MicroPython
 * filesystem.
 *
 * @throws {Error} When the an invalid file name is given.
 * @throws {Error} When the a file doesn't have any data.
 * @throws {Error} When there are issues calculating the file system boundaries.
 * @throws {Error} When there is no space left for a file.
 *
 * @param intelHex - MicroPython Intel Hex string.
 * @param files - Hash table with filenames as the key and byte arrays as the
 *     value.
 * @returns MicroPython Intel Hex string with the file in the filesystem.
 */
declare function addIntelHexFiles(intelHex: string, files: {
    [filename: string]: Uint8Array;
}): string;
/**
 * Reads the filesystem included in a MicroPython Intel Hex string.
 *
 * @throws {Error} When multiple files with the same name encountered.
 * @throws {Error} When a file chunk points to an unused chunk.
 * @throws {Error} When a file chunk marker does not point to previous chunk.
 * @throws {Error} When following through the chunks linked list iterates
 *     through more chunks and used chunks (sign of an infinite loop).
 *
 * @param intelHex - The MicroPython Intel Hex string to read from.
 * @returns Dictionary with the filename as key and byte array as values.
 */
declare function getIntelHexFiles(intelHex: string): {
    [filename: string]: Uint8Array;
};
/**
 * Calculate the MicroPython filesystem size.
 *
 * @param intelHex - The MicroPython Intel Hex string.
 * @returns Size of the filesystem in bytes.
 */
declare function getIntelHexFsSize(intelHex: string): number;
export { addIntelHexFile, addIntelHexFiles, calculateFileSize, getIntelHexFiles, getIntelHexFsSize, };
//# sourceMappingURL=micropython-fs-builder.d.ts.map
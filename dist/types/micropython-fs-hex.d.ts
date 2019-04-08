/** Manage files in a MicroPython hex file. */
import { FsInterface } from './fs-interface';
export declare class MicropythonFsHex implements FsInterface {
    private _intelHex;
    private _files;
    /**
     * File System manager constructor.
     * At the moment it needs a MicroPython hex string without a files included.
     *
     * TODO: If files are already in input hex file, deal with them somehow.
     *
     * @param intelHex - MicroPython Intel Hex string.
     */
    constructor(intelHex: string);
    /**
     * Create a new file and add it to the file system.
     *
     * @throws {Error} When the file already exists.
     * @throws {Error} When an invalid filename is provided.
     * @throws {Error} When invalid file data is provided.
     *
     * @param filename - Name for the file.
     * @param content - File content to write.
     */
    create(filename: string, content: string | Uint8Array): void;
    /**
     * Write a file into the file system. Overwrites a previous file with the
     * same name.
     *
     * @throws {Error} When an invalid filename is provided.
     * @throws {Error} When invalid file data is provided.
     *
     * @param filename - Name for the file.
     * @param content - File content to write.
     */
    write(filename: string, content: string | Uint8Array): void;
    append(filename: string, content: string): void;
    /**
     * Read the text from a file.
     *
     * @throws {Error} When invalid file name is provided.
     * @throws {Error} When file is not in the file system.
     *
     * @param filename - Name of the file to read.
     * @returns Text from the file.
     */
    read(filename: string): string;
    /**
     * Read the bytes from a file.
     *
     * @throws {Error} When invalid file name is provided.
     * @throws {Error} When file is not in the file system.
     *
     * @param filename - Name of the file to read.
     * @returns Byte array from the file.
     */
    readBytes(filename: string): Uint8Array;
    /**
     * Delete a file from the file system.
     *
     * @throws {Error} When invalid file name is provided.
     * @throws {Error} When the file doesn't exist.
     *
     * @param filename - Name of the file to delete.
     */
    remove(filename: string): void;
    /**
     * Check if a file is already present in the file system.
     *
     * @param filename - Name for the file to check.
     * @returns True if it exists, false otherwise.
     */
    exists(filename: string): boolean;
    /**
     * Returns the size of a file in bytes.
     *
     * @throws {Error} When invalid file name is provided.
     * @throws {Error} When the file doesn't exist.
     *
     * @param filename - Name for the file to check.
     * @returns Size file size in bytes.
     */
    size(filename: string): number;
    /**
     * @returns A list all the files in the file system.
     */
    ls(): string[];
    /**
     * Calculate the MicroPython filesystem total size.
     *
     * @returns Size of the filesystem in bytes.
     */
    getStorageSize(): number;
    /**
     * @returns The total number of bytes currently used by files in the file system.
     */
    getStorageUsed(): number;
    /**
     * @returns The remaining storage of the file system in bytes.
     */
    getStorageRemaining(): number;
    /**
     * Read the files included in a MicroPython hex string and add them to this
     * instance.
     *
     * @throws {Error} When there is a problem reading the files from the hex.
     * @throws {Error} When a filename already exists in this instance (all other
     *     files are still imported).
     *
     * @param intelHex - MicroPython hex string with files.
     * @param overwrite - Flag to overwrite existing files in this instance.
     * @param formatFirst - Erase all the previous files before importing. It only
     *     erases the files after there are no error during hex file parsing.
     * @returns A filename list of added files.
     */
    importFilesFromIntelHex(intelHex: string, { overwrite, formatFirst, }?: {
        overwrite?: boolean;
        formatFirst?: boolean;
    }): string[];
    /**
     * Generate a new copy of the MicroPython Intel Hex with the filesystem
     * included.
     *
     * @throws {Error} When a file doesn't have any data.
     * @throws {Error} When there are issues calculating file system boundaries.
     * @throws {Error} When there is no space left for a file.
     *
     * @param intelHex - Optionally provide a different Intel Hex to include the
     *    filesystem into.
     * @returns A new string with MicroPython and the filesystem included.
     */
    getIntelHex(intelHex?: string): string;
}
//# sourceMappingURL=micropython-fs-hex.d.ts.map
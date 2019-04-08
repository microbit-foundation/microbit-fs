export declare class SimpleFile {
    filename: string;
    private _dataBytes;
    /**
     * Create a SimpleFile.
     *
     * @throws {Error} When an invalid filename is provided.
     * @throws {Error} When invalid file data is provided.
     *
     * @param filename - Name for the file.
     * @param data - String or byte array with the file data.
     */
    constructor(filename: string, data: string | Uint8Array);
    getText(): string;
    getBytes(): Uint8Array;
}
//# sourceMappingURL=simple-file.d.ts.map
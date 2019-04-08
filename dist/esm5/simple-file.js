import { bytesToStr, strToBytes } from './common';
var SimpleFile = /** @class */ (function () {
    /**
     * Create a SimpleFile.
     *
     * @throws {Error} When an invalid filename is provided.
     * @throws {Error} When invalid file data is provided.
     *
     * @param filename - Name for the file.
     * @param data - String or byte array with the file data.
     */
    function SimpleFile(filename, data) {
        if (!filename) {
            throw new Error('File was not provided a valid filename.');
        }
        if (!data) {
            throw new Error("File " + filename + " does not have valid content.");
        }
        this.filename = filename;
        if (typeof data === 'string') {
            this._dataBytes = strToBytes(data);
        }
        else if (data instanceof Uint8Array) {
            this._dataBytes = data;
        }
        else {
            throw new Error('File data type must be a string or Uint8Array.');
        }
    }
    SimpleFile.prototype.getText = function () {
        return bytesToStr(this._dataBytes);
    };
    SimpleFile.prototype.getBytes = function () {
        return this._dataBytes;
    };
    return SimpleFile;
}());
export { SimpleFile };
//# sourceMappingURL=simple-file.js.map
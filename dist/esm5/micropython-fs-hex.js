import { addIntelHexFiles, calculateFileSize, getIntelHexFiles, getIntelHexFsSize, } from './micropython-fs-builder';
import { SimpleFile } from './simple-file';
var MicropythonFsHex = /** @class */ (function () {
    /**
     * File System manager constructor.
     * At the moment it needs a MicroPython hex string without a files included.
     *
     * TODO: If files are already in input hex file, deal with them somehow.
     *
     * @param intelHex - MicroPython Intel Hex string.
     */
    function MicropythonFsHex(intelHex) {
        this._files = {};
        this._intelHex = intelHex;
        this.importFilesFromIntelHex(this._intelHex);
        if (this.ls().length) {
            throw new Error('There are files in the MicropythonFsHex constructor hex file input.');
        }
    }
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
    MicropythonFsHex.prototype.create = function (filename, content) {
        if (this.exists(filename)) {
            throw new Error('File already exists.');
        }
        this.write(filename, content);
    };
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
    MicropythonFsHex.prototype.write = function (filename, content) {
        this._files[filename] = new SimpleFile(filename, content);
    };
    MicropythonFsHex.prototype.append = function (filename, content) {
        if (!filename) {
            throw new Error('Invalid filename.');
        }
        if (!this.exists(filename)) {
            throw new Error("File \"" + filename + "\" does not exist.");
        }
        // TODO: Implement this.
        throw new Error('Append operation not yet implemented.');
    };
    /**
     * Read the text from a file.
     *
     * @throws {Error} When invalid file name is provided.
     * @throws {Error} When file is not in the file system.
     *
     * @param filename - Name of the file to read.
     * @returns Text from the file.
     */
    MicropythonFsHex.prototype.read = function (filename) {
        if (!filename) {
            throw new Error('Invalid filename.');
        }
        if (!this.exists(filename)) {
            throw new Error("File \"" + filename + "\" does not exist.");
        }
        return this._files[filename].getText();
    };
    /**
     * Read the bytes from a file.
     *
     * @throws {Error} When invalid file name is provided.
     * @throws {Error} When file is not in the file system.
     *
     * @param filename - Name of the file to read.
     * @returns Byte array from the file.
     */
    MicropythonFsHex.prototype.readBytes = function (filename) {
        if (!filename) {
            throw new Error('Invalid filename.');
        }
        if (!this.exists(filename)) {
            throw new Error("File \"" + filename + "\" does not exist.");
        }
        return this._files[filename].getBytes();
    };
    /**
     * Delete a file from the file system.
     *
     * @throws {Error} When invalid file name is provided.
     * @throws {Error} When the file doesn't exist.
     *
     * @param filename - Name of the file to delete.
     */
    MicropythonFsHex.prototype.remove = function (filename) {
        if (!filename) {
            throw new Error('Invalid filename.');
        }
        if (!this.exists(filename)) {
            throw new Error("File \"" + filename + "\" does not exist.");
        }
        delete this._files[filename];
    };
    /**
     * Check if a file is already present in the file system.
     *
     * @param filename - Name for the file to check.
     * @returns True if it exists, false otherwise.
     */
    MicropythonFsHex.prototype.exists = function (filename) {
        return this._files.hasOwnProperty(filename);
    };
    /**
     * Returns the size of a file in bytes.
     *
     * @throws {Error} When invalid file name is provided.
     * @throws {Error} When the file doesn't exist.
     *
     * @param filename - Name for the file to check.
     * @returns Size file size in bytes.
     */
    MicropythonFsHex.prototype.size = function (filename) {
        if (!filename) {
            throw new Error('Invalid filename.');
        }
        if (!this.exists(filename)) {
            throw new Error("File \"" + filename + "\" does not exist.");
        }
        return calculateFileSize(this._files[filename].filename, this._files[filename].getBytes());
    };
    /**
     * @returns A list all the files in the file system.
     */
    MicropythonFsHex.prototype.ls = function () {
        var files = [];
        Object.values(this._files).forEach(function (value) { return files.push(value.filename); });
        return files;
    };
    /**
     * Calculate the MicroPython filesystem total size.
     *
     * @returns Size of the filesystem in bytes.
     */
    MicropythonFsHex.prototype.getStorageSize = function () {
        return getIntelHexFsSize(this._intelHex);
    };
    /**
     * @returns The total number of bytes currently used by files in the file system.
     */
    MicropythonFsHex.prototype.getStorageUsed = function () {
        var _this = this;
        var total = 0;
        Object.values(this._files).forEach(function (value) { return (total += _this.size(value.filename)); });
        return total;
    };
    /**
     * @returns The remaining storage of the file system in bytes.
     */
    MicropythonFsHex.prototype.getStorageRemaining = function () {
        var _this = this;
        var total = 0;
        var capacity = this.getStorageSize();
        Object.values(this._files).forEach(function (value) { return (total += _this.size(value.filename)); });
        return capacity - total;
    };
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
    MicropythonFsHex.prototype.importFilesFromIntelHex = function (intelHex, _a) {
        var _this = this;
        var _b = _a === void 0 ? {} : _a, _c = _b.overwrite, overwrite = _c === void 0 ? false : _c, _d = _b.formatFirst, formatFirst = _d === void 0 ? false : _d;
        var files = getIntelHexFiles(intelHex);
        if (formatFirst) {
            delete this._files;
            this._files = {};
        }
        var existingFiles = [];
        Object.keys(files).forEach(function (filename) {
            if (!overwrite && _this.exists(filename)) {
                existingFiles.push(filename);
            }
            else {
                _this.write(filename, files[filename]);
            }
        });
        // Only throw the error at the end so that all other files are imported
        if (existingFiles.length) {
            throw new Error("Files \"" + existingFiles + "\" from hex already exists.");
        }
        return Object.keys(files);
    };
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
    MicropythonFsHex.prototype.getIntelHex = function (intelHex) {
        var finalHex = intelHex || this._intelHex;
        var files = {};
        Object.values(this._files).forEach(function (file) {
            files[file.filename] = file.getBytes();
        });
        return addIntelHexFiles(finalHex, files);
    };
    return MicropythonFsHex;
}());
export { MicropythonFsHex };
//# sourceMappingURL=micropython-fs-hex.js.map
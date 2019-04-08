/**
 * Module to add and remove Python scripts into and from a MicroPython hex.
 */
import MemoryMap from 'nrf-intel-hex';
import { bytesToStr, cleanseOldHexFormat, strToBytes } from './common';
/** Start of user script marked by "MP" + 2 bytes for the script length. */
var HEADER_START_BYTE_0 = 77; // 'M'
var HEADER_START_BYTE_1 = 80; // 'P'
/** How many bytes per Intel Hex record line. */
var HEX_RECORD_DATA_LEN = 16;
/**
 * Parses through an Intel Hex string to find the Python code at the
 * allocated address and extracts it.
 *
 * @param intelHex - Intel Hex block to scan for the code.
 * @return Python code.
 */
function getIntelHexAppendedScript(intelHex) {
    var pyCode = '';
    var hexFileMemMap = MemoryMap.fromHex(intelHex);
    // Check that the known flash location has user code
    if (hexFileMemMap.has(253952 /* StartAdd */)) {
        var pyCodeMemMap = hexFileMemMap.slice(253952 /* StartAdd */, 8192 /* Length */);
        var codeBytes = pyCodeMemMap.get(253952 /* StartAdd */);
        if (codeBytes[0 /* Byte0 */] === HEADER_START_BYTE_0 &&
            codeBytes[1 /* Byte1 */] === HEADER_START_BYTE_1) {
            pyCode = bytesToStr(codeBytes.slice(4 /* Length */));
            // Clean null terminators at the end
            pyCode = pyCode.replace(/\0/g, '');
        }
    }
    return pyCode;
}
/**
 * When the user code is inserted into the flash known location it needs to be
 * packed with a header. This function outputs a byte array with a fully formed
 * User Code Block.
 *
 * @param dataBytes - Array of bytes to include in the User Code block.
 * @returns Byte array with the full User Code Block.
 */
function createAppendedBlock(dataBytes) {
    var blockLength = dataBytes.length + 4 /* Length */;
    // Old DAPLink versions need padding on the last record to fill the line
    if (blockLength % HEX_RECORD_DATA_LEN) {
        blockLength += HEX_RECORD_DATA_LEN - (blockLength % HEX_RECORD_DATA_LEN);
    }
    var blockBytes = new Uint8Array(blockLength).fill(0x00);
    // The user script block has to start with "MP" marker + script length
    blockBytes[0] = HEADER_START_BYTE_0;
    blockBytes[1] = HEADER_START_BYTE_1;
    blockBytes[2] = dataBytes.length & 0xff;
    blockBytes[3] = (dataBytes.length >> 8) & 0xff;
    blockBytes.set(dataBytes, 4 /* Length */);
    return blockBytes;
}
/**
 * Converts the Python code into the Intel Hex format expected by
 * MicroPython and injects it into a Intel Hex string containing a marker.
 *
 * TODO: Throw error if filesystem is using the penultimate page already.
 *
 * @param intelHex - Single string of Intel Hex records to inject the code.
 * @param pyStr - Python code string.
 * @returns Intel Hex string with the Python code injected.
 */
function addIntelHexAppendedScript(intelHex, pyCode) {
    var codeBytes = strToBytes(pyCode);
    var blockBytes = createAppendedBlock(codeBytes);
    if (blockBytes.length > 8192 /* Length */) {
        throw new RangeError('Too long');
    }
    // Convert to Intel Hex format
    var intelHexClean = cleanseOldHexFormat(intelHex);
    var intelHexMap = MemoryMap.fromHex(intelHexClean);
    intelHexMap.set(253952 /* StartAdd */, blockBytes);
    // Older versions of DAPLink need the file to end in a new line
    return intelHexMap.asHexString() + '\n';
}
/**
 * Checks the Intel Hex memory map to see if there is an appended script.
 *
 * @param intelHexMap - Memory map for the MicroPython Intel Hex.
 * @returns True if appended script is present, false otherwise.
 */
function isAppendedScriptPresent(intelHex) {
    var intelHexMap;
    if (typeof intelHex === 'string') {
        var intelHexClean = cleanseOldHexFormat(intelHex);
        intelHexMap = MemoryMap.fromHex(intelHexClean);
    }
    else {
        intelHexMap = intelHex;
    }
    var headerMagic = intelHexMap.slicePad(253952 /* StartAdd */, 2, 0xff);
    return (headerMagic[0] === HEADER_START_BYTE_0 &&
        headerMagic[1] === HEADER_START_BYTE_1);
}
export { addIntelHexAppendedScript, getIntelHexAppendedScript, isAppendedScriptPresent, };
//# sourceMappingURL=micropython-appended.js.map
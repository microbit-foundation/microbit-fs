/**
 * Interprets the data stored in the UICR memory space.
 *
 * For more info:
 * https://microbit-micropython.readthedocs.io/en/latest/devguide/hexformat.html
 */
import MemoryMap from 'nrf-intel-hex';
import { bytesToStr } from './common';
var UICR_START = 0x10001000;
var UICR_CUSTOMER_OFFSET = 0x80;
var UICR_CUSTOMER_UPY_OFFSET = 0x40;
var UICR_UPY_START = UICR_START + UICR_CUSTOMER_OFFSET + UICR_CUSTOMER_UPY_OFFSET;
var UPY_MAGIC_HEADER = 0x17eeb07c;
var UPY_DELIMITER = 0xffffffff;
var UPY_MAGIC_LEN = 4;
var UPY_END_MARKER_LEN = 4;
var UPY_PAGE_SIZE_LEN = 4;
var UPY_START_PAGE_LEN = 2;
var UPY_PAGES_USED_LEN = 2;
var UPY_DELIMITER_LEN = 4;
var UPY_VERSION_LEN = 4;
/** UICR Customer area addresses for MicroPython specific data. */
var MicropythonUicrAddress;
(function (MicropythonUicrAddress) {
    MicropythonUicrAddress[MicropythonUicrAddress["MagicValue"] = UICR_UPY_START] = "MagicValue";
    MicropythonUicrAddress[MicropythonUicrAddress["EndMarker"] = MicropythonUicrAddress.MagicValue + UPY_MAGIC_LEN] = "EndMarker";
    MicropythonUicrAddress[MicropythonUicrAddress["PageSize"] = MicropythonUicrAddress.EndMarker + UPY_END_MARKER_LEN] = "PageSize";
    MicropythonUicrAddress[MicropythonUicrAddress["StartPage"] = MicropythonUicrAddress.PageSize + UPY_PAGE_SIZE_LEN] = "StartPage";
    MicropythonUicrAddress[MicropythonUicrAddress["PagesUsed"] = MicropythonUicrAddress.StartPage + UPY_START_PAGE_LEN] = "PagesUsed";
    MicropythonUicrAddress[MicropythonUicrAddress["Delimiter"] = MicropythonUicrAddress.PagesUsed + UPY_PAGES_USED_LEN] = "Delimiter";
    MicropythonUicrAddress[MicropythonUicrAddress["VersionLocation"] = MicropythonUicrAddress.Delimiter + UPY_DELIMITER_LEN] = "VersionLocation";
    MicropythonUicrAddress[MicropythonUicrAddress["End"] = MicropythonUicrAddress.VersionLocation + UPY_VERSION_LEN] = "End";
})(MicropythonUicrAddress || (MicropythonUicrAddress = {}));
/**
 * Reads a 32 bit little endian number from an Intel Hex memory map.
 *
 * @param intelHexMap - Memory map of the Intel Hex data.
 * @param address - Start address of the 32 bit number.
 * @returns Number with the unsigned integer representation of those 4 bytes.
 */
function getUint32FromIntelHexMap(intelHexMap, address) {
    var uint32Data = intelHexMap.slicePad(address, 4, 0xff);
    // Typed arrays use the native endianness, force little endian with DataView
    return new DataView(uint32Data.buffer).getUint32(0, true /* little endian */);
}
/**
 * Reads a 16 bit little endian number from an Intel Hex memory map.
 *
 * @param intelHexMap - Memory map of the Intel Hex data.
 * @param address - Start address of the 16 bit number.
 * @returns Number with the unsigned integer representation of those 2 bytes.
 */
function getUint16FromIntelHexMap(intelHexMap, address) {
    var uint16Data = intelHexMap.slicePad(address, 2, 0xff);
    // Typed arrays use the native endianness, force little endian with DataView
    return new DataView(uint16Data.buffer).getUint16(0, true /* little endian */);
}
/**
 * Decodes a UTF-8 null terminated string stored in the Intel Hex data at
 * the indicated address.
 *
 * @param intelHexMap - Memory map of the Intel Hex data.
 * @param address - Start address for the string.
 * @returns String read from the Intel Hex data.
 */
function getStringFromIntelHexMap(intelHexMap, address) {
    var memBlock = intelHexMap.slice(address).get(address);
    var i = 0;
    for (i = 0; i < memBlock.length && memBlock[i] !== 0; i++)
        ;
    if (i === memBlock.length) {
        // Could not find a null character to indicate the end of the string
        return '';
    }
    var stringBytes = memBlock.slice(0, i);
    return bytesToStr(stringBytes);
}
/**
 * Check if the magic number for the MicroPython UICR data is present in the
 * Intel Hex memory map.
 *
 * @param intelHexMap - Memory map of the Intel Hex data.
 * @return True if the magic number matches, false otherwise.
 */
function confirmMagicValue(intelHexMap) {
    var readMagicHeader = getUint32FromIntelHexMap(intelHexMap, MicropythonUicrAddress.MagicValue);
    return readMagicHeader === UPY_MAGIC_HEADER;
}
/**
 * Reads the UICR data that contains the flash page size.
 *
 * @param intelHexMap - Memory map of the Intel Hex data.
 * @returns The size of each flash page size.
 */
function getPageSize(intelHexMap) {
    var pageSize = getUint32FromIntelHexMap(intelHexMap, MicropythonUicrAddress.PageSize);
    // Page size is stored as a log base 2
    return Math.pow(2, pageSize);
}
/**
 * Reads the UICR data that contains the start page of the MicroPython runtime.
 *
 * @param intelHexMap - Memory map of the Intel Hex data.
 * @returns The start page number of the MicroPython runtime.
 */
function getStartPage(intelHexMap) {
    return getUint16FromIntelHexMap(intelHexMap, MicropythonUicrAddress.StartPage);
}
/**
 * Reads the UICR data that contains the address of the location in flash where
 * the MicroPython version is stored.
 *
 * @param intelHexMap - Memory map of the Intel Hex data.
 * @returns The address of the location in flash where the MicroPython version
 * is stored.
 */
function getPagesUsed(intelHexMap) {
    return getUint16FromIntelHexMap(intelHexMap, MicropythonUicrAddress.PagesUsed);
}
/**
 * Reads the UICR data that contains the number of flash pages used by the
 * MicroPython runtime.
 *
 * @param intelHexMap - Memory map of the Intel Hex data.
 * @returns The number of pages used by the MicroPython runtime.
 */
function getVersionLocation(intelHexMap) {
    return getUint32FromIntelHexMap(intelHexMap, MicropythonUicrAddress.VersionLocation);
}
/**
 * Reads the UICR data from an Intel Hex map and retrieves the MicroPython data.
 *
 * @throws {Error} When the Magic Header is not present.
 *
 * @param intelHexMap - Memory map of the Intel Hex data.
 * @returns Object with the decoded UICR MicroPython data.
 */
function getHexMapUicrData(intelHexMap) {
    var uicrMap = intelHexMap.slice(UICR_UPY_START);
    if (!confirmMagicValue(uicrMap)) {
        throw new Error('Could not find valid MicroPython UICR data.');
    }
    var pageSize = getPageSize(uicrMap);
    var startPage = getStartPage(uicrMap);
    var pagesUsed = getPagesUsed(uicrMap);
    var versionAddress = getVersionLocation(uicrMap);
    var version = getStringFromIntelHexMap(intelHexMap, versionAddress);
    return {
        flashPageSize: pageSize,
        runtimeStartPage: startPage,
        runtimeStartAddress: startPage * pageSize,
        runtimeEndUsed: pagesUsed,
        runtimeEndAddress: pagesUsed * pageSize,
        versionAddress: versionAddress,
        version: version,
    };
}
/**
 * Reads the UICR data from an Intel Hex string and retrieves the MicroPython
 * data.
 *
 * @throws {Error} When the Magic Header is not present.
 *
 * @param intelHex - MicroPython Intel Hex string.
 * @returns Object with the decoded UICR MicroPython data.
 */
function getIntelHexUicrData(intelHex) {
    return getHexMapUicrData(MemoryMap.fromHex(intelHex));
}
export { getHexMapUicrData, getIntelHexUicrData };
//# sourceMappingURL=uicr.js.map
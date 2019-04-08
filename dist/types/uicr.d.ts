/** MicroPython data stored in the UICR Customer area. */
interface MicropythonUicrData {
    flashPageSize: number;
    runtimeStartPage: number;
    runtimeStartAddress: number;
    runtimeEndUsed: number;
    runtimeEndAddress: number;
    versionAddress: number;
    version: string;
}
/**
 * Reads the UICR data from an Intel Hex map and retrieves the MicroPython data.
 *
 * @throws {Error} When the Magic Header is not present.
 *
 * @param intelHexMap - Memory map of the Intel Hex data.
 * @returns Object with the decoded UICR MicroPython data.
 */
declare function getHexMapUicrData(intelHexMap: MemoryMap): MicropythonUicrData;
/**
 * Reads the UICR data from an Intel Hex string and retrieves the MicroPython
 * data.
 *
 * @throws {Error} When the Magic Header is not present.
 *
 * @param intelHex - MicroPython Intel Hex string.
 * @returns Object with the decoded UICR MicroPython data.
 */
declare function getIntelHexUicrData(intelHex: string): MicropythonUicrData;
export { MicropythonUicrData, getHexMapUicrData, getIntelHexUicrData };
//# sourceMappingURL=uicr.d.ts.map
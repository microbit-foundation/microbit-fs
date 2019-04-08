/** User script located at specific flash address. */
declare const enum AppendedBlock {
    StartAdd = 253952,
    Length = 8192,
    EndAdd = 262144
}
/**
 * Parses through an Intel Hex string to find the Python code at the
 * allocated address and extracts it.
 *
 * @param intelHex - Intel Hex block to scan for the code.
 * @return Python code.
 */
declare function getIntelHexAppendedScript(intelHex: string): string;
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
declare function addIntelHexAppendedScript(intelHex: string, pyCode: string): string;
/**
 * Checks the Intel Hex memory map to see if there is an appended script.
 *
 * @param intelHexMap - Memory map for the MicroPython Intel Hex.
 * @returns True if appended script is present, false otherwise.
 */
declare function isAppendedScriptPresent(intelHex: MemoryMap | string): boolean;
export { AppendedBlock, addIntelHexAppendedScript, getIntelHexAppendedScript, isAppendedScriptPresent, };
//# sourceMappingURL=micropython-appended.d.ts.map
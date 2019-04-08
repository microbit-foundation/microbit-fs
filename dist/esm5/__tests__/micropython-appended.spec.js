import MemoryMap from 'nrf-intel-hex';
import { addIntelHexAppendedScript, getIntelHexAppendedScript, isAppendedScriptPresent, } from '../micropython-appended';
var simpleIntelHex = ':020000040000FA\n' +
    ':1000000000400020ED530100295401002B54010051\n' +
    ':00000001FF\n';
describe('Inject Python code into Intel Hex string', function () {
    it('Inject Python code into an Intel Hex string', function () {
        var pyCode = 'from microbit import *\n' + "display.scroll('Hello, World!')";
        var pyCodeHex = ':020000040003F7\n' +
            ':10E000004D50360066726F6D206D6963726F626984\n' +
            ':10E010007420696D706F7274202A0A646973706C61\n' +
            ':10E0200061792E7363726F6C6C282748656C6C6F16\n' +
            ':10E030002C20576F726C642127290000000000001B';
        var output = addIntelHexAppendedScript(simpleIntelHex, pyCode);
        var fullHex = simpleIntelHex.split('\n');
        fullHex.splice(2, 0, pyCodeHex);
        expect(output).toEqual(fullHex.join('\n'));
    });
    it('Inject Python with present UICR and Start Linear Address record', function () {
        var pyCode = 'from microbit import *\n' + "display.scroll('Hello, World!')";
        var pyCodeHex = ':020000040003F7\n' +
            ':10E000004D50360066726F6D206D6963726F626984\n' +
            ':10E010007420696D706F7274202A0A646973706C61\n' +
            ':10E0200061792E7363726F6C6C282748656C6C6F16\n' +
            ':10E030002C20576F726C642127290000000000001B\n';
        var uicr = ':020000041000EA\n' +
            ':1010C0007CB0EE17FFFFFFFF0A0000000000E30006\n' +
            ':0C10D000FFFFFFFF2D6D0300000000007B';
        var record = ':0400000500018E2147';
        var fullHex = simpleIntelHex.split('\n');
        fullHex.splice(2, 0, uicr + '\n' + record);
        var output = addIntelHexAppendedScript(fullHex.join('\n'), pyCode);
        var expectedHex = simpleIntelHex.split('\n');
        // Note that the 05 record is removed by nrf-intel-hex library!
        expectedHex.splice(2, 0, pyCodeHex + uicr);
        expect(output).toEqual(expectedHex.join('\n'));
    });
    it('Fail to inject Python code too large for flash', function () {
        var failCase = function () {
            var fakeCode = new Array(8 * 1024 + 2).join('a');
            var output = addIntelHexAppendedScript(simpleIntelHex, fakeCode);
        };
        expect(failCase).toThrow(RangeError);
    });
});
describe('Extract Python code from Intel Hex string', function () {
    it('Extract Python code', function () {
        var pyCode = 'from microbit import *\n' + "display.scroll('Hello, World!')";
        var intelHex = ':020000040000FA\n' +
            ':1000000000400020ED530100295401002B54010051\n' +
            ':020000040003F7\n' +
            ':10E000004D50360066726F6D206D6963726F626984\n' +
            ':10E010007420696D706F7274202A0A646973706C61\n' +
            ':10E0200061792E7363726F6C6C282748656C6C6F16\n' +
            ':0AE030002C20576F726C6421272921\n' +
            ':00000001FF\n';
        var result = getIntelHexAppendedScript(intelHex);
        expect(result).toEqual(pyCode);
    });
    it('Extract Python code with present UICR and Start Linear Address record)', function () {
        var pyCode = 'from microbit import *\n' + "display.scroll('Hello, World!')";
        var intelHex = ':020000040000FA\n' +
            ':1000000000400020ED530100295401002B54010051\n' +
            ':020000040003F7\n' +
            ':10E000004D50360066726F6D206D6963726F626984\n' +
            ':10E010007420696D706F7274202A0A646973706C61\n' +
            ':10E0200061792E7363726F6C6C282748656C6C6F16\n' +
            ':0AE030002C20576F726C6421272921\n' +
            ':020000041000EA\n' +
            ':1010C0007CB0EE17FFFFFFFF0A0000000000E30006\n' +
            ':0C10D000FFFFFFFF2D6D0300000000007B\n' +
            ':0400000500018E2147\n' +
            ':00000001FF\n';
        var result = getIntelHexAppendedScript(intelHex);
        expect(result).toEqual(pyCode);
    });
    it('There is no Python code to extract', function () {
        var intelHex = ':020000040000FA\n' +
            ':1000000000400020ED530100295401002B54010051\n' +
            ':00000001FF\n';
        var result = getIntelHexAppendedScript(intelHex);
        expect(result).toEqual('');
    });
    it('The Python code block contains garbage', function () {
        var intelHex = ':020000040000FA\n' +
            ':1000000000400020ED530100295401002B54010051\n' +
            ':020000040003F7\n' +
            ':10E000000102030405060708090A0B0C0D0E0F1088\n' +
            ':00000001FF\n';
        var result = getIntelHexAppendedScript(intelHex);
        expect(result).toEqual('');
    });
});
describe('Detect appended script.', function () {
    it('Appended script can be detected.', function () {
        var outputHex = addIntelHexAppendedScript(simpleIntelHex, 'code');
        var outputMap = MemoryMap.fromHex(outputHex);
        var resultStr = isAppendedScriptPresent(outputHex);
        var resultMap = isAppendedScriptPresent(outputMap);
        expect(resultStr).toBe(true);
        expect(resultMap).toBe(true);
    });
    it('Missing appended script can be detected.', function () {
        var simpleMap = MemoryMap.fromHex(simpleIntelHex);
        var resultStr = isAppendedScriptPresent(simpleIntelHex);
        var resultMap = isAppendedScriptPresent(simpleMap);
        expect(resultStr).toBe(false);
        expect(resultMap).toBe(false);
    });
    it('Appended script area with rubbish is not detected as code.', function () {
        // There is 8 Kbs at the end of flash for the appended script
        var appendedAddress = (256 - 8) * 1024;
        var simpleMap = MemoryMap.fromHex(simpleIntelHex);
        simpleMap.set(appendedAddress, new Uint8Array([1, 2, 3, 4, 5, 6, 7, 9, 0]));
        var result = isAppendedScriptPresent(simpleMap);
        expect(result).toBe(false);
    });
});
//# sourceMappingURL=micropython-appended.spec.js.map
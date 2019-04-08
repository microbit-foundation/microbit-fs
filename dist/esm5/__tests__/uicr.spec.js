import * as fs from 'fs';
import { getIntelHexUicrData } from '../uicr';
describe('Read MicroPython UICR data.', function () {
    it('Read MicroPython v1.0.1 hex file UICR', function () {
        var uPyHexFile = fs.readFileSync('./src/__tests__/upy-v1.0.1.hex', 'utf8');
        var expectedPageSize = 1024;
        var expectedRuntimeStartPage = 0;
        var MicroPythonLastByteUsed = 0x388b8;
        var expectedRuntimeEndPage = Math.ceil(MicroPythonLastByteUsed / expectedPageSize);
        var expectedVersionAddress = 0x036d2d;
        var expectedVersion = 'micro:bit v1.0.1+b0bf4a9 on 2018-12-13; ' +
            'MicroPython v1.9.2-34-gd64154c73 on 2017-09-01';
        var result = getIntelHexUicrData(uPyHexFile);
        expect(result.flashPageSize).toEqual(expectedPageSize);
        expect(result.runtimeStartPage).toEqual(expectedRuntimeStartPage);
        expect(result.runtimeStartAddress).toEqual(expectedRuntimeStartPage * expectedPageSize);
        expect(result.runtimeEndUsed).toEqual(expectedRuntimeEndPage);
        expect(result.runtimeEndAddress).toEqual(expectedRuntimeEndPage * expectedPageSize);
        expect(result.versionAddress).toEqual(expectedVersionAddress);
        expect(result.version).toEqual(expectedVersion);
    });
    it('UICR data without MicroPython magic number', function () {
        var makeCodeUicr = ':020000041000EA\n' +
            ':0410140000C0030015\n' +
            ':040000050003C0C173\n' +
            ':00000001FF\n';
        var failCase = function () {
            var result = getIntelHexUicrData(makeCodeUicr);
        };
        expect(failCase).toThrow(Error);
    });
    // TODO: Write these tests
    /*
    it('UICR data without enough MicroPython data.', () => {});
    it('UICR MicroPython version address is not in Intel Hex.', () => {});
    it('UICR MicroPython version address data does not have a null terminator.', () => {});
    */
});
//# sourceMappingURL=uicr.spec.js.map
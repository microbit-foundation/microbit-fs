import * as fs from 'fs';

import { getIntelHexUicrData } from '../uicr';

describe('Read MicroPython UICR data.', () => {
  it('Read MicroPython v1.0.1 hex file UICR', () => {
    const uPyHexFile = fs.readFileSync(
      './src/__tests__/upy-v1.0.1.hex',
      'utf8'
    );
    const expectedPageSize = 1024;
    const expectedRuntimeStartPage = 0;
    const MicroPythonLastByteUsed = 0x388b8;
    const expectedRuntimeEndPage = Math.ceil(
      MicroPythonLastByteUsed / expectedPageSize
    );
    const expectedVersionAddress = 0x036d2d;
    const expectedVersion =
      'micro:bit v1.0.1+b0bf4a9 on 2018-12-13; ' +
      'MicroPython v1.9.2-34-gd64154c73 on 2017-09-01';

    const result = getIntelHexUicrData(uPyHexFile);

    expect(result.FlashPageSize).toEqual(expectedPageSize);
    expect(result.RuntimeStartPage).toEqual(expectedRuntimeStartPage);
    expect(result.RuntimeStartAddress).toEqual(
      expectedRuntimeStartPage * expectedPageSize
    );
    expect(result.RuntimeEndUsed).toEqual(expectedRuntimeEndPage);
    expect(result.RuntimeEndAddress).toEqual(
      expectedRuntimeEndPage * expectedPageSize
    );
    expect(result.VersionAddress).toEqual(expectedVersionAddress);
    expect(result.Version).toEqual(expectedVersion);
  });

  it('UICR data without MicroPython magic number', () => {
    const makeCodeUicr =
      ':020000041000EA\n' +
      ':0410140000C0030015\n' +
      ':040000050003C0C173\n' +
      ':00000001FF\n';
    const failCase = () => {
      const result = getIntelHexUicrData(makeCodeUicr);
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

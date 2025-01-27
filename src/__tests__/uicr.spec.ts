/**
 * (c) 2019 Micro:bit Educational Foundation and the microbit-fs contributors.
 * SPDX-License-Identifier: MIT
 */
import * as fs from 'fs';

import { getIntelHexUicrData } from '../uicr';
import { expect, describe, it } from 'vitest';

describe('Read MicroPython UICR data.', () => {
  const uPy1HexFile = fs.readFileSync('./src/__tests__/upy-v1.0.1.hex', 'utf8');
  const uPy2HexFile = fs.readFileSync(
    './src/__tests__/upy-v2-beta-uicr.hex',
    'utf8'
  );

  it('Read MicroPython v1.0.1 hex file UICR', () => {
    const expectedPageSize = 1024;
    const expectedFlashSize = 256 * 1024;
    const expectedFlashStartAddress = 0;
    const expectedFlashEndAddress = 256 * 1024;
    const expectedRuntimeStartPage = 0;
    const MicroPythonLastByteUsed = 0x388b8;
    const expectedRuntimeEndPage = Math.ceil(
      MicroPythonLastByteUsed / expectedPageSize
    );
    const expectedRuntimeEndAddress = expectedRuntimeEndPage * expectedPageSize;
    const expectedUicrStartAddress = 0x100010c0;
    const expectedUicrEndAddress = 0x100010dc;
    const expectedFsStartAddress = expectedRuntimeEndAddress;
    const expectedFsEndAddress = expectedFlashEndAddress;
    const expectedUPyVersion =
      'micro:bit v1.0.1+b0bf4a9 on 2018-12-13; ' +
      'MicroPython v1.9.2-34-gd64154c73 on 2017-09-01';
    const expectedDeviceVersion = 'V1';

    const result = getIntelHexUicrData(uPy1HexFile);

    expect(result.flashPageSize).toEqual(expectedPageSize);
    expect(result.flashSize).toEqual(expectedFlashSize);
    expect(result.flashStartAddress).toEqual(expectedFlashStartAddress);
    expect(result.flashEndAddress).toEqual(expectedFlashEndAddress);
    expect(result.runtimeStartAddress).toEqual(
      expectedRuntimeStartPage * expectedPageSize
    );
    expect(result.runtimeEndAddress).toEqual(
      expectedRuntimeEndPage * expectedPageSize
    );
    expect(result.fsStartAddress).toEqual(expectedFsStartAddress);
    expect(result.fsEndAddress).toEqual(expectedFsEndAddress);
    expect(result.uicrStartAddress).toEqual(expectedUicrStartAddress);
    expect(result.uicrEndAddress).toEqual(expectedUicrEndAddress);
    expect(result.uPyVersion).toEqual(expectedUPyVersion);
    expect(result.deviceVersion).toEqual(expectedDeviceVersion);
  });

  it('Read MicroPython v2.0.0 beta hex file UICR', () => {
    const expectedPageSize = 4096;
    const expectedFlashSize = 512 * 1024;
    const expectedFlashStartAddress = 0;
    const expectedFlashEndAddress = 512 * 1024;
    const expectedRuntimeStartPage = 0;
    // This is the last address used, but the UICR has been manually created
    // to indicate 104 pages used
    const expectedRuntimeEndPage = 109;
    const expectedUicrStartAddress = 0x100010c0;
    const expectedUicrEndAddress = 0x100010dc;
    const expectedFsStartAddress = 0x6d000;
    const expectedFsEndAddress = 0x73000;
    const expectedUPyVersion =
      'micro:bit v2.0.99+3e09245 on 2020-11-02; ' +
      'MicroPython 3e09245 on 2020-11-02';
    const expectedDeviceVersion = 'V2';

    const result = getIntelHexUicrData(uPy2HexFile);

    expect(result.flashPageSize).toEqual(expectedPageSize);
    expect(result.flashSize).toEqual(expectedFlashSize);
    expect(result.flashStartAddress).toEqual(expectedFlashStartAddress);
    expect(result.flashEndAddress).toEqual(expectedFlashEndAddress);
    expect(result.runtimeStartAddress).toEqual(
      expectedRuntimeStartPage * expectedPageSize
    );
    expect(result.runtimeEndAddress).toEqual(
      expectedRuntimeEndPage * expectedPageSize
    );
    expect(result.fsStartAddress).toEqual(expectedFsStartAddress);
    expect(result.fsEndAddress).toEqual(expectedFsEndAddress);
    expect(result.uicrStartAddress).toEqual(expectedUicrStartAddress);
    expect(result.uicrEndAddress).toEqual(expectedUicrEndAddress);
    expect(result.uPyVersion).toEqual(expectedUPyVersion);
    expect(result.deviceVersion).toEqual(expectedDeviceVersion);
  });

  it('UICR data without MicroPython magic number', () => {
    const makeCodeUicr =
      ':020000041000EA\n' +
      ':0410140000C0030015\n' +
      ':040000050003C0C173\n' +
      ':00000001FF\n';

    const failCase = () => {
      getIntelHexUicrData(makeCodeUicr);
    };

    expect(failCase).toThrow(Error);
  });

  // TODO: Write these tests
  /*
  it('UICR data with wrong magic numbers.', () => {});
  it('UICR data without enough MicroPython data.', () => {});
  it('UICR MicroPython version address is not in Intel Hex.', () => {});
  it('UICR MicroPython version address data does not have a null terminator.', () => {});
  it('UICR runtimeStartPage is not 0', () => {});
  */
});

/**
 * (c) 2021 Micro:bit Educational Foundation and the microbit-fs contributors.
 * SPDX-License-Identifier: MIT
 */
import * as fs from 'fs';

import { getIntelHexDeviceMemInfo } from '../hex-mem-info.js';
import { expect, describe, it } from 'vitest';

describe('Read MicroPython V1 UICR hex mem info data.', () => {
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
    const expectedFsStartAddress = expectedRuntimeEndAddress;
    const expectedFsEndAddress = expectedFlashEndAddress;
    const expectedUPyVersion =
      'micro:bit v1.0.1+b0bf4a9 on 2018-12-13; ' +
      'MicroPython v1.9.2-34-gd64154c73 on 2017-09-01';
    const expectedDeviceVersion = 'V1';

    const result = getIntelHexDeviceMemInfo(uPy1HexFile);

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
    expect(result.uPyVersion).toEqual(expectedUPyVersion);
    expect(result.deviceVersion).toEqual(expectedDeviceVersion);
  });

  it('Read MicroPython v2.0.0 beta hex file UICR', () => {
    const expectedPageSize = 4096;
    const expectedFlashSize = 512 * 1024;
    const expectedFlashStartAddress = 0;
    const expectedFlashEndAddress = 512 * 1024;
    const expectedRuntimeStartPage = 0;
    const expectedRuntimeEndPage = 109;
    const expectedFsStartAddress = 0x6d000;
    const expectedFsEndAddress = 0x73000;
    const expectedUPyVersion =
      'micro:bit v2.0.99+3e09245 on 2020-11-02; ' +
      'MicroPython 3e09245 on 2020-11-02';
    const expectedDeviceVersion = 'V2';

    const result = getIntelHexDeviceMemInfo(uPy2HexFile);

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
      getIntelHexDeviceMemInfo(makeCodeUicr);
    };

    expect(failCase).toThrow(Error);
  });
});

describe('Read MicroPython V2 flash regions data.', () => {
  const uPyHexFile = fs.readFileSync(
    './src/__tests__/upy-v2-beta-region.hex',
    'utf8'
  );

  it('Read MicroPython v2-beta-region hex file flash regions table', () => {
    const expectedPageSize = 4096;
    const expectedFlashSize = 512 * 1024;
    const MicroPythonLastByteUsed = 0x61f24;
    const expectedRuntimeEndPage = Math.ceil(
      MicroPythonLastByteUsed / expectedPageSize
    );
    const expectedFsStartAddress = 0x6d000;
    const expectedFsEndAddress = 0x73000;
    const expectedUpyVersion =
      'micro:bit v2.0.99+b260810 on 2020-11-17; ' +
      'MicroPython b260810 on 2020-11-17';

    const result = getIntelHexDeviceMemInfo(uPyHexFile);

    expect(result.flashPageSize).toEqual(expectedPageSize);
    expect(result.flashSize).toEqual(expectedFlashSize);
    expect(result.flashStartAddress).toEqual(0);
    expect(result.flashEndAddress).toEqual(expectedFlashSize);
    expect(result.runtimeStartAddress).toEqual(0);
    expect(result.runtimeEndAddress).toEqual(
      expectedRuntimeEndPage * expectedPageSize
    );
    expect(result.fsStartAddress).toEqual(expectedFsStartAddress);
    expect(result.fsEndAddress).toEqual(expectedFsEndAddress);
    expect(result.uPyVersion).toEqual(expectedUpyVersion);
    expect(result.deviceVersion).toEqual('V2');
  });
});

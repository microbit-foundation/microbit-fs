/**
 * (c) 2019 Micro:bit Educational Foundation and the microbit-fs contributors.
 * SPDX-License-Identifier: MIT
 */
import * as fs from 'fs';

import * as flashRegions from '../flash-regions';

describe('Read MicroPython flash regions data.', () => {
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

    const result = flashRegions.getIntelHexFlashRegionsData(uPyHexFile);

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

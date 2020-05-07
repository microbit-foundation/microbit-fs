/**
 * (c) 2019 Micro:bit Educational Foundation and the microbit-fs contributors.
 * SPDX-License-Identifier: MIT
 */
import MemoryMap from 'nrf-intel-hex';

import {
  addIntelHexAppendedScript,
  getIntelHexAppendedScript,
  isAppendedScriptPresent,
} from '../micropython-appended';

const simpleIntelHex: string =
  ':020000040000FA\n' +
  ':1000000000400020ED530100295401002B54010051\n' +
  ':00000001FF\n';

const pyCode = 'from microbit import *\n' + "display.scroll('Hello, World!')";
const pyCodeHex =
  ':020000040003F7\n' +
  ':10E000004D50360066726F6D206D6963726F626984\n' +
  ':10E010007420696D706F7274202A0A646973706C61\n' +
  ':10E0200061792E7363726F6C6C282748656C6C6F16\n' +
  ':10E030002C20576F726C642127290000000000001B';

const marker = ':::::::::::::::::::::::::::::::::::::::::::';

describe('Inject Python code into Intel Hex string', () => {
  it('Inject Python code into an Intel Hex string', () => {
    const output: string = addIntelHexAppendedScript(simpleIntelHex, pyCode);

    const fullHex: string[] = simpleIntelHex.split('\n');
    fullHex.splice(2, 0, pyCodeHex);
    expect(output).toEqual(fullHex.join('\n'));
  });

  it('Inject Python with present UICR and Start Linear Address record', () => {
    const uicr: string =
      ':020000041000EA\n' +
      ':1010C0007CB0EE17FFFFFFFF0A0000000000E30006\n' +
      ':0C10D000FFFFFFFF2D6D0300000000007B';
    const record: string = ':0400000500018E2147';
    const fullHex: string[] = simpleIntelHex.split('\n');
    fullHex.splice(2, 0, uicr + '\n' + record);

    const output: string = addIntelHexAppendedScript(
      fullHex.join('\n'),
      pyCode
    );

    const expectedHex: string[] = simpleIntelHex.split('\n');
    // Note that the 05 record is removed by nrf-intel-hex library!
    expectedHex.splice(2, 0, pyCodeHex + '\n' + uicr);
    expect(output).toEqual(expectedHex.join('\n'));
  });

  it('Inject Python in a hex with a  marker', () => {
    const fullHexWithMarker: string[] = simpleIntelHex.split('\n');
    fullHexWithMarker.splice(2, 0, marker);
    const fullHexWithout: string[] = simpleIntelHex.split('\n');
    const expectedHex: string[] = simpleIntelHex.split('\n');
    expectedHex.splice(2, 0, pyCodeHex);

    const outputWithMarker: string = addIntelHexAppendedScript(
      fullHexWithMarker.join('\n'),
      pyCode
    );
    const outputWithout: string = addIntelHexAppendedScript(
      fullHexWithout.join('\n'),
      pyCode
    );

    expect(outputWithMarker).toEqual(expectedHex.join('\n'));
    expect(outputWithMarker).toEqual(outputWithout);
  });

  it('Fail to inject Python code too large for flash', () => {
    const failCase = () => {
      const fakeCode: string = new Array(8 * 1024 + 2).join('a');
      const output: string = addIntelHexAppendedScript(
        simpleIntelHex,
        fakeCode
      );
    };
    expect(failCase).toThrow(RangeError);
  });
});

describe('Extract Python code from Intel Hex string', () => {
  it('Extract Python code', () => {
    const intelHex1: string =
      ':020000040000FA\n' +
      ':1000000000400020ED530100295401002B54010051\n' +
      ':020000040003F7\n' +
      pyCodeHex +
      '\n' +
      ':00000001FF\n';
    // pyCodeHex contains zeros to fill the record, this example doesn't
    const intelHex2: string =
      ':020000040000FA\n' +
      ':1000000000400020ED530100295401002B54010051\n' +
      ':020000040003F7\n' +
      ':10E000004D50360066726F6D206D6963726F626984\n' +
      ':10E010007420696D706F7274202A0A646973706C61\n' +
      ':10E0200061792E7363726F6C6C282748656C6C6F16\n' +
      ':0AE030002C20576F726C6421272921\n' +
      ':00000001FF\n';

    const result1: string = getIntelHexAppendedScript(intelHex1);
    const result2: string = getIntelHexAppendedScript(intelHex2);

    expect(result1).toEqual(pyCode);
    expect(result2).toEqual(pyCode);
  });

  it('Extract Python code with present UICR and Start Linear Address record)', () => {
    const intelHex: string =
      ':020000040000FA\n' +
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

    const result: string = getIntelHexAppendedScript(intelHex);

    expect(result).toEqual(pyCode);
  });

  it('There is no Python code to extract', () => {
    const intelHex: string =
      ':020000040000FA\n' +
      ':1000000000400020ED530100295401002B54010051\n' +
      ':00000001FF\n';

    const result: string = getIntelHexAppendedScript(intelHex);

    expect(result).toEqual('');
  });

  it('The Python code block contains garbage', () => {
    const intelHex: string =
      ':020000040000FA\n' +
      ':1000000000400020ED530100295401002B54010051\n' +
      ':020000040003F7\n' +
      ':10E000000102030405060708090A0B0C0D0E0F1088\n' +
      ':00000001FF\n';

    const result: string = getIntelHexAppendedScript(intelHex);

    expect(result).toEqual('');
  });
});

describe('Detect appended script.', () => {
  it('Appended script can be detected.', () => {
    const outputHex: string = addIntelHexAppendedScript(simpleIntelHex, 'code');
    const outputMap: MemoryMap = MemoryMap.fromHex(outputHex);

    const resultStr = isAppendedScriptPresent(outputHex);
    const resultMap = isAppendedScriptPresent(outputMap);

    expect(resultStr).toBe(true);
    expect(resultMap).toBe(true);
  });

  it('Missing appended script can be detected.', () => {
    const simpleMap: MemoryMap = MemoryMap.fromHex(simpleIntelHex);

    const resultStr = isAppendedScriptPresent(simpleIntelHex);
    const resultMap = isAppendedScriptPresent(simpleMap);

    expect(resultStr).toBe(false);
    expect(resultMap).toBe(false);
  });

  it('Appended script area with rubbish is not detected as code.', () => {
    // There is 8 Kbs at the end of flash for the appended script
    const appendedAddress = (256 - 8) * 1024;
    const simpleMap: MemoryMap = MemoryMap.fromHex(simpleIntelHex);
    simpleMap.set(appendedAddress, new Uint8Array([1, 2, 3, 4, 5, 6, 7, 9, 0]));

    const result = isAppendedScriptPresent(simpleMap);

    expect(result).toBe(false);
  });
});

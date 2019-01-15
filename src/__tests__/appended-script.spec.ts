import {
  appendScriptToIntelHex,
  getScriptFromIntelHex,
} from '../appended-script';

describe('Inject Python code into Intel Hex string', () => {
  const simpleIntelHex: string =
    ':020000040000FA\n' +
    ':1000000000400020ED530100295401002B54010051\n' +
    ':00000001FF\n';

  it('Inject Python code into an Intel Hex string', () => {
    const pyCode =
      'from microbit import *\n' + "display.scroll('Hello, World!')";
    const pyCodeHex =
      ':020000040003F7\n' +
      ':10E000004D50360066726F6D206D6963726F626984\n' +
      ':10E010007420696D706F7274202A0A646973706C61\n' +
      ':10E0200061792E7363726F6C6C282748656C6C6F16\n' +
      ':0AE030002C20576F726C6421272921';

    const output: string = appendScriptToIntelHex(simpleIntelHex, pyCode);

    const fullHex: string[] = simpleIntelHex.split('\n');
    fullHex.splice(2, 0, pyCodeHex);
    expect(output).toEqual(fullHex.join('\n'));
  });

  it('Inject Python with present UICR and Start Linear Address record', () => {
    const pyCode: string =
      'from microbit import *\n' + "display.scroll('Hello, World!')";
    const pyCodeHex: string =
      ':020000040003F7\n' +
      ':10E000004D50360066726F6D206D6963726F626984\n' +
      ':10E010007420696D706F7274202A0A646973706C61\n' +
      ':10E0200061792E7363726F6C6C282748656C6C6F16\n' +
      ':0AE030002C20576F726C6421272921\n';
    const uicr: string =
      ':020000041000EA\n' +
      ':1010C0007CB0EE17FFFFFFFF0A0000000000E30006\n' +
      ':0C10D000FFFFFFFF2D6D0300000000007B';
    const record: string = ':0400000500018E2147';
    const fullHex: string[] = simpleIntelHex.split('\n');
    fullHex.splice(2, 0, uicr + '\n' + record);

    const output: string = appendScriptToIntelHex(fullHex.join('\n'), pyCode);

    const expectedHex: string[] = simpleIntelHex.split('\n');
    // Note that the 05 record is removed by nrf-intel-hex library!
    expectedHex.splice(2, 0, pyCodeHex + uicr);
    expect(output).toEqual(expectedHex.join('\n'));
  });

  it('Fail to inject Python code too large for flash', () => {
    const failCase = () => {
      const fakeCode: string = new Array(8 * 1024 + 2).join('a');
      const output: string = appendScriptToIntelHex(simpleIntelHex, fakeCode);
    };
    expect(failCase).toThrow(RangeError);
  });
});

describe('Extract Python code from Intel Hex string', () => {
  it('Extract Python code', () => {
    const pyCode: string =
      'from microbit import *\n' + "display.scroll('Hello, World!')";
    const intelHex: string =
      ':020000040000FA\n' +
      ':1000000000400020ED530100295401002B54010051\n' +
      ':020000040003F7\n' +
      ':10E000004D50360066726F6D206D6963726F626984\n' +
      ':10E010007420696D706F7274202A0A646973706C61\n' +
      ':10E0200061792E7363726F6C6C282748656C6C6F16\n' +
      ':0AE030002C20576F726C6421272921\n' +
      ':00000001FF\n';

    const result: string = getScriptFromIntelHex(intelHex);

    expect(result).toEqual(pyCode);
  });

  it('Extract Python code with present UICR and Start Linear Address record)', () => {
    const pyCode: string =
      'from microbit import *\n' + "display.scroll('Hello, World!')";
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

    const result: string = getScriptFromIntelHex(intelHex);

    expect(result).toEqual(pyCode);
  });

  it('There is no Python code to extract', () => {
    const intelHex: string =
      ':020000040000FA\n' +
      ':1000000000400020ED530100295401002B54010051\n' +
      ':00000001FF\n';

    const result: string = getScriptFromIntelHex(intelHex);

    expect(result).toEqual('');
  });

  it('The Python code block contains garbage', () => {
    const intelHex: string =
      ':020000040000FA\n' +
      ':1000000000400020ED530100295401002B54010051\n' +
      ':020000040003F7\n' +
      ':10E000000102030405060708090A0B0C0D0E0F1088\n' +
      ':00000001FF\n';

    const result: string = getScriptFromIntelHex(intelHex);

    expect(result).toEqual('');
  });
});

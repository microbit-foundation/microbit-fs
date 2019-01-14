import { extractPyStrFromIntelHex, injectPyStrIntoIntelHex } from '../upyhex';

describe('Inject Python code into Intel Hex string', () => {
  const simpleIntelHex =
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

    const output = injectPyStrIntoIntelHex(simpleIntelHex, pyCode);

    const fullHex = simpleIntelHex.split('\n');
    fullHex.splice(2, 0, pyCodeHex);
    expect(output).toEqual(fullHex.join('\n'));
  });

  it('Fail to inject Python code too large for flash', () => {
    const failCase = () => {
      const fakeCode = new Array(8 * 1024 + 2).join('a');
      const output = injectPyStrIntoIntelHex(simpleIntelHex, fakeCode);
    };
    expect(failCase).toThrow(RangeError);
  });
});

describe('Extract Python code from Intel Hex string', () => {
  it('Extract Python code', () => {
    const pyCode =
      'from microbit import *\n' + "display.scroll('Hello, World!')";
    const intelHex =
      ':020000040000FA\n' +
      ':1000000000400020ED530100295401002B54010051\n' +
      ':020000040003F7\n' +
      ':10E000004D50360066726F6D206D6963726F626984\n' +
      ':10E010007420696D706F7274202A0A646973706C61\n' +
      ':10E0200061792E7363726F6C6C282748656C6C6F16\n' +
      ':0AE030002C20576F726C6421272921\n' +
      ':00000001FF\n';

    const result = extractPyStrFromIntelHex(intelHex);

    expect(result).toEqual(pyCode);
  });

  it('There is no Python code to extract', () => {
    const intelHex =
      ':020000040000FA\n' +
      ':1000000000400020ED530100295401002B54010051\n' +
      ':00000001FF\n';

    const result = extractPyStrFromIntelHex(intelHex);

    expect(result).toEqual('');
  });
});

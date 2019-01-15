import * as fs from 'fs';

import { FileSystem } from '../file-manager';

describe('Test', () => {
  const uPyHexFile = fs.readFileSync('./src/__tests__/upy-v1.0.1.hex', 'utf8');

  it('Write and Read files', () => {
    const content1 = "from microbit import display\r\ndisplay.show('x')";
    const content2 = "from microbit import display\r\ndisplay.show('y')";

    const microbitFs = new FileSystem(uPyHexFile);
    microbitFs.write('test.py', content1);
    microbitFs.write('test2.py', content2);
    const file1 = microbitFs.read('test.py');
    const file2 = microbitFs.read('test2.py');

    const files = microbitFs.ls();
    expect(files).toContain('test.py');
    expect(files).toContain('test2.py');
    expect(file1).toEqual(content1);
    expect(file2).toEqual(content2);
  });

  it('Write and Read files bytes', () => {
    const content1 = new Uint8Array([1, 2, 3]);
    const content2 = new Uint8Array([4, 5, 6]);

    const microbitFs = new FileSystem(uPyHexFile);
    microbitFs.write('test.py', content1);
    microbitFs.write('test2.py', content2);
    const file1 = microbitFs.readBytes('test.py');
    const file2 = microbitFs.readBytes('test2.py');

    const files = microbitFs.ls();
    expect(files).toContain('test.py');
    expect(files).toContain('test2.py');
    expect(file1).toEqual(content1);
    expect(file2).toEqual(content2);
  });

  it('Delete files', () => {
    const content = "from microbit import display\r\ndisplay.show('x')";

    const microbitFs = new FileSystem(uPyHexFile);
    microbitFs.write('test.py', content);
    microbitFs.write('test2.py', content);
    const lsBefore = microbitFs.ls();
    microbitFs.remove('test.py');
    const lsAfter = microbitFs.ls();

    expect(lsBefore).toContain('test.py');
    expect(lsAfter).not.toContain('test.py');
  });

  it('Get Intel Hex', () => {
    // This test is a bit useless at the moment, need to replace as soon
    // as this method is properly implemented
    const microbitFs = new FileSystem(uPyHexFile);
    const returnedIntelHex = microbitFs.getIntelHex();

    expect(returnedIntelHex).toEqual(uPyHexFile);
  });
});

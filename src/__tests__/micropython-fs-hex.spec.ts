/**
 * (c) 2019 Micro:bit Educational Foundation and the microbit-fs contributors.
 * SPDX-License-Identifier: MIT
 */
import * as fs from 'fs';

import MemoryMap from 'nrf-intel-hex';

import * as fsBuilder from '../micropython-fs-builder';
import { MicropythonFsHex } from '../micropython-fs-hex';

// Mock Spy
const addIntelHexFilesSpy = jest.spyOn(fsBuilder, 'addIntelHexFiles');

// MicroPython hex file for testing
const uPyHexFile = fs.readFileSync('./src/__tests__/upy-v1.0.1.hex', 'utf8');

describe('Test general read write operations', () => {
  it('Write and read files', () => {
    const content1 = "from microbit import display\r\ndisplay.show('x')";
    const content2 = "from microbit import display\r\ndisplay.show('y')";
    const micropythonFs = new MicropythonFsHex(uPyHexFile);

    micropythonFs.write('test.py', content1);
    micropythonFs.write('test2.py', content2);
    const file1 = micropythonFs.read('test.py');
    const file2 = micropythonFs.read('test2.py');
    const files = micropythonFs.ls();

    expect(files).toContain('test.py');
    expect(files).toContain('test2.py');
    expect(file1).toEqual(content1);
    expect(file2).toEqual(content2);
  });

  it('Write and read files bytes', () => {
    const content1 = new Uint8Array([1, 2, 3]);
    const content2 = new Uint8Array([4, 5, 6]);
    const micropythonFs = new MicropythonFsHex(uPyHexFile);

    micropythonFs.write('test.py', content1);
    micropythonFs.write('test2.py', content2);
    const file1 = micropythonFs.readBytes('test.py');
    const file2 = micropythonFs.readBytes('test2.py');
    const files = micropythonFs.ls();

    expect(files).toContain('test.py');
    expect(files).toContain('test2.py');
    expect(file1).toEqual(content1);
    expect(file2).toEqual(content2);
  });
});

describe('Test create method.', () => {
  it('Creates new files.', () => {
    const microbitFs = new MicropythonFsHex(uPyHexFile);
    expect(microbitFs.exists('test.py')).toBe(false);

    microbitFs.create('test.py', 'content');

    expect(microbitFs.exists('test.py')).toBe(true);
  });

  it('Create does not overwrite files.', () => {
    const micropythonFs = new MicropythonFsHex(uPyHexFile);
    micropythonFs.create('test.py', 'content');

    const failCase = () => micropythonFs.create('test.py', 'content');

    expect(failCase).toThrow(Error);
  });

  it('Throw error with invalid file name.', () => {
    const micropythonFs = new MicropythonFsHex(uPyHexFile);

    const failCase1 = () => micropythonFs.create('', 'content');
    // @ts-ignore
    const failCase2 = () => micropythonFs.create(null, 'content');
    // @ts-ignore
    const failCase3 = () => micropythonFs.create(undefined, 'content');

    expect(failCase1).toThrow(Error);
    expect(failCase2).toThrow(Error);
    expect(failCase3).toThrow(Error);
  });

  it('Throw error with invalid file content.', () => {
    const micropythonFs = new MicropythonFsHex(uPyHexFile);

    const failCase1 = () => micropythonFs.create('file.txt', '');
    // @ts-ignore
    const failCase2 = () => micropythonFs.create('file.txt', null);
    // @ts-ignore
    const failCase3 = () => micropythonFs.create('file.txt', undefined);

    expect(failCase1).toThrow(Error);
    expect(failCase2).toThrow(Error);
    expect(failCase3).toThrow(Error);
  });
});

describe('Test size operations.', () => {
  it('Creates new files.', () => {
    const microbitFs = new MicropythonFsHex(uPyHexFile);

    expect(microbitFs.getStorageUsed()).toEqual(0);
    expect(microbitFs.getStorageRemaining()).toEqual(27648);

    microbitFs.create('chunk1.py', 'first 128 byte chunk');

    expect(microbitFs.getStorageUsed()).toEqual(128);
    expect(microbitFs.getStorageRemaining()).toEqual(27648 - 128);

    microbitFs.create('chunk2.py', 'second 128 byte chunk');

    expect(microbitFs.getStorageUsed()).toEqual(256);
    expect(microbitFs.getStorageRemaining()).toEqual(27648 - 256);

    microbitFs.create('chunk3.py', new Uint8Array(26800).fill(0x60));

    expect(microbitFs.getStorageUsed()).toEqual(27648 - 128);
    expect(microbitFs.getStorageRemaining()).toEqual(128);

    microbitFs.create('chunk4.py', 'fourth chunk');

    expect(microbitFs.getStorageUsed()).toEqual(27648);
    expect(microbitFs.getStorageRemaining()).toEqual(0);
  });

  it('Sets a maximum filesystem size via constructor', () => {
    const microbitFs = new MicropythonFsHex(uPyHexFile, { maxFsSize: 1024 });

    expect(microbitFs.getStorageUsed()).toEqual(0);
    expect(microbitFs.getStorageRemaining()).toEqual(1024);

    microbitFs.create('chunk1.py', 'first 128 byte chunk');
    microbitFs.create('chunk2.py', 'second 128 byte chunk');
    microbitFs.create('chunk3.py', 'thrid 128 byte chunk');
    microbitFs.create('chunk4.py', 'fouth 128 byte chunk');
    microbitFs.create('chunk5.py', 'fifth 128 byte chunk');
    microbitFs.create('chunk6.py', 'sixth 128 byte chunk');
    microbitFs.create('chunk7.py', 'seventh 128 byte chunk');
    microbitFs.create('chunk8.py', 'eighth 128 byte chunk');
    microbitFs.getIntelHex();

    expect(microbitFs.getStorageUsed()).toEqual(1024);
    expect(microbitFs.getStorageRemaining()).toEqual(0);

    microbitFs.create('chunk9.py', 'This file will not fit');
    const failCase = () => {
      microbitFs.getIntelHex();
    };

    expect(failCase).toThrow(Error);
  });

  it('Sets a maximum filesystem size via constructor', () => {
    const microbitFs = new MicropythonFsHex(uPyHexFile);
    microbitFs.setStorageSize(1024);

    expect(microbitFs.getStorageUsed()).toEqual(0);
    expect(microbitFs.getStorageRemaining()).toEqual(1024);

    microbitFs.create('chunk1.py', 'first 128 byte chunk');
    microbitFs.create('chunk2.py', 'second 128 byte chunk');
    microbitFs.create('chunk3.py', 'thrid 128 byte chunk');
    microbitFs.create('chunk4.py', 'fouth 128 byte chunk');
    microbitFs.create('chunk5.py', 'fifth 128 byte chunk');
    microbitFs.create('chunk6.py', 'sixth 128 byte chunk');
    microbitFs.create('chunk7.py', 'seventh 128 byte chunk');
    microbitFs.create('chunk8.py', 'eighth 128 byte chunk');
    microbitFs.getIntelHex();
    microbitFs.getIntelHexBytes();

    expect(microbitFs.getStorageUsed()).toEqual(1024);
    expect(microbitFs.getStorageRemaining()).toEqual(0);

    microbitFs.create('chunk9.py', 'This file will not fit');
    const failCase1 = () => microbitFs.getIntelHex();
    const failCase2 = () => microbitFs.getIntelHexBytes();

    expect(failCase1).toThrow(Error);
    expect(failCase2).toThrow(Error);
  });

  it('The maximum filesystem size cannot be larger than space available', () => {
    const failCase1 = () => {
      const microbitFs2 = new MicropythonFsHex(uPyHexFile, {
        maxFsSize: 1024 * 1024,
      });
    };
    const microbitFs = new MicropythonFsHex(uPyHexFile);
    const failCase2 = () => microbitFs.setStorageSize(1024 * 1024);

    expect(failCase1).toThrow(Error);
    expect(failCase2).toThrow(Error);
  });
});

describe('Test write method.', () => {
  it('Throw error with invalid file name.', () => {
    const micropythonFs = new MicropythonFsHex(uPyHexFile);

    const failCase1 = () => micropythonFs.write('', 'content');
    // @ts-ignore
    const failCase2 = () => micropythonFs.write(null, 'content');
    // @ts-ignore
    const failCase3 = () => micropythonFs.write(undefined, 'content');

    expect(failCase1).toThrow(Error);
    expect(failCase2).toThrow(Error);
    expect(failCase3).toThrow(Error);
  });

  it('Throw error with invalid file content.', () => {
    const micropythonFs = new MicropythonFsHex(uPyHexFile);

    const failCase1 = () => micropythonFs.write('file.txt', '');
    // @ts-ignore
    const failCase2 = () => micropythonFs.write('file.txt', null);
    // @ts-ignore
    const failCase3 = () => micropythonFs.write('file.txt', undefined);

    expect(failCase1).toThrow(Error);
    expect(failCase2).toThrow(Error);
    expect(failCase3).toThrow(Error);
  });
});

describe('Test append method.', () => {
  it('Throw error with invalid file name.', () => {
    const micropythonFs = new MicropythonFsHex(uPyHexFile);

    const failCase1 = () => micropythonFs.append('', 'more content');
    // @ts-ignore
    const failCase2 = () => micropythonFs.append(null, 'more content');
    // @ts-ignore
    const failCase3 = () => micropythonFs.append(undefined, 'more content');

    expect(failCase1).toThrow(Error);
    expect(failCase2).toThrow(Error);
    expect(failCase3).toThrow(Error);
  });

  it('Throw error if the file does not exists.', () => {
    const microbitFs = new MicropythonFsHex(uPyHexFile);

    const failCase = () => microbitFs.append('does_not_exists.txt', 'content');

    expect(failCase).toThrow(Error);
  });

  it('Append is not yet implemented.', () => {
    const micropythonFs = new MicropythonFsHex(uPyHexFile);
    micropythonFs.write('a.txt', 'content');

    const failCase = () => micropythonFs.append('a.txt', 'more content');

    expect(failCase).toThrow(Error);
  });
});

describe('Test read method.', () => {
  it('Throw error with invalid file name.', () => {
    const micropythonFs = new MicropythonFsHex(uPyHexFile);

    const failCase1 = () => micropythonFs.read('');
    // @ts-ignore
    const failCase2 = () => micropythonFs.read(null);
    // @ts-ignore
    const failCase3 = () => micropythonFs.read(undefined);

    expect(failCase1).toThrow(Error);
    expect(failCase2).toThrow(Error);
    expect(failCase3).toThrow(Error);
  });

  it('Throw error if the file does not exists.', () => {
    const micropythonFs = new MicropythonFsHex(uPyHexFile);

    const failCase = () => micropythonFs.read('does_not_exists.txt');

    expect(failCase).toThrow(Error);
  });
});

describe('Test readBytes method.', () => {
  it('Throw error with invalid file name.', () => {
    const micropythonFs = new MicropythonFsHex(uPyHexFile);

    const failCase1 = () => micropythonFs.readBytes('');
    // @ts-ignore
    const failCase2 = () => micropythonFs.readBytes(null);
    // @ts-ignore
    const failCase3 = () => micropythonFs.readBytes(undefined);

    expect(failCase1).toThrow(Error);
    expect(failCase2).toThrow(Error);
    expect(failCase3).toThrow(Error);
  });

  it('Throw error if the file does not exists.', () => {
    const micropythonFs = new MicropythonFsHex(uPyHexFile);

    const failCase = () => micropythonFs.readBytes('does_not_exists.txt');

    expect(failCase).toThrow(Error);
  });
});

describe('Test remove method.', () => {
  it('Delete files.', () => {
    const content = "from microbit import display\r\ndisplay.show('x')";
    const micropythonFs = new MicropythonFsHex(uPyHexFile);
    micropythonFs.write('test.py', content);
    micropythonFs.write('test2.py', content);

    const lsBefore = micropythonFs.ls();
    micropythonFs.remove('test.py');
    const lsAfter = micropythonFs.ls();

    expect(lsBefore).toContain('test.py');
    expect(lsAfter).not.toContain('test.py');
  });

  it('Throw error with invalid file name.', () => {
    const micropythonFs = new MicropythonFsHex(uPyHexFile);

    const failCase1 = () => micropythonFs.remove('');
    // @ts-ignore
    const failCase2 = () => micropythonFs.remove(null);
    // @ts-ignore
    const failCase3 = () => micropythonFs.remove(undefined);

    expect(failCase1).toThrow(Error);
    expect(failCase2).toThrow(Error);
    expect(failCase3).toThrow(Error);
  });

  it('Throw error if the file does not exists.', () => {
    const micropythonFs = new MicropythonFsHex(uPyHexFile);

    const failCase = () => micropythonFs.remove('does_not_exists.txt');

    expect(failCase).toThrow(Error);
  });
});

describe('Tests exists method.', () => {
  it('Files exist.', () => {
    const micropythonFs = new MicropythonFsHex(uPyHexFile);
    micropythonFs.write('test1.py', 'content');

    const test1Py = micropythonFs.exists('test1.py');
    const test2Py = micropythonFs.exists('test2.py');
    const ls = micropythonFs.ls();

    expect(test1Py).toBe(true);
    expect(ls).toContain('test1.py');
    expect(test2Py).toBe(false);
    expect(ls).not.toContain('test2.py');
  });

  it('Invalid filenames do not exist.', () => {
    const micropythonFs = new MicropythonFsHex(uPyHexFile);

    const test1 = micropythonFs.exists('');
    // @ts-ignore
    const test2 = micropythonFs.exists(null);
    // @ts-ignore
    const test3 = micropythonFs.exists(undefined);

    expect(test1).toBe(false);
    expect(test2).toBe(false);
    expect(test3).toBe(false);
  });
});

describe('Test size method.', () => {
  it('File size is retrieved correctly.', () => {
    const micropythonFs = new MicropythonFsHex(uPyHexFile);
    micropythonFs.write('five_bytes.txt', new Uint8Array([30, 31, 32, 33, 34]));
    micropythonFs.write('more_bytes.txt', new Uint8Array(128).fill(0x55));

    const fileSize1 = micropythonFs.size('five_bytes.txt');
    const fileSize2 = micropythonFs.size('more_bytes.txt');

    // Real size counts chunks, so always a multiple of 128
    expect(fileSize1).toEqual(128);
    expect(fileSize2).toEqual(256);
  });

  it('Throw error with invalid file name.', () => {
    const micropythonFs = new MicropythonFsHex(uPyHexFile);

    const failCase1 = () => micropythonFs.size('');
    // @ts-ignore
    const failCase2 = () => micropythonFs.size(null);
    // @ts-ignore
    const failCase3 = () => micropythonFs.size(undefined);

    expect(failCase1).toThrow(Error);
    expect(failCase2).toThrow(Error);
    expect(failCase3).toThrow(Error);
  });

  it('Throw error if the file does not exists.', () => {
    const micropythonFs = new MicropythonFsHex(uPyHexFile);

    const failCase = () => micropythonFs.size('does_not_exists.txt');

    expect(failCase).toThrow(Error);
  });
});

describe('Test other.', () => {
  it('Too large filename throws error.', () => {
    const maxLength = 120;
    const largeName = 'a'.repeat(maxLength + 1);
    const microbitFs = new MicropythonFsHex(uPyHexFile);

    const failCase = () => {
      microbitFs.write(largeName, 'content');
      microbitFs.getIntelHex();
    };

    expect(failCase).toThrow(Error);
  });
});

describe('Test hex generation.', () => {
  beforeEach(() => {
    addIntelHexFilesSpy.mockReset();
  });

  it('getIntelHex called with constructor hex string.', () => {
    const microbitFs = new MicropythonFsHex(uPyHexFile);
    microbitFs.write('a.txt', 'content');

    const returnedIntelHex = microbitFs.getIntelHex();

    expect(addIntelHexFilesSpy.mock.calls.length).toEqual(1);
    expect(addIntelHexFilesSpy.mock.calls[0][0]).toBe(uPyHexFile);
    expect(addIntelHexFilesSpy.mock.calls[0][2]).toBeFalsy();
  });

  it('getIntelHexBytes called with constructor hex string.', () => {
    const microbitFs = new MicropythonFsHex(uPyHexFile);
    microbitFs.write('a.txt', 'content');

    const returnedIntelHex = microbitFs.getIntelHexBytes();

    expect(addIntelHexFilesSpy.mock.calls.length).toEqual(1);
    expect(addIntelHexFilesSpy.mock.calls[0][0]).toBe(uPyHexFile);
    expect(addIntelHexFilesSpy.mock.calls[0][2]).toBeTruthy();
  });

  it('getIntelHex called with argument hex string.', () => {
    const microbitFs = new MicropythonFsHex(uPyHexFile);
    const falseHex = 'Not the same Intel Hex text';
    microbitFs.write('a.txt', 'content');

    const returnedIntelHex = microbitFs.getIntelHex(falseHex);

    expect(addIntelHexFilesSpy.mock.calls.length).toEqual(1);
    expect(addIntelHexFilesSpy.mock.calls[0][0]).toBe(falseHex);
  });
});

describe('Test importing files from hex.', () => {
  // These were created using a micro:bit running MicroPython v1.0.1.
  const extraFilesHex =
    ':020000040003F7\n' +
    // one_chunk_plus.py
    ':10AE0000FE00116F6E655F6368756E6B5F706C75C9\n' +
    ':10AE1000732E707961203D20222222616263646575\n' +
    ':10AE2000666768696A6B6C6D6E6F7071727374754A\n' +
    ':10AE3000767778797A0A6162636465666768696AB9\n' +
    ':10AE40006B6C6D6E6F707172737475767778797ADA\n' +
    ':10AE50000A6162636465666768696A6B6C6D6E6FD0\n' +
    ':10AE6000707172737475767778797A0A6162636447\n' +
    ':10AE700065666768696A6B6C6D6E6F2222220A468E\n' +
    ':10AE800045FFFFFFFFFFFFFFFFFFFFFFFFFFFFFF8C\n' +
    // a.py
    ':10C18000FE1804612E707961203D20274A75737472\n' +
    ':10C1900020612066696C65270AFFFFFFFFFFFFFF34\n' +
    // afirst.py
    ':10DF0000FE1F096166697273742E70796669727397\n' +
    ':10DF1000746E616D65203D20274361726C6F7327BD\n' +
    ':00000001FF\n';
  const extraFiles: { [filename: string]: string } = {
    'afirst.py': "firstname = 'Carlos'",
    'one_chunk_plus.py':
      'a = """abcdefghijklmnopqrstuvwxyz\n' +
      'abcdefghijklmnopqrstuvwxyz\n' +
      'abcdefghijklmnopqrstuvwxyz\n' +
      'abcdefghijklmno"""\n',
    'a.py': "a = 'Just a file'\n",
  };

  beforeEach(() => {
    addIntelHexFilesSpy.mockReset();
  });

  const createHexStrWithFiles = (): string => {
    const fullUpyFsMemMap = MemoryMap.fromHex(uPyHexFile);
    const filesMap = MemoryMap.fromHex(extraFilesHex);
    filesMap.forEach((value: Uint8Array, index: number) => {
      fullUpyFsMemMap.set(index, value);
    });
    return fullUpyFsMemMap.asHexString();
  };
  const hexStrWithFiles: string = createHexStrWithFiles();

  it('Correctly read files from a hex.', () => {
    const micropythonFs = new MicropythonFsHex(uPyHexFile);

    const fileList = micropythonFs.importFilesFromIntelHex(hexStrWithFiles);

    Object.keys(extraFiles).forEach((filename) => {
      expect(fileList).toContain(filename);
      expect(micropythonFs.read(filename)).toEqual(extraFiles[filename]);
    });
  });

  it('Disabled overwrite flag throws an error when file exists.', () => {
    const micropythonFs = new MicropythonFsHex(uPyHexFile);
    const originalFileContent = 'Original file content.';
    micropythonFs.write('a.py', originalFileContent);

    const failCase = () => {
      micropythonFs.importFilesFromIntelHex(hexStrWithFiles, {
        overwrite: false,
      });
    };

    expect(failCase).toThrow(Error);
    expect(micropythonFs.read('a.py')).toEqual(originalFileContent);
  });

  it('Enabled overwrite flag replaces the file.', () => {
    const micropythonFs = new MicropythonFsHex(uPyHexFile);
    const originalFileContent = 'Original file content.';
    micropythonFs.write('a.py', originalFileContent);

    micropythonFs.importFilesFromIntelHex(hexStrWithFiles, { overwrite: true });

    expect(micropythonFs.read('a.py')).not.toEqual(originalFileContent);
    expect(micropythonFs.read('a.py')).toEqual(extraFiles['a.py']);
  });

  it('By default it throws an error if a filename already exists.', () => {
    const micropythonFs = new MicropythonFsHex(uPyHexFile);
    micropythonFs.write('a.py', 'some content');

    const failCase = () => {
      micropythonFs.importFilesFromIntelHex(hexStrWithFiles);
    };

    expect(failCase).toThrow(Error);
  });

  it('When files are imported it still uses the constructor hex file.', () => {
    const micropythonFs = new MicropythonFsHex(uPyHexFile);

    micropythonFs.importFilesFromIntelHex(hexStrWithFiles);
    const returnedIntelHex = micropythonFs.getIntelHex();

    expect(addIntelHexFilesSpy.mock.calls.length).toEqual(1);
    expect(addIntelHexFilesSpy.mock.calls[0][0]).toBe(uPyHexFile);
  });

  it('Constructor hex file with files to import thorws an error.', () => {
    const failCase = () => new MicropythonFsHex(hexStrWithFiles);

    expect(failCase).toThrow(Error);
  });

  it('Enabling formatFirst flag erases the previous files.', () => {
    const micropythonFs = new MicropythonFsHex(uPyHexFile);
    micropythonFs.write('old_file.py', 'Some content.');

    const fileList = micropythonFs.importFilesFromIntelHex(hexStrWithFiles, {
      overwrite: false,
      formatFirst: true,
    });

    Object.keys(extraFiles).forEach((filename) => {
      expect(fileList).toContain(filename);
      expect(micropythonFs.read(filename)).toEqual(extraFiles[filename]);
    });
    expect(micropythonFs.ls()).not.toContain('old_file.py');
  });

  it('Disabling formatFirst flag, and by default, keeps old files.', () => {
    const micropythonFs = new MicropythonFsHex(uPyHexFile);
    micropythonFs.write('old_file.py', 'Some content.');

    const fileList1 = micropythonFs.importFilesFromIntelHex(hexStrWithFiles, {
      overwrite: false,
    });
    const fileList2 = micropythonFs.importFilesFromIntelHex(hexStrWithFiles, {
      overwrite: true,
      formatFirst: false,
    });

    Object.keys(extraFiles).forEach((filename) => {
      expect(fileList1).toContain(filename);
      expect(fileList2).toContain(filename);
      expect(micropythonFs.read(filename)).toEqual(extraFiles[filename]);
    });
    expect(micropythonFs.ls()).toContain('old_file.py');
  });
});

describe('Test MicroPython hex filesystem size.', () => {
  it('Get how much available fs space there is in a MicroPython hex file.', () => {
    const micropythonFs = new MicropythonFsHex(uPyHexFile);

    const totalSize = micropythonFs.getStorageSize();

    // Calculated by hand from the uPyHexFile v1.0.1 release.
    expect(totalSize).toEqual(27 * 1024);
  });
});

/*
import { addIntelHexAppendedScript } from '../appended-script';

describe('NOT A REAL UNIT TEST! Used for generating a test hex file.', () => {
  it('Create output4.hex with 2 modules used in main.py.', () => {
    const uPyHexFileAppended = addIntelHexAppendedScript(
      uPyHexFile,
      'from microbit import *\n' + 'display.scroll("Appended code")\n'
    );

    const microbitFs = new MicropythonFsHex(uPyHexFileAppended);
    microbitFs.write('first_name.py', 'name = "Hello"');
    microbitFs.write('surname.py', 'name = "World"');
    // This file takes a single chunk
    microbitFs.write(
      'a.py',
      'a = """abcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\n' +
        'abcdefghijklmnopqrstuvwxyz\nabcdefghijklmnopqrstuvwxyz\na"""\n'
    );
    microbitFs.write(
      'main.py',
      'from microbit import display\n' +
        'import first_name\n' +
        'import surname\n' +
        'print("main.py")\n' +
        'display.scroll(first_name.name + " " + surname.name)\n'
    );
    const finalHex = microbitFs.getIntelHex();

    fs.writeFileSync('./ignore/output4.hex', finalHex);
  });
});
*/

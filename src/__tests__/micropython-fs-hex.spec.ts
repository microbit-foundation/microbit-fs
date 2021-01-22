/**
 * (c) 2019 Micro:bit Educational Foundation and the microbit-fs contributors.
 * SPDX-License-Identifier: MIT
 */
import * as fs from 'fs';

import MemoryMap from 'nrf-intel-hex';
import * as microbitUh from '@microbit/microbit-universal-hex';

import * as fsBuilder from '../micropython-fs-builder';
import { MicropythonFsHex, microbitBoardId } from '../micropython-fs-hex';

// MicroPython hex file for testing
const uPy1HexFile = fs.readFileSync('./src/__tests__/upy-v1.0.1.hex', 'utf8');
const uPy1FsSize = 27 * 1024;
const uPy2HexFile = fs.readFileSync(
  './src/__tests__/upy-v2-beta-uicr.hex',
  'utf8'
);
const uPy2FsSize = 20 * 1024;

describe('Test the class constructor', () => {
  it('Falsy input for MicroPython hex throws an error', () => {
    expect(() => new MicropythonFsHex('')).toThrow('Invalid MicroPython hex');

    expect(() => {
      const microbitFs = new MicropythonFsHex([
        {
          hex: '',
          boardId: 0,
        },
      ]);
    }).toThrow('Invalid MicroPython hex');

    expect(() => {
      const microbitFs = new MicropythonFsHex([
        {
          hex: uPy1HexFile,
          boardId: microbitBoardId.V2,
        },
        {
          hex: '',
          boardId: 0x9904,
        },
      ]);
    }).toThrow('Invalid MicroPython hex');
  });

  it('Invalid hex for MicroPython throws an error', () => {
    expect(() => new MicropythonFsHex('nothex')).toThrow(
      'Malformed .hex file, could not parse any registers'
    );

    expect(() => {
      const microbitFs = new MicropythonFsHex([
        {
          hex: 'notahex',
          boardId: 0,
        },
      ]);
    }).toThrow('Malformed .hex file, could not parse any registers');

    expect(() => {
      const microbitFs = new MicropythonFsHex([
        {
          hex: uPy1HexFile,
          boardId: microbitBoardId.V2,
        },
        {
          hex: 'notahex',
          boardId: 0x9904,
        },
      ]);
    }).toThrow('Malformed .hex file, could not parse any registers');
  });

  it('The maximum filesystem size cannot be larger than space available', () => {
    expect(() => {
      const microbitFs = new MicropythonFsHex(uPy1HexFile, {
        maxFsSize: 1024 * 1024,
      });
    }).toThrow('larger than size available');

    expect(() => {
      const microbitFs = new MicropythonFsHex(
        [
          {
            hex: uPy1HexFile,
            boardId: 0x9903,
          },
          {
            hex: uPy2HexFile,
            boardId: 0x9904,
          },
        ],
        {
          maxFsSize: 1024 * 1024,
        }
      );
    }).toThrow('larger than size available');
  });

  // Working constructor tested by using any methods in the rest of the tests

  // Hex file with files error tested in:
  // Test importing files from hex >
  //   Constructor hex file with files to import throws an error.
});

describe('Test general read write operations', () => {
  it('Write and read files', () => {
    const testInstance = (micropythonFs: MicropythonFsHex) => {
      const content1 = "from microbit import display\r\ndisplay.show('x')";
      const content2 = "from microbit import display\r\ndisplay.show('y')";

      micropythonFs.write('test.py', content1);
      micropythonFs.write('test2.py', content2);
      const file1 = micropythonFs.read('test.py');
      const file2 = micropythonFs.read('test2.py');
      const files = micropythonFs.ls();

      expect(files).toContain('test.py');
      expect(files).toContain('test2.py');
      expect(file1).toEqual(content1);
      expect(file2).toEqual(content2);
    };

    testInstance(new MicropythonFsHex(uPy1HexFile));
    testInstance(
      new MicropythonFsHex([
        { hex: uPy1HexFile, boardId: microbitBoardId.V1 },
        { hex: uPy2HexFile, boardId: microbitBoardId.V2 },
      ])
    );
  });

  it('Write and read files bytes', () => {
    const testInstance = (micropythonFs: MicropythonFsHex) => {
      const content1 = new Uint8Array([1, 2, 3]);
      const content2 = new Uint8Array([4, 5, 6]);

      micropythonFs.write('test.py', content1);
      micropythonFs.write('test2.py', content2);
      const file1 = micropythonFs.readBytes('test.py');
      const file2 = micropythonFs.readBytes('test2.py');
      const files = micropythonFs.ls();

      expect(files).toContain('test.py');
      expect(files).toContain('test2.py');
      expect(file1).toEqual(content1);
      expect(file2).toEqual(content2);
    };

    testInstance(new MicropythonFsHex(uPy1HexFile));
    testInstance(
      new MicropythonFsHex([
        { hex: uPy1HexFile, boardId: 0x9900 },
        { hex: uPy2HexFile, boardId: 0x9903 },
      ])
    );
  });
});

describe('Test create method.', () => {
  it('Creates new files.', () => {
    const testInstance = (microbitFs: MicropythonFsHex) => {
      expect(microbitFs.exists('test.py')).toBe(false);

      microbitFs.create('test.py', 'content');

      expect(microbitFs.exists('test.py')).toBe(true);
    };

    testInstance(new MicropythonFsHex(uPy1HexFile));
    testInstance(
      new MicropythonFsHex([
        { hex: uPy1HexFile, boardId: 0x9900 },
        { hex: uPy2HexFile, boardId: 0x9903 },
      ])
    );
  });

  it('Create does not overwrite files.', () => {
    const testInstance = (micropythonFs: MicropythonFsHex) => {
      micropythonFs.create('test.py', 'content');

      const failCase = () => micropythonFs.create('test.py', 'content');

      expect(failCase).toThrow(Error);
    };

    testInstance(new MicropythonFsHex(uPy1HexFile));
    testInstance(
      new MicropythonFsHex([
        { hex: uPy1HexFile, boardId: 0x9900 },
        { hex: uPy2HexFile, boardId: 0x9903 },
      ])
    );
  });

  it('Throw error with invalid file name.', () => {
    const testInstance = (micropythonFs: MicropythonFsHex) => {
      const failCase1 = () => micropythonFs.create('', 'content');
      // @ts-ignore
      const failCase2 = () => micropythonFs.create(null, 'content');
      // @ts-ignore
      const failCase3 = () => micropythonFs.create(undefined, 'content');

      expect(failCase1).toThrow(Error);
      expect(failCase2).toThrow(Error);
      expect(failCase3).toThrow(Error);
    };

    testInstance(new MicropythonFsHex(uPy1HexFile));
    testInstance(
      new MicropythonFsHex([
        { hex: uPy1HexFile, boardId: 0x9900 },
        { hex: uPy2HexFile, boardId: 0x9903 },
      ])
    );
  });

  it('Throw error with invalid file content.', () => {
    const testInstance = (micropythonFs: MicropythonFsHex) => {
      const failCase1 = () => micropythonFs.create('file.txt', '');
      // @ts-ignore
      const failCase2 = () => micropythonFs.create('file.txt', null);
      // @ts-ignore
      const failCase3 = () => micropythonFs.create('file.txt', undefined);

      expect(failCase1).toThrow(Error);
      expect(failCase2).toThrow(Error);
      expect(failCase3).toThrow(Error);
    };

    testInstance(new MicropythonFsHex(uPy1HexFile));
    testInstance(
      new MicropythonFsHex([
        { hex: uPy1HexFile, boardId: 0x9900 },
        { hex: uPy2HexFile, boardId: 0x9903 },
      ])
    );
  });
});

describe('Test size operations.', () => {
  it('Creates files to fill the filesystem and calculates sizes.', () => {
    const testInstance = (microbitFs: MicropythonFsHex, fsSize: number) => {
      expect(microbitFs.getStorageUsed()).toEqual(0);
      expect(microbitFs.getStorageRemaining()).toEqual(fsSize);

      microbitFs.create('chunk1.py', 'first 128 byte chunk');

      expect(microbitFs.getStorageUsed()).toEqual(128);
      expect(microbitFs.getStorageRemaining()).toEqual(fsSize - 128);

      microbitFs.create('chunk2.py', 'second 128 byte chunk');

      expect(microbitFs.getStorageUsed()).toEqual(256);
      expect(microbitFs.getStorageRemaining()).toEqual(fsSize - 256);

      const chunksToFill = fsSize / 128 - 3;
      const dataBytesPerChunk = 126;
      const roughHeaderCount = 20;
      microbitFs.create(
        'chunk3.py',
        new Uint8Array(
          chunksToFill * dataBytesPerChunk - roughHeaderCount
        ).fill(0x60)
      );

      expect(microbitFs.getStorageUsed()).toEqual(fsSize - 128);
      expect(microbitFs.getStorageRemaining()).toEqual(128);

      microbitFs.create('chunk4.py', 'fourth chunk');

      expect(microbitFs.getStorageUsed()).toEqual(fsSize);
      expect(microbitFs.getStorageRemaining()).toEqual(0);
    };

    testInstance(new MicropythonFsHex(uPy1HexFile), uPy1FsSize);
    testInstance(
      new MicropythonFsHex([
        { hex: uPy1HexFile, boardId: 0x9900 },
        { hex: uPy2HexFile, boardId: 0x9903 },
      ]),
      uPy2FsSize
    );
  });

  it('Sets a maximum filesystem size via constructor', () => {
    const testInstance = (microbitFs: MicropythonFsHex, boardId?: number) => {
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
      microbitFs.getIntelHex(boardId);

      expect(microbitFs.getStorageUsed()).toEqual(1024);
      expect(microbitFs.getStorageRemaining()).toEqual(0);

      microbitFs.create('chunk9.py', 'This file will not fit');
      const failCase1 = () => microbitFs.getIntelHex(boardId);
      const failCase2 = () => microbitFs.getIntelHexBytes(boardId);

      expect(failCase1).toThrow('no storage space left');
      expect(failCase2).toThrow('no storage space left');
    };

    testInstance(new MicropythonFsHex(uPy1HexFile, { maxFsSize: 1024 }));
    testInstance(
      new MicropythonFsHex(
        [
          { hex: uPy1HexFile, boardId: 0x9900 },
          { hex: uPy2HexFile, boardId: 0x9903 },
        ],
        { maxFsSize: 1024 }
      ),
      0x9903
    );
  });

  it('Sets a maximum filesystem size via method', () => {
    const testInstance = (microbitFs: MicropythonFsHex, boardId?: number) => {
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
      microbitFs.getIntelHex(boardId);
      microbitFs.getIntelHexBytes(boardId);

      expect(microbitFs.getStorageUsed()).toEqual(1024);
      expect(microbitFs.getStorageRemaining()).toEqual(0);

      microbitFs.create('chunk9.py', 'This file will not fit');
      const failCase1 = () => microbitFs.getIntelHex();
      const failCase2 = () => microbitFs.getIntelHexBytes();

      expect(failCase1).toThrow('no storage space lef');
      expect(failCase2).toThrow('no storage space lef');
    };

    testInstance(new MicropythonFsHex(uPy1HexFile));
    testInstance(
      new MicropythonFsHex([
        { hex: uPy1HexFile, boardId: 0x9900 },
        { hex: uPy2HexFile, boardId: 0x9903 },
      ]),
      0x9903
    );
  });

  it('The maximum filesystem size cannot be larger than space available', () => {
    expect(
      () => new MicropythonFsHex(uPy1HexFile, { maxFsSize: 1024 * 1024 })
    ).toThrow('Storage size limit provided is larger than size available');

    expect(
      () =>
        new MicropythonFsHex(
          [
            { hex: uPy1HexFile, boardId: 0x9900 },
            { hex: uPy2HexFile, boardId: 0x9903 },
          ],
          { maxFsSize: 1024 * 1024 }
        )
    ).toThrow('Storage size limit provided is larger than size available');

    expect(() => {
      const microbitFs = new MicropythonFsHex(uPy1HexFile);
      microbitFs.setStorageSize(1024 * 1024);
    }).toThrow('Storage size limit provided is larger than size available');

    expect(() => {
      const microbitFs = new MicropythonFsHex([
        { hex: uPy1HexFile, boardId: 0x9900 },
        { hex: uPy2HexFile, boardId: 0x9903 },
      ]);
      microbitFs.setStorageSize(1024 * 1024);
    }).toThrow('Storage size limit provided is larger than size available');
  });
});

describe('Test write method.', () => {
  it('Throw error with invalid file name.', () => {
    const micropythonFs = new MicropythonFsHex(uPy1HexFile);

    const failCase1 = () => micropythonFs.write('', 'content');
    // @ts-ignore
    const failCase2 = () => micropythonFs.write(null, 'content');
    // @ts-ignore
    const failCase3 = () => micropythonFs.write(undefined, 'content');

    expect(failCase1).toThrow('not provided a valid filename');
    expect(failCase2).toThrow('not provided a valid filename');
    expect(failCase3).toThrow('not provided a valid filename');
  });

  it('Throw error with invalid file content.', () => {
    const micropythonFs = new MicropythonFsHex(uPy1HexFile);

    const failCase1 = () => micropythonFs.write('file.txt', '');
    // @ts-ignore
    const failCase2 = () => micropythonFs.write('file.txt', null);
    // @ts-ignore
    const failCase3 = () => micropythonFs.write('file.txt', undefined);

    expect(failCase1).toThrow('does not have valid content');
    expect(failCase2).toThrow('does not have valid content');
    expect(failCase3).toThrow('does not have valid content');
  });
});

describe('Test append method.', () => {
  it('Throw error with invalid file name.', () => {
    const micropythonFs = new MicropythonFsHex(uPy1HexFile);

    const failCase1 = () => micropythonFs.append('', 'more content');
    // @ts-ignore
    const failCase2 = () => micropythonFs.append(null, 'more content');
    // @ts-ignore
    const failCase3 = () => micropythonFs.append(undefined, 'more content');

    expect(failCase1).toThrow('Invalid filename');
    expect(failCase2).toThrow('Invalid filename');
    expect(failCase3).toThrow('Invalid filename');
  });

  it('Throw error if the file does not exists.', () => {
    const microbitFs = new MicropythonFsHex(uPy1HexFile);

    const failCase = () => microbitFs.append('does_not_exists.txt', 'content');

    expect(failCase).toThrow('does not exist');
  });

  it('Append is not yet implemented.', () => {
    const micropythonFs = new MicropythonFsHex(uPy1HexFile);
    micropythonFs.write('a.txt', 'content');

    const failCase = () => micropythonFs.append('a.txt', 'more content');

    expect(failCase).toThrow('not yet implemented');
  });
});

describe('Test read method.', () => {
  it('Throw error with invalid file name.', () => {
    const micropythonFs = new MicropythonFsHex(uPy1HexFile);

    const failCase1 = () => micropythonFs.read('');
    // @ts-ignore
    const failCase2 = () => micropythonFs.read(null);
    // @ts-ignore
    const failCase3 = () => micropythonFs.read(undefined);

    expect(failCase1).toThrow('Invalid filename');
    expect(failCase2).toThrow('Invalid filename');
    expect(failCase3).toThrow('Invalid filename');
  });

  it('Throw error if the file does not exists.', () => {
    const micropythonFs = new MicropythonFsHex(uPy1HexFile);

    const failCase = () => micropythonFs.read('does_not_exists.txt');

    expect(failCase).toThrow('does not exist');
  });
});

describe('Test readBytes method.', () => {
  it('Throw error with invalid file name.', () => {
    const micropythonFs = new MicropythonFsHex(uPy1HexFile);

    const failCase1 = () => micropythonFs.readBytes('');
    // @ts-ignore
    const failCase2 = () => micropythonFs.readBytes(null);
    // @ts-ignore
    const failCase3 = () => micropythonFs.readBytes(undefined);

    expect(failCase1).toThrow('Invalid filename');
    expect(failCase2).toThrow('Invalid filename');
    expect(failCase3).toThrow('Invalid filename');
  });

  it('Throw error if the file does not exists.', () => {
    const micropythonFs = new MicropythonFsHex(uPy1HexFile);

    const failCase = () => micropythonFs.readBytes('does_not_exists.txt');

    expect(failCase).toThrow('does not exist');
  });
});

describe('Test remove method.', () => {
  it('Delete files.', () => {
    const content = "from microbit import display\r\ndisplay.show('x')";
    const micropythonFs = new MicropythonFsHex(uPy1HexFile);
    micropythonFs.write('test.py', content);
    micropythonFs.write('test2.py', content);

    const lsBefore = micropythonFs.ls();
    micropythonFs.remove('test.py');
    const lsAfter = micropythonFs.ls();

    expect(lsBefore).toContain('test.py');
    expect(lsAfter).not.toContain('test.py');
  });

  it('Throw error with invalid file name.', () => {
    const micropythonFs = new MicropythonFsHex(uPy1HexFile);

    const failCase1 = () => micropythonFs.remove('');
    // @ts-ignore
    const failCase2 = () => micropythonFs.remove(null);
    // @ts-ignore
    const failCase3 = () => micropythonFs.remove(undefined);

    expect(failCase1).toThrow('Invalid filename');
    expect(failCase2).toThrow('Invalid filename');
    expect(failCase3).toThrow('Invalid filename');
  });

  it('Throw error if the file does not exists.', () => {
    const micropythonFs = new MicropythonFsHex(uPy1HexFile);

    const failCase = () => micropythonFs.remove('does_not_exists.txt');

    expect(failCase).toThrow('does not exist');
  });
});

describe('Tests exists method.', () => {
  it('Files exist.', () => {
    const micropythonFs = new MicropythonFsHex(uPy1HexFile);
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
    const micropythonFs = new MicropythonFsHex(uPy1HexFile);

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
    const testInstance = (micropythonFs: MicropythonFsHex) => {
      micropythonFs.write('5_bytes.txt', new Uint8Array([30, 31, 32, 33, 34]));
      micropythonFs.write('more_bytes.txt', new Uint8Array(128).fill(0x55));

      const fileSize1 = micropythonFs.size('5_bytes.txt');
      const fileSize2 = micropythonFs.size('more_bytes.txt');

      // Real size counts chunks, so always a multiple of 128
      expect(fileSize1).toEqual(128);
      expect(fileSize2).toEqual(256);
    };

    testInstance(new MicropythonFsHex(uPy1HexFile));
    testInstance(
      new MicropythonFsHex([
        { hex: uPy1HexFile, boardId: 0x9900 },
        { hex: uPy2HexFile, boardId: 0x9903 },
      ])
    );
  });

  it('Throw error with invalid file name.', () => {
    const micropythonFs = new MicropythonFsHex(uPy1HexFile);

    const failCase1 = () => micropythonFs.size('');
    // @ts-ignore
    const failCase2 = () => micropythonFs.size(null);
    // @ts-ignore
    const failCase3 = () => micropythonFs.size(undefined);

    expect(failCase1).toThrow('Invalid filename');
    expect(failCase2).toThrow('Invalid filename');
    expect(failCase3).toThrow('Invalid filename');
  });

  it('Throw error if the file does not exists.', () => {
    const micropythonFs = new MicropythonFsHex(uPy1HexFile);

    const failCase = () => micropythonFs.size('does_not_exists.txt');

    expect(failCase).toThrow('does not exist');
  });
});

describe('Test other.', () => {
  it('Too large filename throws error.', () => {
    const maxLength = 120;
    const largeName = 'a'.repeat(maxLength + 1);
    const microbitFs = new MicropythonFsHex(uPy1HexFile);

    const failCase = () => {
      microbitFs.write(largeName, 'content');
      microbitFs.getIntelHex();
    };

    expect(failCase).toThrow('too long');
  });
});

describe('Test Intel Hex generation.', () => {
  const generateHexWithFilesSpy = jest.spyOn(fsBuilder, 'generateHexWithFiles');
  const addIntelHexFilesSpy = jest.spyOn(fsBuilder, 'addIntelHexFiles');

  beforeEach(() => {
    addIntelHexFilesSpy.mockReset();
    generateHexWithFilesSpy.mockReset();
  });

  afterAll(() => {
    generateHexWithFilesSpy.mockRestore();
    addIntelHexFilesSpy.mockRestore();
  });

  it('getIntelHex calls correct hex generation function.', () => {
    const testInstance = (microbitFs: MicropythonFsHex, boardId?: number) => {
      microbitFs.write('a.txt', 'content');

      const returnedIntelHex = microbitFs.getIntelHex(boardId);

      expect(generateHexWithFilesSpy.mock.calls.length).toEqual(1);
    };

    testInstance(new MicropythonFsHex(uPy1HexFile));
    generateHexWithFilesSpy.mockReset();
    const multipleHexInstance = new MicropythonFsHex([
      { hex: uPy1HexFile, boardId: 0x9900 },
      { hex: uPy2HexFile, boardId: 0x9903 },
    ]);
    testInstance(multipleHexInstance, 0x9900);
    generateHexWithFilesSpy.mockReset();
    testInstance(multipleHexInstance, 0x9903);
  });

  it('getIntelHexBytes calls correct hex generation function.', () => {
    const testInstance = (microbitFs: MicropythonFsHex, boardId?: number) => {
      microbitFs.write('a.txt', 'content');

      const returnedIntelHex = microbitFs.getIntelHexBytes(boardId);

      expect(addIntelHexFilesSpy.mock.calls.length).toEqual(1);
      expect(addIntelHexFilesSpy.mock.calls[0][2]).toBeTruthy();
    };

    testInstance(new MicropythonFsHex(uPy1HexFile));
    addIntelHexFilesSpy.mockReset();
    const multipleHexInstance = new MicropythonFsHex([
      { hex: uPy1HexFile, boardId: 0x9900 },
      { hex: uPy2HexFile, boardId: 0x9903 },
    ]);
    testInstance(multipleHexInstance, 0x9900);
    addIntelHexFilesSpy.mockReset();
    testInstance(multipleHexInstance, 0x9903);
  });

  it('Incorrect board ID throws error.', () => {
    const microbitFs1 = new MicropythonFsHex(uPy1HexFile);
    const microbitFs2 = new MicropythonFsHex([
      { hex: uPy1HexFile, boardId: 0x9900 },
      { hex: uPy2HexFile, boardId: 0x9903 },
    ]);

    const failCase1 = () => microbitFs1.getIntelHex(0x9000);
    const failCaseBytes1 = () => microbitFs1.getIntelHexBytes(0x9000);
    const failCase2 = () => microbitFs2.getIntelHex(0x9000);
    const failCaseBytes2 = () => microbitFs2.getIntelHexBytes(0x9000);

    expect(failCase1).toThrow('Board ID requested not found');
    expect(failCaseBytes1).toThrow('Board ID requested not found');
    expect(failCase2).toThrow('Board ID requested not found');
    expect(failCaseBytes2).toThrow('Board ID requested not found');
  });

  it('Missing board ID throws error when there are multiple MicroPythons.', () => {
    const microbitFs = new MicropythonFsHex([
      { hex: uPy1HexFile, boardId: 0x9900 },
      { hex: uPy2HexFile, boardId: 0x9903 },
    ]);

    const failCase = () => microbitFs.getIntelHex();
    const failCaseBytes = () => microbitFs.getIntelHexBytes();

    expect(failCase).toThrow('Board ID must be specified');
    expect(failCaseBytes).toThrow('Board ID must be specified');
  });
});

describe('Test Universal Hex generation.', () => {
  const createUniversalHexSpy = jest.spyOn(microbitUh, 'createUniversalHex');

  beforeEach(() => {
    createUniversalHexSpy.mockReset();
  });

  afterAll(() => {
    createUniversalHexSpy.mockRestore();
  });

  it('Universal Hex library called with correct arguments', () => {
    const micropythonFs = new MicropythonFsHex([
      { hex: uPy1HexFile, boardId: 0x9900 },
      { hex: uPy1HexFile, boardId: 0x9901 },
      { hex: uPy2HexFile, boardId: 0x9903 },
      { hex: uPy2HexFile, boardId: 0x9904 },
    ]);

    const iHexV1 = micropythonFs.getIntelHex(0x9900);
    const iHexV2 = micropythonFs.getIntelHex(0x9903);
    const universalHex = micropythonFs.getUniversalHex();

    expect(createUniversalHexSpy.mock.calls.length).toEqual(1);
    expect(createUniversalHexSpy.mock.calls[0][0][0].boardId).toBe(0x9900);
    expect(createUniversalHexSpy.mock.calls[0][0][0].hex).toBe(iHexV1);
    expect(createUniversalHexSpy.mock.calls[0][0][1].boardId).toBe(0x9901);
    expect(createUniversalHexSpy.mock.calls[0][0][1].hex).toBe(iHexV1);
    expect(createUniversalHexSpy.mock.calls[0][0][2].boardId).toBe(0x9903);
    expect(createUniversalHexSpy.mock.calls[0][0][2].hex).toBe(iHexV2);
    expect(createUniversalHexSpy.mock.calls[0][0][3].boardId).toBe(0x9904);
    expect(createUniversalHexSpy.mock.calls[0][0][3].hex).toBe(iHexV2);
  });

  it('Error if single MicroPython hex provided', () => {
    const micropythonFs = new MicropythonFsHex(uPy1HexFile);

    const failFunc = () => micropythonFs.getUniversalHex();

    expect(failFunc).toThrow('more than one MicroPython Intel Hex');
  });
});

describe('Test importing files from Intel Hex.', () => {
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

  const generateHexWithFilesSpy = jest.spyOn(fsBuilder, 'generateHexWithFiles');
  const addIntelHexFilesSpy = jest.spyOn(fsBuilder, 'addIntelHexFiles');

  beforeEach(() => {
    addIntelHexFilesSpy.mockReset();
    generateHexWithFilesSpy.mockReset();
  });

  afterAll(() => {
    generateHexWithFilesSpy.mockRestore();
    addIntelHexFilesSpy.mockRestore();
  });

  const createHexStrWithFiles = (): string => {
    const fullUpyFsMemMap = MemoryMap.fromHex(uPy1HexFile);
    const filesMap = MemoryMap.fromHex(extraFilesHex);
    filesMap.forEach((value: Uint8Array, index: number) => {
      fullUpyFsMemMap.set(index, value);
    });
    return fullUpyFsMemMap.asHexString();
  };
  const hexStrWithFiles: string = createHexStrWithFiles();

  it('Correctly read files from a hex.', () => {
    const micropythonFsIh = new MicropythonFsHex(uPy1HexFile);
    const micropythonFsH = new MicropythonFsHex(uPy1HexFile);

    const fileListIh = micropythonFsIh.importFilesFromIntelHex(hexStrWithFiles);
    const fileListH = micropythonFsH.importFilesFromHex(hexStrWithFiles);

    Object.keys(extraFiles).forEach((filename) => {
      expect(fileListIh).toContain(filename);
      expect(micropythonFsIh.read(filename)).toEqual(extraFiles[filename]);
      expect(fileListH).toContain(filename);
      expect(micropythonFsH.read(filename)).toEqual(extraFiles[filename]);
    });
  });

  it('Throws and error if there are no files to import.', () => {
    const micropythonFsIh = new MicropythonFsHex(uPy1HexFile);
    const micropythonFsH = new MicropythonFsHex(uPy1HexFile);

    const failCaseIh = () =>
      micropythonFsIh.importFilesFromIntelHex(uPy1HexFile);
    const failCaseH = () => micropythonFsH.importFilesFromIntelHex(uPy1HexFile);

    expect(failCaseIh).toThrow('Hex does not have any files to import');
    expect(failCaseH).toThrow('Hex does not have any files to import');
  });

  it('Disabled overwrite flag throws an error when file exists.', () => {
    const micropythonFsIh = new MicropythonFsHex(uPy1HexFile);
    const micropythonFsH = new MicropythonFsHex(uPy1HexFile);
    const originalFileContent = 'Original file content.';
    micropythonFsIh.write('a.py', originalFileContent);
    micropythonFsH.write('a.py', originalFileContent);

    const failCaseIh = () => {
      micropythonFsIh.importFilesFromIntelHex(hexStrWithFiles, {
        overwrite: false,
      });
    };
    const failCaseH = () => {
      micropythonFsH.importFilesFromIntelHex(hexStrWithFiles, {
        overwrite: false,
      });
    };

    expect(failCaseIh).toThrow(Error);
    expect(micropythonFsIh.read('a.py')).toEqual(originalFileContent);
    expect(failCaseH).toThrow(Error);
    expect(micropythonFsIh.read('a.py')).toEqual(originalFileContent);
  });

  it('Enabled overwrite flag replaces the file.', () => {
    const micropythonFsIh = new MicropythonFsHex(uPy1HexFile);
    const micropythonFsH = new MicropythonFsHex(uPy1HexFile);
    const originalFileContent = 'Original file content.';
    micropythonFsIh.write('a.py', originalFileContent);
    micropythonFsH.write('a.py', originalFileContent);

    micropythonFsIh.importFilesFromIntelHex(hexStrWithFiles, {
      overwrite: true,
    });
    micropythonFsH.importFilesFromIntelHex(hexStrWithFiles, {
      overwrite: true,
    });

    expect(micropythonFsIh.read('a.py')).not.toEqual(originalFileContent);
    expect(micropythonFsIh.read('a.py')).toEqual(extraFiles['a.py']);
    expect(micropythonFsH.read('a.py')).not.toEqual(originalFileContent);
    expect(micropythonFsH.read('a.py')).toEqual(extraFiles['a.py']);
  });

  it('By default it throws an error if a filename already exists.', () => {
    const micropythonFsIh = new MicropythonFsHex(uPy1HexFile);
    const micropythonFsH = new MicropythonFsHex(uPy1HexFile);
    micropythonFsIh.write('a.py', 'some content');
    micropythonFsH.write('a.py', 'some content');

    const failCaseIh = () =>
      micropythonFsIh.importFilesFromIntelHex(hexStrWithFiles);
    const failCaseH = () =>
      micropythonFsH.importFilesFromIntelHex(hexStrWithFiles);

    expect(failCaseIh).toThrow(Error);
    expect(failCaseH).toThrow(Error);
  });

  it('Constructor hex file with files to import throws an error.', () => {
    expect(() => new MicropythonFsHex(hexStrWithFiles)).toThrow(
      'There are files in the MicropythonFsHex constructor hex file input'
    );

    expect(
      () => new MicropythonFsHex([{ hex: hexStrWithFiles, boardId: 0x9903 }])
    ).toThrow(
      'There are files in the MicropythonFsHex constructor hex file input'
    );
  });

  it('Enabling formatFirst flag erases the previous files.', () => {
    const micropythonFsIh = new MicropythonFsHex(uPy1HexFile);
    const micropythonFsH = new MicropythonFsHex(uPy1HexFile);
    micropythonFsIh.write('old_file.py', 'Some content.');
    micropythonFsH.write('old_file.py', 'Some content.');

    const fileListIh = micropythonFsIh.importFilesFromIntelHex(
      hexStrWithFiles,
      {
        overwrite: false,
        formatFirst: true,
      }
    );
    const fileListH = micropythonFsH.importFilesFromIntelHex(hexStrWithFiles, {
      overwrite: false,
      formatFirst: true,
    });

    Object.keys(extraFiles).forEach((filename) => {
      expect(fileListIh).toContain(filename);
      expect(micropythonFsIh.read(filename)).toEqual(extraFiles[filename]);
      expect(fileListH).toContain(filename);
      expect(micropythonFsH.read(filename)).toEqual(extraFiles[filename]);
    });
    expect(micropythonFsIh.ls()).not.toContain('old_file.py');
    expect(micropythonFsH.ls()).not.toContain('old_file.py');
  });

  it('Enabling formatFirst flag only formats if there are files to import.', () => {
    const micropythonFsIh = new MicropythonFsHex(uPy1HexFile);
    const micropythonFsH = new MicropythonFsHex(uPy1HexFile);
    micropythonFsIh.write('old_file.py', 'Some content.');
    micropythonFsH.write('old_file.py', 'Some content.');

    try {
      const fileListIh = micropythonFsIh.importFilesFromIntelHex(uPy1HexFile, {
        overwrite: false,
        formatFirst: true,
      });
    } catch (e) {
      // Not having files to import should raise an error
    }
    try {
      const fileListH = micropythonFsH.importFilesFromIntelHex(uPy1HexFile, {
        overwrite: false,
        formatFirst: true,
      });
    } catch (e) {
      // Not having files to import should raise an error
    }

    expect(micropythonFsIh.ls()).toContain('old_file.py');
    expect(micropythonFsIh.read('old_file.py')).toContain('Some content.');
    expect(micropythonFsH.ls()).toContain('old_file.py');
    expect(micropythonFsH.read('old_file.py')).toContain('Some content.');
  });

  it('Disabling formatFirst flag, and by default, keeps old files.', () => {
    const micropythonFsIh = new MicropythonFsHex(uPy1HexFile);
    const micropythonFsH = new MicropythonFsHex(uPy1HexFile);
    micropythonFsIh.write('old_file.py', 'Some content.');
    micropythonFsH.write('old_file.py', 'Some content.');

    const fileList1Ih = micropythonFsIh.importFilesFromIntelHex(
      hexStrWithFiles,
      {
        overwrite: false,
      }
    );
    const fileList2Ih = micropythonFsIh.importFilesFromIntelHex(
      hexStrWithFiles,
      {
        overwrite: true,
        formatFirst: false,
      }
    );
    const fileList1H = micropythonFsH.importFilesFromIntelHex(hexStrWithFiles, {
      overwrite: false,
    });
    const fileList2H = micropythonFsH.importFilesFromIntelHex(hexStrWithFiles, {
      overwrite: true,
      formatFirst: false,
    });

    Object.keys(extraFiles).forEach((filename) => {
      expect(fileList1Ih).toContain(filename);
      expect(fileList2Ih).toContain(filename);
      expect(micropythonFsIh.read(filename)).toEqual(extraFiles[filename]);
      expect(fileList1H).toContain(filename);
      expect(fileList2H).toContain(filename);
      expect(micropythonFsH.read(filename)).toEqual(extraFiles[filename]);
    });
    expect(micropythonFsIh.ls()).toContain('old_file.py');
    expect(micropythonFsH.ls()).toContain('old_file.py');
  });
});

describe('Test importing files from Universal Hex.', () => {
  // TODO: These tests
  // it('Correctly read files from a Universal Hex.', () => {});
  // it('Throws an error if it is not a Universal hex.', () => {});
  // it('Throws an error if there are no files to import.', () => {});
  // it('Throws an error if files in the individual hexes do not match.', () => {});
  // it('Disabled overwrite flag throws an error when file exists.', () => {});
  // it('Enabled overwrite flag replaces the file.', () => {});
  // it('By default it throws an error if a filename already exists.', () => {});
  // it('Constructor hex file with files to import throws an error.', () => {});
  // it('Enabling formatFirst flag erases the previous files.', () => {});
  // it('Enabling formatFirst flag only formats if there are files to import.', () => {});
  // it('Disabling formatFirst flag, and by default, keeps old files.', () => {});
});

describe('Test MicroPython hex filesystem size.', () => {
  it('Get how much available fs space there is in a MicroPython hex file.', () => {
    const micropythonFs = new MicropythonFsHex(uPy1HexFile);

    const totalSize = micropythonFs.getStorageSize();

    expect(totalSize).toEqual(uPy1FsSize);
  });

  it('Get available fs space when manually set in constructor.', () => {
    const micropythonFs = new MicropythonFsHex(uPy1HexFile, {
      maxFsSize: 1024,
    });

    const totalSize = micropythonFs.getStorageSize();

    expect(totalSize).toEqual(1024);
  });

  it('Get available fs space when both hex and constructor value are provided.', () => {
    const micropythonFs = new MicropythonFsHex(uPy1HexFile, {
      maxFsSize: 1024,
    });

    const totalSize = micropythonFs.getStorageSize();

    expect(totalSize).toEqual(1024);
  });
});

describe('End-to-end loop around.', () => {
  it('Create some files, export Intel hex, and import in a new instance', () => {
    const microbitFs = new MicropythonFsHex(uPy1HexFile);
    microbitFs.write('a.txt', 'This is some content');
    microbitFs.write('main.py', 'print("This is my code")');
    const iHexWithFiles = microbitFs.getIntelHex();

    const microbitFsImported = new MicropythonFsHex(uPy2HexFile);
    const importedFiles = microbitFsImported.importFilesFromIntelHex(
      iHexWithFiles
    );

    expect(microbitFs.ls()).toEqual(importedFiles);
    expect(microbitFs.ls()).toEqual(['a.txt', 'main.py']);
    expect(microbitFsImported.ls()).toEqual(microbitFs.ls());

    expect(microbitFs.read('a.txt')).toEqual('This is some content');
    expect(microbitFsImported.read('a.txt')).toEqual(microbitFs.read('a.txt'));

    expect(microbitFsImported.readBytes('a.txt')).toEqual(
      microbitFs.readBytes('a.txt')
    );

    expect(microbitFsImported.size('a.txt')).toEqual(microbitFs.size('a.txt'));

    expect(microbitFsImported.getStorageUsed()).toEqual(
      microbitFs.getStorageUsed()
    );
  });

  it('Create some files, export Universal hex, and import in a new instance', () => {
    const microbitFs = new MicropythonFsHex([
      { hex: uPy1HexFile, boardId: microbitBoardId.V1 },
      { hex: uPy2HexFile, boardId: microbitBoardId.V2 },
    ]);
    microbitFs.write('a.txt', 'This is some content');
    microbitFs.write('main.py', 'print("This is my code")');
    const uHexWithFiles = microbitFs.getUniversalHex();

    const microbitFsImported = new MicropythonFsHex([
      { hex: uPy1HexFile, boardId: microbitBoardId.V1 },
      { hex: uPy2HexFile, boardId: microbitBoardId.V2 },
    ]);
    const importedFiles = microbitFsImported.importFilesFromHex(uHexWithFiles);

    expect(microbitFs.ls()).toEqual(importedFiles);
    expect(microbitFs.ls()).toEqual(['a.txt', 'main.py']);
    expect(microbitFsImported.ls()).toEqual(microbitFs.ls());

    expect(microbitFs.read('a.txt')).toEqual('This is some content');
    expect(microbitFsImported.read('a.txt')).toEqual(microbitFs.read('a.txt'));

    expect(microbitFsImported.readBytes('a.txt')).toEqual(
      microbitFs.readBytes('a.txt')
    );

    expect(microbitFsImported.size('a.txt')).toEqual(microbitFs.size('a.txt'));

    expect(microbitFsImported.getStorageUsed()).toEqual(
      microbitFs.getStorageUsed()
    );

    expect(microbitFsImported.getIntelHex(microbitBoardId.V1)).toEqual(
      microbitFs.getIntelHex(microbitBoardId.V1)
    );
    expect(microbitFsImported.getIntelHex(microbitBoardId.V2)).toEqual(
      microbitFs.getIntelHex(microbitBoardId.V2)
    );
  });
});

/*
import { addIntelHexAppendedScript } from '../appended-script';

describe('NOT A REAL UNIT TEST! Used for generating a test hex file.', () => {
  it('Create output4.hex with 2 modules used in main.py.', () => {
    const uPy1HexFileAppended = addIntelHexAppendedScript(
      uPy1HexFile,
      'from microbit import *\n' + 'display.scroll("Appended code")\n'
    );

    const microbitFs = new MicropythonFsHex(uPy1HexFileAppended);
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

import * as fs from 'fs';

import { FileSystem } from '../file-manager';
import * as fsBuilder from '../fs-builder';

// MicroPython hex file for testing
const uPyHexFile = fs.readFileSync('./src/__tests__/upy-v1.0.1.hex', 'utf8');

describe('Test general read write operations', () => {
  it('Write and read files', () => {
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

  it('Write and read files bytes', () => {
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
});

describe('Test create method.', () => {
  it('Creates new files.', () => {
    const microbitFs = new FileSystem(uPyHexFile);
    expect(microbitFs.exists('test.py')).toBe(false);

    microbitFs.create('test.py', 'content');

    expect(microbitFs.exists('test.py')).toBe(true);
  });

  it('Create does not overwrite files.', () => {
    const microbitFs = new FileSystem(uPyHexFile);
    microbitFs.create('test.py', 'content');

    const failCase = () => {
      microbitFs.create('test.py', 'content');
    };

    expect(failCase).toThrow(Error);
  });

  it('Throw error with invalid file name.', () => {
    const microbitFs = new FileSystem(uPyHexFile);

    const failCase1 = () => {
      microbitFs.create('', 'content');
    };
    const failCase2 = () => {
      // @ts-ignore
      microbitFs.create(null, 'content');
    };
    const failCase3 = () => {
      // @ts-ignore
      microbitFs.create(undefined, 'content');
    };

    expect(failCase1).toThrow(Error);
    expect(failCase2).toThrow(Error);
    expect(failCase3).toThrow(Error);
  });

  it('Throw error with invalid file content.', () => {
    const microbitFs = new FileSystem(uPyHexFile);

    const failCase1 = () => {
      microbitFs.create('file.txt', '');
    };
    const failCase2 = () => {
      // @ts-ignore
      microbitFs.create('file.txt', null);
    };
    const failCase3 = () => {
      // @ts-ignore
      microbitFs.create('file.txt', undefined);
    };

    expect(failCase1).toThrow(Error);
    expect(failCase2).toThrow(Error);
    expect(failCase3).toThrow(Error);
  });
});

describe('Test write method.', () => {
  it('Throw error with invalid file name.', () => {
    const microbitFs = new FileSystem(uPyHexFile);

    const failCase1 = () => {
      microbitFs.write('', 'content');
    };
    const failCase2 = () => {
      // @ts-ignore
      microbitFs.write(null, 'content');
    };
    const failCase3 = () => {
      // @ts-ignore
      microbitFs.write(undefined, 'content');
    };

    expect(failCase1).toThrow(Error);
    expect(failCase2).toThrow(Error);
    expect(failCase3).toThrow(Error);
  });

  it('Throw error with invalid file content.', () => {
    const microbitFs = new FileSystem(uPyHexFile);

    const failCase1 = () => {
      microbitFs.write('file.txt', '');
    };
    const failCase2 = () => {
      // @ts-ignore
      microbitFs.write('file.txt', null);
    };
    const failCase3 = () => {
      // @ts-ignore
      microbitFs.write('file.txt', undefined);
    };

    expect(failCase1).toThrow(Error);
    expect(failCase2).toThrow(Error);
    expect(failCase3).toThrow(Error);
  });
});

describe('Test append method.', () => {
  it('Throw error with invalid file name.', () => {
    const microbitFs = new FileSystem(uPyHexFile);

    const failCase1 = () => {
      microbitFs.append('', 'more content');
    };
    const failCase2 = () => {
      // @ts-ignore
      microbitFs.append(null, 'more content');
    };
    const failCase3 = () => {
      // @ts-ignore
      microbitFs.append(undefined, 'more content');
    };

    expect(failCase1).toThrow(Error);
    expect(failCase2).toThrow(Error);
    expect(failCase3).toThrow(Error);
  });

  it('Throw error if the file does not exists.', () => {
    const microbitFs = new FileSystem(uPyHexFile);

    const failCase = () => {
      microbitFs.append('does_not_exists.txt', 'content');
    };

    expect(failCase).toThrow(Error);
  });

  it('Append is not yet implemented.', () => {
    const microbitFs = new FileSystem(uPyHexFile);
    microbitFs.write('a.txt', 'content');

    const failCase = () => {
      microbitFs.append('a.txt', 'more content');
    };

    expect(failCase).toThrow(Error);
  });
});

describe('Test read method.', () => {
  it('Throw error with invalid file name.', () => {
    const microbitFs = new FileSystem(uPyHexFile);

    const failCase1 = () => {
      microbitFs.read('');
    };
    const failCase2 = () => {
      // @ts-ignore
      microbitFs.read(null);
    };
    const failCase3 = () => {
      // @ts-ignore
      microbitFs.read(undefined);
    };

    expect(failCase1).toThrow(Error);
    expect(failCase2).toThrow(Error);
    expect(failCase3).toThrow(Error);
  });

  it('Throw error if the file does not exists.', () => {
    const microbitFs = new FileSystem(uPyHexFile);

    const failCase = () => {
      microbitFs.read('does_not_exists.txt');
    };

    expect(failCase).toThrow(Error);
  });
});

describe('Test readBytes method.', () => {
  it('Throw error with invalid file name.', () => {
    const microbitFs = new FileSystem(uPyHexFile);

    const failCase1 = () => {
      microbitFs.readBytes('');
    };
    const failCase2 = () => {
      // @ts-ignore
      microbitFs.readBytes(null);
    };
    const failCase3 = () => {
      // @ts-ignore
      microbitFs.readBytes(undefined);
    };

    expect(failCase1).toThrow(Error);
    expect(failCase2).toThrow(Error);
    expect(failCase3).toThrow(Error);
  });

  it('Throw error if the file does not exists.', () => {
    const microbitFs = new FileSystem(uPyHexFile);

    const failCase = () => {
      microbitFs.readBytes('does_not_exists.txt');
    };

    expect(failCase).toThrow(Error);
  });
});

describe('Test remove method.', () => {
  it('Delete files.', () => {
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

  it('Throw error with invalid file name.', () => {
    const microbitFs = new FileSystem(uPyHexFile);

    const failCase1 = () => {
      microbitFs.remove('');
    };
    const failCase2 = () => {
      // @ts-ignore
      microbitFs.remove(null);
    };
    const failCase3 = () => {
      // @ts-ignore
      microbitFs.remove(undefined);
    };

    expect(failCase1).toThrow(Error);
    expect(failCase2).toThrow(Error);
    expect(failCase3).toThrow(Error);
  });

  it('Throw error if the file does not exists.', () => {
    const microbitFs = new FileSystem(uPyHexFile);

    const failCase = () => {
      microbitFs.remove('does_not_exists.txt');
    };

    expect(failCase).toThrow(Error);
  });
});

describe('Tests exists method.', () => {
  it('Files exist.', () => {
    const microbitFs = new FileSystem(uPyHexFile);
    microbitFs.write('test1.py', 'content');

    const test1Py = microbitFs.exists('test1.py');
    const test2Py = microbitFs.exists('test2.py');
    const ls = microbitFs.ls();

    expect(test1Py).toBe(true);
    expect(ls).toContain('test1.py');
    expect(test2Py).toBe(false);
    expect(ls).not.toContain('test2.py');
  });

  it('Invalid filenames do not exist.', () => {
    const microbitFs = new FileSystem(uPyHexFile);

    const test1 = microbitFs.exists('');
    // @ts-ignore
    const test2 = microbitFs.exists(null);
    // @ts-ignore
    const test3 = microbitFs.exists(undefined);

    expect(test1).toBe(false);
    expect(test2).toBe(false);
    expect(test3).toBe(false);
  });
});

describe('Other checks.', () => {
  it('Too large filename throws error.', () => {
    const maxLength = 120;
    const largeName = 'a'.repeat(maxLength + 1);
    const microbitFs = new FileSystem(uPyHexFile);

    const failCase = () => {
      microbitFs.write(largeName, 'content');
      microbitFs.getIntelHex();
    };

    expect(failCase).toThrow(Error);
  });
});

describe('Test Hex generation.', () => {
  const spy = jest.spyOn(fsBuilder, 'addFileToIntelHex');

  beforeEach(() => {
    spy.mockReset();
  });

  it('getIntelHex called with constructor hex string.', () => {
    const microbitFs = new FileSystem(uPyHexFile);
    microbitFs.write('a.txt', 'content');

    const returnedIntelHex = microbitFs.getIntelHex();

    expect(spy.mock.calls.length).toEqual(1);
    expect(spy.mock.calls[0][0]).toBe(uPyHexFile);
  });

  it('getIntelHex called with argument hex string.', () => {
    const microbitFs = new FileSystem(uPyHexFile);
    const falseHex = 'Not the same Intel Hex text';
    microbitFs.write('a.txt', 'content');

    const returnedIntelHex = microbitFs.getIntelHex(falseHex);

    expect(spy.mock.calls.length).toEqual(1);
    expect(spy.mock.calls[0][0]).toBe(falseHex);
  });
});

/*
describe('NOT A REAL UNIT TEST! Used for generating a test hex file.', () => {
  it('Create output4.hex with 2 modules used in main.py.', () => {
    // This test is a bit useless at the moment, need to replace as soon
    // as this method is properly implemented
    const uPyHexFileAppended = addIntelHexAppendedScript(
      uPyHexFile,
      'from microbit import *\n' + 'display.scroll("Appended code")\n'
    );

    const microbitFs = new FileSystem(uPyHexFileAppended);
    microbitFs.write('first_name.py', 'name = "Carlos"');
    microbitFs.write('surname.py', 'name = "Pereira"');
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

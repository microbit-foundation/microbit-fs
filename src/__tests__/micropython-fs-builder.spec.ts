/**
 * All the hex file strings generated below have been created by transferring
 * the files to a micro:bit running MicroPython v1.0.1 using Mu.
 * Because the filesystem limits depend on the MicroPython version, these will
 * only work if combined with v1.0.1.
 *
 * (c) 2019 Micro:bit Educational Foundation and the microbit-fs contributors.
 * SPDX-License-Identifier: MIT
 */
import * as fs from 'fs';

import MemoryMap from 'nrf-intel-hex';

import { strToBytes } from '../common';
import {
  createMpFsBuilderCache,
  generateHexWithFiles,
  addIntelHexFiles,
  calculateFileSize,
  getIntelHexFiles,
  getMemMapFsSize,
} from '../micropython-fs-builder';

const uPyHexFile = fs.readFileSync('./src/__tests__/upy-v1.0.1.hex', 'utf8');
const makecodeHexFile = fs.readFileSync('./src/__tests__/makecode.hex', 'utf8');
const randContent = strToBytes('Some random content.');

describe('Writing files to the filesystem.', () => {
  const files: {
    fileName: string;
    fileStr: string;
    hex: string;
    fileAddress: number;
    fsSize: number;
    bytes: () => Uint8Array;
  }[] = [
    {
      fileName: 'test_file_1.py',
      fileStr: "from microbit import display\r\ndisplay.show('x')",
      hex:
        ':020000040003F7\n' +
        ':10C90000FE3F0E746573745F66696C655F312E70EF\n' +
        ':10C910007966726F6D206D6963726F6269742069E8\n' +
        ':10C920006D706F727420646973706C61790D0A6444\n' +
        ':10C930006973706C61792E73686F7728277827295F\n' +
        ':10C94000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF7\n' +
        ':10C95000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFE7\n' +
        ':10C96000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFD7\n' +
        ':10C97000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFC7\n' +
        ':00000001FF',
      fileAddress: 0x3c900,
      fsSize: 128,
      bytes() {
        return MemoryMap.fromHex(this.hex).get(this.fileAddress);
      },
    },
    {
      fileName: 'test_file_2.py',
      fileStr:
        '# Lorem Ipsum is simply dummy text of the printing and\r\n' +
        "# typesetting industry. Lorem Ipsum has been the industry's\r\n" +
        '# standard dummy text ever since the 1500s, when an unknown\r\n' +
        '# printer took a galley of type and scrambled it to make a\r\n' +
        '# type specimen book. It has survived not only five\r\n' +
        '# centuries, but also the leap into electronic typesetting,\r\n' +
        '# remaining essentially unchanged. It was popularised in the\r\n' +
        '# 1960s with the release of Letraset sheets containing Lorem\r\n' +
        '# Ipsum passages, and more recently with desktop publishing\r\n' +
        '# software like Aldus PageMaker including versions of Lorem\r\n' +
        '# Ipsum.\r\n' +
        '# Lorem Ipsum is simply dummy text of the printing and\r\n' +
        "# typesetting industry. Lorem Ipsum has been the industry's\r\n" +
        '# standard dummy text ever since the 1500s, when an unknown\r\n' +
        '# printer took a galley of type and scrambled it to make a\r\n' +
        '# type specimen book. It has survived not only five\r\n' +
        '# centuries, but also the leap into electronic typesetting,\r\n' +
        '# remaining essentially unchanged. It was popularised in the\r\n' +
        '# 1960s with the release of Letraset sheets containing Lorem\r\n' +
        '# Ipsum passages, and more recently with desktop publishing\r\n' +
        '# software like Aldus PageMaker including versions of Lorem\r\n' +
        '# Ipsum.',
      hex:
        ':020000040003F7\n' +
        ':108C8000FE600E746573745F66696C655F322E708A\n' +
        ':108C90007923204C6F72656D20497073756D206962\n' +
        ':108CA000732073696D706C792064756D6D792074B3\n' +
        ':108CB000657874206F6620746865207072696E74C0\n' +
        ':108CC000696E6720616E640D0A2320747970657384\n' +
        ':108CD000657474696E6720696E6475737472792E39\n' +
        ':108CE000204C6F72656D20497073756D20686173DB\n' +
        ':108CF000206265656E2074686520696E6475730313\n' +
        ':108D00000274727927730D0A23207374616E646193\n' +
        ':108D100072642064756D6D79207465787420657651\n' +
        ':108D200065722073696E6365207468652031353023\n' +
        ':108D300030732C207768656E20616E20756E6B6EC7\n' +
        ':108D40006F776E0D0A23207072696E7465722074DD\n' +
        ':108D50006F6F6B20612067616C6C6579206F662096\n' +
        ':108D60007479706520616E6420736372616D626CEA\n' +
        ':108D7000656420697420746F206D616B65206104E7\n' +
        ':108D8000030D0A2320747970652073706563696D23\n' +
        ':108D9000656E20626F6F6B2E2049742068617320AE\n' +
        ':108DA0007375727669766564206E6F74206F6E6C71\n' +
        ':108DB0007920666976650D0A232063656E74757285\n' +
        ':108DC0006965732C2062757420616C736F20746800\n' +
        ':108DD00065206C65617020696E746F20656C6563D9\n' +
        ':108DE00074726F6E696320747970657365747469E9\n' +
        ':108DF0006E672C0D0A232072656D61696E696E05C0\n' +
        ':108E0000046720657373656E7469616C6C79207595\n' +
        ':108E10006E6368616E6765642E20497420776173A4\n' +
        ':108E200020706F70756C61726973656420696E2063\n' +
        ':108E30007468650D0A2320313936307320776974E0\n' +
        ':108E400068207468652072656C65617365206F6663\n' +
        ':108E5000204C657472617365742073686565747302\n' +
        ':108E600020636F6E7461696E696E67204C6F726506\n' +
        ':108E70006D0D0A2320497073756D20706173730640\n' +
        ':108E800005616765732C20616E64206D6F726520CB\n' +
        ':108E9000726563656E746C792077697468206465A7\n' +
        ':108EA000736B746F70207075626C697368696E673C\n' +
        ':108EB0000D0A2320736F667477617265206C696B8D\n' +
        ':108EC0006520416C64757320506167654D616B6509\n' +
        ':108ED0007220696E636C7564696E67207665727363\n' +
        ':108EE000696F6E73206F66204C6F72656D0D0A237B\n' +
        ':108EF00020497073756D2E0D0A23204C6F72650723\n' +
        ':108F0000066D20497073756D2069732073696D70EB\n' +
        ':108F10006C792064756D6D792074657874206F6646\n' +
        ':108F200020746865207072696E74696E6720616E66\n' +
        ':108F3000640D0A23207479706573657474696E67B3\n' +
        ':108F400020696E6475737472792E204C6F72656D32\n' +
        ':108F500020497073756D20686173206265656E20AD\n' +
        ':108F600074686520696E64757374727927730D0A6D\n' +
        ':108F700023207374616E646172642064756D6D0882\n' +
        ':108F80000779207465787420657665722073696E40\n' +
        ':108F90006365207468652031353030732C20776824\n' +
        ':108FA000656E20616E20756E6B6E6F776E0D0A2395\n' +
        ':108FB000207072696E74657220746F6F6B2061200F\n' +
        ':108FC00067616C6C6579206F6620747970652061CB\n' +
        ':108FD0006E6420736372616D626C656420697420D5\n' +
        ':108FE000746F206D616B6520610D0A2320747970A8\n' +
        ':108FF000652073706563696D656E20626F6F6B09C4\n' +
        ':10900000082E204974206861732073757276697622\n' +
        ':109010006564206E6F74206F6E6C7920666976656A\n' +
        ':109020000D0A232063656E7475726965732C206266\n' +
        ':10903000757420616C736F20746865206C65617055\n' +
        ':1090400020696E746F20656C656374726F6E6963FE\n' +
        ':10905000207479706573657474696E672C0D0A23CA\n' +
        ':109060002072656D61696E696E6720657373656EE8\n' +
        ':109070007469616C6C7920756E6368616E67650AEE\n' +
        ':1090800009642E2049742077617320706F70756CAD\n' +
        ':1090900061726973656420696E207468650D0A23C6\n' +
        ':1090A0002031393630732077697468207468652000\n' +
        ':1090B00072656C65617365206F66204C65747261C2\n' +
        ':1090C0007365742073686565747320636F6E746173\n' +
        ':1090D000696E696E67204C6F72656D0D0A232049B9\n' +
        ':1090E0007073756D2070617373616765732C206197\n' +
        ':1090F0006E64206D6F726520726563656E746C0BB3\n' +
        ':109100000A792077697468206465736B746F7020C6\n' +
        ':109110007075626C697368696E670D0A2320736FDE\n' +
        ':10912000667477617265206C696B6520416C64754B\n' +
        ':109130007320506167654D616B657220696E636C69\n' +
        ':109140007564696E672076657273696F6E73206FE0\n' +
        ':1091500066204C6F72656D0D0A2320497073756D22\n' +
        ':109160002EFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFE0\n' +
        ':00000001FF',
      fileAddress: 0x38c80,
      fsSize: 1264,
      bytes() {
        return MemoryMap.fromHex(this.hex).get(this.fileAddress);
      },
    },
  ];

  it('Add files to hex, return a string.', () => {
    const fwWithFsOther = addIntelHexFiles(uPyHexFile, {
      [files[0].fileName]: strToBytes(files[0].fileStr),
      [files[1].fileName]: strToBytes(files[1].fileStr),
    });
    // fs.writeFileSync('./ignore/output2.hex', fwWithFsOther);

    // Address calculated starting at the top of the MicroPython v1.0.1 fs
    const opMap = MemoryMap.fromHex(fwWithFsOther);
    const startFs = 0x38c00;
    const file0data = opMap.slice(startFs, files[0].fsSize).get(startFs);
    const file1data = opMap
      .slice(startFs + files[0].fsSize, files[1].fsSize)
      .get(startFs + files[0].fsSize);
    expect(file0data).toEqual(files[0].bytes());
    expect(file1data).toEqual(files[1].bytes());
  });

  it('Add files to hex, return a byte array', () => {
    const fwWithFsBytes = addIntelHexFiles(
      uPyHexFile,
      {
        [files[0].fileName]: strToBytes(files[0].fileStr),
        [files[1].fileName]: strToBytes(files[1].fileStr),
      },
      true
    );

    // Address calculated starting at the top of the MicroPython v1.0.1 fs
    const startFs = 0x38c00;
    const file0data = fwWithFsBytes.slice(startFs, startFs + files[0].fsSize);
    const file1start = startFs + files[0].fsSize;
    const file1data = fwWithFsBytes.slice(
      file1start,
      file1start + files[1].fsSize
    );
    expect(file0data).toEqual(files[0].bytes());
    expect(file1data).toEqual(files[1].bytes());
  });

  it('Both addIntelHexFiles() and generateHexWithFiles() generate compatible data', () => {
    const fsFiles = {
      [files[0].fileName]: strToBytes(files[0].fileStr),
      [files[1].fileName]: strToBytes(files[1].fileStr),
    };
    for (let i = 0; i < 32; i++) {
      fsFiles['file_' + i + '.txt'] = strToBytes("Content doesn't matter " + i);
    }
    const cache = createMpFsBuilderCache(uPyHexFile);

    const hexFromIntelHex = addIntelHexFiles(uPyHexFile, fsFiles) as string;
    const hexFromCache = generateHexWithFiles(cache, fsFiles);

    // The generateHexWithFiles() function caches the MicroPython data in an
    // Intel Hex string, instead of generating it every time, and so it only
    // has to generate records for the filesystem and forward.
    // So we'll always find an Extended Linear Address record at the beginning
    // of the filesystem data (the slower addIntelHexFiles() generates a single
    // continuous hex string). To compare the two functions, we add the extra
    // record after the last line of MicroPython data (excluding UICR)
    const hexFromIntelHexPlusRecord = hexFromIntelHex.replace(
      ':0888B00095880100C1000000E1',
      ':0888B00095880100C1000000E1\n:020000040003F7'
    );
    expect(hexFromCache).toEqual(hexFromIntelHexPlusRecord);
  });

  // A chunk using up the last byte will also use the next and leave it empty
  const fullChunkPlus = {
    fileName: 'one_chunk_plus.py',
    fileStr:
      'a = """abcdefghijklmnopqrstuvwxyz\n' +
      'abcdefghijklmnopqrstuvwxyz\n' +
      'abcdefghijklmnopqrstuvwxyz\n' +
      'abcdefghijklmno"""\n',
    hex:
      ':020000040003F7\n' +
      ':108C0000FE00116F6E655F6368756E6B5F706C75EB\n' +
      ':108C1000732E707961203D20222222616263646597\n' +
      ':108C2000666768696A6B6C6D6E6F7071727374756C\n' +
      ':108C3000767778797A0A6162636465666768696ADB\n' +
      ':108C40006B6C6D6E6F707172737475767778797AFC\n' +
      ':108C50000A6162636465666768696A6B6C6D6E6FF2\n' +
      ':108C6000707172737475767778797A0A6162636469\n' +
      ':108C700065666768696A6B6C6D6E6F2222220A02F4\n' +
      ':108C800001FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF2\n' +
      ':00000001FF',
    fileAddress: 0x38c00,
    fsSize: 144,
    bytes() {
      return MemoryMap.fromHex(this.hex).get(this.fileAddress);
    },
  };
  // Using space except the last byte should only use a single chunk
  const fullChunkMinus = {
    fileName: 'one_chunk_minus.py',
    fileStr:
      'a = """abcdefghijklmnopqrstuvwxyz\n' +
      'abcdefghijklmnopqrstuvwxyz\n' +
      'abcdefghijklmnopqrstuvwxyz\n' +
      'abcdefghijklm"""\n',
    hex:
      ':020000040003F7\n' +
      ':108C0000FE7D126F6E655F6368756E6B5F6D696E7A\n' +
      ':108C100075732E707961203D202222226162636487\n' +
      ':108C200065666768696A6B6C6D6E6F70717273747C\n' +
      ':108C300075767778797A0A616263646566676869D0\n' +
      ':108C40006A6B6C6D6E6F707172737475767778790C\n' +
      ':108C50007A0A6162636465666768696A6B6C6D6EE7\n' +
      ':108C60006F707172737475767778797A0A6162635E\n' +
      ':108C70006465666768696A6B6C6D2222220AFFFF71\n' +
      ':00000001FF',
    fileAddress: 0x38c00,
    fsSize: 128,
    bytes() {
      return MemoryMap.fromHex(this.hex).get(this.fileAddress);
    },
  };
  // One full chunk + a single byte on the second
  const twoChunks = {
    fileName: 'two_chunks.py',
    fileStr:
      'a = """abcdefghijklmnopqrstuvwxyz\n' +
      'abcdefghijklmnopqrstuvwxyz\n' +
      'abcdefghijklmnopqrstuvwxyz\n' +
      'abcdefghijklmnopqrst"""\n',
    hex:
      ':020000040003F7\n' +
      ':108C0000FE010D74776F5F6368756E6B732E7079FC\n' +
      ':108C100061203D2022222261626364656667686983\n' +
      ':108C20006A6B6C6D6E6F707172737475767778792C\n' +
      ':108C30007A0A6162636465666768696A6B6C6D6E07\n' +
      ':108C40006F707172737475767778797A0A6162637E\n' +
      ':108C50006465666768696A6B6C6D6E6F707172735C\n' +
      ':108C60007475767778797A0A616263646566676895\n' +
      ':108C7000696A6B6C6D6E6F7071727374222222025E\n' +
      ':108C8000010AFFFFFFFFFFFFFFFFFFFFFFFFFFFFE7\n' +
      ':00000001FF',
    fileAddress: 0x38c00,
    fsSize: 144,
    bytes() {
      return MemoryMap.fromHex(this.hex).get(this.fileAddress);
    },
  };

  it('Can generate a full chunk that also consumes the next one.', () => {
    const fwWithFsOther = addIntelHexFiles(uPyHexFile, {
      [fullChunkPlus.fileName]: strToBytes(fullChunkPlus.fileStr),
    });

    const opMap = MemoryMap.fromHex(fwWithFsOther);
    const readFileData = opMap
      .slice(fullChunkPlus.fileAddress, fullChunkPlus.fsSize)
      .get(fullChunkPlus.fileAddress);
    expect(readFileData).toEqual(fullChunkPlus.bytes());
  });

  it('Correctly generate an almost full chunk (not using last byte).', () => {
    const fwWithFsOther = addIntelHexFiles(uPyHexFile, {
      [fullChunkMinus.fileName]: strToBytes(fullChunkMinus.fileStr),
    });

    const opMap = MemoryMap.fromHex(fwWithFsOther);
    const readFileData = opMap
      .slice(fullChunkMinus.fileAddress, fullChunkMinus.fsSize)
      .get(fullChunkMinus.fileAddress);
    expect(readFileData).toEqual(fullChunkMinus.bytes());
  });

  it('Correctly generate just over a full chunk.', () => {
    const fwWithFsOther = addIntelHexFiles(uPyHexFile, {
      [twoChunks.fileName]: strToBytes(twoChunks.fileStr),
    });

    const opMap = MemoryMap.fromHex(fwWithFsOther);
    const readFileData = opMap
      .slice(twoChunks.fileAddress, twoChunks.fsSize)
      .get(twoChunks.fileAddress);
    expect(readFileData).toEqual(twoChunks.bytes());
  });

  it('Empty file name throws an error.', () => {
    const failCase = () => addIntelHexFiles(uPyHexFile, { '': randContent });

    expect(failCase).toThrow('File has to have a file name');
  });

  it('Empty file data throw an error.', () => {
    const failCase = () =>
      addIntelHexFiles(uPyHexFile, { 'my_file.txt': new Uint8Array(0) });

    expect(failCase).toThrow('has to contain data');
  });

  it('Large file that does not fit throws error.', () => {
    const failCase = () => {
      addIntelHexFiles(uPyHexFile, {
        'my_file.txt': new Uint8Array(50 * 1024).fill(0x55),
      });
    };
    expect(failCase).toThrow('Not enough space');
  });

  it('Add files until no more fit.', () => {
    // The MicroPython hex has about 29 KBs
    let hexWithFs = uPyHexFile;
    // Use 4 KB blocks per file (each chunk is 128 B)
    const fakeBigFileData = new Uint8Array(4000).fill(0x55);
    const fakeSingleChunkData = new Uint8Array([0x55, 0x55]);

    const addLargeFiles = () => {
      // At 4Kbs we only fit 7 files
      for (let i = 0; i < 15; i++) {
        hexWithFs = addIntelHexFiles(hexWithFs, {
          ['file_' + i + '.txt']: fakeBigFileData,
        }) as string;
      }
    };
    const completeFsFilling = () => {
      // At a maximum of 4 Kbs left, it would fit 32 chunks max
      for (let i = 100; i < 132; i++) {
        hexWithFs = addIntelHexFiles(hexWithFs, {
          ['file_' + i + '.txt']: fakeSingleChunkData,
        }) as string;
      }
    };

    expect(addLargeFiles).toThrow('Not enough space');
    expect(completeFsFilling).toThrow('no storage space left');
  });

  it('Add a group of files that do not fit.', () => {
    // The MicroPython hex has about 29 KBs
    const hexWithFs = uPyHexFile;
    // Use 4 KB blocks per file (each chunk is 128 B)
    const fakeBigFileData = new Uint8Array(4000).fill(0x55);
    const tooManyBigFiles: { [filename: string]: Uint8Array } = {};
    for (let i = 0; i < 8; i++) {
      tooManyBigFiles['file_' + i + '.txt'] = fakeBigFileData;
    }

    const addingAllFiles = () => addIntelHexFiles(uPyHexFile, tooManyBigFiles);

    expect(addingAllFiles).toThrow('Not enough space');
  });

  it('Max filename length works.', () => {
    const maxLength = 120;
    const largeName = 'a'.repeat(maxLength);

    const workingCase = () =>
      addIntelHexFiles(uPyHexFile, { [largeName]: randContent });

    expect(workingCase).not.toThrow(Error);
  });

  it('Too large filename throws error.', () => {
    const maxLength = 120;
    const largeName = 'a'.repeat(maxLength + 1);

    const failCase = () =>
      addIntelHexFiles(uPyHexFile, { [largeName]: randContent });

    expect(failCase).toThrow('File name');
  });

  it('Adding files to non-MicroPython hex fails.', () => {
    const failCase = () =>
      addIntelHexFiles(makecodeHexFile, { 'a.py': randContent });

    expect(failCase).toThrow('Could not find valid MicroPython UICR');
  });

  // TODO: Hex file with persistent page marker doesn't get two markers
  // TODO: Create tests for createMpFsBuilderCache
});

describe('Reading files from the filesystem.', () => {
  const alastFilename = 'alast.py';
  const alastContent = strToBytes(
    '# Lorem Ipsum is simply dummy text of the printing and\n' +
      "# typesetting industry. Lorem Ipsum has been the industry's\n" +
      '# standard dummy text ever since the 1500s, when an unknown\n' +
      '# printer took a galley of type and scrambled it to make a\n' +
      '# type specimen book. It has survived not only five\n' +
      '# centuries, but also the leap into electronic typesetting,\n' +
      '# remaining essentially unchanged. It was popularised in the\n' +
      '# 1960s with the release of Letraset sheets containing Lorem\n' +
      '# Ipsum passages, and more recently with desktop publishing\n' +
      '# software like Aldus PageMaker including versions of Lorem\n' +
      '# Ipsum.\n' +
      '# Lorem Ipsum is simply dummy text of the printing and\n' +
      "# typesetting industry. Lorem Ipsum has been the industry's\n" +
      '# standard dummy text ever since the 1500s, when an unknown\n' +
      '# printer took a galley of type and scrambled it to make a\n' +
      '# type specimen book. It has survived not only five\n' +
      '# centuries, but also the leap into electronic typesetting,\n' +
      '# remaining essentially unchanged. It was popularised in the\n' +
      '# 1960s with the release of Letraset sheets containing Lorem\n' +
      '# Ipsum passages, and more recently with desktop publishing\n' +
      '# software like Aldus PageMaker including versions of Lorem\n' +
      '# Ipsum.\n' +
      'import afirst\n\n' +
      "lastname = 'Pereira'\n" +
      "full_name = '{} {}'.format(afirst.firstname, lastname)\n"
  );
  // Uses chunk 0x0F, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19
  const alastHex =
    ':020000040003F7\n' +
    ':10930000FE2308616C6173742E707923204C6F7298\n' +
    ':10931000656D20497073756D2069732073696D7078\n' +
    ':109320006C792064756D6D792074657874206F6632\n' +
    ':1093300020746865207072696E74696E6720616E52\n' +
    ':10934000640A23207479706573657474696E67208C\n' +
    ':10935000696E6475737472792E204C6F72656D201E\n' +
    ':10936000497073756D20686173206265656E207445\n' +
    ':10937000686520696E64757374727927730A2310A7\n' +
    ':109380000F207374616E646172642064756D6D7911\n' +
    ':10939000207465787420657665722073696E6365E4\n' +
    ':1093A000207468652031353030732C207768656E05\n' +
    ':1093B00020616E20756E6B6E6F776E0A232070725F\n' +
    ':1093C000696E74657220746F6F6B20612067616CC9\n' +
    ':1093D0006C6579206F66207479706520616E6420F9\n' +
    ':1093E000736372616D626C656420697420746F20B0\n' +
    ':1093F0006D616B6520610A2320747970652073119B\n' +
    ':1094000010706563696D656E20626F6F6B2E204909\n' +
    ':109410007420686173207375727669766564206E56\n' +
    ':109420006F74206F6E6C7920666976650A232063FD\n' +
    ':10943000656E7475726965732C2062757420616C39\n' +
    ':10944000736F20746865206C65617020696E746F3D\n' +
    ':1094500020656C656374726F6E69632074797065E2\n' +
    ':1094600073657474696E672C0A232072656D616977\n' +
    ':109470006E696E6720657373656E7469616C6C12DA\n' +
    ':10948000117920756E6368616E6765642E2049747A\n' +
    ':109490002077617320706F70756C61726973656499\n' +
    ':1094A00020696E207468650A2320313936307320B4\n' +
    ':1094B00077697468207468652072656C656173658E\n' +
    ':1094C000206F66204C6574726173657420736865E3\n' +
    ':1094D00065747320636F6E7461696E696E67204C8A\n' +
    ':1094E0006F72656D0A2320497073756D207061730A\n' +
    ':1094F00073616765732C20616E64206D6F726513F4\n' +
    ':109500001220726563656E746C79207769746820C7\n' +
    ':109510006465736B746F70207075626C69736869D1\n' +
    ':109520006E670A2320736F667477617265206C69B9\n' +
    ':109530006B6520416C64757320506167654D616B8C\n' +
    ':10954000657220696E636C7564696E6720766572FA\n' +
    ':1095500073696F6E73206F66204C6F72656D0A239E\n' +
    ':1095600020497073756D2E0A23204C6F72656D2033\n' +
    ':10957000497073756D2069732073696D706C79140F\n' +
    ':10958000132064756D6D792074657874206F662082\n' +
    ':10959000746865207072696E74696E6720616E64AC\n' +
    ':1095A0000A23207479706573657474696E67206925\n' +
    ':1095B0006E6475737472792E204C6F72656D2049DC\n' +
    ':1095C0007073756D20686173206265656E207468C4\n' +
    ':1095D0006520696E64757374727927730A2320732A\n' +
    ':1095E00074616E646172642064756D6D7920746558\n' +
    ':1095F000787420657665722073696E6365207415D2\n' +
    ':109600001468652031353030732C207768656E2002\n' +
    ':10961000616E20756E6B6E6F776E0A2320707269B3\n' +
    ':109620006E74657220746F6F6B20612067616C6C63\n' +
    ':109630006579206F66207479706520616E6420738F\n' +
    ':109640006372616D626C656420697420746F206D53\n' +
    ':10965000616B6520610A23207479706520737065E1\n' +
    ':1096600063696D656E20626F6F6B2E204974206890\n' +
    ':109670006173207375727669766564206E6F7416F7\n' +
    ':1096800015206F6E6C7920666976650A2320636504\n' +
    ':109690006E7475726965732C2062757420616C73C9\n' +
    ':1096A0006F20746865206C65617020696E746F202E\n' +
    ':1096B000656C656374726F6E69632074797065732D\n' +
    ':1096C000657474696E672C0A232072656D61696E1A\n' +
    ':1096D000696E6720657373656E7469616C6C79205F\n' +
    ':1096E000756E6368616E6765642E204974207761CA\n' +
    ':1096F0007320706F70756C6172697365642069178F\n' +
    ':10970000166E207468650A2320313936307320774D\n' +
    ':10971000697468207468652072656C656173652082\n' +
    ':109720006F66204C6574726173657420736865653B\n' +
    ':10973000747320636F6E7461696E696E67204C6F1D\n' +
    ':1097400072656D0A2320497073756D2070617373A3\n' +
    ':10975000616765732C20616E64206D6F7265207285\n' +
    ':109760006563656E746C79207769746820646573CD\n' +
    ':109770006B746F70207075626C697368696E6718BE\n' +
    ':10978000170A2320736F667477617265206C696BAA\n' +
    ':109790006520416C64757320506167654D616B6530\n' +
    ':1097A0007220696E636C7564696E6720766572738A\n' +
    ':1097B000696F6E73206F66204C6F72656D0A23208F\n' +
    ':1097C000497073756D2E0A696D706F7274206166D1\n' +
    ':1097D000697273740A0A6C6173746E616D65203D01\n' +
    ':1097E000202750657265697261270A66756C6C5F27\n' +
    ':1097F0006E616D65203D20277B7D207B7D272E19A6\n' +
    ':1098000018666F726D6174286166697273742E6672\n' +
    ':10981000697273746E616D652C206C6173746E6116\n' +
    ':109820006D65290AFFFFFFFFFFFFFFFFFFFFFFFF3F\n' +
    ':00000001FF\n';

  const afirstFilename = 'afirst.py';
  const afirstContent = strToBytes("firstname = 'Carlos'");
  // Uses chunk ??
  const afirstHex =
    ':020000040003F7\n' +
    ':10DF0000FE1F096166697273742E70796669727397\n' +
    ':10DF1000746E616D65203D20274361726C6F7327BD\n' +
    ':00000001FF\n';

  const mainFilename = 'main.py';
  const mainContent = strToBytes(
    'from microbit import display, Image, sleep\n\n' +
      'from afirst import firstname\n' +
      'from alast import lastname, full_name\n\n' +
      "if full_name == 'Carlos Pereira':\n" +
      '    display.show(Image.HAPPY)\n' +
      'else:\n' +
      '    display.show(Image.SAD)\n' +
      'sleep(2000)\n' +
      "full = '{} {}'.format(firstname, lastname)\n" +
      'display.scroll(full)\n' +
      'print(full)\n'
  );
  // Uses chunks 0xCA, 0xCB, 0xCC
  const mainHex =
    ':020000040003F7\n' +
    ':10F08000FE37076D61696E2E707966726F6D206D47\n' +
    ':10F090006963726F62697420696D706F7274206445\n' +
    ':10F0A0006973706C61792C20496D6167652C2073E0\n' +
    ':10F0B0006C6565700A0A66726F6D206166697273AD\n' +
    ':10F0C0007420696D706F72742066697273746E61FA\n' +
    ':10F0D0006D650A66726F6D20616C61737420696D75\n' +
    ':10F0E000706F7274206C6173746E616D652C206634\n' +
    ':10F0F000756C6C5F6E616D650A0A6966206675CB1A\n' +
    ':10F10000CA6C6C5F6E616D65203D3D202743617266\n' +
    ':10F110006C6F732050657265697261273A0A20200E\n' +
    ':10F120002020646973706C61792E73686F77284949\n' +
    ':10F130006D6167652E4841505059290A656C7365A9\n' +
    ':10F140003A0A20202020646973706C61792E7368FC\n' +
    ':10F150006F7728496D6167652E534144290A736CA6\n' +
    ':10F160006565702832303030290A66756C6C203D38\n' +
    ':10F1700020277B7D207B7D272E666F726D6174CC8E\n' +
    ':10F18000CB2866697273746E616D652C206C617337\n' +
    ':10F19000746E616D65290A646973706C61792E7390\n' +
    ':10F1A00063726F6C6C2866756C6C290A7072696E7C\n' +
    ':10F1B000742866756C6C290AFFFFFFFFFFFFFFFFD5\n' +
    ':00000001FF\n';

  it('Can read files of different sizes in non-consecutive locations.', () => {
    const addHexToMap = (hexMap: MemoryMap, hex: string) => {
      const newMemMap = MemoryMap.fromHex(hex);
      newMemMap.forEach((value: Uint8Array, index: number) => {
        hexMap.set(index, value);
      });
    };
    const fullUpyFsMemMap = MemoryMap.fromHex(uPyHexFile);
    addHexToMap(fullUpyFsMemMap, afirstHex);
    addHexToMap(fullUpyFsMemMap, alastHex);
    addHexToMap(fullUpyFsMemMap, mainHex);

    const foundFiles = getIntelHexFiles(fullUpyFsMemMap.asHexString());

    expect(foundFiles).toHaveProperty([afirstFilename], afirstContent);
    expect(foundFiles).toHaveProperty([alastFilename], alastContent);
    expect(foundFiles).toHaveProperty([mainFilename], mainContent);
  });

  // When MicroPython saves a file that takes full chunk it still utilises
  // the next chunk and leaves it empty
  const oneChunkPlusFilename = 'one_chunk_plus.py';
  const oneChunkPlusContent =
    'a = """abcdefghijklmnopqrstuvwxyz\n' +
    'abcdefghijklmnopqrstuvwxyz\n' +
    'abcdefghijklmnopqrstuvwxyz\n' +
    'abcdefghijklmno"""\n';
  // Uses chunk 0x45 and 0x46
  const oneChunkPlusHex =
    ':020000040003F7\n' +
    ':10AE0000FE00116F6E655F6368756E6B5F706C75C9\n' +
    ':10AE1000732E707961203D20222222616263646575\n' +
    ':10AE2000666768696A6B6C6D6E6F7071727374754A\n' +
    ':10AE3000767778797A0A6162636465666768696AB9\n' +
    ':10AE40006B6C6D6E6F707172737475767778797ADA\n' +
    ':10AE50000A6162636465666768696A6B6C6D6E6FD0\n' +
    ':10AE6000707172737475767778797A0A6162636447\n' +
    ':10AE700065666768696A6B6C6D6E6F2222220A468E\n' +
    ':10AE800045FFFFFFFFFFFFFFFFFFFFFFFFFFFFFF8C\n' +
    ':00000001FF\n';

  it('Can read a file that occupies a single chunk and also the next.', () => {
    // In the one_chunk_plus.py example the data inside the file would take
    // exactly 128 Bytes, or one chunk. However, MicroPython also "takes" or
    // "links" the next chunk and doesn't put any data into it.
    const fullUpyFsMemMap = MemoryMap.fromHex(uPyHexFile);
    const oneChunkPlusMemMap = MemoryMap.fromHex(oneChunkPlusHex);
    oneChunkPlusMemMap.forEach((value: Uint8Array, index: number) => {
      fullUpyFsMemMap.set(index, value);
    });

    const foundFiles = getIntelHexFiles(fullUpyFsMemMap.asHexString());

    expect(foundFiles).toHaveProperty(
      [oneChunkPlusFilename],
      strToBytes(oneChunkPlusContent)
    );
  });

  const oneChunkMinusFilename = 'one_chunk_minus.py';
  const oneChunkMinusContent =
    'a = """abcdefghijklmnopqrstuvwxyz\n' +
    'abcdefghijklmnopqrstuvwxyz\n' +
    'abcdefghijklmnopqrstuvwxyz\n' +
    'abcdefghijklm"""\n';
  // Uses chunk ??
  const oneChunkMinusHex =
    ':020000040003F7\n' +
    ':10920000FE7D126F6E655F6368756E6B5F6D696E74\n' +
    ':1092100075732E707961203D202222226162636481\n' +
    ':1092200065666768696A6B6C6D6E6F707172737476\n' +
    ':1092300075767778797A0A616263646566676869CA\n' +
    ':109240006A6B6C6D6E6F7071727374757677787906\n' +
    ':109250007A0A6162636465666768696A6B6C6D6EE1\n' +
    ':109260006F707172737475767778797A0A61626358\n' +
    ':109270006465666768696A6B6C6D2222220AFFFF6B\n' +
    ':00000001FF\n';

  it('Can read a file that occupies almost a full chunk.', () => {
    // In contrast to the one_chunk_plus.py example, this one fills the chunk
    // minus 1 Byte (The second 0xFF at the end is the chunk tail).
    const fullUpyFsMemMap = MemoryMap.fromHex(uPyHexFile);
    const oneChunkMinusMemMap = MemoryMap.fromHex(oneChunkMinusHex);
    oneChunkMinusMemMap.forEach((value: Uint8Array, index: number) => {
      fullUpyFsMemMap.set(index, value);
    });

    const foundFiles = getIntelHexFiles(fullUpyFsMemMap.asHexString());

    expect(foundFiles).toHaveProperty(
      [oneChunkMinusFilename],
      strToBytes(oneChunkMinusContent)
    );
  });

  const duplicateFilename = 'a.py';
  // Uses chunks ??
  const oneFileCopyHex =
    ':020000040003F7\n' +
    ':10AE0000FE1804612E707961203D20274A75737405\n' +
    ':10AE100020612066696C65270AFFFFFFFFFFFFFFC7\n' +
    ':00000001FF\n';
  const otherFileCopyHex =
    ':020000040003F7\n' +
    ':10C18000FE1804612E707961203D20274A75737472\n' +
    ':10C1900020612066696C65270AFFFFFFFFFFFFFF34\n' +
    ':00000001FF\n';

  it('Duplicate file names throws an error.', () => {
    // In contrast to the one_chunk_plus.py example, this one fills the chunk
    // minus 1 Byte (The second 0xFF at the end is the chunk tail).
    const fullUpyFsMemMap = MemoryMap.fromHex(uPyHexFile);
    const oneFileCopyMemMap = MemoryMap.fromHex(oneFileCopyHex);
    oneFileCopyMemMap.forEach((value: Uint8Array, index: number) => {
      fullUpyFsMemMap.set(index, value);
    });
    const otherFileCopyMemMap = MemoryMap.fromHex(otherFileCopyHex);
    otherFileCopyMemMap.forEach((value: Uint8Array, index: number) => {
      fullUpyFsMemMap.set(index, value);
    });

    const failCase = () => getIntelHexFiles(fullUpyFsMemMap.asHexString());

    expect(failCase).toThrow('Found multiple files named');
  });

  it('Reading files from empty MicroPython hex returns empty list.', () => {
    const foundFiles = getIntelHexFiles(uPyHexFile);

    expect(foundFiles).toEqual({});
  });

  it('Reading files from non-MicroPython hex fails.', () => {
    const failCase = () => getIntelHexFiles(makecodeHexFile);

    expect(failCase).toThrow('Could not find valid MicroPython UICR');
  });

  // TODO: Read tests with a file that has chunks in non-continuous order
  // TODO: Read test with chunks that point to each other in an infinite loop
  // TODO: Read test with chunks that don't point to each other in Marker/Tail
  // TODO: Read test with chunks using all the start file markers
});

describe('Calculate sizes.', () => {
  it('Get how much available fs space there is in a MicroPython hex file.', () => {
    const totalSize = getMemMapFsSize(MemoryMap.fromHex(uPyHexFile));

    // Calculated by hand from the uPyHexFile v1.0.1 release.
    expect(totalSize).toEqual(27 * 1024);
  });

  it('Calculate the space occupied for a file in the fs.', () => {
    const fileSizeOne = calculateFileSize(
      'one_chunk.txt',
      new Uint8Array([30, 31, 32, 33, 34])
    );
    const fileSizeAlmostFullOne = calculateFileSize(
      'almost_one_chunk____.txt',
      new Uint8Array(99).fill(0x35)
    );
    const fileSizeOneOverflow = calculateFileSize(
      'one_chunk_overflow__.txt',
      new Uint8Array(100).fill(0x35)
    );
    const fileSizeTwo = calculateFileSize(
      'just_about_2_chunks_.txt',
      new Uint8Array(101).fill(0x35)
    );
    const fileSizeNine = calculateFileSize(
      '9_chunks.txt',
      new Uint8Array(1100).fill(0x35)
    );

    // Real size counts chunks, so always a multiple of 128
    expect(fileSizeOne).toEqual(128);
    expect(fileSizeAlmostFullOne).toEqual(128);
    expect(fileSizeOneOverflow).toEqual(128 * 2);
    expect(fileSizeTwo).toEqual(128 * 2);
    expect(fileSizeNine).toEqual(128 * 9);
  });
});

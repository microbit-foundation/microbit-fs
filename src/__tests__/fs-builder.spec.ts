import * as fs from 'fs';

import MemoryMap from 'nrf-intel-hex';

import { bytesToStr, strToBytes } from '../common';
import {
  addFileToIntelHex,
  getIntelHexFiles,
  testResetFileSystem,
} from '../fs-builder';

const uPyHexFile = fs.readFileSync('./src/__tests__/upy-v1.0.1.hex', 'utf8');

describe('Writing files to the filesystem.', () => {
  it('Add files to hex.', () => {
    const files = [
      {
        fileName: 'test_file_1.py',
        fileStr: "from microbit import display\r\ndisplay.show('x')",
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
      },
    ];
    const largeFileHex =
      ':020000040003F7\n' +
      ':10C98000FE600E746573745F66696C655F322E704D\n' +
      ':10C990007923204C6F72656D20497073756D206925\n' +
      ':10C9A000732073696D706C792064756D6D79207476\n' +
      ':10C9B000657874206F6620746865207072696E7483\n' +
      ':10C9C000696E6720616E640D0A2320747970657347\n' +
      ':10C9D000657474696E6720696E6475737472792EFC\n' +
      ':10C9E000204C6F72656D20497073756D206861739E\n' +
      ':10C9F000206265656E2074686520696E6475732DAC\n' +
      ':10CA00002C74727927730D0A23207374616E64612C\n' +
      ':10CA100072642064756D6D79207465787420657614\n' +
      ':10CA200065722073696E63652074686520313530E6\n' +
      ':10CA300030732C207768656E20616E20756E6B6E8A\n' +
      ':10CA40006F776E0D0A23207072696E7465722074A0\n' +
      ':10CA50006F6F6B20612067616C6C6579206F662059\n' +
      ':10CA60007479706520616E6420736372616D626CAD\n' +
      ':10CA7000656420697420746F206D616B6520612E80\n' +
      ':10CA80002D0D0A2320747970652073706563696DBC\n' +
      ':10CA9000656E20626F6F6B2E204974206861732071\n' +
      ':10CAA0007375727669766564206E6F74206F6E6C34\n' +
      ':10CAB0007920666976650D0A232063656E74757248\n' +
      ':10CAC0006965732C2062757420616C736F207468C3\n' +
      ':10CAD00065206C65617020696E746F20656C65639C\n' +
      ':10CAE00074726F6E696320747970657365747469AC\n' +
      ':10CAF0006E672C0D0A232072656D61696E696E2F59\n' +
      ':10CB00002E6720657373656E7469616C6C7920752E\n' +
      ':10CB10006E6368616E6765642E2049742077617367\n' +
      ':10CB200020706F70756C61726973656420696E2026\n' +
      ':10CB30007468650D0A2320313936307320776974A3\n' +
      ':10CB400068207468652072656C65617365206F6626\n' +
      ':10CB5000204C6574726173657420736865657473C5\n' +
      ':10CB600020636F6E7461696E696E67204C6F7265C9\n' +
      ':10CB70006D0D0A2320497073756D207061737330D9\n' +
      ':10CB80002F616765732C20616E64206D6F72652064\n' +
      ':10CB9000726563656E746C7920776974682064656A\n' +
      ':10CBA000736B746F70207075626C697368696E67FF\n' +
      ':10CBB0000D0A2320736F667477617265206C696B50\n' +
      ':10CBC0006520416C64757320506167654D616B65CC\n' +
      ':10CBD0007220696E636C7564696E67207665727326\n' +
      ':10CBE000696F6E73206F66204C6F72656D0D0A233E\n' +
      ':10CBF00020497073756D2E0D0A23204C6F726531BC\n' +
      ':10CC0000306D20497073756D2069732073696D7084\n' +
      ':10CC10006C792064756D6D792074657874206F6609\n' +
      ':10CC200020746865207072696E74696E6720616E29\n' +
      ':10CC3000640D0A23207479706573657474696E6776\n' +
      ':10CC400020696E6475737472792E204C6F72656DF5\n' +
      ':10CC500020497073756D20686173206265656E2070\n' +
      ':10CC600074686520696E64757374727927730D0A30\n' +
      ':10CC700023207374616E646172642064756D6D321B\n' +
      ':10CC80003179207465787420657665722073696ED9\n' +
      ':10CC90006365207468652031353030732C207768E7\n' +
      ':10CCA000656E20616E20756E6B6E6F776E0D0A2358\n' +
      ':10CCB000207072696E74657220746F6F6B206120D2\n' +
      ':10CCC00067616C6C6579206F66207479706520618E\n' +
      ':10CCD0006E6420736372616D626C65642069742098\n' +
      ':10CCE000746F206D616B6520610D0A23207479706B\n' +
      ':10CCF000652073706563696D656E20626F6F6B335D\n' +
      ':10CD0000322E2049742068617320737572766976BB\n' +
      ':10CD10006564206E6F74206F6E6C7920666976652D\n' +
      ':10CD20000D0A232063656E7475726965732C206229\n' +
      ':10CD3000757420616C736F20746865206C65617018\n' +
      ':10CD400020696E746F20656C656374726F6E6963C1\n' +
      ':10CD5000207479706573657474696E672C0D0A238D\n' +
      ':10CD60002072656D61696E696E6720657373656EAB\n' +
      ':10CD70007469616C6C7920756E6368616E67653487\n' +
      ':10CD800033642E2049742077617320706F70756C46\n' +
      ':10CD900061726973656420696E207468650D0A2389\n' +
      ':10CDA00020313936307320776974682074686520C3\n' +
      ':10CDB00072656C65617365206F66204C6574726185\n' +
      ':10CDC0007365742073686565747320636F6E746136\n' +
      ':10CDD000696E696E67204C6F72656D0D0A2320497C\n' +
      ':10CDE0007073756D2070617373616765732C20615A\n' +
      ':10CDF0006E64206D6F726520726563656E746C354C\n' +
      ':10CE000034792077697468206465736B746F70205F\n' +
      ':10CE10007075626C697368696E670D0A2320736FA1\n' +
      ':10CE2000667477617265206C696B6520416C64750E\n' +
      ':10CE30007320506167654D616B657220696E636C2C\n' +
      ':10CE40007564696E672076657273696F6E73206FA3\n' +
      ':10CE500066204C6F72656D0D0A2320497073756DE5\n' +
      ':10CE60002EFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFA3\n' +
      ':00000001FF';
    const largeMap = MemoryMap.fromHex(largeFileHex);
    const largeData = largeMap.get(0x3c980);
    const shortFileHex =
      ':020000040003F7\n' +
      ':10C90000FE3F0E746573745F66696C655F312E70EF\n' +
      ':10C910007966726F6D206D6963726F6269742069E8\n' +
      ':10C920006D706F727420646973706C61790D0A6444\n' +
      ':10C930006973706C61792E73686F7728277827295F\n' +
      ':10C94000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFF7\n' +
      ':10C95000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFE7\n' +
      ':10C96000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFD7\n' +
      ':10C97000FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFC7\n' +
      ':00000001FF';
    const shortMap = MemoryMap.fromHex(shortFileHex);
    const shortData = shortMap.get(0x3c900);

    testResetFileSystem();
    let fwWithFsOther = addFileToIntelHex(
      uPyHexFile,
      files[0].fileName,
      strToBytes(files[0].fileStr)
    );
    fwWithFsOther = addFileToIntelHex(
      fwWithFsOther,
      files[1].fileName,
      strToBytes(files[1].fileStr)
    );
    // fs.writeFileSync('./ignore/output2.hex', fwWithFsOther);

    const opMap = MemoryMap.fromHex(fwWithFsOther);
    const opLargeData = opMap.slice(0x3a180, 1264).get(0x3a180);
    const opShortData = opMap.slice(0x3a100, 128).get(0x3a100);
    expect(opShortData).toEqual(shortData);
    expect(opLargeData).toEqual(largeData);
  });

  it('Empty file name throws an error.', () => {
    const failCase = () => {
      const hexWithFs = addFileToIntelHex(
        uPyHexFile,
        '',
        strToBytes('Some content.')
      );
    };
    expect(failCase).toThrow(Error);
  });

  it('Empty file data throw an error.', () => {
    const failCase = () => {
      const hexWithFs = addFileToIntelHex(
        uPyHexFile,
        'my_file.txt',
        new Uint8Array(0)
      );
    };
    expect(failCase).toThrow(Error);
  });

  it('Large file that does not fit throws error.', () => {
    const failCase = () => {
      const hexWithFs = addFileToIntelHex(
        uPyHexFile,
        'my_file.txt',
        new Uint8Array(50 * 1024).fill(0x55)
      );
    };
    expect(failCase).toThrow(Error);
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
        hexWithFs = addFileToIntelHex(
          hexWithFs,
          'file_' + i + '.txt',
          fakeBigFileData
        );
      }
    };
    const completeFsFilling = () => {
      // At a maximum of 4 Kbs left, it would fit 32 chunks max
      for (let i = 100; i < 132; i++) {
        hexWithFs = addFileToIntelHex(
          hexWithFs,
          'file_' + i + '.txt',
          fakeSingleChunkData
        );
      }
    };
    expect(addLargeFiles).toThrow(Error);
    expect(completeFsFilling).toThrow(Error);
  });

  it('Max filename works.', () => {
    const workingCase = () => {
      const maxLength = 120;
      const largeName = 'a'.repeat(maxLength);
      addFileToIntelHex(uPyHexFile, largeName, strToBytes('Some content.'));
    };
    expect(workingCase).not.toThrow(Error);
  });

  it('Too large filename throws error.', () => {
    const failCase = () => {
      const maxLength = 120;
      const largeName = 'a'.repeat(maxLength + 1);
      addFileToIntelHex(uPyHexFile, largeName, strToBytes('Some content.'));
    };
    expect(failCase).toThrow(Error);
  });

  // TODO: Hex file with persistent page marker doesn't get two markers
  // TODO: Hex file with injection string (:::...) still works
});

describe('Reading files from the filesystem.', () => {
  // All the files generated below have been created by transferring the files
  // to a micro:bit running MicroPython v1.0.1 using Mu.
  // Because the filesystem limits depend on the MicroPython version, these will
  // only work if combined with v1.0.1.

  const alastFilename = 'alast.py';
  const alastContent =
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
    "full_name = '{} {}'.format(afirst.firstname, lastname)\n";
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
  const afirstContent = "firstname = 'Carlos'";
  // Uses chunk ??
  const afirstHex =
    ':020000040003F7\n' +
    ':10DF0000FE1F096166697273742E70796669727397\n' +
    ':10DF1000746E616D65203D20274361726C6F7327BD\n' +
    ':00000001FF\n';

  const mainFilename = 'main.py';
  const mainContent =
    'from microbit import display, Image, sleep\n\n' +
    'from afirst import firstname\n' +
    'from alast import lastname, full_name\n\n' +
    "if full_name == 'Carlos Pereira':\n" +
    '    display.show(Image.HAPPY)\n' +
    'else:\n' +
    '    display.show(Image.SAD)\n' +
    'sleep(2000)\n' +
    "full = '{} {}'.format(firstname, lastname)\n" +
    'print(full)\n' +
    'display.scroll(full)\n';
  // Uses chunk 0xCA, 0xCB, 0xCC
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
    const fullUpyFsMemMap = MemoryMap.fromHex(uPyHexFile);
    const afirstMemMap = MemoryMap.fromHex(afirstHex);
    afirstMemMap.forEach((value: Uint8Array, index: number) => {
      fullUpyFsMemMap.set(index, value);
    });
    const alastMemMap = MemoryMap.fromHex(alastHex);
    alastMemMap.forEach((value: Uint8Array, index: number) => {
      fullUpyFsMemMap.set(index, value);
    });
    const mainMemMap = MemoryMap.fromHex(mainHex);
    mainMemMap.forEach((value: Uint8Array, index: number) => {
      fullUpyFsMemMap.set(index, value);
    });

    const result = getIntelHexFiles(fullUpyFsMemMap.asHexString());

    expect(result).toHaveProperty([afirstFilename], strToBytes(afirstContent));
    expect(result).toHaveProperty([alastFilename], strToBytes(alastContent));
    expect(result).toHaveProperty([mainFilename]), strToBytes(mainContent);
  });

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

    const result = getIntelHexFiles(fullUpyFsMemMap.asHexString());

    expect(result).toHaveProperty(
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

    const result = getIntelHexFiles(fullUpyFsMemMap.asHexString());

    expect(result).toHaveProperty(
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

    expect(failCase).toThrow(Error);
  });

  // TODO: Create tests with a file that has chunks in non-continuous order
  // TODO: Create test with chunks that point to each other in an infinite loop
  // TODO: Create test with chunks that point to each other in the Marker/Tail
});

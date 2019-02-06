import * as fs from 'fs';

import MemoryMap from 'nrf-intel-hex';

import { strToBytes } from '../common';
import { addFileToIntelHex, testResetFileSystem } from '../fs-builder';

describe('Filesystem Builder', () => {
  const uPyHexFile = fs.readFileSync('./src/__tests__/upy-v1.0.1.hex', 'utf8');

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

  it('Empty file throw an error.', () => {
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
    const failCase = () => {
      let hexWithFs = uPyHexFile;
      // Use 2 KB blocks per file (each chunk is 128 B)
      const fakeFileData = new Uint8Array(1900).fill(0x55);
      for (let i = 0; i < 15; i++) {
        hexWithFs = addFileToIntelHex(
          hexWithFs,
          'my_file_' + i + '.txt',
          fakeFileData
        );
      }
    };
    expect(failCase).toThrow(Error);
  });

  // TODO: Hex file with persistent page marker doesn't get two markers
  // TODO: Hex file with injection string (:::...) still works
});

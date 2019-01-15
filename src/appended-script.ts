/**
 * Module to add and remove Python scripts into and from a MicroPython hex.
 */
import MemoryMap from 'nrf-intel-hex';

const enum UserCodeBlock {
  /** User script located at specific flash address. */
  StartAdd = 0x3e000,
  Length = 8 * 1024,
  EndAdd = StartAdd + Length,

  /** User code header */
  HeaderStartByte0Index = 0,
  HeaderStartByte1Index = 1,
  HeaderCodeLenLsbIndex = 2,
  HeaderCodeLenMsbIndex = 3,
  HeaderLength = 4,

  /** Start of user script marked by "MP" + 2 bytes for the script length. */
  HeaderStartByte0 = 77, // 'M'
  HeaderStartByte1 = 80, // 'P'
}

/**
 * String placed inside the MicroPython hex string to indicate where to
 * paste the Python Code
 */
const HEX_INSERTION_POINT = ':::::::::::::::::::::::::::::::::::::::::::\n';

/**
 * Converts a string into a byte array of characters.
 * TODO: Update to encode to UTF-8 correctly.
 * @param str - String to convert to bytes.
 * @returns A byte array with the encoded data.
 */
function strToBytes(str: string): Uint8Array {
  const data: Uint8Array = new Uint8Array(str.length);
  for (let i: number = 0; i < str.length; i++) {
    // TODO: This will only keep the LSB from the UTF-16 code points
    data[i] = str.charCodeAt(i);
  }
  return data;
}

/**
 * Converts a byte array into a string of characters.
 * TODO: This currently only deals with single byte characters, so needs to
 *       be expanded to support UTF-8 characters longer than 1 byte.
 * @param byteArray - Array of bytes to convert.
 * @returns String output from the conversion.
 */
function bytesToStr(byteArray: Uint8Array): string {
  const result: string[] = [];
  byteArray.forEach((element) => result.push(String.fromCharCode(element)));
  return result.join('');
}

/**
 * Removes the old insertion line the input Intel Hex string contains it.
 * @param intelHex String with the intel hex lines.
 * @returns The Intel Hex string without insertion line.
 */
function cleanseOldHexFormat(intelHex: string): string {
  return intelHex.replace(HEX_INSERTION_POINT, '');
}

/**
 * Parses through an Intel Hex string to find the Python code at the
 * allocated address and extracts it.
 * @param intelHex - Intel Hex block to scan for the code.
 * @return Python code.
 */
function getScriptFromIntelHex(intelHex: string): string {
  let pyCode: string = '';
  const hexFileMemMap = MemoryMap.fromHex(intelHex);
  // Check that the known flash location has user code
  if (hexFileMemMap.has(UserCodeBlock.StartAdd)) {
    const pyCodeMemMap = hexFileMemMap.slice(
      UserCodeBlock.StartAdd,
      UserCodeBlock.Length
    );
    const codeBytes = pyCodeMemMap.get(UserCodeBlock.StartAdd);
    if (
      codeBytes[UserCodeBlock.HeaderStartByte0Index] ===
        UserCodeBlock.HeaderStartByte0 &&
      codeBytes[UserCodeBlock.HeaderStartByte1Index] ===
        UserCodeBlock.HeaderStartByte1
    ) {
      pyCode = bytesToStr(codeBytes.slice(UserCodeBlock.HeaderLength));
      // Clean null terminators at the end
      pyCode = pyCode.replace(/\0/g, '');
    }
  }
  return pyCode;
}

/**
 * When the user code is inserted into the flash known location it needs to be
 * packed with a header. This function outputs a byte array with a fully formed
 * User Code Block.
 * @param dataBytes Array of bytes to include in the User Code block.
 * @returns Byte array with the full User Code Block.
 */
function createUserCodeBlock(dataBytes: Uint8Array): Uint8Array {
  // The user script block has to start with "MP" marker + script length
  const blockBytes: Uint8Array = new Uint8Array(
    dataBytes.length + UserCodeBlock.HeaderLength
  );
  blockBytes[0] = UserCodeBlock.HeaderStartByte0;
  blockBytes[1] = UserCodeBlock.HeaderStartByte1;
  blockBytes[2] = dataBytes.length & 0xff;
  blockBytes[3] = (dataBytes.length >> 8) & 0xff;
  blockBytes.set(dataBytes, UserCodeBlock.HeaderLength);
  return blockBytes;
}

/**
 * Converts the Python code into the Intel Hex format expected by
 * MicroPython and injects it into a Intel Hex string containing a marker.
 * @param intelHex - Single string of Intel Hex records to inject the code.
 * @param pyStr - Python code string.
 * @returns Intel Hex string with the Python code injected.
 */
function appendScriptToIntelHex(intelHex: string, pyCode: string): string {
  const codeBytes: Uint8Array = strToBytes(pyCode);
  const blockBytes: Uint8Array = createUserCodeBlock(codeBytes);
  if (blockBytes.length > UserCodeBlock.Length) {
    throw new RangeError('Too long');
  }
  // Convert to Intel Hex format
  const intelHexClean = cleanseOldHexFormat(intelHex);
  const intelHexMap = MemoryMap.fromHex(intelHexClean);
  intelHexMap.set(UserCodeBlock.StartAdd, blockBytes);
  // Older versions of DAPLink need the file to end in a new line
  return intelHexMap.asHexString() + '\n';
}

export { appendScriptToIntelHex, getScriptFromIntelHex };

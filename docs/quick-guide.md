---
title: Quick guide
---

# Quick guide

## npm package

You can integrate this library in your project using the [npm package](https://www.npmjs.com/package/@microbit/microbit-fs):

```bash
$ npm install @microbit/microbit-fs
```

## MicroPython filesystem inside a hex file

### Initialise

Initialise a filesystem with a MicroPython Intel Hex string using {@link MicropythonFsHex | MicropythonFsHex class}.

```js
import { MicropythonFsHex } from "@microbit/microbit-fs";

// Create a new FileSystem instance passing the MicroPython Intel Hex string
let micropythonFs = new MicropythonFsHex(intelHexStr);
// There are some options available in the constructor
micropythonFs = new MicropythonFsHex(intelHexStr, { maxFsSize: 20 * 1024});
```
### Import files

Import files from a different MicroPython hex file with filesystem using {@link MicropythonFsHex.importFilesFromIntelHex | importFilesFromIntelHex}.
```
let addedFilenames = micropythonFs.importFilesFromIntelHex(uploadedHexWithUserFiles);
addedFilenames = micropythonFs.importFilesFromIntelHex(uploadedHexWithUserFiles, {overwrite: false, formatFirst: false});
```

### File operations

File operations are on the {@link MicropythonFsHex | MicropythonFsHex class}.
```
micropythonFs.create('filename.txt', 'Error thrown if file already exists.');
micropythonFs.write('filename.txt', 'Create or overwrite a file.');
micropythonFs.append('filename.txt', 'Add additional content.');
const fileContent = micropythonFs.read('filename.txt');
const fileContentByteArray = micropythonFs.readBytes('filename.txt');
if (micropythonFs.exists('filename.txt')) {
  micropythonFs.remove('filename.txt');
}
const fileSizeInBytes = micropythonFs.size('filename.txt');
const fileList = micropythonFs.ls();
```

### Filesystem size

{@link MicropythonFsHex} can query storage usage:

```
// Filesystem size information
const fsSize = micropythonFs.getStorageSize();
const fsAvailableSize = micropythonFs.getStorageUsed();
const fsUsedSize = micropythonFs.getStorageRemaining();

// You can also provide an artificial storage size
micropythonFs.setStorageSize(20 * 1024);

// Generate a new hex string or Uint8Array with MicroPython and the files
const intelHexStrWithFs = micropythonFs.getIntelHex();
const intelHexBytesWithFs = micropythonFs.getIntelHexBytes();
```

## Supporting V1 and V2 micro:bit versions with a Universal Hex

You can create a [Universal
Hex](https://github.com/microbit-foundation/spec-universal-hex) by passing a hex for each board version to the {@link MicropythonFsHex:constructor | MicropythonFsHex constructor}:

```js
import { MicropythonFsHex, microbitBoardId } from "@microbit/microbit-fs";

// Create a new FileSystem instance passing the MicroPython Intel Hex string
const micropythonFs = new MicropythonFsHex([
  { hex: uPy1HexFile, boardId: microbitBoardId.V1 },
  { hex: uPy2HexFile, boardId: microbitBoardId.V2 },
]);;

// Import files from a different MicroPython Intel hex file with filesystem
let addedFilenames = micropythonFs.importFilesFromIntelHex(uploadedHexWithUserFiles);
addedFilenames = micropythonFs.importFilesFromIntelHex(uploadedHexWithUserFiles, {overwrite: false, formatFirst: false});

// Generate a new Intel hex string or Uint8Array with MicroPython and the files
const uPy1IntelHexStrWithFs = micropythonFs.getIntelHex(microbitBoardId.V1);
const uPy1IntelHexBytesWithFs = micropythonFs.getIntelHexBytes(microbitBoardId.V1);
const uPy2IntelHexStrWithFs = micropythonFs.getIntelHex(microbitBoardId.V2);
const uPy2IntelHexBytesWithFs = micropythonFs.getIntelHexBytes(microbitBoardId.V2);

// Generate a new Universal hex string with all MicroPython+files data
const universalHexStrWithFs = micropythonFs.getUniversalHex();
```

## Append and extract Python code from known flash location

To add and remove the Python code use {@link addIntelHexAppendedScript}:

```js
import { isAppendedScriptPresent, getIntelHexAppendedScript, addIntelHexAppendedScript } from "@microbit/microbit-fs";

const finalHexStr = addIntelHexAppendedScript(originalIntelHexStr, 'print("hello world!")');
if (isAppendedScriptPresent(finalHexStr)) {
  const pythonCode = getIntelHexAppendedScript(finalHexStr);
}
```

## Read device memory information

To read device memory information use {@link getIntelHexDeviceMemInfo}:

```js
import {getIntelHexDeviceMemInfo} from "@microbit/microbit-fs";

const deviceMemInfoData = getIntelHexDeviceMemInfo(intelHexStr);
console.log('Flash Page Size:' + deviceMemInfoData.flashPageSize);
console.log('Flash Size:' + deviceMemInfoData.flashSize);
console.log('Flash Start Address:' + deviceMemInfoData.flashStartAddress);
console.log('Flash End Address:' + deviceMemInfoData.flashEndAddress);
console.log('Runtime Start Address:' + deviceMemInfoData.runtimeStartAddress);
console.log('Runtime End Address:' + deviceMemInfoData.runtimeEndAddress);
console.log('Filesystem Start Address:' + deviceMemInfoData.fsStartAddress);
console.log('Filesystem End Address:' + deviceMemInfoData.fsEndAddress);
console.log('MicroPython Version:' + deviceMemInfoData.uPyVersion);
console.log('Device Version: ' + deviceMemInfoData.deviceVersion);
```

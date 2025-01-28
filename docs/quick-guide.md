---
title: Quick guide
---

# Quick guide

## npm package

You can integrate this library in your project using the [npm package](https://www.npmjs.com/package/@microbit/microbit-fs):

```bash
$ npm add @microbit/microbit-fs
```

## MicroPython filesystem inside a hex file

### Initialise

Initialise a File System instance with a MicroPython Intel Hex string using {@link MicropythonFsHex | MicropythonFsHex class}.

```js
// Create a new FileSystem instance passing the MicroPython Intel Hex string
var micropythonFs = new microbitFs.MicropythonFsHex(IntelHexStr);
// There are some options available in the constructor
micropythonFs = new microbitFs.MicropythonFsHex(IntelHexStr, { maxFsSize: 20 * 1024});
```
### Import files 

Import files from a different MicroPython hex file with filesystem using {@link MicropythonFsHex.importFilesFromIntelHex | importFilesFromIntelHex}.
```
var addedFilenames = micropythonFs.importFilesFromIntelHex(UploadedHexWithUserFiles);
addedFilenames = micropythonFs.importFilesFromIntelHex(UploadedHexWithUserFiles, {overwrite: false, formatFirst: false});
```

### File operations

File operations are on the {@link MicropythonFsHex | MicropythonFsHex class}.
```
// File operations
micropythonFs.create('filename.txt', 'Error thrown if file already exists.');
micropythonFs.write('filename.txt', 'Create or overwrite a file.');
// Append not yet implemented
micropythonFs.append('filename.txt', 'Add additional content.');
var fileContent = micropythonFs.read('filename.txt');
var fileContentByteArray = micropythonFs.readBytes('filename.txt');
if (micropythonFs.exists('filename.txt')) {
  micropythonFs.remove('filename.txt');
}
var fileSizeInBytes = micropythonFs.size('filename.txt');
var fileList = micropythonFs.ls();
```

### Filesystem size

To get file size information use {@link MicropythonFsHex.getStorageSize | getStorageSize}, 
```
// Filesystem size information
var fsSize = micropythonFs.getStorageSize();
var fsAvailableSize = micropythonFs.getStorageUsed();
var fsUsedSize = micropythonFs.getStorageRemaining();

// You can also provide an artificial storage size
micropythonFs.setStorageSize(20 * 1024);

// Generate a new hex string or Uint8Array with MicroPython and the files
var intelHexStrWithFs = micropythonFs.getIntelHex();
var intelHexBytesWithFs = micropythonFs.getIntelHexBytes();
```

Using multiple MicroPython Intel Hex files to generate a Universal Hex:

```js
// Create a new FileSystem instance passing the MicroPython Intel Hex string
var micropythonFs = new microbitFs.MicropythonFsHex([
  { hex: uPy1HexFile, boardId: microbitFs.microbitBoardId.V1 },
  { hex: uPy2HexFile, boardId: microbitFs.microbitBoardId.V2 },
]);;

// Import files from a different MicroPython Intel hex file with filesystem
var addedFilenames = micropythonFs.importFilesFromIntelHex(UploadedHexWithUserFiles);
addedFilenames = micropythonFs.importFilesFromIntelHex(UploadedHexWithUserFiles, {overwrite: false, formatFirst: false});

// Generate a new Intel hex string or Uint8Array with MicroPython and the files
var uPy1IntelHexStrWithFs = micropythonFs.getIntelHex(microbitFs.microbitBoardId.V1);
var uPy1IntelHexBytesWithFs = micropythonFs.getIntelHexBytes(microbitFs.microbitBoardId.V1);
var uPy2IntelHexStrWithFs = micropythonFs.getIntelHex(microbitFs.microbitBoardId.V2);
var uPy2IntelHexBytesWithFs = micropythonFs.getIntelHexBytes(microbitFs.microbitBoardId.V2);

// Generate a new Universal hex string with all MicroPython+files data
var universalHexStrWithFs = micropythonFs.getUniversalHex();
```

## Append and extract Python code from known flash location
To add and remove the Python code using the old format:

```js
var finalHexStr = microbitFs.addIntelHexAppendedScript(originalIntelHexStr, 'print("hello world!")');
if (microbitFs.isAppendedScriptPresent(finalHexStr)) {
  var pythonCode = microbitFs.getIntelHexAppendedScript(finalHexStr);
}
```

## Read device memory info data

```js
var deviceMemInfoData = getIntelHexDeviceMemInfo(IntelHexStr);
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
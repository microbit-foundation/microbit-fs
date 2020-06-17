---
layout: default
title: Quick Guide
nav_order: 2
---

# Quick Guide

## ES5 UMD Bundle

### MicroPython Filesystem inside a hex file
Initialise a File System instance with a MicroPython Intel Hex string and start operating on files:

```js
// Create a new FileSystem instance passing the MicroPython Intel Hex string
var micropythonFs = new microbitFs.MicropythonFsHex(IntelHexStr);

// Import files from a different MicroPython hex file with filesystem
var addedFilenames = micropythonFs.importFilesFromIntelHex(UploadedHexWithUserFiles);
addedFilenames = micropythonFs.importFilesFromIntelHex(UploadedHexWithUserFiles, {overwrite: false, formatFirst: false});

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

Public interface can be found in the `src/fs-interface.ts` file.

### Append and extract Python code from known flash location
To add and remove the Python code using the old format:

```js
var finalHexStr = microbitFs.addIntelHexAppendedScript(originalIntelHexStr, 'print("hello world!")');
if (microbitFs.isAppendedScriptPresent(finalHexStr)) {
  var pythonCode = microbitFs.getIntelHexAppendedScript(finalHexStr);
}
```

### Read UICR data

```js
var uicrData = getIntelHexUicrData(IntelHexStr);
console.log('Flash Page Size:' + uicrData.flashPageSize);
console.log('Flash Size:' + uicrData.flashSize);
console.log('Runtime Start Page:' + uicrData.runtimeStartPage);
console.log('Runtime Start Address:' + uicrData.runtimeStartAddress);
console.log('Runtime End Used:' + uicrData.runtimeEndUsed);
console.log('Runtime End Address:' + uicrData.runtimeEndAddress);
console.log('Version Address:' + uicrData.versionAddress);
console.log('Version: ' + uicrData.version);
```

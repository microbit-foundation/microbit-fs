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
var micropythonFsWithFiles = = new microbitFs.MicropythonFsHex(UploadedHexWithUserFiles);

var addedFilenames = micropythonFs.importFilesFromIntelHex(UploadedHexWithUserFiles);

micropythonFs.create('filename.txt', 'Error thrown if file already exists.');
micropythonFs.write('filename.txt', 'Create or overwrites file.');
micropythonFs.append('filename.txt', 'Adds additional content.');
var content = micropythonFs.read('filename.txt');
if (micropythonFs.exists('filename.txt')) {
  micropythonFs.remove('filename.txt');
}
micropythonFs.ls();
var fileSizeInBytes = micropythonFs.size('filename.txt');

var intelHexWithFs = micropythonFs.getIntelHex();
```

Public interface can be found in the `src/fs-interface.ts` file.

### Append and extract Python code from known flash location
To add and remove the Python code using the old format:

```js
var finalHexStr = microbitFs.addIntelHexAppendedScript(originalIntelHexStr, 'print("hello world!")');
if (microbitFs.isAppendedScriptPresent(finalHexStr)) {
  var pythonCode = microbitFs.getIntelHexAppendedScript(finalHexStr)
}
```

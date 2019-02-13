---
layout: default
title: Quick Guide
nav_order: 2
---

# Quick Guide

## ES5 UMD Bundle

Initialise a File System instance with a MicroPython Intel Hex string and start operating on files:

```js
// Create a new FileSystem instance passing the MicroPython Intel Hex string
var microbitFs = new MicropythonFs.FileSystem(IntelHexStr);

microbitFs.create('filename.txt', 'Error thrown if file already exists.');
microbitFs.write('filename.txt', 'Create or overwrites file.');
microbitFs.append('filename.txt', 'Adds additional content.');
var content = microbitFs.read('filename.txt');
if (microbitFs.exists('filename.txt')) {
  microbitFs.remove('filename.txt');
}
microbitFs.ls();

var intelHexWithFs = microbitFs.getIntelHex();
```

Public interface can be found in the `src/fs-interface.ts` file.

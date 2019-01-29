# micro:bit MicroPython Filesystem

WIP

A TypeScript library to manipulate the micro:bit MicroPython filesystem within
a hex file.

## Usage

```js
// Create a new FileSystem instance passing the MicroPython Intel Hex string
var microbitFs = new MicropythonFs.FileSystem(IntelHexStr);

microbitFs.write('filename.txt', 'File content.');
microbitFs.append('filename.txt', 'Additional content.');
microbitFs.read('filename.txt');
if (microbitFs.exists('filename.txt')) {
  microbitFs.remove('filename.txt');
}
microbitFs.ls();

var intelHexWithFs = microbitFs.getIntelHex();
```

Public interface can be found in the `src/fs-interface.ts` file.

/**
 * (c) 2019 Micro:bit Educational Foundation and the microbit-fs contributors.
 * SPDX-License-Identifier: MIT
 */
import { bytesToStr, strToBytes } from '../common';

describe(`strToBytes`, () => {
  it(`works with 1 byte characters`, () => {
    const testString = 'test';
    const testCodes = [116, 101, 115, 116];

    const tester = strToBytes(testString).values();

    for (const code of testCodes) {
      expect(tester.next().value).toEqual(code);
    }
  });
  it(`works with 2 byte characters`, () => {
    const testString = 'Ση';
    const testCodes = [206, 163, 206, 183];

    const tester = strToBytes(testString).values();

    for (const code of testCodes) {
      expect(tester.next().value).toEqual(code);
    }
  });
  it(`works with 3 byte characters`, () => {
    const testString = '世';
    const testCodes = [228, 184, 150];

    const tester = strToBytes(testString).values();

    for (const code of testCodes) {
      expect(tester.next().value).toEqual(code);
    }
  });
});

describe(`bytesToStr`, () => {
  it(`works with 1 byte characters`, () => {
    const testCodes: Uint8Array = new Uint8Array([116, 101, 115, 116]);

    expect(bytesToStr(testCodes)).toEqual('test');
  });
  it(`works with 2 byte characters`, () => {
    const testCodes: Uint8Array = new Uint8Array([206, 163, 206, 183]);

    expect(bytesToStr(testCodes)).toEqual('Ση');
  });
  it(`works with 3 byte characters`, () => {
    const testCodes: Uint8Array = new Uint8Array([228, 184, 150]);

    expect(bytesToStr(testCodes)).toEqual('世');
  });
});

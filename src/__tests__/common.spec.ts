/**
 * (c) 2019 Micro:bit Educational Foundation and the microbit-fs contributors.
 * SPDX-License-Identifier: MIT
 */
import {
  bytesToStr,
  strToBytes,
  concatUint8Array,
  areUint8ArraysEqual,
} from '../common';

describe('strToBytes', () => {
  it('works with 1 byte characters', () => {
    const testString = 'test';
    const testCodes = [116, 101, 115, 116];

    const tester = strToBytes(testString).values();

    for (const code of testCodes) {
      expect(tester.next().value).toEqual(code);
    }
  });

  it('works with 2 byte characters', () => {
    const testString = 'Ση';
    const testCodes = [206, 163, 206, 183];

    const tester = strToBytes(testString).values();

    for (const code of testCodes) {
      expect(tester.next().value).toEqual(code);
    }
  });

  it('works with 3 byte characters', () => {
    const testString = '世';
    const testCodes = [228, 184, 150];

    const tester = strToBytes(testString).values();

    for (const code of testCodes) {
      expect(tester.next().value).toEqual(code);
    }
  });
});

describe('bytesToStr', () => {
  it('works with 1 byte characters', () => {
    const testCodes: Uint8Array = new Uint8Array([116, 101, 115, 116]);

    expect(bytesToStr(testCodes)).toEqual('test');
  });

  it('works with 2 byte characters', () => {
    const testCodes: Uint8Array = new Uint8Array([206, 163, 206, 183]);

    expect(bytesToStr(testCodes)).toEqual('Ση');
  });

  it('works with 3 byte characters', () => {
    const testCodes: Uint8Array = new Uint8Array([228, 184, 150]);

    expect(bytesToStr(testCodes)).toEqual('世');
  });
});

describe('concatUint8Array', () => {
  it('concatenates correctly', () => {
    const firstArray = [116, 101, 115, 116];
    const secondArray = [234, 56, 45, 98];
    const first: Uint8Array = new Uint8Array(firstArray);
    const second: Uint8Array = new Uint8Array(secondArray);

    const result1 = concatUint8Array(first, first);
    const result2 = concatUint8Array(second, second);
    const result3 = concatUint8Array(first, second);

    expect(result1).toEqual(new Uint8Array(firstArray.concat(firstArray)));
    expect(result2).toEqual(new Uint8Array(secondArray.concat(secondArray)));
    expect(result3).toEqual(new Uint8Array(firstArray.concat(secondArray)));
  });

  it('concatenates correctly empty arrays', () => {
    const first: Uint8Array = new Uint8Array([]);
    const second: Uint8Array = new Uint8Array([]);

    const result = concatUint8Array(first, second);

    expect(result).toEqual(new Uint8Array([]));
  });

  it('concatenates arrays of different length', () => {
    const firstArray = [116, 101, 115, 116];
    const secondArray = [234, 56, 45, 98, 0];
    const first: Uint8Array = new Uint8Array(firstArray);
    const second: Uint8Array = new Uint8Array(secondArray);

    const result1 = concatUint8Array(first, second);
    const result2 = concatUint8Array(second, first);

    expect(result1).toEqual(new Uint8Array(firstArray.concat(secondArray)));
    expect(result2).toEqual(new Uint8Array(secondArray.concat(firstArray)));
  });
});

describe('areUint8ArraysEqual', () => {
  it('compares correctly equal arrays', () => {
    const first: Uint8Array = new Uint8Array([116, 101, 115, 116]);
    const second: Uint8Array = new Uint8Array([116, 101, 115, 116]);

    const result1 = areUint8ArraysEqual(first, first);
    const result2 = areUint8ArraysEqual(second, second);
    const result3 = areUint8ArraysEqual(first, second);

    expect(result1).toBeTruthy();
    expect(result2).toBeTruthy();
    expect(result3).toBeTruthy();
  });

  it('compares correctly empty arrays', () => {
    const first: Uint8Array = new Uint8Array([]);
    const second: Uint8Array = new Uint8Array([]);

    const result = areUint8ArraysEqual(first, second);

    expect(result).toBeTruthy();
  });

  it('compares arrays of different length', () => {
    const first: Uint8Array = new Uint8Array([5, 12, 46]);
    const second: Uint8Array = new Uint8Array([5, 12, 46, 0]);

    const result1 = areUint8ArraysEqual(first, second);
    const result2 = areUint8ArraysEqual(second, first);

    expect(result1).toBeFalsy();
    expect(result2).toBeFalsy();
  });
});

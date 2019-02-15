import { strToBytes } from '../common';

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
    const testCodes = [203, 163, 206, 183];
    // Notable fail case: Becomes 0xA3 / £ / 163

    const tester = strToBytes(testString).values();

    for (const code of testCodes) {
      expect(tester.next().value).toEqual(code);
    }
  });
});

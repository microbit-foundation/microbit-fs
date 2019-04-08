import { bytesToStr, strToBytes } from '../common';
describe("strToBytes", function () {
    it("works with 1 byte characters", function () {
        var testString = 'test';
        var testCodes = [116, 101, 115, 116];
        var tester = strToBytes(testString).values();
        for (var _i = 0, testCodes_1 = testCodes; _i < testCodes_1.length; _i++) {
            var code = testCodes_1[_i];
            expect(tester.next().value).toEqual(code);
        }
    });
    it("works with 2 byte characters", function () {
        var testString = 'Ση';
        var testCodes = [206, 163, 206, 183];
        var tester = strToBytes(testString).values();
        for (var _i = 0, testCodes_2 = testCodes; _i < testCodes_2.length; _i++) {
            var code = testCodes_2[_i];
            expect(tester.next().value).toEqual(code);
        }
    });
    it("works with 3 byte characters", function () {
        var testString = '世';
        var testCodes = [228, 184, 150];
        var tester = strToBytes(testString).values();
        for (var _i = 0, testCodes_3 = testCodes; _i < testCodes_3.length; _i++) {
            var code = testCodes_3[_i];
            expect(tester.next().value).toEqual(code);
        }
    });
});
describe("bytesToStr", function () {
    it("works with 1 byte characters", function () {
        var testCodes = new Uint8Array([116, 101, 115, 116]);
        expect(bytesToStr(testCodes)).toEqual('test');
    });
    it("works with 2 byte characters", function () {
        var testCodes = new Uint8Array([206, 163, 206, 183]);
        expect(bytesToStr(testCodes)).toEqual('Ση');
    });
    it("works with 3 byte characters", function () {
        var testCodes = new Uint8Array([228, 184, 150]);
        expect(bytesToStr(testCodes)).toEqual('世');
    });
});
//# sourceMappingURL=common.spec.js.map
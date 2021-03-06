"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var io_utils_1 = require("./io_utils");
describe('toBuffer', function () {
    it('Simple case', function () {
        var ab = new Uint8Array([3, 2, 1]).buffer;
        var buffer = io_utils_1.toBuffer(ab);
        expect(new Uint8Array(buffer)).toEqual(new Uint8Array([3, 2, 1]));
    });
});
describe('toArrayBuffer', function () {
    it('Single Buffer', function () {
        var buf = new Buffer([10, 20, 30]);
        var ab = io_utils_1.toArrayBuffer(buf);
        expect(new Uint8Array(ab)).toEqual(new Uint8Array([10, 20, 30]));
    });
    it('Two Buffers', function () {
        var buf1 = new Buffer([10, 20, 30]);
        var buf2 = new Buffer([40, 50, 60]);
        var ab = io_utils_1.toArrayBuffer([buf1, buf2]);
        expect(new Uint8Array(ab)).toEqual(new Uint8Array([
            10, 20, 30, 40, 50, 60
        ]));
    });
    it('Three Buffers', function () {
        var buf1 = new Buffer([10, 20, 30]);
        var buf2 = new Buffer([40, 50, 60]);
        var buf3 = new Buffer([3, 2, 1]);
        var ab = io_utils_1.toArrayBuffer([buf1, buf2, buf3]);
        expect(new Uint8Array(ab)).toEqual(new Uint8Array([
            10, 20, 30, 40, 50, 60, 3, 2, 1
        ]));
    });
    it('Zero buffers', function () {
        var ab = io_utils_1.toArrayBuffer([]);
        expect(new Uint8Array(ab)).toEqual(new Uint8Array([]));
    });
});
//# sourceMappingURL=io_utils_test.js.map
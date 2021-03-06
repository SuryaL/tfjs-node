"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tf = require("@tensorflow/tfjs-core");
var MockContext = (function () {
    function MockContext() {
    }
    MockContext.prototype.getImageData = function (x, y, width, height) {
        var data = new Uint8ClampedArray(width * height * 4);
        for (var i = 0; i < data.length; ++i) {
            data[i] = i + 1;
        }
        return { data: data };
    };
    return MockContext;
}());
var MockCanvas = (function () {
    function MockCanvas(width, height) {
        this.width = width;
        this.height = height;
    }
    MockCanvas.prototype.getContext = function (type) {
        return new MockContext();
    };
    return MockCanvas;
}());
describe('tf.fromPixels', function () {
    it('accepts a canvas-like element', function () {
        var c = new MockCanvas(2, 2);
        var t = tf.fromPixels(c);
        expect(t.dtype).toBe('int32');
        expect(t.shape).toEqual([2, 2, 3]);
        tf.test_util.expectArraysEqual(t, [1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15]);
    });
    it('accepts a canvas-like element, numChannels=4', function () {
        var c = new MockCanvas(2, 2);
        var t = tf.fromPixels(c, 4);
        expect(t.dtype).toBe('int32');
        expect(t.shape).toEqual([2, 2, 4]);
        tf.test_util.expectArraysEqual(t, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    });
    it('errors when passed a non-canvas object', function () {
        var c = 5;
        expect(function () { return tf.fromPixels(c); })
            .toThrowError(/When running in node, pixels must be an HTMLCanvasElement/);
    });
});
//# sourceMappingURL=canvas_test.js.map
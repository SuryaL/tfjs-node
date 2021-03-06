"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tf = require("@tensorflow/tfjs-core");
var test_util_1 = require("@tensorflow/tfjs-core/dist/test_util");
describe('delayed upload', function () {
    it('should handle data before op execution', function () {
        var t = tf.tensor1d([1, 2, 3]);
        test_util_1.expectArraysClose(t, [1, 2, 3]);
        var r = t.add(tf.tensor1d([4, 5, 6]));
        test_util_1.expectArraysClose(r, [5, 7, 9]);
    });
    it('Should not cache tensors in the tensor map for device support. ', function () {
        var logits = tf.tensor1d([1, 2, 3]);
        var softmaxLogits = tf.softmax(logits);
        var data = softmaxLogits.dataSync();
        expect(softmaxLogits.get(0)).toEqual(data[0]);
        expect(softmaxLogits.get(1)).toEqual(data[1]);
        expect(softmaxLogits.get(2)).toEqual(data[2]);
    });
});
//# sourceMappingURL=nodejs_kernel_backend_test.js.map
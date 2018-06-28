"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./index");
var jasmine_util = require("@tensorflow/tfjs-core/dist/jasmine_util");
Error.stackTraceLimit = Infinity;
var jasmineCtor = require('jasmine');
var bindings = require("bindings");
var nodejs_kernel_backend_1 = require("./nodejs_kernel_backend");
jasmine_util.setTestBackends([{
        name: 'test-tensorflow',
        factory: function () {
            return new nodejs_kernel_backend_1.NodeJSKernelBackend(bindings('tfjs_binding.node'));
        },
        priority: 100
    }]);
var IGNORE_LIST = [
    'depthwiseConv2D',
    'separableConv2d',
    'IORouterRegistry',
    'unsortedSegmentSum', 'gather {} gradient',
    'arrayBufferToBase64String', 'stringByteLength'
];
var runner = new jasmineCtor();
runner.loadConfig({
    spec_files: [
        'src/**/*_test.ts', 'node_modules/@tensorflow/tfjs-core/dist/**/*_test.js'
    ]
});
var env = jasmine.getEnv();
env.specFilter = function (spec) {
    for (var i = 0; i < IGNORE_LIST.length; ++i) {
        if (spec.getFullName().startsWith(IGNORE_LIST[i])) {
            return false;
        }
    }
    return true;
};
runner.execute();
//# sourceMappingURL=run_tests.js.map
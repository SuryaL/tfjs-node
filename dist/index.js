"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tfc = require("@tensorflow/tfjs-core");
var file_system_1 = require("./io/file_system");
var nodejs_kernel_backend_1 = require("./nodejs_kernel_backend");
var bindings = require("bindings");
tfc.ENV.registerBackend('tensorflow', function () {
    return new nodejs_kernel_backend_1.NodeJSKernelBackend(bindings('tfjs_binding.node'));
});
if (tfc.ENV.findBackend('tensorflow') != null) {
    tfc.setBackend('tensorflow');
}
tfc.io.registerSaveRouter(file_system_1.nodeFileSystemRouter);
tfc.io.registerLoadRouter(file_system_1.nodeFileSystemRouter);
var version_1 = require("./version");
exports.version = version_1.version;
//# sourceMappingURL=index.js.map
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var tfc = require("@tensorflow/tfjs-core");
var test_util_1 = require("@tensorflow/tfjs-core/dist/test_util");
var fs = require("fs");
var path = require("path");
var rimraf = require("rimraf");
var util_1 = require("util");
var io_utils_1 = require("./io_utils");
describe('File system IOHandler', function () {
    var mkdtemp = util_1.promisify(fs.mkdtemp);
    var readFile = util_1.promisify(fs.readFile);
    var writeFile = util_1.promisify(fs.writeFile);
    var rimrafPromise = util_1.promisify(rimraf);
    var modelTopology1 = {
        'class_name': 'Sequential',
        'keras_version': '2.1.6',
        'config': [{
                'class_name': 'Dense',
                'config': {
                    'kernel_initializer': {
                        'class_name': 'VarianceScaling',
                        'config': {
                            'distribution': 'uniform',
                            'scale': 1.0,
                            'seed': null,
                            'mode': 'fan_avg'
                        }
                    },
                    'name': 'dense',
                    'kernel_constraint': null,
                    'bias_regularizer': null,
                    'bias_constraint': null,
                    'dtype': 'float32',
                    'activation': 'linear',
                    'trainable': true,
                    'kernel_regularizer': null,
                    'bias_initializer': { 'class_name': 'Zeros', 'config': {} },
                    'units': 1,
                    'batch_input_shape': [null, 3],
                    'use_bias': true,
                    'activity_regularizer': null
                }
            }],
        'backend': 'tensorflow'
    };
    var weightSpecs1 = [
        {
            name: 'dense/kernel',
            shape: [3, 1],
            dtype: 'float32',
        },
        {
            name: 'dense/bias',
            shape: [1],
            dtype: 'float32',
        }
    ];
    var weightData1 = new ArrayBuffer(16);
    var testDir;
    beforeEach(function (done) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, mkdtemp('tfjs_node_fs_test')];
                case 1:
                    testDir = _a.sent();
                    done();
                    return [2];
            }
        });
    }); });
    afterEach(function (done) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, rimrafPromise(testDir)];
                case 1:
                    _a.sent();
                    done();
                    return [2];
            }
        });
    }); });
    it('save succeeds with newly created directory', function (done) { return __awaiter(_this, void 0, void 0, function () {
        var _this = this;
        var t0, handler;
        return __generator(this, function (_a) {
            t0 = new Date();
            testDir = path.join(testDir, 'save-destination');
            handler = tfc.io.getSaveHandlers("file://" + testDir)[0];
            handler
                .save({
                modelTopology: modelTopology1,
                weightSpecs: weightSpecs1,
                weightData: weightData1,
            })
                .then(function (saveResult) { return __awaiter(_this, void 0, void 0, function () {
                var modelJSONPath, weightsBinPath, modelJSON, _a, _b, weightData, _c;
                return __generator(this, function (_d) {
                    switch (_d.label) {
                        case 0:
                            expect(saveResult.modelArtifactsInfo.dateSaved.getTime())
                                .toBeGreaterThanOrEqual(t0.getTime());
                            expect(saveResult.modelArtifactsInfo.modelTopologyType)
                                .toEqual('JSON');
                            modelJSONPath = path.join(testDir, 'model.json');
                            weightsBinPath = path.join(testDir, 'weights.bin');
                            _b = (_a = JSON).parse;
                            return [4, readFile(modelJSONPath, 'utf8')];
                        case 1:
                            modelJSON = _b.apply(_a, [_d.sent()]);
                            expect(modelJSON.modelTopology).toEqual(modelTopology1);
                            expect(modelJSON.weightsManifest.length).toEqual(1);
                            expect(modelJSON.weightsManifest[0].paths).toEqual(['weights.bin']);
                            expect(modelJSON.weightsManifest[0].weights).toEqual(weightSpecs1);
                            _c = Uint8Array.bind;
                            return [4, readFile(weightsBinPath)];
                        case 2:
                            weightData = new (_c.apply(Uint8Array, [void 0, _d.sent()]))();
                            expect(weightData.length).toEqual(16);
                            weightData.forEach(function (value) { return expect(value).toEqual(0); });
                            done();
                            return [2];
                    }
                });
            }); })
                .catch(function (err) { return done.fail(err.stack); });
            return [2];
        });
    }); });
    it('save fails if path exists as a file', function (done) { return __awaiter(_this, void 0, void 0, function () {
        var handler;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    testDir = path.join(testDir, 'save-destination');
                    return [4, writeFile(testDir, 'foo')];
                case 1:
                    _a.sent();
                    handler = tfc.io.getSaveHandlers("file://" + testDir)[0];
                    handler
                        .save({
                        modelTopology: modelTopology1,
                        weightSpecs: weightSpecs1,
                        weightData: weightData1,
                    })
                        .then(function (saveResult) {
                        done.fail('Saving to path of existing file succeeded unexpectedly.');
                    })
                        .catch(function (err) {
                        expect(err.message).toMatch(/.*exists as a file.*directory.*/);
                        done();
                    });
                    return [2];
            }
        });
    }); });
    it('save-load round trip: one weight file', function (done) {
        var handler1 = tfc.io.getSaveHandlers("file://" + testDir)[0];
        handler1
            .save({
            modelTopology: modelTopology1,
            weightSpecs: weightSpecs1,
            weightData: weightData1,
        })
            .then(function (saveResult) {
            var modelJSONPath = path.join(testDir, 'model.json');
            var handler2 = tfc.io.getLoadHandlers("file://" + modelJSONPath)[0];
            handler2.load()
                .then(function (modelArtifacts) {
                expect(modelArtifacts.modelTopology).toEqual(modelTopology1);
                expect(modelArtifacts.weightSpecs).toEqual(weightSpecs1);
                expect(new Float32Array(modelArtifacts.weightData))
                    .toEqual(new Float32Array([0, 0, 0, 0]));
                done();
            })
                .catch(function (err) { return done.fail(err.stack); });
        })
            .catch(function (err) { return done.fail(err.stack); });
    });
    it('load: two weight files', function (done) { return __awaiter(_this, void 0, void 0, function () {
        var weightsManifest, modelJSON, modelJSONPath, weightsData1, weightsData2, handler;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    weightsManifest = [
                        {
                            paths: ['weights.1.bin'],
                            weights: [{
                                    name: 'dense/kernel',
                                    shape: [3, 1],
                                    dtype: 'float32',
                                }],
                        },
                        {
                            paths: ['weights.2.bin'],
                            weights: [{
                                    name: 'dense/bias',
                                    shape: [1],
                                    dtype: 'float32',
                                }]
                        }
                    ];
                    modelJSON = {
                        modelTopology: modelTopology1,
                        weightsManifest: weightsManifest,
                    };
                    modelJSONPath = path.join(testDir, 'model.json');
                    return [4, writeFile(modelJSONPath, JSON.stringify(modelJSON), 'utf8')];
                case 1:
                    _a.sent();
                    weightsData1 = Buffer.from(new Float32Array([-1.1, -3.3, -3.3]).buffer);
                    return [4, writeFile(path.join(testDir, 'weights.1.bin'), weightsData1, 'binary')];
                case 2:
                    _a.sent();
                    weightsData2 = io_utils_1.toBuffer(new Float32Array([-7.7]).buffer);
                    return [4, writeFile(path.join(testDir, 'weights.2.bin'), weightsData2, 'binary')];
                case 3:
                    _a.sent();
                    handler = tfc.io.getLoadHandlers("file://" + modelJSONPath)[0];
                    handler.load()
                        .then(function (modelArtifacts) {
                        expect(modelArtifacts.modelTopology).toEqual(modelTopology1);
                        expect(modelArtifacts.weightSpecs).toEqual([
                            {
                                name: 'dense/kernel',
                                shape: [3, 1],
                                dtype: 'float32',
                            },
                            {
                                name: 'dense/bias',
                                shape: [1],
                                dtype: 'float32',
                            }
                        ]);
                        test_util_1.expectArraysClose(new Float32Array(modelArtifacts.weightData), new Float32Array([-1.1, -3.3, -3.3, -7.7]));
                        done();
                    })
                        .catch(function (err) { return done.fail(err.stack); });
                    return [2];
            }
        });
    }); });
    it('loading from nonexistent model.json path fails', function (done) {
        var handler = tfc.io.getLoadHandlers("file://" + testDir + "/foo/model.json")[0];
        handler.load()
            .then(function (getModelArtifactsInfoForJSON) {
            done.fail('Loading from nonexisting model.json path succeeded ' +
                'unexpectedly.');
        })
            .catch(function (err) {
            expect(err.message)
                .toMatch(/model\.json.*does not exist.*loading failed/);
            done();
        });
    });
    it('loading from missing weights path fails', function (done) { return __awaiter(_this, void 0, void 0, function () {
        var weightsManifest, modelJSON, modelJSONPath, weightsData1, handler;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    weightsManifest = [
                        {
                            paths: ['weights.1.bin'],
                            weights: [{
                                    name: 'dense/kernel',
                                    shape: [3, 1],
                                    dtype: 'float32',
                                }],
                        },
                        {
                            paths: ['weights.2.bin'],
                            weights: [{
                                    name: 'dense/bias',
                                    shape: [1],
                                    dtype: 'float32',
                                }]
                        }
                    ];
                    modelJSON = {
                        modelTopology: modelTopology1,
                        weightsManifest: weightsManifest,
                    };
                    modelJSONPath = path.join(testDir, 'model.json');
                    return [4, writeFile(modelJSONPath, JSON.stringify(modelJSON), 'utf8')];
                case 1:
                    _a.sent();
                    weightsData1 = Buffer.from(new Float32Array([-1.1, -3.3, -3.3]).buffer);
                    return [4, writeFile(path.join(testDir, 'weights.1.bin'), weightsData1, 'binary')];
                case 2:
                    _a.sent();
                    handler = tfc.io.getLoadHandlers("file://" + modelJSONPath)[0];
                    handler.load()
                        .then(function (modelArtifacts) {
                        done.fail('Loading with missing weights file succeeded ' +
                            'unexpectedly.');
                    })
                        .catch(function (err) {
                        expect(err.message)
                            .toMatch(/Weight file .*weights\.2\.bin does not exist/);
                        done();
                    });
                    return [2];
            }
        });
    }); });
});
//# sourceMappingURL=file_system_test.js.map
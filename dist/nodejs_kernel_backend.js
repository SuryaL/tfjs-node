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
Object.defineProperty(exports, "__esModule", { value: true });
var tfjs_core_1 = require("@tensorflow/tfjs-core");
var types_1 = require("@tensorflow/tfjs-core/dist/types");
var NodeJSKernelBackend = (function () {
    function NodeJSKernelBackend(binding) {
        this.tensorMap = new WeakMap();
        this.binding = binding;
    }
    NodeJSKernelBackend.prototype.getTFDType = function (dataType) {
        switch (dataType) {
            case 'float32':
                return this.binding.TF_FLOAT;
            case 'int32':
                return this.binding.TF_INT32;
            case 'bool':
                return this.binding.TF_BOOL;
            default:
                throw new Error('Unknown dtype `${dtype}`');
        }
    };
    NodeJSKernelBackend.prototype.createOutputTensor = function (metadata) {
        var newId = {};
        this.tensorMap.set(newId, {
            shape: metadata.shape,
            dtype: metadata.dtype,
            id: metadata.id,
            values: null
        });
        var dtype;
        switch (metadata.dtype) {
            case this.binding.TF_FLOAT:
                dtype = 'float32';
                break;
            case this.binding.TF_INT32:
                dtype = 'int32';
                break;
            case this.binding.TF_BOOL:
                dtype = 'bool';
                break;
            default:
                throw new Error("Unknown dtype enum " + metadata.dtype);
        }
        return tfjs_core_1.Tensor.make(metadata.shape, { dataId: newId }, dtype);
    };
    NodeJSKernelBackend.prototype.getInputTensorIds = function (tensors) {
        var ids = [];
        for (var i = 0; i < tensors.length; i++) {
            var info = this.tensorMap.get(tensors[i].dataId);
            if (info.values != null) {
                info.id =
                    this.binding.createTensor(info.shape, info.dtype, info.values);
                info.values = null;
                this.tensorMap.set(tensors[i].dataId, info);
            }
            ids.push(info.id);
        }
        return ids;
    };
    NodeJSKernelBackend.prototype.createReductionOpAttrs = function (tensor) {
        return [
            { name: 'keep_dims', type: this.binding.TF_ATTR_BOOL, value: false },
            this.createTypeOpAttr('T', tensor.dtype),
            this.createTypeOpAttr('Tidx', 'int32')
        ];
    };
    NodeJSKernelBackend.prototype.createTypeOpAttr = function (attrName, dtype) {
        return {
            name: attrName,
            type: this.binding.TF_ATTR_TYPE,
            value: this.getTFDType(dtype)
        };
    };
    NodeJSKernelBackend.prototype.executeSingleInput = function (name, input) {
        var opAttrs = [this.createTypeOpAttr('T', input.dtype)];
        return this.executeSingleOutput(name, opAttrs, [input]);
    };
    NodeJSKernelBackend.prototype.executeSingleOutput = function (name, opAttrs, inputs) {
        var outputMetadata = this.binding.executeOp(name, opAttrs, this.getInputTensorIds(inputs), 1);
        return this.createOutputTensor(outputMetadata[0]);
    };
    NodeJSKernelBackend.prototype.executeMultipleOutputs = function (name, opAttrs, inputs, numOutputs) {
        var _this = this;
        var outputMetadata = this.binding.executeOp(name, opAttrs, this.getInputTensorIds(inputs), numOutputs);
        return outputMetadata.map(function (m) { return _this.createOutputTensor(m); });
    };
    NodeJSKernelBackend.prototype.dispose = function () { };
    NodeJSKernelBackend.prototype.read = function (dataId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2, this.readSync(dataId)];
            });
        });
    };
    NodeJSKernelBackend.prototype.readSync = function (dataId) {
        if (!this.tensorMap.has(dataId)) {
            throw new Error("Tensor " + dataId + " was not registered!");
        }
        var info = this.tensorMap.get(dataId);
        if (info.values != null) {
            return info.values;
        }
        else {
            return this.binding.tensorDataSync(info.id);
        }
    };
    NodeJSKernelBackend.prototype.disposeData = function (dataId) {
        var id = this.tensorMap.get(dataId).id;
        if (id != null && id >= 0) {
            this.binding.deleteTensor(id);
        }
        this.tensorMap.delete(dataId);
    };
    NodeJSKernelBackend.prototype.write = function (dataId, values) {
        if (!this.tensorMap.has(dataId)) {
            throw new Error("Tensor " + dataId + " was not registered!");
        }
        var info = this.tensorMap.get(dataId);
        info.values = values;
        this.tensorMap.set(dataId, info);
    };
    NodeJSKernelBackend.prototype.register = function (dataId, shape, dtype) {
        if (!this.tensorMap.has(dataId)) {
            this.tensorMap.set(dataId, { shape: shape, dtype: this.getTFDType(dtype), values: null, id: -1 });
        }
    };
    NodeJSKernelBackend.prototype.matMul = function (a, b, transposeA, transposeB) {
        var opAttrs = [
            { name: 'transpose_a', type: this.binding.TF_ATTR_BOOL, value: transposeA },
            { name: 'transpose_b', type: this.binding.TF_ATTR_BOOL, value: transposeB },
            this.createTypeOpAttr('T', types_1.upcastType(a.dtype, b.dtype))
        ];
        return this.executeSingleOutput('MatMul', opAttrs, [a, b]);
    };
    NodeJSKernelBackend.prototype.stridedSlice = function (x, begin, end, strides, beginMask, endMask) {
        var beginTensor = tfjs_core_1.tensor1d(begin, 'int32');
        var endTensor = tfjs_core_1.tensor1d(end, 'int32');
        var stridesTensor = tfjs_core_1.tensor1d(strides, 'int32');
        var opAttrs = [
            this.createTypeOpAttr('T', x.dtype),
            this.createTypeOpAttr('Index', 'int32'),
            { name: 'begin_mask', type: this.binding.TF_ATTR_INT, value: beginMask },
            { name: 'end_mask', type: this.binding.TF_ATTR_INT, value: endMask },
            { name: 'ellipsis_mask', type: this.binding.TF_ATTR_INT, value: 0 },
            { name: 'new_axis_mask', type: this.binding.TF_ATTR_INT, value: 0 },
            { name: 'shrink_axis_mask', type: this.binding.TF_ATTR_INT, value: 0 }
        ];
        return this.executeSingleOutput('StridedSlice', opAttrs, [x, beginTensor, endTensor, stridesTensor]);
    };
    NodeJSKernelBackend.prototype.slice = function (x, begin, size) {
        var opAttrs = [
            this.createTypeOpAttr('T', x.dtype),
            this.createTypeOpAttr('Index', 'int32')
        ];
        var beginTensor = tfjs_core_1.tensor1d(begin, 'int32');
        var sizeTensor = tfjs_core_1.tensor1d(size, 'int32');
        return this.executeSingleOutput('Slice', opAttrs, [x, beginTensor, sizeTensor]);
    };
    NodeJSKernelBackend.prototype.reverse = function (a, axis) {
        var opAttrs = [
            this.createTypeOpAttr('Tidx', 'int32'),
            this.createTypeOpAttr('T', a.dtype)
        ];
        var axisTensor = tfjs_core_1.tensor1d(axis, 'int32');
        return this.executeSingleOutput('ReverseV2', opAttrs, [a, axisTensor]);
    };
    NodeJSKernelBackend.prototype.concat = function (a, b) {
        var opAttrs = [
            { name: 'N', type: this.binding.TF_ATTR_INT, value: 2 },
            this.createTypeOpAttr('Tidx', 'int32'),
            this.createTypeOpAttr('T', a.dtype)
        ];
        var axisTensor = tfjs_core_1.scalar(1, 'int32');
        return this.executeSingleOutput('ConcatV2', opAttrs, [a, b, axisTensor]);
    };
    NodeJSKernelBackend.prototype.neg = function (a) {
        return this.executeSingleInput('Neg', a);
    };
    NodeJSKernelBackend.prototype.add = function (a, b) {
        var opAttrs = [this.createTypeOpAttr('T', types_1.upcastType(a.dtype, b.dtype))];
        return this.executeSingleOutput('Add', opAttrs, [a, b]);
    };
    NodeJSKernelBackend.prototype.subtract = function (a, b) {
        var opAttrs = [this.createTypeOpAttr('T', types_1.upcastType(a.dtype, b.dtype))];
        return this.executeSingleOutput('Sub', opAttrs, [a, b]);
    };
    NodeJSKernelBackend.prototype.multiply = function (a, b) {
        var opAttrs = [this.createTypeOpAttr('T', types_1.upcastType(a.dtype, b.dtype))];
        return this.executeSingleOutput('Mul', opAttrs, [a, b]);
    };
    NodeJSKernelBackend.prototype.realDivide = function (a, b) {
        var opAttrs = [this.createTypeOpAttr('T', types_1.upcastType(a.dtype, b.dtype))];
        return this.executeSingleOutput('RealDiv', opAttrs, [a, b]);
    };
    NodeJSKernelBackend.prototype.floorDiv = function (a, b) {
        var opAttrs = [this.createTypeOpAttr('T', types_1.upcastType(a.dtype, b.dtype))];
        return this.executeSingleOutput('FloorDiv', opAttrs, [a, b]);
    };
    NodeJSKernelBackend.prototype.divide = function (a, b) {
        var opAttrs = [this.createTypeOpAttr('T', types_1.upcastType(a.dtype, b.dtype))];
        return this.executeSingleOutput('Div', opAttrs, [a, b]);
    };
    NodeJSKernelBackend.prototype.unsortedSegmentSum = function (x, segmentIds, numSegments) {
        var opAttrs = [
            this.createTypeOpAttr('T', x.dtype),
            this.createTypeOpAttr('Tindices', 'int32'),
            this.createTypeOpAttr('Tnumsegments', 'int32')
        ];
        return this.executeSingleOutput('UnsortedSegmentSum', opAttrs, [x, segmentIds, tfjs_core_1.scalar(numSegments, 'int32')]);
    };
    NodeJSKernelBackend.prototype.sum = function (x, axes) {
        var axisTensor = tfjs_core_1.tensor1d(axes, 'int32');
        return this.executeSingleOutput('Sum', this.createReductionOpAttrs(x), [x, axisTensor]);
    };
    NodeJSKernelBackend.prototype.argMin = function (x, axis) {
        var axisScalar = tfjs_core_1.scalar(axis, 'int32');
        var opAttrs = [
            this.createTypeOpAttr('T', x.dtype),
            this.createTypeOpAttr('Tidx', 'int32'),
            this.createTypeOpAttr('output_type', 'int32')
        ];
        return this.executeSingleOutput('ArgMin', opAttrs, [x, axisScalar]);
    };
    NodeJSKernelBackend.prototype.argMax = function (x, axis) {
        var axisScalar = tfjs_core_1.scalar(axis, 'int32');
        var opAttrs = [
            this.createTypeOpAttr('T', x.dtype),
            this.createTypeOpAttr('Tidx', 'int32'),
            this.createTypeOpAttr('output_type', 'int32')
        ];
        return this.executeSingleOutput('ArgMax', opAttrs, [x, axisScalar]);
    };
    NodeJSKernelBackend.prototype.equal = function (a, b) {
        var opAttrs = [this.createTypeOpAttr('T', types_1.upcastType(a.dtype, b.dtype))];
        return this.executeSingleOutput('Equal', opAttrs, [a, b]);
    };
    NodeJSKernelBackend.prototype.notEqual = function (a, b) {
        var opAttrs = [this.createTypeOpAttr('T', types_1.upcastType(a.dtype, b.dtype))];
        return this.executeSingleOutput('NotEqual', opAttrs, [a, b]);
    };
    NodeJSKernelBackend.prototype.less = function (a, b) {
        var opAttrs = [this.createTypeOpAttr('T', types_1.upcastType(a.dtype, b.dtype))];
        return this.executeSingleOutput('Less', opAttrs, [a, b]);
    };
    NodeJSKernelBackend.prototype.lessEqual = function (a, b) {
        var opAttrs = [this.createTypeOpAttr('T', types_1.upcastType(a.dtype, b.dtype))];
        return this.executeSingleOutput('LessEqual', opAttrs, [a, b]);
    };
    NodeJSKernelBackend.prototype.greater = function (a, b) {
        var opAttrs = [this.createTypeOpAttr('T', types_1.upcastType(a.dtype, b.dtype))];
        return this.executeSingleOutput('Greater', opAttrs, [a, b]);
    };
    NodeJSKernelBackend.prototype.greaterEqual = function (a, b) {
        var opAttrs = [this.createTypeOpAttr('T', types_1.upcastType(a.dtype, b.dtype))];
        return this.executeSingleOutput('GreaterEqual', opAttrs, [a, b]);
    };
    NodeJSKernelBackend.prototype.logicalNot = function (a) {
        return this.executeSingleOutput('LogicalNot', [], [a]);
    };
    NodeJSKernelBackend.prototype.logicalAnd = function (a, b) {
        return this.executeSingleOutput('LogicalAnd', [], [a, b]);
    };
    NodeJSKernelBackend.prototype.logicalOr = function (a, b) {
        return this.executeSingleOutput('LogicalOr', [], [a, b]);
    };
    NodeJSKernelBackend.prototype.where = function (condition, a, b, dtype) {
        var opAttrs = [this.createTypeOpAttr('T', types_1.upcastType(a.dtype, b.dtype))];
        return this.executeSingleOutput('Select', opAttrs, [condition, a, b]);
    };
    NodeJSKernelBackend.prototype.topKValues = function (x, k) {
        throw new Error('Method not implemented.');
    };
    NodeJSKernelBackend.prototype.topKIndices = function (x, k) {
        throw new Error('Method not implemented.');
    };
    NodeJSKernelBackend.prototype.min = function (x, axes) {
        var axesTensor = tfjs_core_1.tensor1d(axes, 'int32');
        return this.executeSingleOutput('Min', this.createReductionOpAttrs(x), [x, axesTensor]);
    };
    NodeJSKernelBackend.prototype.minimum = function (a, b) {
        var opAttrs = [this.createTypeOpAttr('T', types_1.upcastType(a.dtype, b.dtype))];
        return this.executeSingleOutput('Minimum', opAttrs, [a, b]);
    };
    NodeJSKernelBackend.prototype.max = function (x, axes) {
        var axesTensor = tfjs_core_1.tensor1d(axes, 'int32');
        return this.executeSingleOutput('Max', this.createReductionOpAttrs(x), [x, axesTensor]);
    };
    NodeJSKernelBackend.prototype.maximum = function (a, b) {
        var opAttrs = [this.createTypeOpAttr('T', types_1.upcastType(a.dtype, b.dtype))];
        return this.executeSingleOutput('Maximum', opAttrs, [a, b]);
    };
    NodeJSKernelBackend.prototype.ceil = function (x) {
        return this.executeSingleInput('Ceil', x);
    };
    NodeJSKernelBackend.prototype.floor = function (x) {
        return this.executeSingleInput('Floor', x);
    };
    NodeJSKernelBackend.prototype.pow = function (a, b) {
        var opAttrs = [this.createTypeOpAttr('T', types_1.upcastType(a.dtype, b.dtype))];
        return this.executeSingleOutput('Pow', opAttrs, [a, b]);
    };
    NodeJSKernelBackend.prototype.exp = function (x) {
        return this.executeSingleInput('Exp', x);
    };
    NodeJSKernelBackend.prototype.log = function (x) {
        return this.executeSingleInput('Log', x);
    };
    NodeJSKernelBackend.prototype.log1p = function (x) {
        return this.executeSingleInput('Log1p', x);
    };
    NodeJSKernelBackend.prototype.sqrt = function (x) {
        return this.executeSingleInput('Sqrt', x);
    };
    NodeJSKernelBackend.prototype.square = function (x) {
        return this.executeSingleInput('Square', x);
    };
    NodeJSKernelBackend.prototype.relu = function (x) {
        return this.executeSingleInput('Relu', x);
    };
    NodeJSKernelBackend.prototype.elu = function (x) {
        return this.executeSingleInput('Elu', x);
    };
    NodeJSKernelBackend.prototype.eluDer = function (dy, y) {
        var opAttrs = [this.createTypeOpAttr('T', y.dtype)];
        return this.executeSingleOutput('EluGrad', opAttrs, [dy, y]);
    };
    NodeJSKernelBackend.prototype.selu = function (x) {
        return this.executeSingleInput('Selu', x);
    };
    NodeJSKernelBackend.prototype.int = function (x) {
        throw new Error('Method not implemented.');
    };
    NodeJSKernelBackend.prototype.clip = function (x, min, max) {
        var xMin = this.minimum(x, tfjs_core_1.scalar(max));
        return this.maximum(xMin, tfjs_core_1.scalar(min));
    };
    NodeJSKernelBackend.prototype.abs = function (x) {
        return this.executeSingleInput('Abs', x);
    };
    NodeJSKernelBackend.prototype.sigmoid = function (x) {
        return this.executeSingleInput('Sigmoid', x);
    };
    NodeJSKernelBackend.prototype.sin = function (x) {
        return this.executeSingleInput('Sin', x);
    };
    NodeJSKernelBackend.prototype.cos = function (x) {
        return this.executeSingleInput('Cos', x);
    };
    NodeJSKernelBackend.prototype.tan = function (x) {
        return this.executeSingleInput('Tan', x);
    };
    NodeJSKernelBackend.prototype.asin = function (x) {
        return this.executeSingleInput('Asin', x);
    };
    NodeJSKernelBackend.prototype.acos = function (x) {
        return this.executeSingleInput('Acos', x);
    };
    NodeJSKernelBackend.prototype.atan = function (x) {
        return this.executeSingleInput('Atan', x);
    };
    NodeJSKernelBackend.prototype.sinh = function (x) {
        return this.executeSingleInput('Sinh', x);
    };
    NodeJSKernelBackend.prototype.cosh = function (x) {
        return this.executeSingleInput('Cosh', x);
    };
    NodeJSKernelBackend.prototype.tanh = function (x) {
        return this.executeSingleInput('Tanh', x);
    };
    NodeJSKernelBackend.prototype.mod = function (a, b) {
        var opAttrs = [this.createTypeOpAttr('T', a.dtype)];
        return this.executeSingleOutput('FloorMod', opAttrs, [a, b]);
    };
    NodeJSKernelBackend.prototype.round = function (x) {
        return this.executeSingleInput('Round', x);
    };
    NodeJSKernelBackend.prototype.sign = function (x) {
        return this.executeSingleInput('Sign', x);
    };
    NodeJSKernelBackend.prototype.rsqrt = function (x) {
        return this.executeSingleInput('Rsqrt', x);
    };
    NodeJSKernelBackend.prototype.reciprocal = function (x) {
        return this.executeSingleInput('Reciprocal', x);
    };
    NodeJSKernelBackend.prototype.asinh = function (x) {
        return this.executeSingleInput('Asinh', x);
    };
    NodeJSKernelBackend.prototype.acosh = function (x) {
        return this.executeSingleInput('Acosh', x);
    };
    NodeJSKernelBackend.prototype.atanh = function (x) {
        return this.executeSingleInput('Atanh', x);
    };
    NodeJSKernelBackend.prototype.erf = function (x) {
        return this.executeSingleInput('Erf', x);
    };
    NodeJSKernelBackend.prototype.squaredDifference = function (a, b) {
        var opAttrs = [this.createTypeOpAttr('T', a.dtype)];
        return this.executeSingleOutput('SquaredDifference', opAttrs, [a, b]);
    };
    NodeJSKernelBackend.prototype.expm1 = function (x) {
        return this.executeSingleInput('Expm1', x);
    };
    NodeJSKernelBackend.prototype.softplus = function (x) {
        return this.executeSingleInput('Softplus', x);
    };
    NodeJSKernelBackend.prototype.atan2 = function (a, b) {
        var opAttrs = [this.createTypeOpAttr('T', a.dtype)];
        return this.executeSingleOutput('Atan2', opAttrs, [a, b]);
    };
    NodeJSKernelBackend.prototype.step = function (x, alpha) {
        var dtype = x.dtype;
        var nans = this.isNaN(x);
        var stepNoNans = this.where(this.greater(x, tfjs_core_1.scalar(0, dtype)), tfjs_core_1.ones(x.shape), tfjs_core_1.fill(x.shape, alpha, dtype), dtype);
        return this.where(nans, x, stepNoNans, dtype);
    };
    NodeJSKernelBackend.prototype.conv2d = function (x, filter, convInfo) {
        if (convInfo.padInfo.type !== 'VALID' && convInfo.padInfo.type !== 'SAME') {
            throw new Error("TF Backend supports only 'valid' and 'same' padding " +
                ("while padding was " + convInfo.padInfo.type));
        }
        var strides = [1, convInfo.strideHeight, convInfo.strideWidth, 1];
        var padding = convInfo.padInfo.type;
        var dataFormat = convInfo.dataFormat === 'channelsLast' ? 'NHWC' : 'NCHW';
        var dilations = [1, convInfo.dilationHeight, convInfo.dilationWidth, 1];
        var opAttrs = [
            this.createTypeOpAttr('T', x.dtype),
            { name: 'strides', type: this.binding.TF_ATTR_INT, value: strides },
            { name: 'padding', type: this.binding.TF_ATTR_STRING, value: padding },
            {
                name: 'data_format',
                type: this.binding.TF_ATTR_STRING,
                value: dataFormat
            },
            { name: 'use_cudnn_on_gpu', type: this.binding.TF_ATTR_BOOL, value: true },
            { name: 'dilations', type: this.binding.TF_ATTR_INT, value: dilations },
        ];
        return this.executeSingleOutput('Conv2D', opAttrs, [x, filter]);
    };
    NodeJSKernelBackend.prototype.conv2dDerInput = function (dy, filter, convInfo) {
        if (convInfo.padInfo.type !== 'VALID' && convInfo.padInfo.type !== 'SAME') {
            throw new Error("TF Backend supports only 'valid' and 'same' padding " +
                ("while padding was " + convInfo.padInfo.type));
        }
        var strides = [1, convInfo.strideHeight, convInfo.strideWidth, 1];
        var padding = convInfo.padInfo.type;
        var dataFormat = convInfo.dataFormat === 'channelsLast' ? 'NHWC' : 'NCHW';
        var dilations = [1, convInfo.dilationHeight, convInfo.dilationWidth, 1];
        var opAttrs = [
            this.createTypeOpAttr('T', 'float32'),
            { name: 'strides', type: this.binding.TF_ATTR_INT, value: strides },
            { name: 'padding', type: this.binding.TF_ATTR_STRING, value: padding }, {
                name: 'data_format',
                type: this.binding.TF_ATTR_STRING,
                value: dataFormat
            },
            { name: 'use_cudnn_on_gpu', type: this.binding.TF_ATTR_BOOL, value: true },
            { name: 'dilations', type: this.binding.TF_ATTR_INT, value: dilations }
        ];
        var inputSizes = tfjs_core_1.tensor1d(convInfo.inShape, 'int32');
        return this.executeSingleOutput('Conv2DBackpropInput', opAttrs, [inputSizes, filter, dy]);
    };
    NodeJSKernelBackend.prototype.conv2dDerFilter = function (x, dy, convInfo) {
        if (convInfo.padInfo.type !== 'VALID' && convInfo.padInfo.type !== 'SAME') {
            throw new Error("TF Backend supports only 'valid' and 'same' padding " +
                ("while padding was " + convInfo.padInfo.type));
        }
        var strides = [1, convInfo.strideHeight, convInfo.strideWidth, 1];
        var padding = convInfo.padInfo.type;
        var dataFormat = convInfo.dataFormat === 'channelsLast' ? 'NHWC' : 'NCHW';
        var dilations = [1, convInfo.dilationHeight, convInfo.dilationWidth, 1];
        var opAttrs = [
            this.createTypeOpAttr('T', 'float32'),
            { name: 'strides', type: this.binding.TF_ATTR_INT, value: strides },
            { name: 'padding', type: this.binding.TF_ATTR_STRING, value: padding }, {
                name: 'data_format',
                type: this.binding.TF_ATTR_STRING,
                value: dataFormat
            },
            { name: 'use_cudnn_on_gpu', type: this.binding.TF_ATTR_BOOL, value: true },
            { name: 'dilations', type: this.binding.TF_ATTR_INT, value: dilations }
        ];
        var filterSizes = tfjs_core_1.tensor1d(convInfo.filterShape, 'int32');
        return this.executeSingleOutput('Conv2DBackpropFilter', opAttrs, [x, filterSizes, dy]);
    };
    NodeJSKernelBackend.prototype.depthwiseConv2DDerInput = function (dy, filter, convInfo) {
        var strides = [1, convInfo.strideHeight, convInfo.strideWidth, 1];
        var padding = convInfo.padInfo.type;
        var dataFormat = convInfo.dataFormat === 'channelsLast' ? 'NHWC' : 'NCHW';
        var dilations = [1, convInfo.dilationHeight, convInfo.dilationWidth, 1];
        var opAttrs = [
            this.createTypeOpAttr('T', 'float32'),
            { name: 'strides', type: this.binding.TF_ATTR_INT, value: strides },
            { name: 'padding', type: this.binding.TF_ATTR_STRING, value: padding }, {
                name: 'data_format',
                type: this.binding.TF_ATTR_STRING,
                value: dataFormat
            },
            { name: 'dilations', type: this.binding.TF_ATTR_INT, value: dilations }
        ];
        var inputSizes = tfjs_core_1.tensor1d(convInfo.inShape, 'int32');
        return this.executeSingleOutput('DepthwiseConv2dNativeBackpropInput', opAttrs, [inputSizes, filter, dy]);
    };
    NodeJSKernelBackend.prototype.depthwiseConv2DDerFilter = function (x, dY, convInfo) {
        var strides = [1, convInfo.strideHeight, convInfo.strideWidth, 1];
        var padding = convInfo.padInfo.type;
        var dataFormat = convInfo.dataFormat === 'channelsLast' ? 'NHWC' : 'NCHW';
        var dilations = [1, convInfo.dilationHeight, convInfo.dilationWidth, 1];
        var opAttrs = [
            this.createTypeOpAttr('T', 'float32'),
            { name: 'strides', type: this.binding.TF_ATTR_INT, value: strides },
            { name: 'padding', type: this.binding.TF_ATTR_STRING, value: padding }, {
                name: 'data_format',
                type: this.binding.TF_ATTR_STRING,
                value: dataFormat
            },
            { name: 'dilations', type: this.binding.TF_ATTR_INT, value: dilations }
        ];
        var filterSizes = tfjs_core_1.tensor1d(convInfo.filterShape, 'int32');
        return this.executeSingleOutput('DepthwiseConv2dNativeBackpropFilter', opAttrs, [x, filterSizes, dY]);
    };
    NodeJSKernelBackend.prototype.depthwiseConv2D = function (input, filter, convInfo) {
        if (convInfo.padInfo.type !== 'VALID' && convInfo.padInfo.type !== 'SAME') {
            throw new Error("TF Backend supports only 'valid' and 'same' padding " +
                ("while padding was " + convInfo.padInfo.type));
        }
        var strides = [1, convInfo.strideHeight, convInfo.strideWidth, 1];
        var padding = convInfo.padInfo.type;
        var dataFormat = convInfo.dataFormat === 'channelsLast' ? 'NHWC' : 'NCHW';
        var dilations = [1, convInfo.dilationHeight, convInfo.dilationWidth, 1];
        var opAttrs = [
            this.createTypeOpAttr('T', input.dtype),
            { name: 'strides', type: this.binding.TF_ATTR_INT, value: strides },
            { name: 'padding', type: this.binding.TF_ATTR_STRING, value: padding }, {
                name: 'data_format',
                type: this.binding.TF_ATTR_STRING,
                value: dataFormat
            },
            { name: 'dilations', type: this.binding.TF_ATTR_INT, value: dilations }
        ];
        return this.executeSingleOutput('DepthwiseConv2dNative', opAttrs, [input, filter]);
    };
    NodeJSKernelBackend.prototype.maxPool = function (x, convInfo) {
        if (convInfo.padInfo.type !== 'VALID' && convInfo.padInfo.type !== 'SAME') {
            throw new Error("TF Backend supports only 'valid' and 'same' padding " +
                ("while padding was " + convInfo.padInfo.type));
        }
        var ksize = [1, convInfo.filterHeight, convInfo.filterWidth, 1];
        var strides = [1, convInfo.strideHeight, convInfo.strideWidth, 1];
        var padding = convInfo.padInfo.type;
        var dataFormat = convInfo.dataFormat === 'channelsLast' ? 'NHWC' : 'NCHW';
        var opAttrs = [
            this.createTypeOpAttr('T', x.dtype),
            { name: 'ksize', type: this.binding.TF_ATTR_INT, value: ksize },
            { name: 'strides', type: this.binding.TF_ATTR_INT, value: strides },
            { name: 'padding', type: this.binding.TF_ATTR_STRING, value: padding }, {
                name: 'data_format',
                type: this.binding.TF_ATTR_STRING,
                value: dataFormat
            }
        ];
        return this.executeSingleOutput('MaxPool', opAttrs, [x]);
    };
    NodeJSKernelBackend.prototype.maxPoolBackprop = function (dy, x, y, convInfo) {
        if (convInfo.padInfo.type !== 'VALID' && convInfo.padInfo.type !== 'SAME') {
            throw new Error("TF Backend supports only 'valid' and 'same' padding " +
                ("while padding type was " + convInfo.padInfo.type));
        }
        var ksize = [1, convInfo.filterHeight, convInfo.filterWidth, 1];
        var strides = [1, convInfo.strideHeight, convInfo.strideWidth, 1];
        var padding = convInfo.padInfo.type;
        var dataFormat = convInfo.dataFormat === 'channelsLast' ? 'NHWC' : 'NCHW';
        var opAttrs = [
            this.createTypeOpAttr('T', x.dtype),
            { name: 'ksize', type: this.binding.TF_ATTR_INT, value: ksize },
            { name: 'strides', type: this.binding.TF_ATTR_INT, value: strides },
            { name: 'padding', type: this.binding.TF_ATTR_STRING, value: padding },
            {
                name: 'data_format',
                type: this.binding.TF_ATTR_STRING,
                value: dataFormat
            },
        ];
        return this.executeSingleOutput('MaxPoolGrad', opAttrs, [x, y, dy]);
    };
    NodeJSKernelBackend.prototype.avgPool = function (x, convInfo) {
        if (convInfo.padInfo.type !== 'VALID' && convInfo.padInfo.type !== 'SAME') {
            throw new Error("TF Backend supports only 'valid' and 'same' padding " +
                ("while padding was " + convInfo.padInfo.type));
        }
        var ksize = [1, convInfo.filterHeight, convInfo.filterWidth, 1];
        var strides = [1, convInfo.strideHeight, convInfo.strideWidth, 1];
        var padding = convInfo.padInfo.type;
        var dataFormat = convInfo.dataFormat === 'channelsLast' ? 'NHWC' : 'NCHW';
        var opAttrs = [
            this.createTypeOpAttr('T', x.dtype),
            { name: 'ksize', type: this.binding.TF_ATTR_INT, value: ksize },
            { name: 'strides', type: this.binding.TF_ATTR_INT, value: strides },
            { name: 'padding', type: this.binding.TF_ATTR_STRING, value: padding },
            {
                name: 'data_format',
                type: this.binding.TF_ATTR_STRING,
                value: dataFormat
            },
        ];
        return this.executeSingleOutput('AvgPool', opAttrs, [x]);
    };
    NodeJSKernelBackend.prototype.avgPoolBackprop = function (dy, x, convInfo) {
        if (convInfo.padInfo.type !== 'VALID' && convInfo.padInfo.type !== 'SAME') {
            throw new Error("TF Backend supports only 'valid' and 'same' padding " +
                ("while padding type was " + convInfo.padInfo.type));
        }
        var ksize = [1, convInfo.filterHeight, convInfo.filterWidth, 1];
        var strides = [1, convInfo.strideHeight, convInfo.strideWidth, 1];
        var padding = convInfo.padInfo.type;
        var dataFormat = convInfo.dataFormat === 'channelsLast' ? 'NHWC' : 'NCHW';
        var opAttrs = [
            this.createTypeOpAttr('T', x.dtype),
            { name: 'ksize', type: this.binding.TF_ATTR_INT, value: ksize },
            { name: 'strides', type: this.binding.TF_ATTR_INT, value: strides },
            { name: 'padding', type: this.binding.TF_ATTR_STRING, value: padding },
            {
                name: 'data_format',
                type: this.binding.TF_ATTR_STRING,
                value: dataFormat
            },
        ];
        var origInputShape = tfjs_core_1.tensor1d(x.shape, 'int32');
        return this.executeSingleOutput('AvgPoolGrad', opAttrs, [origInputShape, dy]);
    };
    NodeJSKernelBackend.prototype.reshape = function (x, shape) {
        var shapeTensor = tfjs_core_1.tensor1d(shape, 'int32');
        var opAttrs = [
            this.createTypeOpAttr('T', x.dtype),
            this.createTypeOpAttr('Tshape', shapeTensor.dtype)
        ];
        return this.executeSingleOutput('Reshape', opAttrs, [x, shapeTensor]);
    };
    NodeJSKernelBackend.prototype.cast = function (x, dtype) {
        var opAttrs = [
            this.createTypeOpAttr('SrcT', x.dtype),
            this.createTypeOpAttr('DstT', dtype)
        ];
        return this.executeSingleOutput('Cast', opAttrs, [x]);
    };
    NodeJSKernelBackend.prototype.tile = function (x, reps) {
        var opAttrs = [
            this.createTypeOpAttr('T', x.dtype),
            this.createTypeOpAttr('Tmultiples', 'int32')
        ];
        var multiples = tfjs_core_1.tensor1d(reps, 'int32');
        return this.executeSingleOutput('Tile', opAttrs, [x, multiples]);
    };
    NodeJSKernelBackend.prototype.pad = function (x, paddings, constantValue) {
        var paddingsTensor = tfjs_core_1.tensor2d(paddings, [paddings.length, 2], 'int32');
        var constantTensor = tfjs_core_1.scalar(constantValue, x.dtype);
        var opAttrs = [
            this.createTypeOpAttr('T', x.dtype),
            this.createTypeOpAttr('Tpaddings', paddingsTensor.dtype)
        ];
        return this.executeSingleOutput('PadV2', opAttrs, [x, paddingsTensor, constantTensor]);
    };
    NodeJSKernelBackend.prototype.transpose = function (x, perm) {
        var permTensor = tfjs_core_1.tensor1d(perm, 'int32');
        var opAttrs = [
            this.createTypeOpAttr('T', x.dtype),
            this.createTypeOpAttr('Tperm', 'int32')
        ];
        return this.executeSingleOutput('Transpose', opAttrs, [x, permTensor]);
    };
    NodeJSKernelBackend.prototype.gather = function (x, indices, axis) {
        var axisTensor = tfjs_core_1.scalar(axis, 'int32');
        var opAttrs = [
            this.createTypeOpAttr('Tparams', x.dtype),
            this.createTypeOpAttr('Tindices', indices.dtype),
            this.createTypeOpAttr('Taxis', 'int32')
        ];
        return this.executeSingleOutput('GatherV2', opAttrs, [x, indices, axisTensor]);
    };
    NodeJSKernelBackend.prototype.resizeBilinear = function (x, newHeight, newWidth, alignCorners) {
        var opAttrs = [
            this.createTypeOpAttr('T', x.dtype),
            {
                name: 'align_corners',
                type: this.binding.TF_ATTR_BOOL,
                value: alignCorners
            },
        ];
        var size = tfjs_core_1.tensor1d([newHeight, newWidth], 'int32');
        return this.executeSingleOutput('ResizeBilinear', opAttrs, [x, size]);
    };
    NodeJSKernelBackend.prototype.resizeBilinearBackprop = function (dy, x, alignCorners) {
        var opAttrs = [
            this.createTypeOpAttr('T', x.dtype), {
                name: 'align_corners',
                type: this.binding.TF_ATTR_BOOL,
                value: alignCorners
            }
        ];
        return this.executeSingleOutput('ResizeBilinearGrad', opAttrs, [dy, x]);
    };
    NodeJSKernelBackend.prototype.resizeNearestNeighbor = function (x, newHeight, newWidth, alignCorners) {
        var opAttrs = [
            this.createTypeOpAttr('T', x.dtype),
            {
                name: 'align_corners',
                type: this.binding.TF_ATTR_BOOL,
                value: alignCorners
            },
        ];
        var size = tfjs_core_1.tensor1d([newHeight, newWidth], 'int32');
        return this.executeSingleOutput('ResizeNearestNeighbor', opAttrs, [x, size]);
    };
    NodeJSKernelBackend.prototype.batchNormalization = function (x, mean, variance, varianceEpsilon, scale, offset) {
        if (mean.rank > 1) {
            var inv = tfjs_core_1.rsqrt(variance.add(tfjs_core_1.scalar(varianceEpsilon)));
            if (scale != null) {
                inv = inv.mul(scale);
            }
            var xNorm = x.sub(mean).mul(inv);
            return offset != null ? xNorm.add(offset) : xNorm;
        }
        var dataFormat = 'NHWC';
        var depth = x.shape[3];
        var opAttrs = [
            this.createTypeOpAttr('T', x.dtype),
            {
                name: 'epsilon',
                type: this.binding.TF_ATTR_FLOAT,
                value: varianceEpsilon
            },
            {
                name: 'data_format',
                type: this.binding.TF_ATTR_STRING,
                value: dataFormat
            },
            { name: 'is_training', type: this.binding.TF_ATTR_BOOL, value: false },
        ];
        var numOutputs = 5;
        if (scale == null) {
            scale = tfjs_core_1.fill([depth], 1);
        }
        if (offset == null) {
            offset = tfjs_core_1.fill([depth], 0);
        }
        return this.executeMultipleOutputs('FusedBatchNorm', opAttrs, [x, scale, offset, mean, variance], numOutputs)[0];
    };
    NodeJSKernelBackend.prototype.localResponseNormalization4D = function (x, radius, bias, alpha, beta) {
        var opAttrs = [
            this.createTypeOpAttr('T', x.dtype),
            { name: 'depth_radius', type: this.binding.TF_ATTR_INT, value: radius },
            { name: 'bias', type: this.binding.TF_ATTR_FLOAT, value: bias },
            { name: 'alpha', type: this.binding.TF_ATTR_FLOAT, value: alpha },
            { name: 'beta', type: this.binding.TF_ATTR_FLOAT, value: beta },
        ];
        return this.executeSingleOutput('LRN', opAttrs, [x]);
    };
    NodeJSKernelBackend.prototype.multinomial = function (logits, normalized, numSamples, seed) {
        if (normalized) {
            throw new Error('TF Node backend does not support normalized logits ' +
                'passed to multinomial');
        }
        var opAttrs = [
            this.createTypeOpAttr('T', logits.dtype),
            this.createTypeOpAttr('output_dtype', 'int32'),
            { name: 'seed', type: this.binding.TF_ATTR_INT, value: seed },
            { name: 'seed2', type: this.binding.TF_ATTR_INT, value: seed * seed },
        ];
        return this.executeSingleOutput('Multinomial', opAttrs, [logits, tfjs_core_1.scalar(numSamples, 'int32')]);
    };
    NodeJSKernelBackend.prototype.oneHot = function (indices, depth, onValue, offValue) {
        var depthTensor = tfjs_core_1.scalar(depth, 'int32');
        var onValueTensor = tfjs_core_1.scalar(onValue, 'int32');
        var offValueTensor = tfjs_core_1.scalar(offValue, 'int32');
        var opAttrs = [
            { name: 'axis', type: this.binding.TF_ATTR_INT, value: -1 },
            this.createTypeOpAttr('T', indices.dtype),
            this.createTypeOpAttr('TI', indices.dtype)
        ];
        return this.executeSingleOutput('OneHot', opAttrs, [
            indices, depthTensor, onValueTensor, offValueTensor
        ]);
    };
    NodeJSKernelBackend.prototype.cumsum = function (x, axis, exclusive, reverse) {
        var axisTensor = tfjs_core_1.scalar(axis, 'int32');
        var opAttrs = [
            { name: 'exclusive', type: this.binding.TF_ATTR_BOOL, value: exclusive },
            { name: 'reverse', type: this.binding.TF_ATTR_BOOL, value: reverse },
            this.createTypeOpAttr('T', x.dtype),
            this.createTypeOpAttr('Tidx', 'int32')
        ];
        return this.executeSingleOutput('Cumsum', opAttrs, [x, axisTensor]);
    };
    NodeJSKernelBackend.prototype.fromPixels = function (pixels, numChannels) {
        if (pixels == null) {
            throw new Error('pixels passed to tf.fromPixels() can not be null');
        }
        if (pixels.getContext == null) {
            throw new Error('When running in node, pixels must be an HTMLCanvasElement ' +
                'like the one returned by the `canvas` npm package');
        }
        var vals = pixels
            .getContext('2d')
            .getImageData(0, 0, pixels.width, pixels.height)
            .data;
        var values;
        if (numChannels === 4) {
            values = new Int32Array(vals);
        }
        else {
            var numPixels = pixels.width * pixels.height;
            values = new Int32Array(numPixels * numChannels);
            for (var i = 0; i < numPixels; i++) {
                for (var channel = 0; channel < numChannels; ++channel) {
                    values[i * numChannels + channel] = vals[i * 4 + channel];
                }
            }
        }
        var outShape = [pixels.height, pixels.width, numChannels];
        return tfjs_core_1.tensor3d(values, outShape, 'int32');
    };
    NodeJSKernelBackend.prototype.memory = function () {
        return { unreliable: true };
    };
    NodeJSKernelBackend.prototype.time = function (f) {
        return __awaiter(this, void 0, void 0, function () {
            var start, elapsed;
            return __generator(this, function (_a) {
                start = process.hrtime();
                f();
                elapsed = process.hrtime(start);
                return [2, { kernelMs: elapsed[0] * 1000 + elapsed[1] / 1000000 }];
            });
        });
    };
    NodeJSKernelBackend.prototype.isNaN = function (x) {
        return this.executeSingleInput('IsNan', x);
    };
    return NodeJSKernelBackend;
}());
exports.NodeJSKernelBackend = NodeJSKernelBackend;
//# sourceMappingURL=nodejs_kernel_backend.js.map
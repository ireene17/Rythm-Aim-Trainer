"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const tf = __importStar(require("@tensorflow/tfjs-node"));
const fs = __importStar(require("fs"));
// Entradas de entrenamiento
const inputs = [
    'quiero mejorar mi puntería',
    'necesito velocidad y reflejos',
    'practicar saltos de cámara',
    'quiero una mezcla de todo',
    'quiero reforzar todas mis cualidades',
    'precisión con el mouse',
    'precisión con el retón',
    'quiero agilidad mental y reacción',
    'seguir el objetivo con el ratón'
];
const labels = [
    'TrackerMode',
    'ReflexedMode',
    'FlicksMode',
    'MixedMode',
    'MixedMode',
    'TrackerMode',
    'TrackerMode',
    'ReflexedMode',
    'TrackerMode'
];
// Preprocesamiento
const vocab = Array.from(new Set(inputs.join(' ').split(' ')));
const vocabMap = Object.fromEntries(vocab.map((word, i) => [word, i]));
function encode(text) {
    const vec = new Array(vocab.length).fill(0);
    text.split(' ').forEach(word => {
        if (vocabMap[word] !== undefined)
            vec[vocabMap[word]] = 1;
    });
    return vec;
}
const xs = tf.tensor2d(inputs.map(encode));
const labelSet = Array.from(new Set(labels));
const ys = tf.tensor2d(labels.map(l => {
    const arr = new Array(labelSet.length).fill(0);
    arr[labelSet.indexOf(l)] = 1;
    return arr;
}));
// Modelo
const model = tf.sequential();
model.add(tf.layers.dense({ inputShape: [vocab.length], units: 16, activation: 'relu' }));
model.add(tf.layers.dense({ units: labelSet.length, activation: 'softmax' }));
model.compile({ optimizer: 'adam', loss: 'categoricalCrossentropy', metrics: ['accuracy'] });
// Entrenamiento
function train() {
    return __awaiter(this, void 0, void 0, function* () {
        yield model.fit(xs, ys, {
            epochs: 50,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    console.log(`Epoch ${epoch + 1}: loss = ${logs === null || logs === void 0 ? void 0 : logs.loss}`);
                }
            }
        });
        yield model.save('file://./server/tf/model');
        fs.writeFileSync('./server/tf/vocab.json', JSON.stringify({ vocab, labelSet }));
    });
}
train();

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Map_1 = require("../models/Map");
const router = express_1.default.Router();
const keywordRules = {
    puntería: ['TrackerMode', 'FlicksMode'],
    precisión: ['TrackerMode'],
    reflejos: ['ReflexedMode'],
    velocidad: ['ReflexedMode'],
    salto: ['FlicksMode'],
    cámara: ['FlicksMode'],
    flicks: ['FlicksMode'],
    seguimiento: ['TrackerMode'],
    mezcla: ['MixedMode'],
    todo: ['MixedMode'],
};
function getSuggestedCategories(prompt) {
    const foundCategories = new Set();
    const lowerPrompt = prompt.toLowerCase();
    for (const [keyword, categories] of Object.entries(keywordRules)) {
        if (lowerPrompt.includes(keyword)) {
            categories.forEach(cat => foundCategories.add(cat));
        }
    }
    return foundCategories.size > 0 ? Array.from(foundCategories) : ['MixedMode'];
}
router.post('/recomendar-mapas', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { prompt } = req.body;
    if (!prompt) {
        res.status(400).json({ error: 'Falta el prompt del usuario' });
        return;
    }
    try {
        const sugeridas = getSuggestedCategories(prompt);
        const mapas = yield Map_1.MapModel.find({ categoria: { $in: sugeridas } }).limit(3);
        res.json({ resultados: mapas });
    }
    catch (err) {
        console.error('Error al recomendar mapas:', err);
        res.status(500).json({ error: 'Error al obtener recomendaciones' });
    }
}));
exports.default = router;

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
exports.router = void 0;
const Map_1 = require("../models/Map");
const express_1 = __importDefault(require("express"));
exports.router = express_1.default.Router();
exports.router.get("/by-id/:id", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const mapa = yield Map_1.MapModel.findById(req.params.id);
        if (!mapa) {
            res.status(404).json({ mensaje: "Mapa no encontrado" });
            return;
        }
        res.json(mapa);
    }
    catch (error) {
        console.error("Error al obtener mapa:", error);
        res.status(500).json({ mensaje: "Error al obtener el mapa" });
    }
}));
// GET /api/mapas/:categoria
exports.router.get("/:categoria", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { categoria } = req.params;
    console.log("➡ Petición para categoría:", categoria);
    try {
        const mapas = yield Map_1.MapModel.find({ categoria });
        console.log("✅ Mapas encontrados:", mapas.length);
        res.json(mapas);
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Error al obtener los mapas");
    }
}));
exports.router.get("/categoria/:categoria", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { categoria } = req.params;
    try {
        const mapas = yield Map_1.MapModel.find({ categoria });
        res.json({ mapas });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener los mapas" });
    }
}));
//!-------------------------
exports.router.get("/all", (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const todos = yield Map_1.MapModel.find({});
    console.log("Todos los mapas en la DB:", todos.length);
    res.json(todos);
}));
// router.post("/insert-test", async (_req, res) => {
//   const mapa = new MapModel({
//     nombre: "Mapa prueba codigo",
//     categoria: "MixedMode",
//     difucultad: 1,
//     descripcion: "Mapa demo para test",
//     imagen: "/img/mapa1.png",
//     gif: "/img/gif1.gif",
//     audio: "/audio/audio1.mp3",
//     datosMapa: {
//       targets: [{ x: 100, y: 100, tiempo: 0, tamano: 40 }],
//       duracion: 30,
//       velocidad: "lenta",
//       cancion: "/audio/cancion1.mp3"
//     },
//     creador: "Irene",
//     fechaCreacion: new Date()
//   });
//   await mapa.save();
//   res.send("Mapa insertado correctamente");
// });
// router.get("/test", (_req, res) => {
//   const mapasDePrueba = [
//     {
//     _id: "1",
//     nombre: "Mapa Demo 1",
//     imagen: "/img/mapa1.png",
//     gif: "/img/persona.jpg",
//     audio: "/audio/audio1.mp3"
//     },
//     {
//       _id: "2",
//       nombre: "Mapa Demo 2",
//       imagen: "/img/mapa1.png",
//       gif: "/img/persona.jpg",
//       audio: "/audio/audio2.mp3",
//     },
//   ];
//   console.log("Enviando mapas de prueba");
//   res.json(mapasDePrueba);
// });

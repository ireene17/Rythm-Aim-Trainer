"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const mapSchema = new mongoose_1.default.Schema({
    nombre: String,
    categoria: String,
    dificultad: Number,
    descripcion: String,
    imagen: String,
    gif: String,
    audio: String,
    datosMapa: {
        targets: [{ x: Number, y: Number, tiempo: Number, tamano: Number, destinoX: Number, destinoY: Number }],
        duracion: Number,
        velocidad: String,
        cancion: String,
    },
    creador: String,
    fechaCreacion: Date,
});
exports.MapModel = mongoose_1.default.model("Map", mapSchema, "mapas");

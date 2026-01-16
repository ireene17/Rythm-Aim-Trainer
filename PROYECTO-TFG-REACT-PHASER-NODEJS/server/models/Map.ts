import mongoose from "mongoose";

const mapSchema = new mongoose.Schema({
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

export const MapModel = mongoose.model("Map", mapSchema, "mapas");
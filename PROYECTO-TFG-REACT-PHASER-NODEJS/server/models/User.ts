import mongoose from "mongoose";

const estadisticasSchema = new mongoose.Schema({
  totalPuntos: { type: Number, default: 0 },
  precisionGlobal: { type: Number, default: 0 },
  centroClicks: { type: Number, default: 0 },
  mapasJugados: [{
    nombreMapa: String,
    vecesJugado: { type: Number, default: 1 }
  }],
  habilidad: {
    punteria: { type: Number, default: 1 },
    reflejos: { type: Number, default: 1 },
    flicks: { type: Number, default: 1 },
    tracking: { type: Number, default: 1 },
    adaptacion: { type: Number, default: 1 }
  },
  mejoresMapas: { type: [String], default: [] },
  peoresMapas: { type: [String], default: [] },
  consejos: {
    type: [String],
    default: [
      "Empieza por mapas más lentos para mejorar puntería.",
      "Tu adaptación aún puede mejorar.",
      "Practica mapas con más movimiento para mejorar tracking."
    ]
  },
  tiempoPromedioReaccion: { type: Number, default: 0 },
  aciertosPorSegundo: { type: Number, default: 0 },
  maxRachaAciertos: { type: Number, default: 0 },
  rachaActual: { type: Number, default: 0 },
  sesionesJugadas: { type: Number, default: 0 },
  historialSesiones: { type: [Object], default: [] },
  estiloDominante: { type: String, default: "mixto" }
}, { _id: false }); 


const userSchema = new mongoose.Schema({
  userName: { type: String, required: true, unique: true },
  nombre: { type: String },
  apellidos: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  telefono: { type: String },
  pais: { type: String, required: true },
  provincia: { type: String },
  nivel: { type: String, enum: ["facil", "intermedio", "avanzado"], default: "facil" },
  rango: { type: Number, default: 0 },
  descripcion: { type: String, default: "" },
  fotoPerfil: { type: String, default: "/img/default-pfp.webp" },
  panel: { type: String, default: "/img/default-pfp.webp" },
  completados: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Map' }],
  estadisticas: { type: estadisticasSchema, default: () => ({}) },
  fechaRegistro: { type: Date, default: Date.now }
});

export const UserModel = mongoose.model("User", userSchema, "usuarios");

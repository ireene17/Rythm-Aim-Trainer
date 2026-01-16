import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import { router as gameRouter } from "./controllers/gameEndPointsController";
import authRouter from "./controllers/authController";
import userRouter from "./controllers/userController";
import iaRouter from "./controllers/iaController";

dotenv.config();
const app = express();

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.URL_MONGODB;
const DB_NAME = process.env.DB_MONGODB;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.use("/api/mapas", gameRouter);
app.use("/api/auth", authRouter);
app.use("/api/usuario", userRouter);
app.use("/api/ia", iaRouter);

interface Jugador {
  id: string;
  nombre: string;
  puntuacion: number;
  esAnfitrion: boolean;
}

interface Mensaje {
  usuario: string;
  texto: string;
}

interface MapaSimple {
  _id: string;
  nombre: string;
  descripcion: string;
  imagen: string;
}

interface Sala {
  id: string;
  jugadores: Jugador[];
  chat: Mensaje[];
  anfitrionId: string;
  mapa: MapaSimple;
  timeout?: NodeJS.Timeout;
  resultadosParciales?: { id: string; puntuacion: number }[];
}

const salas: Record<string, Sala> = {};

io.on("connection", (socket) => {
  console.log(`Usuario conectado: ${socket.id}`);

  function generarCodigoSala(): string {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let codigo = '';
    for (let i = 0; i < 7; i++) {
      codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    return codigo;
  }

  socket.on("crearSala", ({ nombre, mapa }) => {
  try {
    let salaId = generarCodigoSala();
    while (salas[salaId]) {
      salaId = generarCodigoSala();
    }
    

    const mapaLimpiado: MapaSimple = {
      _id: mapa._id.toString(),
      nombre: mapa.nombre,
      descripcion: mapa.descripcion,
      imagen: mapa.imagen
    };

    const nuevaSala: Sala = {
      id: salaId,
      jugadores: [
        { id: socket.id, nombre, puntuacion: 0, esAnfitrion: true },
      ],
      chat: [],
      anfitrionId: socket.id,
      mapa: mapaLimpiado,
    };

    socket.on('actualizarPuntuacion', ({ salaId, jugadorId, puntuacion }) => {
  const sala = salas[salaId];
  if (!sala) return;

  const jugador = sala.jugadores.find(j => j.id === jugadorId);
  if (jugador) jugador.puntuacion = puntuacion;

  const ranking = [...sala.jugadores].sort((a, b) => b.puntuacion - a.puntuacion);
  io.to(salaId).emit('actualizarPuntuaciones', ranking);
});

    salas[salaId] = nuevaSala;
    socket.join(salaId);

    socket.emit('actualizarSala', {
      ...nuevaSala,
      soyAnfitrion: true 
    });

      salas[salaId].timeout = setTimeout(() => {
        if (salas[salaId]) {
          io.to(salaId).emit("iniciarPartida");
        }
      }, 5 * 60 * 1000);

    } catch (error) {
      console.error("Error al crear sala:", error);
      socket.emit("error", "No se pudo crear la sala");
    }
  });

  socket.on("unirseSala", ({ salaId, nombre }) => {
  try {
    const sala = salas[salaId];
    if (!sala || sala.jugadores.length >= 8) {
      socket.emit("error", "La sala está llena o no existe");
      return;
    }

    const yaExiste = sala.jugadores.some(j => j.id === socket.id);
    if (yaExiste) return;

    const nuevoJugador: Jugador = {
      id: socket.id,
      nombre,
      puntuacion: 0,
      esAnfitrion: false,
    };

    sala.jugadores.push(nuevoJugador);
    socket.join(salaId);

    socket.to(salaId).emit("actualizarSala", {
  id: sala.id,
  jugadores: sala.jugadores,
  mapa: sala.mapa,
  chat: sala.chat,
  anfitrionId: sala.anfitrionId
});

socket.emit("actualizarSala", {
  id: sala.id,
  jugadores: sala.jugadores,
  mapa: sala.mapa,
  chat: sala.chat,
  anfitrionId: sala.anfitrionId,
  soyAnfitrion: socket.id === sala.anfitrionId
});

console.log(`Usuario ${socket.id} es anfitrión? ${socket.id === sala.anfitrionId}`);
  } catch (error) {
    console.error("Error al unirse a sala:", error);
    socket.emit("error", "No se pudo unir a la sala");
  }
});


  socket.on("enviarMensaje", ({ salaId, mensaje }) => {
    try {
      const sala = salas[salaId];
      if (!sala) return;

      const mensajeLimpiado: Mensaje = {
        usuario: mensaje.usuario,
        texto: mensaje.texto
      };

      sala.chat.push(mensajeLimpiado);
      io.to(salaId).emit("nuevoMensaje", mensajeLimpiado);

    } catch (error) {
      console.error("Error al enviar mensaje:", error);
    }
  });

  socket.on("llenarHuecos", (salaId: string) => {
    try {
      const sala = salas[salaId];
      if (!sala) return;

      const botsFaltantes = 8 - sala.jugadores.length;
      for (let i = 1; i <= botsFaltantes; i++) {
        sala.jugadores.push({
          id: `bot_${i}`,
          nombre: `bot_${i}`,
          puntuacion: Math.floor(Math.random() * 401) + 100,
          esAnfitrion: false,
        });
      }

      io.to(salaId).emit("actualizarSala", {
        id: sala.id,
        jugadores: sala.jugadores,
        mapa: sala.mapa,
        chat: sala.chat,
        anfitrionId: sala.anfitrionId,
        soyAnfitrion: socket.id === sala.anfitrionId
      });

    } catch (error) {
      console.error("Error al llenar huecos:", error);
    }
  });

  socket.on("iniciarPartida", (salaId: string) => {
  try {
    console.log(`Recibido iniciarPartida para sala: ${salaId}`); 
    const sala = salas[salaId];
    if (!sala) {
      console.error(`Sala ${salaId} no encontrada`);
      return;
    }
    
    if (socket.id !== sala.anfitrionId) {
      console.error(`Usuario ${socket.id} no es anfitrión de la sala ${salaId}`);
      socket.emit("error", "Solo el anfitrión puede iniciar la partida");
      return;
    }
    
    if (sala.timeout) {
      clearTimeout(sala.timeout);
      delete sala.timeout;
    }

    console.log(`Iniciando partida para sala: ${salaId}`); 
    io.to(salaId).emit("iniciarPartida");
    
  

  } catch (error) {
    console.error("Error al iniciar partida:", error);
    socket.emit("error", "Error al iniciar partida");
  }
});

socket.on("finalizarPartida", ({ salaId, puntuaciones }: { salaId: string; puntuaciones: { id: string; puntuacion: number }[] }) => {
  try {
    const sala = salas[salaId];
    if (!sala) return;

    if (!sala.resultadosParciales) {
      sala.resultadosParciales = [];
    }

    for (const p of puntuaciones) {
      const yaEnviado = sala.resultadosParciales.some(res => res.id === p.id);
      if (!yaEnviado) {
        sala.resultadosParciales.push(p);
      }
    }

    const jugadoresReales = sala.jugadores.filter(j => !j.id.startsWith("bot_"));
    const enviados = sala.resultadosParciales.map(p => p.id);
    const todosHanTerminado = jugadoresReales.every(j => enviados.includes(j.id));

    if (todosHanTerminado) {
      const resultadosFinales = sala.jugadores.map((j: Jugador) => {
        const puntuacionReal = sala.resultadosParciales!.find(p => p.id === j.id);
        return {
          id: j.id,
          nombre: j.nombre,
          puntuacion: puntuacionReal ? puntuacionReal.puntuacion : j.puntuacion || 0,
          esAnfitrion: j.esAnfitrion
        };
      });

      const ranking = resultadosFinales.sort((a, b) => b.puntuacion - a.puntuacion);

      io.to(salaId).emit("mostrarResultados", {
        ranking,
        mapa: sala.mapa
      });

      delete sala.resultadosParciales;
    }
  } catch (error) {
    console.error("Error al finalizar partida:", error);
  }
});



  socket.on("disconnect", () => {
    console.log(`Usuario desconectado: ${socket.id}`);
    
    try {
      for (const salaId in salas) {
        const sala = salas[salaId];
        const jugadorIndex = sala.jugadores.findIndex((j) => j.id === socket.id);
        
        if (jugadorIndex !== -1) {
          if (sala.anfitrionId === socket.id && sala.jugadores.length > 1) {
            const nuevoAnfitrion = sala.jugadores.find(j => j.id !== socket.id);
            if (nuevoAnfitrion) {
              sala.anfitrionId = nuevoAnfitrion.id;
              nuevoAnfitrion.esAnfitrion = true;
            }
          }
          
          sala.jugadores.splice(jugadorIndex, 1);
          
          if (sala.jugadores.length === 0) {
            if (sala.timeout) clearTimeout(sala.timeout);
            delete salas[salaId];
          } else {
            io.to(salaId).emit("actualizarSala", {
              id: sala.id,
              jugadores: sala.jugadores,
              mapa: sala.mapa,
              chat: sala.chat,
              anfitrionId: sala.anfitrionId
            });
          }
        }
      }
    } catch (error) {
      console.error("Error al manejar desconexión........", error);
    }
  });
});

mongoose
  .connect(MONGO_URI!, { dbName: DB_NAME })
  .then(() => {
    console.log(`Conectado a MongoDB en la base de datos..... ${DB_NAME}`);
    server.listen(PORT, () =>
      console.log(`Servidor con Socket corriendo en puerto.......${PORT}`)
    );
  })
  .catch((err) => console.error("Error conectando a MongoDB:", err));
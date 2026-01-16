import { MapModel } from "../models/Map";
import express, { Request, Response } from 'express';


export const router = express.Router();

router.get("/by-id/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const mapa = await MapModel.findById(req.params.id);
    if (!mapa) {
      res.status(404).json({ mensaje: "Mapa no encontrado" });
      return;
    }

    res.json(mapa);
  } catch (error) {
    console.error("Error al obtener mapa:", error);
    res.status(500).json({ mensaje: "Error al obtener el mapa" });
  }
});


// GET /api/mapas/:categoria
router.get("/:categoria", async (req, res) => {
  const { categoria } = req.params;
  console.log("➡ Petición para categoría:", categoria);

  try {
    const mapas = await MapModel.find({ categoria });

    console.log("✅ Mapas encontrados:", mapas.length);
    res.json(mapas);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener los mapas");
  }
});

router.get("/categoria/:categoria", async (req, res) => {
  const { categoria } = req.params;
  try {
    const mapas = await MapModel.find({ categoria });
    res.json({ mapas });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener los mapas" });
  }
});




//!-------------------------
router.get("/all", async (_req, res) => {
  const todos = await MapModel.find({});
  console.log("Todos los mapas en la DB:", todos.length);
  res.json(todos);
});



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
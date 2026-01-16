import express, { Request, Response } from "express";
import { UserModel } from "../models/User";
import jwt from "jsonwebtoken";

const router = express.Router();
import { MapModel } from "../models/Map";

const verificarToken: express.RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    res.status(401).json({ error: "Token requerido" });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, "supersecreto");
    (req as any).usuario = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: "Token inválido" });
    return;
  }
};

router.get('/ranking', async (req, res) => {
  try {
    const usuarios = await UserModel.find({}, {
      userName: 1,
      fotoPerfil: 1,
      'estadisticas.totalPuntos': 1,
    }).sort({ 'estadisticas.totalPuntos': -1 });

    res.json(usuarios);
  } catch (error) {
    console.error("Error al obtener rankings:", error);
    res.status(500).json({ mensaje: "Error al obtener rankings" });
  }
});

// PUT /api/usuario/:id
router.put("/:id", verificarToken, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { fotoPerfil, panel, descripcion } = req.body;

  try {
    const actualizado = await UserModel.findByIdAndUpdate(
      id,
      { fotoPerfil, panel, descripcion },
      { new: true }
    );

    if (!actualizado) {
      console.log("Usuario no encontrado");
    }

    res.json({ mensaje: "Perfil actualizado", usuario: actualizado });
  } catch (err) {
    console.error("Error actualizando usuario:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

// GET /api/usuario/:id
router.get("/:id", verificarToken, async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const usuario = await UserModel.findById(id)
      .select("userName email fotoPerfil panel descripcion completados estadisticas");

    if (!usuario) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    const estadisticasCompletas = usuario.estadisticas || {
      totalPuntos: 0,
      precisionGlobal: 0,
      centroClicks: 0,
      mapasJugados: {},
      habilidad: {
        punteria: 1,
        reflejos: 1,
        flicks: 1,
        tracking: 1,
        adaptacion: 1
      },
      consejos: [
        "Empieza por mapas más lentos para mejorar puntería.",
        "Tu adaptación aún puede mejorar.",
        "Practica mapas con más movimiento para mejorar tracking."
      ],
      tiempoPromedioReaccion: 0,
      aciertosPorSegundo: 0,
      maxRachaAciertos: 0,
      rachaActual: 0,
      sesionesJugadas: 0,
      historialSesiones: [],
      estiloDominante: "mixto"
    };

    res.json({
      ...usuario.toObject(),
      estadisticas: estadisticasCompletas
    });
  } catch (err) {
    console.error("Error obteniendo usuario:", err);
    res.status(500).json({ error: "Error interno al obtener el usuario" });
  }
});

// POST /api/usuario/:id/completado
router.post("/:id/completado", verificarToken, async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { mapaId } = req.body;

  try {
    const user = await UserModel.findById(id);
    if (!user) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    if (!user.completados.includes(mapaId)) {
      user.completados.push(mapaId);
      await user.save();
    }

    res.json({ mensaje: "Progreso actualizado" });
  } catch (err) {
    console.error("Error guardando mapa completado:", err);
    res.status(500).json({ error: "Error al guardar el progreso" });
  }
});

// POST /api/usuario/actualizar-estadisticas
router.post("/actualizar-estadisticas", verificarToken, async (req: Request, res: Response): Promise<void> => {
   console.log("Datos recibidos:", req.body);
  try {
    const {
      userId,
      mapaId,
      mapa,
      puntos,
      aciertos,
      intentos,
      centroClicks,
      tiempoReaccion,
      rachaActual,
      rachaMax,
      resultado,
      precision
    } = req.body;

    const usuario = await UserModel.findById(userId);
    if (!usuario) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    usuario.estadisticas = usuario.estadisticas || {}; //?--------------------------


    const stats = usuario.estadisticas;
    const sesiones = stats.sesionesJugadas || 0;

    stats.mapasJugados = stats.mapasJugados || {};
    const nombreMapa = mapa || `Mapa-${mapaId}`;

    const mapaExistente = usuario.estadisticas.mapasJugados.find(m => m.nombreMapa === nombreMapa);

    if (mapaExistente) {
      mapaExistente.vecesJugado++;
    } else {
      usuario.estadisticas.mapasJugados.push({ nombreMapa, vecesJugado: 1 });
    }
    stats.totalPuntos += puntos;

    stats.tiempoPromedioReaccion = ((stats.tiempoPromedioReaccion * sesiones) + tiempoReaccion) / (sesiones + 1);
    stats.precisionGlobal = ((stats.precisionGlobal * sesiones) + precision) / (sesiones + 1);
    stats.centroClicks = ((stats.centroClicks * sesiones) + centroClicks) / (sesiones + 1);
    stats.aciertosPorSegundo = ((stats.aciertosPorSegundo * sesiones) + (aciertos / 30)) / (sesiones + 1); //TODO cambiar segundos

    stats.maxRachaAciertos = Math.max(stats.maxRachaAciertos, rachaMax);
    stats.rachaActual = rachaActual;

    stats.sesionesJugadas = sesiones + 1;

    if (resultado === "victoria") {
      stats.totalPuntos += puntos;
    }
    stats.historialSesiones = stats.historialSesiones || [];
    stats.historialSesiones.push({
      fecha: new Date(),
      mapa,
      puntos,
      aciertos,
      intentos,
      precision: Number(((aciertos / intentos) * 100).toFixed(2)),
      tiempoReaccion: Math.round(tiempoReaccion).toFixed(1),
      rachaMax,
      resultado
    });


    interface SesionHistorial {
      fecha: Date;
      mapa: string;
      puntos: number;
      aciertos: number;
      intentos: number;
      precision: number;
      tiempoReaccion: number;
      rachaMax: number;
      resultado?: "victoria" | "derrota";
    }

    const sesionesHistorial: SesionHistorial[] = stats.historialSesiones.map((s: any) => ({
      fecha: new Date(s.fecha),
      mapa: s.mapa,
      puntos: s.puntos,
      aciertos: s.aciertos,
      intentos: s.intentos,
      precision: s.precision,
      tiempoReaccion: s.tiempoReaccion,
      rachaMax: s.rachaMax,
      resultado: s.resultado,
    }));

    const mapasStats: Record<string, { total: number; sumaPrecision: number }> = {};

    for (const sesion of sesionesHistorial){
      const nombre = sesion.mapa;
      if (!mapasStats[nombre]){
        mapasStats[nombre] = { total: 0, sumaPrecision: 0 };
      }
      mapasStats[nombre].total +=1;
      mapasStats[nombre].sumaPrecision += sesion.precision;
    }

    const promedioMapas = Object.entries(mapasStats)
                          .filter(([_, data]) => data.total >= 2)
                          .map(([nombre, data]) => ({
                              nombre,
                              promedioPrecision: data.sumaPrecision / data.total
                          }))
                          .sort((a, b) => b.promedioPrecision - a.promedioPrecision);

    // !Mirar esto
    // const mejores =  promedioMapas.slice(0, 3);
    // const peores = promedioMapas
    //                 .slice()
    //                 .reverse()
    //                 .filter(m => !mejores.some(mejor => mejor.nombre === m.nombre))
    //                 .slice(0, 3);
    // stats.mejoresMapas = mejores.map(m => m.nombre);
    // stats.peoresMapas = peores.map(m => m.nombre);

    // !Mirar esto ^^
    stats.mejoresMapas = promedioMapas.slice(0, 3).map(m => m.nombre);
    stats.peoresMapas = promedioMapas.slice(-3).map(m => m.nombre);


    if (stats.peoresMapas.length > 0) {
      stats.consejos = stats.consejos.filter(c => !c.startsWith("Practica más los mapas:"));
      stats.consejos.push(`Practica más los mapas: ${stats.peoresMapas.join(", ")}`);
    }

      stats.habilidad = stats.habilidad || {
        punteria: 1,
        reflejos: 1,
        flicks: 1,
        tracking: 1,
        adaptacion: 1,
      };

      // === Calcular habilidades por categoría de mapas (flicks, tracking, adaptacion)
const sesionesPorCategoria: Record<string, { total: number; sumaPrecision: number }> = {};

for (const sesion of sesionesHistorial) {
  const mapaDoc = await MapModel.findOne({ nombre: sesion.mapa });
  if (!mapaDoc || !mapaDoc.categoria) continue;

  const categoria = mapaDoc.categoria;
  if (!sesionesPorCategoria[categoria]) {
    sesionesPorCategoria[categoria] = { total: 0, sumaPrecision: 0 };
  }

  sesionesPorCategoria[categoria].total += 1;
  sesionesPorCategoria[categoria].sumaPrecision += sesion.precision;
}

const calcularNivel = (categoria: string): number => {
  const info = sesionesPorCategoria[categoria];
  if (!info || info.total < 2) return 1;
  const promedio = info.sumaPrecision / info.total;

  if (promedio >= 90) return 5;
  if (promedio >= 75) return 4;
  if (promedio >= 60) return 3;
  if (promedio >= 45) return 2;
  return 1;
};

stats.habilidad.flicks = calcularNivel("FlicksMode");
stats.habilidad.tracking = calcularNivel("TrackerMode");
stats.habilidad.adaptacion = calcularNivel("MixedMode");

    await usuario.save();
    res.json({ mensaje: "Estadísticas actualizadas correctamente" });
    return;

  } catch (error) {
    console.error("Error actualizando estadísticas:", error);
    res.status(500).json({ error: "Error interno al actualizar estadísticas" });
  }
});





export default router;

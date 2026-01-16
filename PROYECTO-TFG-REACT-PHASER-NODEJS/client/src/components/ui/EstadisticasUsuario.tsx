import { useEffect, useState } from "react";
import axios from "axios";
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";

interface HabilidadData {
  punteria: number;
  reflejos: number;
  flicks: number;
  tracking: number;
  adaptacion: number;
}

interface SesionHistorial {
  fecha: string; 
  mapa: string;
  puntos: number;
  aciertos: number;
  intentos: number;
  precision: number;
  tiempoReaccion: number;
  rachaMax: number;
  resultado?: "victoria" | "derrota" ;
}

interface MapaJugado {
  nombreMapa: string;
  vecesJugado: number;
}

interface EstadisticasJugador {
  totalPuntos: number;
  precisionGlobal: number;
  centroClicks: number;
  mapasJugados: MapaJugado[];
  habilidad: HabilidadData;
  mejoresMapas: string[];
  peoresMapas: string[];
  consejos: string[];
  tiempoPromedioReaccion: number;
  aciertosPorSegundo: number;
  rachaActual: number;
  maxRachaAciertos: number;
  sesionesJugadas: number;
  estiloDominante: string;
  historialSesiones?: SesionHistorial[];
}

const EstadisticasUsuario = () => {
      const navigate = useNavigate();
  const [estadisticas, setEstadisticas] = useState<EstadisticasJugador | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {   
    const fetchData = async () => {
      try {
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");
        
        if (!userId || !token) {
          throw new Error("No hay usuario autenticado");
        }

        const response = await axios.get(`http://localhost:3001/api/usuario/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Datos recibidos:", response.data);
        
        const stats = response.data.estadisticas || {
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
          estiloDominante: "no se han jugado partidas aun",
          historialSesiones: []
        };

        setEstadisticas(stats);
      } catch (err) {
        console.error("Error cargando estadísticas:", err);
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [refreshKey]);

  useEffect(() => {
    const handler = () => {
      console.log("Evento recibido: estadisticasActualizadas");
      setRefreshKey(prev => prev + 1);
    };
    
    window.addEventListener('estadisticasActualizadas', handler);
    return () => window.removeEventListener('estadisticasActualizadas', handler);
  }, []);

  if (loading) {
    return <div className="text-white text-center p-8">Cargando estadísticas...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-8">Error: {error}</div>;
  }

  if (!estadisticas) {
    return <div className="text-yellow-500 text-center p-8">No se encontraron estadisticas</div>;
  }

  const radarData = [
    { habilidad: 'Puntería', valor: estadisticas.habilidad.punteria },
    { habilidad: 'Reflejos', valor: estadisticas.habilidad.reflejos },
    { habilidad: 'Flicks', valor: estadisticas.habilidad.flicks },
    { habilidad: 'Tracking', valor: estadisticas.habilidad.tracking },
    { habilidad: 'Adaptación', valor: estadisticas.habilidad.adaptacion },
  ];

  return (
  <div className="min-h-screen relative min-w-screen bg-gray-950 text-white p-6 space-y-8">
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-purple-600 blur-3xl opacity-20 pointer-events-none"></div>
      <div className="absolute top-3/4 left-1/12 w-38 h-38 rounded-full bg-cyan-600 blur-3xl opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-cyan-500 blur-3xl opacity-20 pointer-events-none"></div>
    </div>

    <div className="flex items-center w-full">
      <h2 className="text-3xl font-bold text-purple-300 audiowide-regular">
        Estadísticas del Jugador
      </h2>
      <div className="flex ml-auto gap-x-2">
      <button
        onClick={() => navigate("/rankings")}
        className="bg-purple-300 hover:bg-purple-400 text-black px-4 py-2 rounded"
      >
        Ver Ranking
      </button>
      <button
        onClick={() => navigate("/menuInicioJuegos")}
        className="bg-purple-300 hover:bg-purple-400 text-black px-4 py-2 rounded  me-30"
      >
        Volver atrás
      </button>
    </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="bg-gray-900 p-6 rounded-xl shadow">
        <h3 className="text-xl font-semibold mb-2">Resumen</h3>
        <p>
          <strong>Total puntos:</strong> {estadisticas.totalPuntos}
        </p>
        <p>
          <strong>Precisión global:</strong>{" "}
          {estadisticas.precisionGlobal?.toFixed(2) ?? 0}%
        </p>
        <p>
          <strong>Centro de clics:</strong>{" "}
          {estadisticas.centroClicks?.toFixed(2) ?? 0}%
        </p>
        <p>
          <strong>Tiempo promedio de reacción:</strong>{" "}
          {estadisticas.tiempoPromedioReaccion ?? 0}ms
        </p>
        <p>
          <strong>Aciertos por segundo:</strong>{" "}
          {estadisticas.aciertosPorSegundo?.toFixed(2) ?? 0}
        </p>
        <p>
          <strong>Racha máxima:</strong> {estadisticas.maxRachaAciertos ?? 0}
        </p>
        <p>
          <strong>Sesiones jugadas:</strong> {estadisticas.sesionesJugadas ?? 0}
        </p>
        <p>
          <strong>Estilo dominante:</strong>{" "}
          {estadisticas.estiloDominante ?? "No determinado"}
        </p>
        <p>
          <strong>Racha actual:</strong> {estadisticas.rachaActual ?? 0}
        </p>
      </div>

      <div className="bg-gray-900 p-6 rounded-xl shadow">
        <h3 className="text-xl font-semibold mb-4">Radar de Habilidades</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="habilidad" tick={{ fill: "#fff" }} />
              <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: "#ccc" }} />
              <Radar
                name="Jugador"
                dataKey="valor"
                stroke="#06b6d4"
                fill="#06b6d4"
                fillOpacity={0.6}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

    <div className="bg-gray-900 p-6 rounded-xl shadow">
      <h3 className="text-xl font-semibold mb-2">Consejos personalizados</h3>
      <ul className="list-disc pl-5 space-y-1">
        {estadisticas.consejos?.map((c, i) => (
          <li key={i}>{c}</li>
        )) ?? <li>No hay consejos disponibles</li>}
      </ul>
    </div>

    <div className="bg-gray-900 p-6 rounded-xl shadow">
      <h3 className="text-xl font-semibold mb-2">Mapas más jugados</h3>
      <ul className="list-disc pl-5">
        {estadisticas.mapasJugados && estadisticas.mapasJugados.length > 0 ? (
          estadisticas.mapasJugados
            .sort((a, b) => b.vecesJugado - a.vecesJugado)
            .map(({ nombreMapa, vecesJugado }) => (
              <li key={nombreMapa} className="py-1">
                <span className="font-medium">{nombreMapa}</span> -{" "}
                <span className="text-purple-300 ml-1">
                  {vecesJugado} {vecesJugado === 1 ? "vez" : "veces"}
                </span>
              </li>
            ))
        ) : (
          <li className="text-gray-400">No hay mapas jugados</li>
        )}
      </ul>
    </div>

    <div className="bg-gray-900 p-6 rounded-xl shadow">
      <h3 className="text-xl font-semibold mb-2">Mejores mapas</h3>
      <ul className="list-disc pl-5">
        {estadisticas.mejoresMapas.length > 0 ? (
          estadisticas.mejoresMapas.map((nombre, idx) => (
            <li key={idx} className="text-green-400">
              {nombre}
            </li>
          ))
        ) : (
          <li className="text-gray-400">No hay suficientes datos</li>
        )}
      </ul>
    </div>

    <div className="bg-gray-900 p-6 rounded-xl shadow">
      <h3 className="text-xl font-semibold mb-2">Peores mapas</h3>
      <ul className="list-disc pl-5">
        {estadisticas.peoresMapas.length > 0 ? (
          estadisticas.peoresMapas.map((nombre, idx) => (
            <li key={idx} className="text-red-400">
              {nombre}
            </li>
          ))
        ) : (
          <li className="text-gray-400">No hay suficientes datos</li>
        )}
      </ul>
    </div>

    <div className="bg-gray-900 p-6 rounded-xl shadow">
      <h3 className="text-xl font-semibold mb-2">Historial de sesiones</h3>
      <ul className="space-y-2 max-h-[300px] overflow-y-auto">
        {estadisticas.historialSesiones
          ?.slice()
          .reverse()
          .map((sesion, idx) => (
            <li key={idx} className="text-sm text-gray-300">
              <span
                className={`font-bold mr-2 ${
                  sesion.resultado === "victoria"
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {sesion.resultado === "victoria" ? "Victoria" : "Derrota"}
              </span>
              <strong>
                {new Date(sesion.fecha).toLocaleString()}
              </strong>{" "}
              - {sesion.mapa} - {sesion.puntos} pts - {sesion.precision}% precisión
              - Racha: {sesion.rachaMax}
            </li>
          ))}
      </ul>
    </div>
  </div>
);

};

export default EstadisticasUsuario;
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

interface Mapa {
  _id: string;
  nombre: string;
  descripcion: string;
  dificultad: number;
  imagen: string;
  categoria: string;
}

const ElegirMapa = () => {
  const { categoria } = useParams();
  const navigate = useNavigate();
  const [mapas, setMapas] = useState<Mapa[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMapas = async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/mapas/categoria/${categoria}`);
        const data = await res.json();
        setMapas(data.mapas);
      } catch (error) {
        console.error("Error al obtener mapas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMapas();
  }, [categoria]);

  const seleccionarMapa = (mapaId: string) => {
    navigate(`/multiplayer/sala-espera/${mapaId}`);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-6 text-cyan-400">Elige un mapa</h2>
      {loading ? (
        <p className="text-gray-400">Cargando mapas...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
          {mapas.map((mapa) => (
            <div
              key={mapa._id}
              onClick={() => seleccionarMapa(mapa._id)}
              className="bg-gray-900 p-4 rounded-xl shadow hover:scale-105 transition-transform cursor-pointer"
            >
              <img
                src={mapa.imagen}
                alt={mapa.nombre}
                className="w-full h-40 object-cover rounded-md mb-2"
              />
              <h3 className="text-xl font-semibold text-cyan-300">{mapa.nombre}</h3>
              <p className="text-sm text-gray-400">{mapa.descripcion}</p>
              <p className="text-xs text-gray-500 mt-1">Dificultad: {mapa.dificultad}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ElegirMapa;

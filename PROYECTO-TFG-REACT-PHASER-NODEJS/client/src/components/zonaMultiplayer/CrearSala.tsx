import { useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../socket";

interface Mapa {
  _id: string;
  nombre: string;
  categoria: string;
  dificultad: number;
  descripcion: string;
  imagen: string;
}

const categorias = [
  {
    titulo: "Mixto",
    categoria: "MixedMode",
    descripcion: "Para poner a prueba todas tus habilidades",
  },
  {
    titulo: "Flicks",
    categoria: "FlicksMode",
    descripcion: "Practica los saltos de cámara",
  },
  {
    titulo: "Tracking",
    categoria: "TrackerMode",
    descripcion: "Pon en el punto de mira a tu rival",
  },
  {
    titulo: "Reflejos",
    categoria: "ReflexedMode",
    descripcion: "Ponte a prueba con el modo más ágil",
  },
];

const CrearSala = () => {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);
  const [mapas, setMapas] = useState<Mapa[]>([]);
  const [usuario, setUsuario] = useState("");
  const [mapaSeleccionado, setMapaSeleccionado] = useState<Mapa | null>(null);
  const navigate = useNavigate();

  const seleccionarCategoria = async (cat: string) => {
    setCategoriaSeleccionada(cat);
    setMapaSeleccionado(null);
    try {
      const res = await fetch(`http://localhost:3001/api/mapas/categoria/${cat}`);
      const data = await res.json();
      setMapas(data.mapas);
    } catch (error) {
      console.error("Error cargando mapas:", error);
    }
  };

  const crearSala = () => {
  if (!usuario || !categoriaSeleccionada || !mapaSeleccionado) return;

  const mapaSimple = {
    _id: mapaSeleccionado._id,
    nombre: mapaSeleccionado.nombre,
    descripcion: mapaSeleccionado.descripcion,
    imagen: mapaSeleccionado.imagen,
  };

  socket.emit("crearSala", {
    nombre: usuario,
    mapa: mapaSimple,
  });

  socket.once("actualizarSala", (sala) => {
  navigate(`/sala-espera/${sala.id}`, { 
    state: { 
      sala: {
        ...sala,
        soyAnfitrion: true 
      }, 
      nombre: usuario 
    } 
  });
});
};

  return (
    <div className="w-screen min-h-screen relative flex flex-col justify-center bg-gray-950 gap-4 ">
      <div className="w-5/6 mx-auto">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
            <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-purple-600 blur-3xl opacity-20 pointer-events-none"></div>
            <div className="absolute top-3/4 left-1/12 w-38 h-38 rounded-full bg-cyan-600 blur-3xl opacity-20 pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-cyan-500 blur-3xl opacity-20 pointer-events-none"></div>
          </div>
      <h2 className="text-4xl font-bold mb-8 text-purple-300 audiowide-regular">
      Crea tu sala
    </h2>

      <input
        type="text"
        placeholder="Nombre del jugador"
        value={usuario}
        onChange={(e) => setUsuario(e.target.value)}
        className=" p-2 rounded-md text-white bg-gray-700 placeholder-gray-400 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-300 mb-6"

      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {categorias.map((cat) => (
          <button
            key={cat.categoria}
            onClick={() => seleccionarCategoria(cat.categoria)}
            className={`p-4 rounded-lg transition font-semibold ${
              categoriaSeleccionada === cat.categoria
                ? "bg-purple-600"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            <h3 className="text-lg text-white">{cat.titulo}</h3>
            <p className="text-sm text-gray-300">{cat.descripcion}</p>
          </button>
        ))}
      </div>

      {categoriaSeleccionada && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {mapas.map((mapa) => (
            <div
              key={mapa._id}
              className={`bg-gray-800 p-4 rounded-lg hover:scale-105 transition cursor-pointer ${
                mapaSeleccionado?._id === mapa._id ? "ring-2 ring-purple-400" : ""
              }`}
              onClick={() => setMapaSeleccionado(mapa)}
            >
              <img src={mapa.imagen} alt={mapa.nombre} className="w-full h-40 object-contain rounded" />
              <h4 className="text-lg font-bold text-white mt-2">{mapa.nombre}</h4>
              <p className="text-sm text-gray-400">{mapa.descripcion}</p>
            </div>
          ))}
        </div>
      )}

      {usuario && categoriaSeleccionada && mapaSeleccionado && (
        <button
          onClick={crearSala}
          className="bg-purple-500 text-white px-6 py-3 rounded font-semibold hover:bg-purple-700 transition"
        >
          Crear Sala
        </button>
      )}
      </div>
      <button
        onClick={() => navigate("/multiplayer")}
        className="fixed self-start bottom-10 ml-15 px-3 py-2 bg-cyan-200/10 hover:bg-cyan-100/20 text-white font-bold rounded"
      >
        Volver atrás
      </button>
          
    </div>
  );
};

export default CrearSala;

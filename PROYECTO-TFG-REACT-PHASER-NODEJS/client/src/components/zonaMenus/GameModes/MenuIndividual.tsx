import { useNavigate } from "react-router-dom";
import { useState } from "react";
import '../ScreenInicio.css'

interface MapaRecomendado {
  _id: string;
  nombre: string;
  categoria: string;
  dificultad: number;
  descripcion: string;
  imagen: string;
}


const modos = [
  {
    titulo: "MIXTO",
    categoria: "MixedMode",
    descripcion: "Para poner a prueba todas tus habilidades",
    imagen: "/img/pipa.jpg",
  },
  {
    titulo: "FLICKS",
    categoria: "FlicksMode",
    descripcion: "Practica los saltos de cámara",
    imagen: "/img/minigun.png",
  },
  {
    titulo: "TRACKING",
    categoria: "TrackerMode",
    descripcion: "Pon en el punto de mira a tu rival",
    imagen: "/img/lanzagranadas.jpg",
  },
  {
    titulo: "REFLEJOS",
    categoria: "ReflexedMode",
    descripcion: "Ponte a prueba con el modo más ágil",
    imagen: "/img/escopeta.png",
  },
];

const MenuIndividual = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [recomendaciones, setRecomendaciones] = useState([]);
  const [cargando, setCargando] = useState(false);


  const pedirRecomendaciones = async () => {
  setCargando(true);
  try {
    const res = await fetch("http://localhost:3001/api/ia/recomendar-mapas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    const data = await res.json();
    setRecomendaciones(data.resultados || []);
  } catch (error) {
    console.error("Error al pedir recomendaciones:", error);
  } finally {
    setCargando(false);
  }
};


 return (
  <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4 relative">

    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-purple-600 blur-3xl opacity-20 pointer-events-none"></div>
      <div className="absolute top-3/4 left-1/12 w-38 h-38 rounded-full bg-cyan-600 blur-3xl opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-cyan-500 blur-3xl opacity-20 pointer-events-none"></div>
    </div>

    <h2 className="text-4xl font-bold mb-8 text-purple-300 audiowide-regular">Elige un modo</h2>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl w-full mb-12">
      {modos.map((modo, index) => (
        <div
          key={index}
          onClick={() =>
            navigate(`/individual/${modo.categoria}`, {
              state: { modoJuego: modo.categoria },
            })
          }
          className="relative bg-gray-950 rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer bg-cover bg-center h-117 border border-purple-300"
          style={{ backgroundImage: `url('${modo.imagen}')` }}
        >
          <div className="absolute bottom-0 left-0 w-full bg-transparent p-4">
            <h3 className="text-2xl font-semibold text-purple-300 audiowide-regular">{modo.titulo}</h3>
            <p className="text-sm text-gray-400">{modo.descripcion}</p>
          </div>
        </div>
      ))}
    </div>
    <button
        onClick={() => navigate("/menuInicioJuegos")}
        className="fixed self-start bottom-10 ml-15 px-3 py-2 bg-cyan-200/10 hover:bg-cyan-100/20 text-white font-bold rounded"
      >
        Volver atrás
      </button>

    <div className="w-full max-w-xl text-left mt-6 z-10">
      <h3 className="text-2xl font-bold mb-4 text-purple-300 audiowide-regular">¿Qué quieres mejorar?</h3>
      
      <div className="flex items-center">
        <input
          type="text"
          placeholder="Ej: mejorar puntería, reflejos rápidos..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="flex-grow p-3 rounded-md text-white bg-gray-700 placeholder-gray-400 border border-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-300"
        />
        <button
          onClick={pedirRecomendaciones}
          disabled={cargando || !prompt.trim()}
          className={`flex items-center justify-center gap-2 ml-2 ${
            cargando ? "bg-purple-300 cursor-not-allowed" : "bg-purple-300 hover:bg-purple-400"
          } text-black px-6 py-3 rounded-md transition`}
        >
          {cargando && (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          )}
          {cargando ? "Buscando..." : "Buscar mapas"}
        </button>
      </div>

      {recomendaciones.length > 0 && (
        <div className="mt-6 text-left">
          <h4 className="text-xl font-semibold mb-2 text-purple-300">Recomendaciones:</h4>
          <div className="space-y-4">
            {recomendaciones.map((mapa: MapaRecomendado) => (
              <div
                key={mapa._id}
                className="bg-gray-800 p-4 rounded-lg hover:scale-105 transition cursor-pointer"
                onClick={() => navigate(`/individual/${mapa.categoria}`)}
              >
                <img
                  src={mapa.imagen}
                  alt={mapa.nombre}
                  className="w-full h-40 object-cover rounded-md mb-3"
                />
                <h5 className="text-lg font-bold text-white">{mapa.nombre}</h5>
                <p className="text-sm text-gray-400">Categoría: {mapa.categoria}</p>
                <p className="text-sm text-gray-400">Dificultad: {mapa.dificultad}</p>
                <p className="text-sm text-gray-300 mt-1">{mapa.descripcion}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

};

export default MenuIndividual;

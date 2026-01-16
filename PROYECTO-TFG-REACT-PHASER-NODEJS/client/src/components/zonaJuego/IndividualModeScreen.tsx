import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

interface Mapa {
  _id: string;
  nombre: string;
  imagen: string;
  gif: string;
  audio: string;
  dificultad: number;
}

const IndividualModeScreen = () => {
  const { mode } = useParams();

  const [mapas, setMaps] = useState<Mapa[]>([]);
  const [mapasCompletados, setMapasCompletados] = useState<string[]>([]);
  const [dificultadActiva, setDificultadActiva] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
    try {
      const mapasRes = await axios.get(`http://localhost:3001/api/mapas/${mode}`);
      setMaps(mapasRes.data);

      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

       if (mode) {
        localStorage.setItem("modoJuego", mode);
      }

      if (userId && token) {
        const userRes = await axios.get(`http://localhost:3001/api/usuario/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const completados = userRes.data.completados || [];
        setMapasCompletados(completados); 
      }
    } catch (error) {
      console.error(error);
    }
  };

  fetchData();
}, [mode]);

  const mapasPorDificultad: Record<number, Mapa[]> = {};
  mapas.forEach((mapa) => {
    const dificultad = mapa.dificultad;
    if (!mapasPorDificultad[dificultad]) {
      mapasPorDificultad[dificultad] = [];
    }
    mapasPorDificultad[dificultad].push(mapa);
  });

  const dificultades = [1, 2, 3, 4, 5, 6, 7];

  // Colores para cada dificultad
  const coloresDificultad :  Record<number,string> = {
    1: 'bg-pink-500',
    2: 'bg-fuchsia-500',
    3: 'bg-purple-500',
    4: 'bg-violet-500',
    5: 'bg-indigo-500',
    6: 'bg-cyan-500',
    7: 'bg-teal-400'
  };

  const bordesDificultad :  Record<number,string> = {
    1: 'border-pink-700',
    2: 'border-fuchsia-700',
    3: 'border-purple-700',
    4: 'border-violet-700',
    5: 'border-indigo-700',
    6: 'border-cyan-700',
    7: 'border-teal-600'
  };

  const toggleDificultad = (nivel: number) => {
    setDificultadActiva(dificultadActiva === nivel ? null : nivel);
  };

  return (
    <div className="min-h-screen bg-gray-950 p-8 pl-0">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-purple-600 blur-3xl opacity-20 pointer-events-none"></div>
        <div className="absolute top-3/4 left-1/12 w-38 h-38 rounded-full bg-cyan-600 blur-3xl opacity-20 pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-cyan-500 blur-3xl opacity-20 pointer-events-none"></div>
      </div>
      <div className="space-y-2"> 
        {dificultades.map((nivel) => (
          mapasPorDificultad[nivel]?.length > 0 && (
            <div key={nivel} className="relative">
             
              <div 
                className={`flex items-center cursor-pointer transition-all duration-300 w-150
                  ${coloresDificultad[nivel]} 
                  ${bordesDificultad[nivel]} 
                  border-l-4 pl-4 pr-6 py-3 rounded-r-lg 
                  shadow-lg backdrop-blur-sm 
                  hover:w-165 hover:z-10 transform hover:scale-x-[1.0] hover:scale-y-[1.05]`}
                onClick={() => toggleDificultad(nivel)}
              >
                <span className="text-white font-bold text-lg mr-3">Dificultad {nivel}</span>
                <div className="flex space-x-2">
                  {Array.from({ length: 7 }, (_, i) => (
                    <span
                      key={i}
                      className={`block w-4 h-4 rounded-full ${i < nivel ? 'bg-white' : 'bg-gray-300/50'}`}
                    />
                  ))}
                </div>

                <span className="ml-auto text-white/80">
                  {dificultadActiva === nivel ? '▼' : '▶'}
                </span>
              </div>

              {dificultadActiva === nivel && (
                <div className="mt-4 ml-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 animate-fade-in">
                  {mapasPorDificultad[nivel].map((mapa) => (
                    <div
                      key={mapa._id}
                      className="group relative cursor-pointer transition-all duration-300 hover:scale-105"
                    >

                      <div className="relative overflow-hidden rounded-lg w-60 h-40" 
                      onClick={() => {
                            console.log("click");
                            
                          }}
                        >
                        <img
                          src={mapa.imagen}
                          alt={mapa.nombre}
                          className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-0"
                        />
                        <video
                          src={mapa.gif}
                          loop={true}
                          autoPlay={true}
                          onMouseEnter={(e) => {
                            e.currentTarget.currentTime = 0;
                            e.currentTarget.play();
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.pause();
                          }}
                          className="w-full h-full object-cover absolute top-0 left-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        />
                        <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                      
                      <h3 className="mt-2 text-left text-white font-medium text-sm md:text-base truncate flex items-center gap-2">
                        {mapa.nombre}
                        {mapasCompletados.includes(mapa._id) && (
                          <span title="Completado">✅</span>
                        )}
                      </h3>
                      <button
                          onClick={() => {
                            localStorage.setItem("mapaSeleccionado", JSON.stringify(mapa));
                            navigate("/jugar");
     
                          }}
                          className="mt-2 px-4 py-1 bg-cyan-500 text-black rounded hover:bg-cyan-600"
                        >
                          Jugar
                      </button>
                      {/* <audio 
                        id={`audio-${mapa._id}`} 
                        src={mapa.audio}
                        preload="none"
                      /> */}
                      
                      {/* <div
                        className="absolute inset-0"
                        onMouseEnter={() => {
                          const audio = document.getElementById(`audio-${mapa._id}`) as HTMLAudioElement;
                          audio.currentTime = 0;
                          audio.play();
                        }}
                        onMouseLeave={() => {
                          (document.getElementById(`audio-${mapa._id}`) as HTMLAudioElement)?.pause();
                        }}
                      /> */}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        ))}
      </div>
          <button
        onClick={() => navigate("/individual")}
        className="fixed right-10 bottom-10 px-3 py-2 bg-cyan-200/10 hover:bg-cyan-100/20 text-white font-bold rounded"
      >
        Volver a modos de juego
      </button>
    </div>
  );
};

export default IndividualModeScreen;
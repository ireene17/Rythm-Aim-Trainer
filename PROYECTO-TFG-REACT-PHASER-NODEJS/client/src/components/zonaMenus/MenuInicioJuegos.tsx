import React from "react";
import { useNavigate } from "react-router-dom";

const MenuInicioJuegos: React.FC = () => {
    const navigate = useNavigate();

  return (
  <div className="w-screen min-h-screen relative flex flex-col items-center justify-center bg-gray-950 gap-4">
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-purple-600 blur-3xl opacity-20"></div>
      <div className="absolute top-3/4 left-1/12 w-38 h-38 rounded-full bg-cyan-600 blur-3xl opacity-20"></div>
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-cyan-500 blur-3xl opacity-20"></div>
    </div>

    <div className="relative z-10 flex flex-col items-center justify-center transform -translate-y-16 w-full px-4 sm:px-6 md:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl w-full">
        <div
          className="relative bg-gray-950 rounded-xl shadow-lg overflow-hidden hover:scale-105 transition-transform h-64 sm:h-80 md:h-117 bg-cover bg-center border border-purple-300"
          onClick={() => navigate("/individual")}
          style={{
            backgroundImage: "url('/img/individualImg.png')",
          }}
        >
          <h3 className="absolute bottom-0 w-full text-center text-purple-400 bg-transparent py-2 text-2xl font-semibold audiowide-regular">
            Modo individual
          </h3>
        </div>

        <div
          className="relative bg-gray-950 rounded-xl shadow-lg overflow-hidden hover:scale-105 transition-transform h-64 sm:h-80 md:h-117 bg-cover bg-center border border-purple-300"
          onClick={() => navigate("/multiplayer")}
          style={{
            backgroundImage: "url('/img/multiImg.png')",
          }}
        >
          <h3 className="absolute bottom-0 w-full text-center text-purple-400 bg-transparent py-2 text-2xl font-semibold audiowide-regular">
            Modo Multijugador
          </h3>
        </div>

        <div
          className="relative bg-gray-950 rounded-xl shadow-lg overflow-hidden hover:scale-105 transition-transform h-64 sm:h-80 md:h-117 bg-cover bg-center border border-purple-300"
          onClick={() => navigate("/estadisticas")}
          style={{
            backgroundImage: "url('/img/rankingImg.png')",
          }}
        >
          <h3 className="absolute bottom-0 w-full text-center text-purple-400 bg-transparent py-2 text-2xl font-semibold audiowide-regular">
            Ranking y Estadísticas
          </h3>
        </div>
      </div>
    </div>

    <button
      onClick={() => navigate("/menuInicio")}
      className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-10 md:left-10 px-3 py-2 bg-cyan-200/10 hover:bg-cyan-100/20 text-white font-bold rounded"
    >
      Volver atrás
    </button>
  </div>
);

};

export default MenuInicioJuegos;

import React from "react";
import { useNavigate } from "react-router-dom";

const MenuPrincipal: React.FC = () => {
    const navigate = useNavigate();

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center bg-gray-950 gap-4">
  <div className="absolute inset-0 overflow-hidden">
    <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
    <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-purple-600 blur-3xl opacity-20"></div>
    <div className="absolute top-3/4 left-1/12 w-38 h-38 rounded-full bg-cyan-600 blur-3xl opacity-20"></div>
    <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-cyan-500 blur-3xl opacity-20"></div>
  </div>

  <div className="relative z-10 flex flex-col items-center justify-center transform -translate-y-16">
    <div className="relative">
      <div className="absolute -inset-12 flex items-center justify-center pointer-events-none">
        <div className="relative w-[120%] h-[120%]">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/30 to-purple-500/30 blur-xl animate-wave-aura-1"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/20 to-purple-500/20 blur-lg animate-wave-aura-2"></div>
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/15 to-purple-500/15 blur-md animate-wave-aura-3"></div>
        </div>
      </div>

      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/30 to-purple-500/30 blur-xl animate-wave-aura-1"></div>
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/20 to-purple-500/20 blur-lg animate-wave-aura-2"></div>
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400/15 to-purple-500/15 blur-md animate-wave-aura-3"></div>

      <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full flex items-center justify-center backdrop-blur-sm">
        <div className="absolute inset-0 rounded-full bg-cyan-500 opacity-10 blur-sm"></div>

        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 z-20">
          <button
            onClick={() => navigate("/menuInicioJuegos")}
            className="bg-cyan-200/20 hover:bg-cyan-200/30 text-gray-900 font-bold py-2 px-8 rounded-full w-60"
          >
            MODOS DE JUEGO
          </button>
          <button
            onClick={() => navigate("/perfilUsuario")}
            className="bg-cyan-200/20 hover:bg-cyan-200/30 text-gray-900 font-bold py-2 px-8 rounded-full w-60"
          >
            CONFIGURACION
          </button>
          <button
            onClick={() => navigate("/login")}
            className="bg-cyan-200/20 hover:bg-cyan-200/30 text-gray-900 font-bold py-2 px-8 rounded-full w-60"
          >
            REGISTRO / LOGIN
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

  );
};

export default MenuPrincipal;

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import './ScreenInicio.css'



const ScreenInicio = () => {
  const [showButton, setShowButton] = useState(false);

  const navigate = useNavigate();

  const handleClickJugar = () => {
    navigate("/menuInicio");
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButton(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);


  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gray-950 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-purple-600 blur-3xl opacity-20"></div>
        <div className="absolute top-3/4 left-1/12 w-38 h-38 rounded-full bg-cyan-600 blur-3xl opacity-20"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-cyan-500 blur-3xl opacity-20"></div>
        
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center">
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
          <div className="relative w-64 h-64 md:w-80 md:h-80 rounded-full  flex items-center justify-center backdrop-blur-sm">
            <div className="absolute inset-0 rounded-full bg-cyan-500 opacity-10 blur-sm"></div>
            <h1 className="text-4xl md:text-5xl font-bold text-center bg-clip-text text-gray-900 bg-gradient-to-r from-cyan-400 to-purple-500 audiowide-regular">
              Rythm Aim Trainer
            </h1>
          </div>
        </div>

        <div className="h-24 mt-8 flex items-center justify-center">
          {showButton && (
            <button 
            onClick={handleClickJugar}
            className="px-12 inter-700 py-3 bg-transparent border-1 border-gray-900 text-gray-900 text-xl font-semibold rounded-full hover:bg-cyan-400/10 hover:text-gray-900 transition-all duration-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 relative overflow-hidden group animate-fade-in">
              <span className="relative z-10">JUGAR</span>
              <span className="absolute inset-0 bg-gradient-to-r from-cyan-400/40 to-purple-500/40 opacity-40 group-hover:opacity-90 transition-opacity duration-300"></span>
              <span className="absolute top-0 left-0 w-full h-full overflow-hidden">
                <span className="absolute top-0 left-0 w-4 h-full bg-white opacity-0 group-hover:animate-shine"></span>
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScreenInicio;
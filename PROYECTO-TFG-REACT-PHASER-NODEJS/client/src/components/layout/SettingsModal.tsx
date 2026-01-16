import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  visible: boolean;
  onClose: () => void;
}

const SettingsModal = ({ visible, onClose }: Props) => {
  const navigate = useNavigate();
  const [showAjustes, setShowAjustes] = useState(false);
  
  const ajustes = JSON.parse(localStorage.getItem("ajustesJuego") || "{}");

const [volumen, setVolumen] = useState<number>(() => ajustes.volumen ?? 1);


  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showAjustes) {
          setShowAjustes(false);
        } else {
          onClose();
        }
      }
    };
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [onClose, showAjustes]);

  useEffect(() => {
    localStorage.setItem(
      "ajustesJuego",
      JSON.stringify({ volumen })
    );
    window.dispatchEvent(new Event("storage")); 
  }, [volumen]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-transparent bg-opacity-60 flex items-center justify-center z-50">

      <div className="bg-gray-900 p-6 rounded-lg w-80 text-white space-y-4 relative">
        <h2 className="text-xl font-bold text-cyan-400 text-center audiowide-regular">Ajustes rápidos</h2>

        <button
          onClick={() => { navigate("/login"); onClose(); }}
          className="w-full bg-cyan-500 hover:bg-cyan-600 py-2 rounded text-black font-semibold"
        >
          Iniciar sesión
        </button>

        <button
          onClick={() => { navigate("/perfilUsuario"); onClose(); }}
          className="w-full bg-cyan-500 hover:bg-cyan-600 py-2 rounded text-black font-semibold"
        >
          Configurar cuenta
        </button>

        <button
          onClick={() => setShowAjustes(true)}
          className="w-full bg-cyan-500 hover:bg-cyan-600 py-2 rounded text-black font-semibold"
        >
          Ajustes generales
        </button>

        <button
          onClick={() => { navigate("/menuInicio"); onClose(); }}
          className="w-full bg-cyan-500 hover:bg-cyan-600 py-2 rounded text-black font-semibold"
        >
          Volver al inicio
        </button>

        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-white text-xl hover:text-red-400"
        >
          ×
        </button>
      </div>

      {showAjustes && (
        <div className="absolute bg-gray-800 p-17 rounded-lg w-80 text-white space-y-7 z-60 shadow-xl">
          <h3 className="text-lg font-semibold text-center text-cyan-300 audiowide-regular">Ajustes de juego</h3>

          <div>
            <label className="block mb-1">Volumen: {Math.round(volumen * 100)}%</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volumen}
              onChange={(e) => setVolumen(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <button
            onClick={() => setShowAjustes(false)}
            className="w-full bg-cyan-500 hover:bg-cyan-600 py-2 rounded text-black font-semibold mt-2"
          >
            Volver
          </button>
        </div>
      )}
    </div>
  );
};

export default SettingsModal;

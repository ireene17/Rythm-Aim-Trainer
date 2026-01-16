import { useState } from "react";
import { useNavigate } from "react-router-dom";
import socket from "../../socket";

const UnirseASala = () => {
  const [nombre, setNombre] = useState("");
  const [codigoSala, setCodigoSala] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleUnirse = () => {
    const codigo = codigoSala.trim();
    if (!nombre || !codigo) {
      setError("Debes introducir tu nombre y el código de la sala");
      return;
    }

    socket.once("error", (msg: string) => {
      setError(msg || "No se pudo unir a la sala");
    });

    socket.once("actualizarSala", (sala) => {
        localStorage.setItem("nombreUsuario", nombre);
      navigate(`/sala-espera/${codigo}`, {
        state: {
          nombre: nombre,
          sala
        }
      });
    });

    socket.emit("unirseSala", {
      salaId: codigo,
      nombre
    });
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-purple-600 blur-3xl opacity-20 pointer-events-none"></div>
      <div className="absolute top-3/4 left-1/12 w-38 h-38 rounded-full bg-cyan-600 blur-3xl opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-cyan-500 blur-3xl opacity-20 pointer-events-none"></div>
    </div>
      <h2 className="text-4xl font-bold mb-8 text-purple-300 audiowide-regular">Unirse a una sala</h2>

      <input
        type="text"
        placeholder="Introduce tu nombre de partida"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        className="w-1/2 p-3 rounded-md text-white bg-gray-700 placeholder-gray-400 border border-gray-500  focus:ring-2 focus:ring-purple-300 mb-4"
      />

      <input
        type="text"
        placeholder="Código de sala (ej: A1B2C3D)"
        value={codigoSala}
        onChange={(e) => setCodigoSala(e.target.value)}
        className="w-1/2 p-3 rounded-md text-white bg-gray-700 placeholder-gray-400 border border-gray-500  focus:ring-2 focus:ring-purple-300 mb-4"

      />

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <button
        onClick={handleUnirse}
        className="bg-purple-500 hover:bg-purple-600 px-6 py-3 rounded"
      >
        Unirse
      </button>
         
        <button
        onClick={() => navigate("/multiplayer")}
        className="fixed self-start bottom-10 ml-15 px-3 py-2 bg-cyan-200/10 hover:bg-cyan-100/20 text-white font-bold rounded"
      >
        Volver atrás
      </button>
    </div>
    
  );
};

export default UnirseASala;

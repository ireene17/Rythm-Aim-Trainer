import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import socket from "../../socket";

interface Jugador {
  id: string;
  nombre: string;
  puntuacion?: number;
  esAnfitrion: boolean;
}

interface Mensaje {
  usuario: string;
  texto: string;
}

interface Sala {
  id: string;
  jugadores: Jugador[];
  chat: Mensaje[];
  mapa: {
    _id: string;
    nombre: string;
    descripcion: string;
    imagen: string;
  };
  anfitrionId: string;
  soyAnfitrion?: boolean;
}


const SalaEspera = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [jugadores, setJugadores] = useState<Jugador[]>(location.state?.sala?.jugadores || []);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [tiempoRestante, setTiempoRestante] = useState(300);
  const [anfitrion, setAnfitrion] = useState(location.state?.sala?.soyAnfitrion || false);
  const [mapa] = useState(location.state?.sala?.mapa);
  const [nombreUsuario] = useState(location.state?.nombre || localStorage.getItem("nombreUsuario"));
  const soyCreador = location.state?.sala !== undefined;

useEffect(() => {

  console.log("Estado anfitrion:", anfitrion);
  if (!soyCreador) {
    socket.emit("unirseSala", { salaId: id, nombre: nombreUsuario });
  }

  // socket.on("actualizarSala", (sala: Sala) => {
  //   setJugadores(sala.jugadores);
  //   setAnfitrion(sala.soyAnfitrion ?? false);
  // });

  socket.on("actualizarSala", (sala: Sala) => {
    setJugadores(sala.jugadores);
    setAnfitrion(socket.id === sala.anfitrionId); 
  });

  socket.on("nuevoMensaje", (mensaje: Mensaje) => {
    setMensajes((prev) => [...prev, mensaje]);
  });

  socket.on("iniciarPartida", async () => {
    console.log("iniciarPartida..."); 
    try {
    const response = await fetch(`http://localhost:3001/api/mapas/by-id/${mapa._id}`);
    if (!response.ok) throw new Error("Error al obtener el mapa");

    const mapaCompleto = await response.json();

    if (!mapaCompleto?.datosMapa?.targets) {
      console.error("Mapa incompleto o inválido");
      throw new Error("El mapa no tiene targets definidos");
    }

    localStorage.setItem("modoJuego", "multijugador");
    localStorage.setItem("mapaSeleccionado", JSON.stringify(mapaCompleto));
    localStorage.setItem("salaId", id!);

    navigate(`/partida/${id}`, {
      state: {
        mapa: mapaCompleto,
        salaId: id,
        esMultijugador: true
      }
    });
  } catch (err) {
    console.error("Error al cargar el mapa completo:", err);
  }
  });

  return () => {
    socket.emit("salirSala", id);
    socket.off("actualizarSala");
    socket.off("nuevoMensaje");
    socket.off("iniciarPartida");
  };
}, [id, nombreUsuario, navigate, soyCreador, mapa, anfitrion]);

  useEffect(() => {
    const intervalo = setInterval(() => {
      setTiempoRestante((prev) => {
        if (prev <= 1) {
          clearInterval(intervalo);
          if (anfitrion) socket.emit("iniciarPartida", id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalo);
  }, [anfitrion, id]);

  const enviarMensaje = () => {
    if (!nuevoMensaje.trim()) return;
    const mensaje: Mensaje = { usuario: nombreUsuario, texto: nuevoMensaje };
    socket.emit("enviarMensaje", { salaId: id, mensaje });
    setNuevoMensaje("");
  };

  const llenarHuecos = () => {
    socket.emit("llenarHuecos", id);
  };

  const iniciarPartida = () => {
    socket.emit("iniciarPartida", id);
  };

  const formatearTiempo = (segundos: number) => {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${min}:${seg.toString().padStart(2, "0")}`;
  };

  return (
    <div className="p-4 text-white min-h-screen bg-gray-950 flex flex-col items-center">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-purple-600 blur-3xl opacity-20 pointer-events-none"></div>
      <div className="absolute top-3/4 left-1/12 w-38 h-38 rounded-full bg-cyan-600 blur-3xl opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-cyan-500 blur-3xl opacity-20 pointer-events-none"></div>
    </div>
    
      <h2 className="text-4xl font-bold mb-8 text-purple-300 audiowide-regular">Sala de espera</h2>
      <p className="mb-2">
        Mapa: <strong>{mapa?.nombre || "Cargando..."}</strong>
      </p>
      <p className="mb-4">
        Tiempo restante:{" "}
        <span className="text-purple-300">{formatearTiempo(tiempoRestante)}</span>
      </p>

      <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl">
        <div className="bg-gray-800 p-4 rounded">
          <h3 className="text-xl mb-2">Jugadores ({jugadores.length}/8)</h3>
          <ul className="space-y-1">
            {jugadores.map((j, i) => (
              <li key={j.id} className="text-gray-200">
                {i + 1}. {j.nombre}{" "}
                {j.esAnfitrion && (
                  <span className="text-yellow-400">(Anfitrión)</span>
                )}
              </li>
            ))}
          </ul>
          {jugadores.length < 8 && (
            <button
              onClick={llenarHuecos}
              className="mt-4 bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded"
            >
              Llenar huecos
            </button>
          )}
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <h3 className="text-xl mb-2">Chat</h3>
          <div className="h-40 overflow-y-auto bg-gray-900 p-2 rounded mb-2">
            {mensajes.map((msg, idx) => (
              <div key={idx}>
                <strong className="text-purple-300">{msg.usuario}:</strong>{" "}
                {msg.texto}
              </div>
            ))}
          </div>
          <div className="flex">
            <input
              type="text"
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              className="flex-1 p-2 rounded text-black mr-2 bg-white bg-opacity-50"
              placeholder="Escribe tu mensaje..."
            />
            <button
              onClick={enviarMensaje}
              className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded "
            >
              Enviar
            </button>
          </div>
        </div>
      </div>

      {anfitrion && (
        <button
          onClick={iniciarPartida}
          className="mt-8 bg-purple-500 hover:bg-purple-600 px-6 py-3 rounded text-lg"
        >
          Empezar partida
        </button>
      )}

      {anfitrion && id && (
  <div className="mt-6 bg-gray-800 p-4 rounded text-center">
    <p className="mb-2 text-cyan-300">
      Código de la sala: <strong className="text-white text-xl">{id}</strong>
    </p>
    <button
      onClick={() => {
        navigator.clipboard.writeText(id);
      }}
      className="bg-purple-500/30 hover:bg-purple-600/30 px-4 py-2 rounded text-sm"
    >
      Copiar código
    </button>
    <button
        onClick={() => navigate("/multiplayer")}
        className="fixed self-start bottom-3 ml-100 px-3 py-2 bg-cyan-200/10 hover:bg-cyan-100/20 text-white font-bold rounded"
      >
        Volver atrás
      </button>
  </div>
)}

    </div>
  );
};

export default SalaEspera;

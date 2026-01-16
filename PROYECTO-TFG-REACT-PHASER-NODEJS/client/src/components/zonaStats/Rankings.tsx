import { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";


interface Usuario {
  _id: string;
  userName: string;
  fotoPerfil: string;
  estadisticas: {
    totalPuntos: number;
  };
}

const Rankings = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
      const navigate = useNavigate();
  

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch('http://localhost:3001/api/usuario/ranking', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          console.error("Error al obtener el ranking. Código de estado:", res.status);
          return;
        }

        const data = await res.json();

        if (Array.isArray(data)) {
          setUsuarios(data);
        } else {
          console.error("La respuesta del ranking no es un array:", data);
        }
      } catch (error) {
        console.error('Error al obtener ranking:', error);
      }
    };

    fetchRanking();
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-purple-600 blur-3xl opacity-20 pointer-events-none"></div>
      <div className="absolute top-3/4 left-1/12 w-38 h-38 rounded-full bg-cyan-600 blur-3xl opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-cyan-500 blur-3xl opacity-20 pointer-events-none"></div>
    </div>
      <h1 className="text-4xl font-bold text-purple-300 mb-6 text-center audiowide-regular">Ranking Global</h1>
      <div className="max-w-3xl mx-auto">
        {usuarios.map((usuario, index) => (
          <div
            key={usuario._id}
            className="flex items-center bg-gray-800 p-4 rounded mb-3 shadow-md"
          >
            <span className="text-2xl font-bold w-10 text-center text-purple-300">
              {index + 1}
            </span>
            <img
              src={usuario.fotoPerfil || '/img/default-pfp.webp'}
              alt={usuario.userName}
              className="w-12 h-12 rounded-full mx-4"
            />
            <div className="flex flex-col">
              <span className="font-semibold">{usuario.userName}</span>
              <span className="text-sm text-gray-300">
                {usuario.estadisticas?.totalPuntos || 0} puntos
              </span>
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={() => navigate("/menuInicioJuegos")}
        className="fixed self-start bottom-10 ml-30 px-3 py-2 bg-cyan-200/10 hover:bg-cyan-100/20 text-white font-bold rounded"
      >
        Volver atrás
      </button>
    </div>
  );
};

export default Rankings;

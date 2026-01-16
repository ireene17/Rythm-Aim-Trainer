import { useNavigate } from "react-router-dom";

const modos = [
    {
      titulo: "UNIRSE A UNA SALA",
      imagen: "/img/unirseaSala.png",
      route: "/multiplayer/unirse"
    },
    {
      titulo: "CREAR UNA SALA",
      imagen: "/img/crearSala.png",
      route: "/multiplayer/crear"
    },
  ];
  
  const MenuIndividual = () => {
    const navigate = useNavigate();
  
  return (
  <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-4 relative">
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-purple-600 blur-3xl opacity-20 pointer-events-none"></div>
      <div className="absolute top-3/4 left-1/12 w-38 h-38 rounded-full bg-cyan-600 blur-3xl opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-cyan-500 blur-3xl opacity-20 pointer-events-none"></div>
    </div>

    <h2 className="text-4xl font-bold mb-8 text-purple-300 audiowide-regular">
      Elige un modo
    </h2>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 max-w-2xl w-full">
      {modos.map((modo, index) => (
        <div
          key={index}
          onClick={() => navigate(modo.route)}
          className="relative bg-gray-900 rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer bg-cover bg-center h-117"
          style={{ backgroundImage: `url('${modo.imagen}')` }}
        >
          <div className="absolute bottom-0 left-0 w-full bg-transparent p-4">
            <h3 className="text-2xl font-semibold text-purple-300 audiowide-regular">
              {modo.titulo}
            </h3>
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
  </div>
);

  };
  
  export default MenuIndividual;
  
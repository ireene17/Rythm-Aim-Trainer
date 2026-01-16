import { useEffect, useState } from "react";

const AjustesGenerales = () => {
  const [volumen, setVolumen] = useState(1);
  const [sensibilidad, setSensibilidad] = useState(1);
  const [invertirY, setInvertirY] = useState(false);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("ajustesJuego") || "{}");
    if (saved) {
      setVolumen(saved.volumen ?? 1);
      setSensibilidad(saved.sensibilidad ?? 1);
      setInvertirY(saved.invertirY ?? false);
    }
  }, []);

  const guardarAjustes = () => {
    localStorage.setItem(
      "ajustesJuego",
      JSON.stringify({ volumen, sensibilidad, invertirY })
    );
    alert("Ajustes guardados");
  };

  const restablecer = () => {
    setVolumen(1);
    setSensibilidad(1);
    setInvertirY(false);
    localStorage.removeItem("ajustesJuego");
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      <h1 className="text-3xl font-bold text-cyan-400">Ajustes Generales</h1>

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

      <div>
        <label className="block mb-1">Sensibilidad: {sensibilidad.toFixed(2)}</label>
        <input
          type="range"
          min="0.5"
          max="2"
          step="0.01"
          value={sensibilidad}
          onChange={(e) => setSensibilidad(parseFloat(e.target.value))}
          className="w-full"
        />
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={invertirY}
            onChange={(e) => setInvertirY(e.target.checked)}
            className="mr-2"
          />
          Invertir eje Y
        </label>
      </div>

      <div className="flex gap-4">
        <button
          onClick={guardarAjustes}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
        >
          Guardar
        </button>

        <button
          onClick={restablecer}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
        >
          Restablecer
        </button>
      </div>
    </div>
  );
};

export default AjustesGenerales;

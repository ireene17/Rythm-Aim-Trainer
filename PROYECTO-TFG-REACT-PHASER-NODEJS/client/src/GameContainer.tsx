import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import JuegoScene from "./scenes/JuegoScene";
import JuegoReflejosScene from "./scenes/JuegoReflejosScene"; 
import JuegoTrackerScene from "./scenes/JuegoTrackerScene";
import JuegoMultiScene from "./scenes/JuegoMultiScene";


const GameContainer = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [gameKey, setGameKey] = useState<number>(0);

  const restartGame = () => {
    setGameKey((prevKey) => prevKey + 1);
  };

  useEffect(() => {
    const fetchMapa = async () => {
      const mapaStr = localStorage.getItem("mapaSeleccionado");
      const modoJuego = localStorage.getItem("modoJuego");
      
      if (!mapaStr) {
        console.error("No se encontró mapa en localStorage");
        return;
      }

      try {
        const mapaResumen = JSON.parse(mapaStr);
        let mapaCompleto = mapaResumen;

        if (modoJuego === "multijugador") {
          const res = await fetch(`http://localhost:3001/api/mapas/by-id/${mapaResumen._id}`);
          if (!res.ok) throw new Error("Error al cargar el mapa");
          mapaCompleto = await res.json();
        }

        if (!mapaCompleto?.datosMapa?.targets) {
          throw new Error("Mapa no tiene la estructura esperada");
        }

        let sceneToUse;
        switch (modoJuego) {
          case "multijugador":
            sceneToUse = JuegoMultiScene;
            break;
          case "ReflexedMode":
            sceneToUse = JuegoReflejosScene;
            break;
          case "TrackerMode":
            sceneToUse = JuegoTrackerScene;
            break;
          case "FlicksMode":
            sceneToUse = JuegoScene;
            break;
          default:
            sceneToUse = JuegoTrackerScene;
        }

        const config: Phaser.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          width: window.innerWidth,
          height: window.innerHeight,
          parent: "game-container",
          backgroundColor: "#333333",
          scene: [sceneToUse],
          scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
          },
          render: {
            pixelArt: false,
            antialias: true,
            
          },
          
        };

        if (gameRef.current) {
          gameRef.current.destroy(true);
        }

        const game = new Phaser.Game(config);
        game.registry.set("mapaActivo", mapaCompleto);
        game.events.on("restartGame", restartGame);
        gameRef.current = game;

        (window as unknown as Window).phaserGame = game;


      } catch (error) {
        console.error("Error al inicializar el juego:", error);
      }
    };

    fetchMapa();

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [gameKey]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div 
        id="game-container" 
        key={gameKey} 
        style={{ width: "100vw", height: "100vh" }} 
      />
    </div>
  );
};

export default GameContainer;
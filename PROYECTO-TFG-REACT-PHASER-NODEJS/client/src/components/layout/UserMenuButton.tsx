import { useState, useEffect } from "react";
import { FiSettings } from "react-icons/fi";
import SettingsModal from "./SettingsModal";
import Phaser from "phaser";

declare global {
  interface Window {
    phaserGame?: Phaser.Game;
  }
}

const pausePhaserGame = () => {
  const game = window.phaserGame;
  if (!game) return;

  const activeScene = game.scene.getScenes(true)[0]; 
  if (activeScene && activeScene.scene.isActive()) {
    activeScene.scene.pause();
    activeScene.sound?.pauseAll();
    console.log(`🎮 Juego pausado: ${activeScene.scene.key}`);
  }
};

const resumePhaserGame = () => {
  const game = window.phaserGame;
  if (!game) return;

  const pausedScene = game.scene.getScenes(false).find(s => s.scene.isPaused());
  if (pausedScene) {
    pausedScene.scene.resume();
    pausedScene.sound?.resumeAll();
    console.log(`🎮 Juego reanudado: ${pausedScene.scene.key}`);
  }
};


const UserMenuButton = () => {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (showModal) {
          resumePhaserGame();
          setShowModal(false);
        } else {
          setShowModal(true);
          pausePhaserGame();
        }
      }
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [showModal]);

  return (
    <>
      <div className="fixed top-4 right-6 z-50">
        <button
          onClick={() => {
            setShowModal(true);
            pausePhaserGame();
          }}
          className="text-white text-4xl hover:text-purple-300 transition"
        >
          <FiSettings />
        </button>
      </div>

      <SettingsModal
        visible={showModal}
        onClose={() => {
          resumePhaserGame();
          setShowModal(false);
        }}
      />
    </>
  );
};

export default UserMenuButton;

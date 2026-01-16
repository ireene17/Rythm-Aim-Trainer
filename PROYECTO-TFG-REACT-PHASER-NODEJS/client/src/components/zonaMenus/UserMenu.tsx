// src/components/layout/UserMenu.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const UserMenu = () => {
  const [visible, setVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="absolute top-4 right-6 z-50" ref={menuRef}>
      <button
        onClick={() => setVisible(!visible)}
        className="text-white text-2xl hover:text-cyan-400 transition"
      >
        SETTINGS
      </button>

      {visible && (
        <div className="mt-2 bg-gray-800 border border-gray-700 rounded shadow-md p-4 w-52 space-y-2">
          <button
            onClick={() => navigate("/login")}
            className="block w-full text-left text-white hover:text-cyan-400"
          >
            Iniciar sesión
          </button>
          <button
            onClick={() => navigate("/perfilUsuario")}
            className="block w-full text-left text-white hover:text-cyan-400"
          >
            Configurar cuenta
          </button>
          <button
            onClick={() => navigate("/ajustes")}
            className="block w-full text-left text-white hover:text-cyan-400"
          >
            Ajustes generales
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;

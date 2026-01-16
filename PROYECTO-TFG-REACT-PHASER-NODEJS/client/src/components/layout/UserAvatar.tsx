import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const UserAvatar = () => {
  const [fotoPerfil, setFotoPerfil] = useState<string>("/img/default-pfp.webp");
  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (userId && token) {
      fetch(`http://localhost:3001/api/usuario/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data.fotoPerfil) {
            setFotoPerfil(data.fotoPerfil);
          }
        })
        .catch(err => console.error("Error al obtener el perfil:", err));
    }
  }, []);

  const handleClick = () => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/perfilUsuario");
    } else {
      navigate("/login");
    }
  };

  return (
    <img
      src={fotoPerfil}
      alt="Perfil"
      onClick={handleClick}
      className="w-10 h-10 rounded-full border-2 border-purple-300 cursor-pointer hover:scale-105 transition-transform"
    />
  );
};

export default UserAvatar;


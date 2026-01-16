import { useState, useEffect } from "react";
import axios from "axios";

const PerfilUsuario = () => {

  const [perfil, setPerfil] = useState({
    fotoPerfil: "/img/defaultAvatar.png",
    panel: "/img/defaultPanel.png",
    descripcion: ""
  });


  const userId = localStorage.getItem("userId");
  useEffect(() => {
  const fetchPerfil = async () => {
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    if (!userId || !token) {
      console.warn("No hay sesión activa");
      return;
    }

    try {
      const response = await axios.get(`http://localhost:3001/api/usuario/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = response.data;
      setPerfil({
        fotoPerfil: data.fotoPerfil || "/img/default-pfp.webp",
        panel: data.panel || "/img/default-pfp.webp",
        descripcion: data.descripcion || ""
      });
    } catch (error) {
      console.error("Error al cargar perfil:", error);
    }
  };

  fetchPerfil();
}, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPerfil({ ...perfil, [e.target.name]: e.target.value });
  };

  

  const handleGuardar = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("No has iniciado sesión");
      return;
    }

    const response = await axios.put(
      `http://localhost:3001/api/usuario/${userId}`,
      {
        fotoPerfil: perfil.fotoPerfil,
        panel: perfil.panel,
        descripcion: perfil.descripcion
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    alert("Perfil actualizado con éxito");
    console.log("Respuesta:", response.data);
  } catch (err) {
    console.error("Error guardando perfil:", err);
    alert("Error al guardar cambios");
  }
};

const cloudName = import.meta.env.VITE_CLOUD_NAME;
const uploadPreset = import.meta.env.VITE_UPLOAD_PRESET;

const handleUploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData
    );

    const imageUrl = response.data.secure_url;
    setPerfil((prev) => ({ ...prev, fotoPerfil: imageUrl }));
  } catch (err) {
    console.error("Error al subir imagen:", err);
    alert("No se pudo subir la imagen");
  }
};
const handleUploadPanel = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      formData
    );

    const imageUrl = response.data.secure_url;
    setPerfil((prev) => ({ ...prev, panel: imageUrl }));
  } catch (err) {
    console.error("Error al subir imagen:", err);
    alert("No se pudo subir la imagen");
  }
};

const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
          window.location.href = "/"; 
        
};

 return (
  <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center p-8">
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
      <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-purple-600 blur-3xl opacity-20 pointer-events-none"></div>
      <div className="absolute top-3/4 left-1/12 w-38 h-38 rounded-full bg-cyan-600 blur-3xl opacity-20 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-cyan-500 blur-3xl opacity-20 pointer-events-none"></div>
    </div>

    <h2 className="text-3xl font-bold text-purple-300 audiowide-regular">Editar Perfil</h2>

    <div className="w-full max-w-2xl mt-6 relative">
      <div
        className="w-full h-32 rounded-lg bg-cover bg-center border-2 border-purple-300"
        style={{ backgroundImage: `url(${perfil.panel})` }}
      />

      <div className="absolute left-6 -bottom-16">
        <img
          src={perfil.fotoPerfil}
          alt="Perfil"
          className="w-32 h-32 rounded-full border-4 border-purple-300 object-cover"
        />
      </div>
    </div>

    <div className="h-16" />

    <div className="w-full max-w-2xl flex justify-between px-6">
      <div className="flex flex-col items-center space-y-2 mt-4">
        <label
          htmlFor="uploadFoto"
          className="cursor-pointer text-sm font-semibold hover:text-purple-300 "
        >
          Subir nueva foto de perfil
        </label>
        <input
          id="uploadFoto"
          type="file"
          accept="image/*"
          onChange={handleUploadFoto}
          className="hidden"
        />
      </div>

      <div className="flex flex-col items-center space-y-2 mt-4">
        <label
          htmlFor="uploadPanel"
          className="cursor-pointer text-sm font-semibold hover:text-purple-300"
        >
          Subir nuevo panel
        </label>
        <input
          id="uploadPanel"
          type="file"
          accept="image/*"
          onChange={handleUploadPanel}
          className="hidden"
        />
      </div>
    </div>

    <div className="mt-12 w-full max-w-2xl">
      <textarea
        name="descripcion"
        value={perfil.descripcion}
        onChange={handleChange}
        placeholder="Escribe tu descripción..."
        className="w-full p-3 rounded bg-gray-800 border border-gray-600 text-white resize-none h-28"
      />
    </div>

    <div className="flex space-x-4 mt-6 justify-center">
      <button
        onClick={handleGuardar}
        className="px-6 py-2 bg-purple-300 hover:bg-purple-400 text-black font-bold rounded"
      >
        Guardar cambios
      </button>

      <button
        onClick={handleLogout}
        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded"
      >
        Cerrar sesión
      </button>

      <button
        onClick={() => {
          window.location.href = "/menuInicio"; 
        }}
        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded"
      >
        Volver atrás
      </button>
    </div>
  </div>
);



};

export default PerfilUsuario;

import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const niveles = [ "facil", "intermedio", "avanzado" ];



const RegisterForm = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        userName: "",
        nombre: "",
        apellidos: "",
        email: "",
        password: "",
        telefono: "",
        pais: "",
        provincia: "",
        nivel: "facil"
    });

    const [errores, setErrores] = useState<{ [ key: string ]: string }>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  let mensaje = "";

  switch (name) {
    case "userName":
      if (!value.trim()) mensaje = "El nombre de usuario es obligatorio";
      break;
    case "email":
      if (!value.trim()) {
        mensaje = "El correo es obligatorio";
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        mensaje = "Correo no válido";
      }
      break;
    case "password":
      if (!value) {
        mensaje = "La password es obligatoria.";
      } else if (value.length < 6) {
        mensaje = "Mínimo 6 caracteres.";
      } else if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}$/.test(value)) {
        mensaje = "Debe tener mayúsculas, minúsculas, números y caracteres especiales";
      }
      break;
    case "telefono":
      if (value && !/^\d{7,15}$/.test(value)) mensaje = "Teléfono no válido";
      break;
    case "pais":
      if (!value.trim()) mensaje = "El país obligatorio";
      break;
  }

  setErrores((prev) => ({ ...prev, [name]: mensaje }));
};


    const validar = () => {
  const nuevosErrores: { [key: string]: string } = {};

  if (!formData.userName.trim()) nuevosErrores.userName = "El nombre de usuario es obligatorio";
 
  if (!formData.email.trim()) {
    nuevosErrores.email = "El correo es obligatorio";
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    nuevosErrores.email = "Correo no válido";
  }

  if (!formData.password) {
    nuevosErrores.password = "La password es obligatoria";
  } else if (formData.password.length < 6) {
    nuevosErrores.password = "Minimo 6 caracteres";
  } else if (!/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/.test(formData.password)) {
    nuevosErrores.password = "Formato incorrecto de pwd";
  }

  if (formData.telefono && !/^\d{7,15}$/.test(formData.telefono)) {
    nuevosErrores.telefono = "Teléfono no válido";
  }

  if (!formData.pais.trim()) nuevosErrores.pais = "El país es obligatorio";

  return nuevosErrores;
};


    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      const erroresValidados = validar();
      if (Object.keys(erroresValidados).length > 0) {
        setErrores(erroresValidados);
        return;
      }

      setErrores({});
      console.log("datos del registro.......", formData);

        //TODO API CONFIG
        axios.post("http://localhost:3001/api/auth/register", formData)
        .then(res => {
          alert("Usuario registrado con éxito!");
          console.log(res.data);
          navigate("/login");
        })
        .catch(err => {
          const mensaje = err.response?.data?.error || "Error al registrar";
          alert(mensaje);
        });
    }

    return(
      <div className="min-h-screen flex items-center justify-center bg-gray-950 text-white px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
            <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-purple-600 blur-3xl opacity-20 pointer-events-none"></div>
            <div className="absolute top-3/4 left-1/12 w-38 h-38 rounded-full bg-cyan-600 blur-3xl opacity-20 pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-cyan-500 blur-3xl opacity-20 pointer-events-none"></div>
      </div>
      <form onSubmit={handleSubmit} className="bg-gray-900 p-8 rounded-lg shadow-md w-full max-w-lg space-y-4">
        <h2 className="text-2xl font-bold mb-4 text-purple-300 audiowide-regular">Crear cuenta</h2>

        <input 
          name="userName" 
          type="text" placeholder="Nombre de usuario" 
          onChange={handleChange}
          onBlur={handleBlur} 
          className="w-full p-2 rounded bg-gray-800 focus:outline-none focus:ring-2 focus:ring-cyan-500" 
        />
          {errores.userName && 
            <p className="text-red-500 text-sm">{errores.userName}</p>
          }

        <div className="flex flex-col md:flex-row gap-4">
          <input 
            name="nombre" 
            type="text" 
            placeholder="Nombre" 
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full md:w-1/2 p-2 rounded bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500" 
          />

          <input 
            name="apellidos" 
            type="text" 
            placeholder="Apellidos" 
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full md:w-1/2 p-2 rounded bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500" 
          />
      </div>
       

        <input
          name="email"
          type="email"
          placeholder="Correo electrónico"
          onChange={handleChange}
          onBlur={handleBlur}
          className="w-full p-2 rounded bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        {errores.email && ( <p className="text-red-500 text-sm mt-1">{errores.email}</p> )}

        <input 
          name="password" 
          type="password" 
          placeholder="Password" 
          onChange={handleChange} 
          onBlur={handleBlur}
          className="w-full p-2 rounded bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        {errores.password && ( <p className="text-red-500 text-sm">{errores.password}</p> )}
        <input 
          name="telefono" 
          type="tel" 
          placeholder="Teléfono" 
          onChange={handleChange} 
          onBlur={handleBlur}
          className="w-full p-2 rounded bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500" 
        />
        {errores.telefono && <p className="text-red-500 text-sm">{errores.telefono}</p>}

        <div className="flex flex-col md:flex-row gap-4">
          <input 
            name="pais" 
            type="text" 
            placeholder="País" 
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full md:w-1/2 p-2 rounded bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <input 
            name="provincia" 
            type="text" 
            placeholder="Provincia" 
            onChange={handleChange}
            className="w-full md:w-1/2 p-2 rounded bg-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500" 
          />
        </div>
        {errores.pais && <p className="text-red-500 text-sm mt-1">{errores.pais}</p>}

        <select name="nivel" value={formData.nivel} onChange={handleChange} className="w-full p-2 rounded bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500">
          {niveles.map((nivel) => (
            <option key={nivel} value={nivel}>
              Nivel: {nivel.charAt(0).toUpperCase() + nivel.slice(1)}
            </option>
          ))}
        </select>

        <button type="submit" className="w-full bg-purple-300 hover:bg-purple-400 text-black font-bold py-2 px-4 rounded">
          Registrarse
        </button>
      </form>
    </div>
    )
}

export default RegisterForm;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [errores, setErrores] = useState<{ [key: string]: string }>({});
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let mensaje = "";

    if (!value.trim()) {
      mensaje = `El campo ${name} es obligatorio.`;
    } else if (name === "email" && !/\S+@\S+\.\S+/.test(value)) {
      mensaje = "Formato de correo no valido";
    }

    setErrores((prev) => ({ ...prev, [name]: mensaje }));
  };

  const validar = () => {
    const nuevosErrores: { [key: string]: string } = {};

    if (!formData.email.trim()) {
      nuevosErrores.email = "El correo es obligatorio";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      nuevosErrores.email = "Correo no válido";
    }

    if (!formData.password.trim()) {
      nuevosErrores.password = "La pwd es obligatoria";
    }

    return nuevosErrores;
  };

  const navigate = useNavigate();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const erroresValidados = validar();
    if (Object.keys(erroresValidados).length > 0) {
      setErrores(erroresValidados);
      return;
    }

    try {
      const response = await axios.post("http://localhost:3001/api/auth/login", {
        email: formData.email,
        password: formData.password
      });

      //const { token, usuario } = response.data;

      if (response.data.token && response.data.usuario) {
        console.log("Respuesta login:", response.data);
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("userId", response.data.usuario._id);
      navigate("/perfilUsuario");
      

} else {
  setLoginError("error del servidor");
}
      //localStorage.setItem("token", token);
      //alert(`Bienvenido, ${usuario.userName}`);
    } catch (err: unknown) {
  if (axios.isAxiosError(err)) {
    console.error("Error Axios:", err.response?.status, err.response?.data);
    const mensaje = err.response?.data?.error || "Error al iniciar sesión";
    setLoginError(mensaje);
  } else {
    console.error("Error desconocido:", err);
    setLoginError("Error inesperado");
  }
    }};

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white px-4 space-y-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none"></div>
            <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-purple-600 blur-3xl opacity-20 pointer-events-none"></div>
            <div className="absolute top-3/4 left-1/12 w-38 h-38 rounded-full bg-cyan-600 blur-3xl opacity-20 pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-cyan-500 blur-3xl opacity-20 pointer-events-none"></div>
      </div>
  <form
    onSubmit={handleSubmit}
    className="bg-gray-900 p-8 rounded-lg shadow-md w-full max-w-md space-y-4"
  >
    <h2 className="text-2xl font-bold text-purple-300 mb-4 audiowide-regular">Iniciar sesión</h2>

    <input
      name="email"
      type="email"
      placeholder="Correo electrónico"
      onChange={handleChange}
      onBlur={handleBlur}
      className={`w-full p-2 rounded bg-gray-800 border ${
        errores.email ? "border-red-500" : "border-white"
      } focus:outline-none focus:ring-2 focus:ring-purple-500`}
    />
    {errores.email && <p className="text-red-500 text-sm">{errores.email}</p>}

    <input
      name="password"
      type="password"
      placeholder="Contraseña"
      onChange={handleChange}
      onBlur={handleBlur}
      className={`w-full p-2 rounded bg-gray-800 border ${
        errores.password ? "border-red-500" : "border-white"
      } focus:outline-none focus:ring-2 focus:ring-purple-500`}
    />
    {errores.password && <p className="text-red-500 text-sm">{errores.password}</p>}

    {loginError && <p className="text-red-400 text-sm">{loginError}</p>}

    <button
      type="submit"
      className="w-full bg-purple-300 hover:bg-purple-400 text-black font-bold py-2 px-4 rounded"
    >
      Entrar
    </button>
  </form>

  <button
    onClick={() => navigate("/registro")}
    className="w-full max-w-md bg-purple-300 hover:bg-purple-400 text-black font-bold py-2 px-4 rounded"
  >
    Registro
  </button>
</div>

  );
};

export default LoginForm;

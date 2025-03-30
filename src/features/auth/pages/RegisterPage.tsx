import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@shared/contexts/AuthContext";

interface RegisterError {
  message?: string;
  code?: string;
  details?: string;
  [key: string]: unknown;
}

export const RegisterPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);

    try {
      // Store fullName in localStorage for now since the signUp function doesn't support it
      localStorage.setItem("userFullName", fullName);

      const { error } = await signUp(email, password);

      if (error) {
        setError(error.message);
      } else {
        // Mensaje de éxito indicando que necesita confirmar email
        setError(""); // Limpiar cualquier error previo
        // Crear una nueva div para mostrar mensajes de éxito
        setSuccessMessage(`¡Registro exitoso! Te hemos enviado un correo de confirmación a ${email}. 
          Por favor, revisa tu bandeja de entrada y haz clic en el enlace de confirmación antes de iniciar sesión.
          Si no lo encuentras, revisa tu carpeta de spam.`);
        // No navegar automáticamente al dashboard, ya que necesita confirmar el email
      }
    } catch (err: unknown) {
      console.error("Error durante el registro:", err);

      // Convertir el error al tipo definido
      const error = err as RegisterError;

      // Manejo específico para el error de conexión
      if (error.message && error.message.includes("fetch")) {
        setError(
          "Error de conexión: No se pudo conectar con el servidor. Verifica tus credenciales de Supabase en el archivo .env",
        );
      } else if (error.message) {
        setError(`Error durante el registro: ${error.message}`);
      } else {
        setError("Ha ocurrido un error desconocido al registrarse");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Link to="/">
              <img
                src="/imagenes/Logo_hosthelper_new.png"
                alt="Host Helper AI Logo"
                className="h-48 cursor-pointer hover:opacity-90 transition-opacity"
              />
            </Link>
          </div>
          <p className="text-gray-600 mt-2">Crea tu cuenta</p>
        </div>

        <div className="bg-white p-8 border border-gray-300 rounded-lg shadow-sm">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 text-green-700 p-3 rounded mb-4 text-sm">
              {successMessage}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="fullName"
                className="block text-gray-700 font-medium mb-2"
              >
                Nombre completo
              </label>
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-2"
              >
                Correo electrónico
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-gray-700 font-medium mb-2"
              >
                Contraseña
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                minLength={6}
                style={{ color: "#333" }}
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="confirmPassword"
                className="block text-gray-700 font-medium mb-2"
              >
                Confirmar contraseña
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                style={{ color: "#333" }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-500 text-white py-2 px-4 rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition duration-150 disabled:bg-primary-300 disabled:cursor-not-allowed"
            >
              {isLoading ? "Registrando..." : "Registrarse"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <a
                href="/login"
                className="text-primary-600 hover:text-primary-800"
              >
                Inicia sesión
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

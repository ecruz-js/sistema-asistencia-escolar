import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, School } from "lucide-react"; // Cambié el icono a 'School'
import { useAuth } from "../../hooks/useAuth";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

const Login = () => {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // CONFIGURACIÓN DE IMAGEN
  // Cambia a 'true' para ver la foto mezclada con el color
  const useImage = true;
  const teacherImageURL =
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
    } catch (error) {
      // Error ya manejado en useAuth
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      {/* Container principal - Ancho máximo limitado para que parezca app móvil en desktop */}
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden ring-1 ring-slate-900/5">
        {/* === HEADER CON IMAGEN (Dentro del Formulario) === */}
        <div className="relative h-48 sm:h-56 bg-primary-700 flex flex-col items-center justify-center text-center p-6">
          {/* Capa 1: Imagen de Fondo o Gradiente Base */}
          {useImage ? (
            <img
              src={teacherImageURL}
              alt="Fondo escolar"
              className="absolute inset-0 w-full h-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary-600 to-primary-800" />
          )}

          {/* Capa 2: Overlay Blended (Mezcla de color) */}
          {/* Esto asegura que el texto blanco sea legible sobre cualquier foto */}
          <div
            className={`absolute inset-0 ${
              useImage ? "bg-primary-900/80 mix-blend-multiply" : ""
            }`}
          />

          {/* Capa 3: Decoración extra (Gradiente suave inferior) */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/10 to-transparent" />

          {/* Contenido del Header (Z-index alto para estar sobre la imagen) */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-3 shadow-inner ring-1 ring-white/30">
              <School className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Sistema de Asistencia
            </h2>
            <p className="text-primary-100 text-sm mt-1 font-medium">
              Portal Docente
            </p>
          </div>
        </div>

        {/* === CUERPO DEL FORMULARIO === */}
        <div className="p-8 pt-10 relative">
          {/* Efecto visual: Curva invertida para conectar con la imagen (Opcional, pero se ve 'nice') */}
          {/* Crea una sensación de que el formulario se solapa sobre la imagen */}
          <div className="absolute top-0 left-0 right-0 h-6 bg-white rounded-t-3xl -mt-6 z-20"></div>

          <div className="mb-6">
            <h1 className="text-xl font-bold text-gray-800">Iniciar Sesión</h1>
            <p className="text-sm text-gray-500">
              Ingresa tus credenciales para acceder.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Correo Electrónico"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="docente@escuela.edu.do"
              icon={Mail}
              required
              className="bg-slate-50 border-slate-200 focus:bg-white"
            />

            <div className="relative">
              <Input
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                icon={Lock}
                required
                className="bg-slate-50 border-slate-200 focus:bg-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[2.35rem] p-1.5 text-gray-400 hover:text-primary-600 transition-colors rounded-full hover:bg-slate-100"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>

            <div className="flex items-center justify-between text-xs sm:text-sm">
              <label className="flex items-center text-gray-500 cursor-pointer">
                <input
                  type="checkbox"
                  className="mr-2 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                Recuérdame
              </label>
              <button
                type="button"
                className="text-primary-600 hover:text-primary-800 font-semibold"
              >
                ¿Olvidaste tu clave?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full shadow-lg shadow-primary-500/25 mt-2"
            >
              Acceder
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="flex flex-col items-center justify-center gap-2">
              {/* Badge de versión */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-full border border-slate-200/60">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-medium text-slate-600">
                  v{import.meta.env.VITE_APP_VERSION || "1.0.0"}
                </span>
              </div>

              {/* Información institucional */}
              <div className="text-center space-y-1">
                <p className="text-xs font-semibold text-slate-700 tracking-wide">
                  JAVEE TECH
                </p>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Centro Educativo Prof. Maria Ramona Sanchez
                </p>
                <p className="text-[10px] text-slate-400">
                  © {new Date().getFullYear()} Todos los derechos reservados
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

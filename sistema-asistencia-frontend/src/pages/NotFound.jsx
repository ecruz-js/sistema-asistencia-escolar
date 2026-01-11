import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import { Home, Search, FileQuestion, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Elementos decorativos de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-2xl w-full">
        {/* Card principal */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl ring-1 ring-slate-900/5 p-8 sm:p-12 text-center">
          {/* Icono animado */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-500/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="relative w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl flex items-center justify-center shadow-lg shadow-primary-500/25 rotate-6 hover:rotate-0 transition-transform duration-300">
                <FileQuestion
                  className="w-12 h-12 text-white"
                  strokeWidth={2}
                />
              </div>
            </div>
          </div>

          {/* Número 404 */}
          <div className="relative mb-4">
            <h1 className="text-8xl sm:text-9xl font-black bg-gradient-to-r from-primary-600 via-primary-500 to-blue-600 bg-clip-text text-transparent select-none">
              404
            </h1>
            <div className="absolute inset-0 text-8xl sm:text-9xl font-black text-primary-600/5 blur-sm select-none">
              404
            </div>
          </div>

          {/* Título y descripción */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            ¡Oops! Página no encontrada
          </h2>
          <p className="text-gray-600 text-base sm:text-lg max-w-md mx-auto leading-relaxed mb-2">
            La página que buscas no existe o ha sido movida a otra ubicación.
          </p>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mb-8">
            Verifica la URL o regresa al inicio para continuar navegando.
          </p>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              icon={ArrowLeft}
              className="w-full sm:w-auto"
            >
              Volver Atrás
            </Button>
            <Button
              onClick={() => navigate("/")}
              variant="primary"
              icon={Home}
              className="w-full sm:w-auto shadow-lg shadow-primary-500/25"
            >
              Ir al Inicio
            </Button>
          </div>
        </div>

        {/* Footer minimalista */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            Sistema de Asistencia Escolar &bull; JAVEE TECH
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import { Home } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-600">404</h1>
        <h2 className="text-3xl font-semibold text-gray-900 mt-4">
          Página no encontrada
        </h2>
        <p className="text-gray-500 mt-2 max-w-md mx-auto">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>
        <div className="mt-8">
          <Button onClick={() => navigate("/")} variant="primary" icon={Home}>
            Volver al Inicio
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;

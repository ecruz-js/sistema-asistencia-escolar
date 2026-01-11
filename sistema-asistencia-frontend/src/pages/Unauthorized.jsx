import { useNavigate } from "react-router-dom";
import Button from "../components/common/Button";
import { ShieldAlert, Home } from "lucide-react";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <ShieldAlert className="w-24 h-24 text-red-500 mx-auto" />
        <h1 className="text-3xl font-bold text-gray-900 mt-6">
          Acceso No Autorizado
        </h1>
        <p className="text-gray-500 mt-2 max-w-md mx-auto">
          No tienes los permisos necesarios para acceder a esta página.
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

export default Unauthorized;

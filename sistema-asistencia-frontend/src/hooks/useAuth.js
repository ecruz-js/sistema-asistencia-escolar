import { useAuthStore } from "../store/authStore";
import { authService } from "../services/auth.service";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export const useAuth = () => {
  const navigate = useNavigate();
  const { user, setAuth, clearAuth, isAuthenticated } = useAuthStore();

  const login = async (email, password) => {
    try {
      const response = await authService.login(email, password);
      const { usuario, token, refreshToken } = response.data;

      setAuth(usuario, token, refreshToken);
      toast.success("¡Bienvenido!");

      // Redirigir según rol
      if (usuario.rol === "admin" || usuario.rol === "direccion") {
        navigate("/dashboard");
      } else if (usuario.rol === "docente_aula") {
        navigate("/asistencia");
      } else {
        navigate("/");
      }

      return response;
    } catch (error) {
      const message =
        error.response?.data?.message || "Error al iniciar sesión";
      toast.error(message);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      clearAuth();
      navigate("/login");
      toast.success("Sesión cerrada");
    } catch (error) {
      clearAuth();
      navigate("/login");
    }
  };

  const changePassword = async (
    passwordActual,
    passwordNuevo,
    confirmarPassword
  ) => {
    try {
      const response = await authService.changePassword(
        passwordActual,
        passwordNuevo,
        confirmarPassword
      );
      toast.success("Contraseña actualizada correctamente");
      return response;
    } catch (error) {
      const message =
        error.response?.data?.message || "Error al cambiar contraseña";
      toast.error(message);
      throw error;
    }
  };

  return {
    user,
    isAuthenticated,
    login,
    logout,
    changePassword,
  };
};

import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import RoleRoute from "./RoleRoute";
import Layout from "../components/layout/Layout";
import { useAuthStore } from "../store/authStore";

// Auth Pages
import Login from "../pages/auth/Login";

// Dashboard Pages
import AdminDashboard from "../pages/dashboard/AdminDashboard";
// Asistencia Pages
import TomarAsistencia from "../pages/asistencia/TomarAsistencia";
import ListaAsistencia from "../pages/asistencia/ListaAsistencia";

// Estudiantes Pages
import ListaEstudiantes from "../pages/estudiantes/ListaEstudiantes";
import DetalleEstudiante from "../pages/estudiantes/DetalleEstudiante";

// Grados Pages
import ListaGrados from "../pages/grados/ListaGrados";
import DetalleGrado from "../pages/grados/DetalleGrado";

// Dirección Pages
import ValidarAsistencia from "../pages/direccion/ValidarAsistencia";
import EnviarMinerd from "../pages/direccion/EnviarMinerd";

// Reportes Pages
import ReporteDiario from "../pages/reportes/ReporteDiario";
import Estadisticas from "../pages/reportes/Estadisticas";

// Configuración Pages
import Configuracion from "../pages/configuracion/Configuracion";

// Other Pages
import NotFound from "../pages/NotFound";
import Unauthorized from "../pages/Unauthorized";

const AppRoutes = () => {
  const { user } = useAuthStore();

  // Determinar dashboard según rol
  const getDashboard = () => {
    if (!user) return <Navigate to="/login" replace />;

    switch (user.rol) {
      case "admin":
      case "direccion":
        return <AdminDashboard />;
      case "docente_aula":
        return <AdminDashboard />;
      default:
        return <Navigate to="/unauthorized" replace />;
    }
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* Private Routes */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        {/* Dashboard Routes */}
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={getDashboard()} />

        {/* Asistencia Routes */}
        <Route path="asistencia">
          <Route index element={<TomarAsistencia />} />
          <Route path="lista" element={<ListaAsistencia />} />
          <Route path="grado/:gradoId" element={<TomarAsistencia />} />
        </Route>

        {/* Estudiantes Routes */}
        <Route path="estudiantes">
          <Route index element={<ListaEstudiantes />} />
          <Route path=":id" element={<DetalleEstudiante />} />
        </Route>

        {/* Grados Routes */}
        <Route path="grados">
          <Route index element={<ListaGrados />} />
          <Route path=":id" element={<DetalleGrado />} />
        </Route>

        {/* Dirección Routes */}
        <Route
          path="direccion/validar"
          element={
            <RoleRoute allowedRoles={["admin", "direccion"]}>
              <ValidarAsistencia />
            </RoleRoute>
          }
        />
        <Route
          path="direccion/minerd"
          element={
            <RoleRoute allowedRoles={["admin", "direccion"]}>
              <EnviarMinerd />
            </RoleRoute>
          }
        />

        {/* Reportes Routes */}
        <Route path="reportes">
          <Route index element={<ReporteDiario />} />
          <Route path="estadisticas" element={<Estadisticas />} />
        </Route>

        {/* Configuración Routes */}
        <Route
          path="configuracion"
          element={
            <RoleRoute allowedRoles={["admin"]}>
              <Configuracion />
            </RoleRoute>
          }
        />
      </Route>

      {/* Error Routes */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;

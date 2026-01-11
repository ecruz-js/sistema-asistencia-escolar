import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import RoleRoute from "./RoleRoute";
import Layout from "../components/layout/Layout";

// Auth Pages
import Login from "../pages/auth/Login";

// // Dashboard Pages
// import AdminDashboard from "../pages/dashboard/AdminDashboard";
// import DireccionDashboard from "../pages/dashboard/DireccionDashboard";
// import DocenteDashboard from "../pages/dashboard/DocenteDashboard";

// // Asistencia Pages
// import TomarAsistencia from "../pages/asistencia/TomarAsistencia";
// import ListaAsistencia from "../pages/asistencia/ListaAsistencia";

// // Estudiantes Pages
// import ListaEstudiantes from "../pages/estudiantes/ListaEstudiantes";
// import DetalleEstudiante from "../pages/estudiantes/DetalleEstudiante";

// // Grados Pages
// import ListaGrados from "../pages/grados/ListaGrados";
// import DetalleGrado from "../pages/grados/DetalleGrado";

// // Dirección Pages
// import ValidarAsistencia from "../pages/direccion/ValidarAsistencia";
// import EnviarMinerd from "../pages/direccion/EnviarMinerd";

// // Reportes Pages
// import ReporteDiario from "../pages/reportes/ReporteDiario";
// import Estadisticas from "../pages/reportes/Estadisticas";

// Other Pages
import NotFound from "../pages/NotFound";
import Unauthorized from "../pages/Unauthorized";

const AppRoutes = () => {
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
      ></Route>

      {/* Error Routes */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;

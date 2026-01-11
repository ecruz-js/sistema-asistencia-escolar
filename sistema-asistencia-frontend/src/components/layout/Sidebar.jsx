import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  GraduationCap,
  FileText,
  Settings,
  ChevronLeft,
  CheckCircle2,
  Send,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import { ROLES } from "../../utils/constants";

const Sidebar = () => {
  const { user } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();

  const navigation = [
    // Dashboard
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: [ROLES.ADMIN, ROLES.DIRECCION],
    },

    // Asistencia
    {
      name: "Tomar Asistencia",
      href: "/asistencia",
      icon: ClipboardCheck,
      roles: [ROLES.ADMIN, ROLES.DIRECCION, ROLES.DOCENTE_AULA],
    },

    // Estudiantes
    {
      name: "Estudiantes",
      href: "/estudiantes",
      icon: Users,
      roles: [ROLES.ADMIN, ROLES.DIRECCION, ROLES.DOCENTE_AULA],
    },

    // Grados
    {
      name: "Grados",
      href: "/grados",
      icon: GraduationCap,
      roles: [ROLES.ADMIN, ROLES.DIRECCION],
    },

    // Dirección (Submenu)
    {
      name: "Validar Asistencia",
      href: "/direccion/validar",
      icon: CheckCircle2,
      roles: [ROLES.ADMIN, ROLES.DIRECCION],
    },
    {
      name: "Enviar al MINERD",
      href: "/direccion/minerd",
      icon: Send,
      roles: [ROLES.ADMIN, ROLES.DIRECCION],
    },

    // Reportes
    {
      name: "Reportes",
      href: "/reportes",
      icon: FileText,
      roles: [ROLES.ADMIN, ROLES.DIRECCION, ROLES.DOCENTE_AULA],
    },

    // Configuración
    {
      name: "Configuración",
      href: "/configuracion",
      icon: Settings,
      roles: [ROLES.ADMIN],
    },
  ];

  // Filtrar navegación según rol
  const filteredNavigation = navigation.filter(
    (item) => !item.roles || item.roles.includes(user?.rol)
  );

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } bg-white border-r border-gray-200 w-64`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h1 className="text-xl font-bold text-primary-600">
              Sistema Asistencia
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              {import.meta.env.VITE_APP_VERSION}
            </p>
          </div>
          <button
            onClick={toggleSidebar}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {filteredNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary-50 text-primary-700 font-medium"
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-700 font-semibold">
                {user?.nombre?.charAt(0)}
                {user?.apellido?.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.nombre} {user?.apellido}
              </p>
              <p className="text-xs text-gray-500 truncate capitalize">
                {user?.rol?.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay (mobile) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default Sidebar;

import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ClipboardCheck,
  Users,
  GraduationCap,
  FileText,
  Settings,
  X,
  CheckCircle2,
  Send,
  School,
  ChevronRight,
  LogOut,
  Bell,
  Moon,
  Sun,
  User,
  Key,
  Sparkles
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import { ROLES } from "../../utils/constants";
import { useState } from "react";

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar, darkMode, toggleDarkMode } = useUIStore();
  const [hoveredItem, setHoveredItem] = useState(null);

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: [ROLES.ADMIN, ROLES.DIRECCION], badge: null },
    { name: "Tomar Asistencia", href: "/asistencia", icon: ClipboardCheck, roles: [ROLES.ADMIN, ROLES.DIRECCION, ROLES.DOCENTE_AULA], badge: "Nuevo" },
    { name: "Estudiantes", href: "/estudiantes", icon: Users, roles: [ROLES.ADMIN, ROLES.DIRECCION, ROLES.DOCENTE_AULA], badge: null },
    { name: "Grados", href: "/grados", icon: GraduationCap, roles: [ROLES.ADMIN, ROLES.DIRECCION], badge: null },

    // Section Header for Direction
    { isSection: true, name: "DIRECCIÓN", roles: [ROLES.ADMIN, ROLES.DIRECCION] },
    { name: "Validar Asistencia", href: "/direccion/validar", icon: CheckCircle2, roles: [ROLES.ADMIN, ROLES.DIRECCION], badge: null },
    { name: "Enviar al MINERD", href: "/direccion/minerd", icon: Send, roles: [ROLES.ADMIN, ROLES.DIRECCION], badge: null },

    // Section Header for Reports
    { isSection: true, name: "REPORTES", roles: [ROLES.ADMIN, ROLES.DIRECCION, ROLES.DOCENTE_AULA] },
    { name: "Reportes", href: "/reportes", icon: FileText, roles: [ROLES.ADMIN, ROLES.DIRECCION, ROLES.DOCENTE_AULA], badge: null },

    // Section Header for Config
    { isSection: true, name: "SISTEMA", roles: [ROLES.ADMIN] },
    { name: "Configuración", href: "/configuracion", icon: Settings, roles: [ROLES.ADMIN], badge: null },
  ];

  const filteredNavigation = navigation.filter(
    (item) => !item.roles || item.roles.includes(user?.rol)
  );

  return (
    <>
      {/* Sidebar Overlay - Pantalla completa con blur fuerte */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-md transition-all duration-500 ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={toggleSidebar}
      />

      {/* Sidebar Panel - Pantalla completa en móvil */}
      <aside
        className={`fixed top-0 left-0 z-50 h-[100dvh] w-full sm:w-96 bg-white dark:bg-slate-900 shadow-2xl transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] lg:w-72 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full relative overflow-hidden">
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary-500/10 to-indigo-500/10 rounded-full blur-3xl -translate-y-32 translate-x-32 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-3xl translate-y-24 -translate-x-24 pointer-events-none"></div>

          {/* Header */}
          <div className="relative flex items-center justify-between px-6 sm:px-8 h-20 sm:h-24 border-b border-slate-200/50 dark:border-slate-700/50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80">
            <div className="flex items-center gap-4">
              <div className="relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-tr from-primary-600 via-primary-500 to-indigo-500 text-white shadow-xl shadow-primary-500/30 animate-gradient">
                <School className="w-7 h-7 sm:w-8 sm:h-8" />
                <Sparkles className="absolute -top-1 -right-1 w-4 h-4 text-yellow-300 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  S.A.E.
                </span>
                <span className="text-[10px] font-bold tracking-widest text-primary-500 uppercase">
                  Sistema Asistencia
                </span>
              </div>
            </div>
            <button
              onClick={toggleSidebar}
              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 active:scale-90"
              aria-label="Cerrar menú"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 sm:px-6 py-6 space-y-1.5 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-700 hover:scrollbar-thumb-slate-400 dark:hover:scrollbar-thumb-slate-600">
            {filteredNavigation.map((item, index) => {
              if (item.isSection) {
                 return (
                    <div
                      key={item.name}
                      className="mt-8 mb-3 px-3 flex items-center gap-2"
                    >
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent"></div>
                      <span className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase">
                        {item.name}
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent"></div>
                    </div>
                 )
              }

              return (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={toggleSidebar}
                onMouseEnter={() => setHoveredItem(index)}
                onMouseLeave={() => setHoveredItem(null)}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 sm:gap-4 px-4 py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-semibold transition-all duration-300 transform ${
                    isActive
                      ? "bg-gradient-to-r from-primary-500 to-indigo-500 text-white shadow-lg shadow-primary-500/30 scale-[1.02]"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-[1.01]"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Animated background on hover */}
                    {!isActive && hoveredItem === index && (
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-indigo-500/10 rounded-2xl animate-pulse"></div>
                    )}

                    <div className={`relative p-2 rounded-xl transition-all duration-300 ${
                      isActive ? "bg-white/20" : "bg-slate-100 dark:bg-slate-800 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20"
                    }`}>
                      <item.icon
                        className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 ${
                          isActive ? "text-white animate-pulse" : "text-slate-500 dark:text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400"
                        }`}
                      />
                    </div>
                    <span className="flex-1 relative z-10">{item.name}</span>

                    {/* Badge */}
                    {item.badge && (
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        isActive
                          ? "bg-white/30 text-white"
                          : "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400"
                      }`}>
                        {item.badge}
                      </span>
                    )}

                    {isActive && (
                      <ChevronRight className="w-5 h-5 text-white animate-bounce-x" />
                    )}
                  </>
                )}
              </NavLink>
            )})}
          </nav>

          {/* Footer Actions */}
          <div className="p-4 sm:p-6 space-y-3 border-t border-slate-200/50 dark:border-slate-700/50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 group"
            >
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
                {darkMode ? (
                  <Sun className="w-5 h-5 text-amber-500" />
                ) : (
                  <Moon className="w-5 h-5 text-indigo-500" />
                )}
              </div>
              <span className="flex-1 text-left text-sm sm:text-base">
                {darkMode ? "Modo Claro" : "Modo Oscuro"}
              </span>
            </button>

            {/* User Profile */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-primary-400 via-primary-500 to-indigo-500 flex items-center justify-center shadow-lg">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.nombre} className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span className="text-lg sm:text-xl font-black text-white">
                      {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
                    </span>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                    {user?.nombre} {user?.apellido}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Perfil</span>
                </button>
                <button
                  onClick={logout}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Agregar animación personalizada en el CSS global si es necesario */}
      <style jsx>{`
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-bounce-x {
          animation: bounce-x 1s ease-in-out infinite;
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </>
  );
};

export default Sidebar;

import { NavLink, useLocation } from "react-router-dom";
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
  LogOut,
  Moon,
  Sun,
  Calendar,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useUIStore } from "../../store/uiStore";
import { ROLES } from "../../utils/constants";

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar, darkMode, toggleDarkMode } = useUIStore();
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: [ROLES.ADMIN, ROLES.DIRECCION] },
    { name: "Tomar Asistencia", href: "/asistencia", icon: ClipboardCheck, roles: [ROLES.ADMIN, ROLES.DIRECCION, ROLES.DOCENTE_AULA] },
    { name: "Estudiantes", href: "/estudiantes", icon: Users, roles: [ROLES.ADMIN, ROLES.DIRECCION, ROLES.DOCENTE_AULA] },
    { name: "Grados", href: "/grados", icon: GraduationCap, roles: [ROLES.ADMIN, ROLES.DIRECCION] },

    { isSection: true, name: "DIRECCIÓN", roles: [ROLES.ADMIN, ROLES.DIRECCION] },
    { name: "Enviar al MINERD", href: "/direccion/minerd", icon: Send, roles: [ROLES.ADMIN, ROLES.DIRECCION] },

    { isSection: true, name: "REPORTES", roles: [ROLES.ADMIN, ROLES.DIRECCION, ROLES.DOCENTE_AULA] },
    { name: "Reportes", href: "/reportes", icon: FileText, roles: [ROLES.ADMIN, ROLES.DIRECCION, ROLES.DOCENTE_AULA] },
    { name: "Calendario", href: "/reportes/calendario", icon: Calendar, roles: [ROLES.ADMIN, ROLES.DIRECCION, ROLES.DOCENTE_AULA] },

    { isSection: true, name: "SISTEMA", roles: [ROLES.ADMIN] },
    { name: "Configuración", href: "/configuracion", icon: Settings, roles: [ROLES.ADMIN] },
  ];

  const filteredNavigation = navigation.filter(
    (item) => !item.roles || item.roles.includes(user?.rol)
  );

  return (
    <>
      {/* Overlay móvil */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        onClick={toggleSidebar}
      />

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-[85vw] max-w-[320px] sm:w-80 bg-[#615fff] shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:translate-x-0 lg:static lg:w-72 lg:shadow-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex flex-col h-full relative z-10 overflow-y-auto overflow-x-hidden custom-scrollbar">

          {/* Logo / Header */}
          <div className="h-20 flex items-center justify-between px-6 sticky top-0 z-20 bg-[#615fff]">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                <School className="w-6 h-6 text-[#615fff]" />
              </div>

              <div className="flex flex-col">
                <span className="text-xl font-bold text-white tracking-tight">SAE</span>
                <span className="text-xs font-medium text-indigo-200 tracking-wide">
                  Sistema <br />Asistencia Escolar
                </span>
              </div>
            </div>

            {/* Close Button (Mobile Only) */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Scroll Area */}
          <nav className="flex-1 py-6 relative z-10">
            <ul className="space-y-2">
              {filteredNavigation.map((item, index) => {
                if (item.isSection) {
                  return (
                    <div key={item.name} className="mt-6 mb-3 px-8">
                      <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">
                        {item.name}
                      </span>
                    </div>
                  );
                }

                const isActive = location.pathname === item.href;

                return (
                  <li key={item.href} className={`relative ${isActive ? 'z-10' : 'z-20'}`}>
                    {/* Visual Connector Curves for Active Item */}
                    {isActive && (
                      <>
                        {/* Top Connector - Creates the inverted curve above */}
                        <div className="absolute -top-[50px] right-0 w-[50px] h-[50px] bg-slate-100 z-10 pointer-events-none">
                          <div className="w-full h-full bg-[#615fff] rounded-br-[30px]"></div>
                        </div>
                        {/* Bottom Connector - Creates the inverted curve below */}
                        <div className="absolute -bottom-[50px] right-0 w-[50px] h-[50px] bg-slate-100 z-10 pointer-events-none">
                          <div className="w-full h-full bg-[#615fff] rounded-tr-[30px]"></div>
                        </div>
                      </>
                    )}

                    <NavLink
                      to={item.href}
                      onClick={() => {
                        if (window.innerWidth < 1024) toggleSidebar();
                      }}
                      className={`
                        w-full flex items-center gap-4 px-8 py-4 transition-all duration-300 relative z-20
                        ${isActive
                          ? 'text-[#615fff] font-semibold'
                          : 'text-indigo-200 hover:text-white'
                        }
                      `}
                    >
                      {/* Background Layer for Active Item */}
                      {isActive && (
                        <div className="absolute inset-y-0 right-0 left-4 bg-slate-100 rounded-l-[30px] -mr-1"></div>
                      )}

                      {/* Icon & Text */}
                      <span className="relative z-30">
                        <item.icon className="w-5 h-5" />
                      </span>
                      <span className="relative z-30 text-sm">{item.name}</span>
                    </NavLink>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </aside>

      <style>{`
        /* Scrollbar personalizado para el sidebar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </>
  );
};

export default Sidebar;
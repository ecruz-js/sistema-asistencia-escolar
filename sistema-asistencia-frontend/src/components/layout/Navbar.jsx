import {
  Menu,
  Bell,
  User,
  LogOut,
  Settings,
  Search,
  X,
  TrendingUp,
  Clock,
  Home,
  ChevronRight,
  FileText,
  Users,
  Calendar,
  ChevronLeft,
  Zap,
  HelpCircle,
  ClipboardCheck,
  GraduationCap,
  Moon,
  Sun,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useUIStore } from "../../store/uiStore";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../hooks/useNotifications";
import { formatRelativeTime } from "../../utils/formatters";
import { useLocation, useNavigate } from "react-router-dom";
import AttendanceCalendar from "../common/ui/AttendanceCalendar";

const Navbar = () => {
  const { toggleSidebar, darkMode, toggleDarkMode } = useUIStore();
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const notificationsRef = useRef(null);
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(event.target)
      )
        setShowNotifications(false);
      if (userMenuRef.current && !userMenuRef.current.contains(event.target))
        setShowUserMenu(false);
      if (searchRef.current && !searchRef.current.contains(event.target))
        setShowSearch(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === "Escape") {
        setShowSearch(false);
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Breadcrumbs logic
  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split("/").filter((x) => x);
    const breadcrumbs = [{ name: "Inicio", path: "/dashboard", icon: Home }];
    let currentPath = "";
    pathnames.forEach((path, index) => {
      currentPath += `/${path}`;
      const name =
        path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " ");
      breadcrumbs.push({ name, path: currentPath });
    });
    return breadcrumbs;
  };
  const breadcrumbs = generateBreadcrumbs();

  // Quick actions for search
  const quickActions = [
    {
      icon: ClipboardCheck,
      label: "Tomar Asistencia",
      path: "/asistencia",
      category: "Acciones",
    },
    {
      icon: Users,
      label: "Estudiantes",
      path: "/estudiantes",
      category: "Gestión",
    },
    {
      icon: GraduationCap,
      label: "Grados",
      path: "/grados",
      category: "Gestión",
    },
    {
      icon: FileText,
      label: "Reportes",
      path: "/reportes",
      category: "Reportes",
    },
    {
      icon: Settings,
      label: "Configuración",
      path: "/configuracion",
      category: "Sistema",
    },
  ];

  const filteredActions = quickActions.filter((action) =>
    action.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* --- NAVBAR HEADER --- */}
      <nav className="sticky top-0 z-30 transition-all duration-300 border-b border-slate-200 dark:border-slate-800/50 bg-white dark:bg-slate-950/90 backdrop-blur-xl">
        <div className="px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Izquierda: Toggle & Breadcrumbs */}
            <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0">
              <button
                onClick={toggleSidebar}
                className="p-1.5 sm:p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Mobile Brand */}
              <div className="flex items-center gap-2 lg:hidden flex-shrink-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-primary-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                  S
                </div>
              </div>

              {/* Breadcrumbs Desktop */}
              <div className="hidden lg:flex items-center gap-2 text-sm">
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.path} className="flex items-center gap-2">
                    {index > 0 && (
                      <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                    )}
                    <button
                      onClick={() => navigate(crumb.path)}
                      className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors ${index === breadcrumbs.length - 1
                          ? "font-semibold text-slate-900 dark:text-white"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                        }`}
                    >
                      {index === 0 && <crumb.icon className="w-4 h-4" />}
                      {crumb.name}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Derecha: Acciones */}
            <div className="flex items-center justify-center gap-2 sm:gap-4 flex-shrink-0">

              {/* Global Date Picker */}
              <AttendanceCalendar />

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="w-full flex items-center gap-2.5 sm:gap-4 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all duration-200 mb-0 border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                <div className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-700">
                  {darkMode ? (
                    <Sun className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Moon className="w-4 h-4 text-indigo-600" />
                  )}
                </div>
              </button>

              {/* Search Trigger */}
              <button
                onClick={() => setShowSearch(true)}
                className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all border border-slate-200 dark:border-transparent hover:border-slate-300 dark:hover:border-slate-600 text-xs font-medium shadow-sm"
              >
                <Search className="w-4 h-4" />
                <span className="opacity-70">Buscar...</span>
                <kbd className="ml-2 px-1.5 py-0.5 rounded bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 shadow-xs font-mono text-[10px] opacity-60">
                  ⌘K
                </kbd>
              </button>
              {/* Mobile Search Icon */}
              <button
                onClick={() => setShowSearch(true)}
                className="md:hidden p-1.5 sm:p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Notifications */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowUserMenu(false);
                  }}
                  className={`p-2 sm:p-2.5 rounded-xl transition-all duration-200 relative ${showNotifications
                      ? "bg-indigo-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                >
                  <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 sm:w-5 sm:h-5 bg-rose-500 text-white text-[9px] sm:text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </button>
              </div>

              {/* User Menu */}
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                className={`flex items-center gap-2 sm:gap-3 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl transition-all duration-200 ${showUserMenu
                    ? "bg-indigo-100 dark:bg-slate-800"
                    : "hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center ring-2 ring-slate-200 dark:ring-slate-700">
                  {user?.foto_ur ? (
                    <img
                      src={user.foto_url}
                      alt={user.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {user?.nombres?.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="hidden lg:block text-sm font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap max-w-[120px] truncate">
                  {user?.nombres ? user.nombres.split(' ')[0] : ''}
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- SEARCH MODAL --- */}
      <div
        ref={searchRef}
        className={`fixed inset-0 z-50 flex items-start justify-center transition-all duration-300 ${showSearch ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
      >
        <div
          className="absolute inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-md transition-opacity"
          onClick={() => setShowSearch(false)}
        />
        <div
          className={`relative w-full max-w-2xl mx-4 mt-16 sm:mt-24 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transform transition-all duration-300 ${showSearch ? "scale-100 translate-y-0" : "scale-95 -translate-y-4"
            }`}
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 dark:border-slate-800">
            <Search className="w-5 h-5 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar páginas, acciones..."
              className="flex-1 bg-transparent outline-none text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500"
              autoFocus
            />
            <button
              onClick={() => setShowSearch(false)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Actions Results */}
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            {searchQuery === "" ? (
              <div className="p-4 sm:p-6 text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Search className="w-5 h-5 sm:w-7 sm:h-7 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Escribe para buscar páginas y acciones
                </p>
              </div>
            ) : filteredActions.length === 0 ? (
              <div className="p-4 sm:p-6 text-center">
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  No se encontraron resultados
                </p>
              </div>
            ) : (
              <div className="p-2">
                {filteredActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      navigate(action.path);
                      setShowSearch(false);
                      setSearchQuery("");
                    }}
                    className="w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group text-left"
                  >
                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      <action.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                        {action.label}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {action.category}
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer Tips */}
          <div className="px-4 sm:px-6 py-2 sm:py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex flex-wrap items-center gap-3 sm:gap-4 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <kbd className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-1">
                ESC
              </kbd>{" "}
              Cerrar
            </span>
            <span className="flex items-center gap-1">
              <kbd className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded px-1">
                ↵
              </kbd>{" "}
              Seleccionar
            </span>
          </div>
        </div>
      </div>

      {/* --- NOTIFICATIONS PANEL --- */}
      <div
        ref={notificationsRef}
        className={`fixed inset-0 z-50 transition-all duration-300 ${showNotifications ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
      >
        <div
          className="absolute inset-0 bg-slate-900/20 dark:bg-slate-950/40 backdrop-blur-sm transition-opacity"
          onClick={() => setShowNotifications(false)}
        />
        <div
          className={`absolute right-0 top-0 h-full w-full sm:w-[380px] md:w-[400px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-2xl border-l border-slate-200 dark:border-slate-800 transform transition-all duration-300 ease-out ${showNotifications ? "translate-x-0" : "translate-x-full"
            }`}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Notificaciones
              </h2>
              {unreadCount > 0 && (
                <p className="text-xs text-indigo-500 dark:text-indigo-400 font-medium mt-0.5">
                  {unreadCount} sin leer
                </p>
              )}
            </div>
            <button
              onClick={() => setShowNotifications(false)}
              className="p-1.5 sm:p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* List */}
          <div className="h-[calc(100%-72px)] sm:h-[calc(100%-80px)] overflow-y-auto custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-6 sm:p-8 text-center">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3 sm:mb-4">
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-slate-900 dark:text-white font-medium">
                  Todo tranquilo
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  No tienes notificaciones nuevas.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => markAsRead(n.id)}
                    className={`p-3 sm:p-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 cursor-pointer transition-colors ${!n.leida ? "bg-indigo-50/30 dark:bg-indigo-900/10" : ""
                      }`}
                  >
                    <div className="flex gap-3">
                      <div
                        className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${!n.leida ? "bg-indigo-500" : "bg-transparent"
                          }`}
                      ></div>
                      <div>
                        <p
                          className={`text-sm mb-1 ${!n.leida
                              ? "font-semibold text-slate-900 dark:text-white"
                              : "text-slate-700 dark:text-slate-300"
                            }`}
                        >
                          {n.titulo}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                          {n.mensaje}
                        </p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-2 font-medium uppercase tracking-wide">
                          {formatRelativeTime(n.creada_en)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- USER MENU PANEL --- */}
      <div
        ref={userMenuRef}
        className={`fixed inset-0 z-50 transition-all duration-300 ${showUserMenu ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
      >
        <div
          className="absolute inset-0 bg-slate-900/20 dark:bg-slate-950/40 backdrop-blur-sm transition-opacity"
          onClick={() => setShowUserMenu(false)}
        />
        <div
          className={`absolute right-0 top-0 h-full w-full sm:w-[340px] md:w-[380px] bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl border-l border-slate-200 dark:border-slate-800 transform transition-all duration-300 ease-out ${showUserMenu ? "translate-x-0" : "translate-x-full"
            }`}
        >
          {/* Header: Profile Summary */}
          <div className="relative h-36 sm:h-40 bg-slate-50 dark:bg-slate-800/50 overflow-hidden">
            {/* Decorative Background Pattern */}
            <div
              className="absolute inset-0 opacity-10 dark:opacity-5"
              style={{
                backgroundImage:
                  "radial-gradient(#4f46e5 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            ></div>

            <button
              onClick={() => setShowUserMenu(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white dark:bg-slate-700 shadow-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative flex flex-col items-center justify-center h-full pt-4">
              <div className="relative mb-2 sm:mb-3">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full p-1 bg-white dark:bg-slate-800 shadow-md">
                  <div className="w-full h-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
                    {user?.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        className="w-full h-full object-cover"
                        alt={user?.nombre}
                      />
                    ) : (
                      <span className="text-2xl font-bold text-slate-500 dark:text-slate-400">
                        {user?.nombre?.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white dark:border-slate-800 rounded-full"></div>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {user?.nombre} {user?.apellido}
              </h3>
              <span className="text-[10px] sm:text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-full mt-1">
                {getRoleDisplay(user?.rol)}
              </span>
            </div>
          </div>

          {/* Menu Actions */}
          <div className="p-3 sm:p-4 space-y-1">
            <p className="px-4 py-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Cuenta
            </p>

            <button className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 transition-colors group">
              <div className="p-1.5 sm:p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                <User className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Mi Perfil</span>
            </button>

            <button className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 transition-colors group">
              <div className="p-1.5 sm:p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                <Settings className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Configuración</span>
            </button>

            <p className="px-4 py-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-4">
              Soporte
            </p>

            <button className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-200 transition-colors group">
              <div className="p-1.5 sm:p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">
                <HelpCircle className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Centro de Ayuda</span>
            </button>
          </div>

          {/* Logout */}
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-white via-white dark:from-slate-900 dark:via-slate-900 to-transparent">
            <button
              onClick={() => {
                logout();
                setShowUserMenu(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-rose-100 dark:border-rose-900/30 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all text-sm font-semibold"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* --- CUSTOM SCROLLBAR STYLES --- */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: ${darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"
        };
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: ${darkMode ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.2)"
        };
        }
      `}</style>
    </>
  );
};

// Helpers
const getRoleDisplay = (role) => {
  const roles = {
    ADMIN: "Administrador",
    DIRECCION: "Dirección",
    DOCENTE_AULA: "Docente",
    DOCENTE: "Docente",
  };
  return roles[role] || role;
};

export default Navbar;

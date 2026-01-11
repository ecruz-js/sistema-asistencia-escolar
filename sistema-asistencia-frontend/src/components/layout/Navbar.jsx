import { Menu, Bell, User, LogOut, Key, School, ChevronDown, Search, X, TrendingUp, Clock, Home, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useUIStore } from "../../store/uiStore";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../hooks/useNotifications";
import { formatRelativeTime } from "../../utils/formatters";
import { useLocation, useNavigate } from "react-router-dom";

const Navbar = () => {
  const { toggleSidebar, darkMode } = useUIStore();
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
      ) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearch(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard shortcut for search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Generar breadcrumbs basados en la ruta
  const generateBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(x => x);
    const breadcrumbs = [{ name: 'Inicio', path: '/dashboard', icon: Home }];

    let currentPath = '';
    pathnames.forEach((path, index) => {
      currentPath += `/${path}`;
      const name = path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ');
      breadcrumbs.push({ name, path: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-30 transition-all duration-300 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Left side - Trigger & Branding */}
            <div className="flex items-center gap-4">
              <button
                onClick={toggleSidebar}
                className="p-2.5 transition-all duration-200 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                aria-label="Toggle menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Mobile Brand */}
              <div className="flex items-center gap-3 lg:hidden">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg shadow-sm bg-gradient-to-tr from-primary-600 to-primary-500 text-white">
                  <School className="w-5 h-5" />
                </div>
                <span className="text-lg font-bold tracking-tight text-slate-800 dark:text-white">S.A.E.</span>
              </div>

              {/* Desktop Breadcrumbs */}
              <div className="hidden lg:flex items-center gap-2">
                {breadcrumbs.map((crumb, index) => (
                  <div key={crumb.path} className="flex items-center gap-2">
                    {index > 0 && <ChevronRight className="w-4 h-4 text-slate-400" />}
                    <button
                      onClick={() => navigate(crumb.path)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        index === breadcrumbs.length - 1
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {crumb.icon && <crumb.icon className="w-4 h-4" />}
                      <span>{crumb.name}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right side - Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Button */}
              <button
                onClick={() => setShowSearch(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <Search className="w-5 h-5" />
                <span className="hidden md:inline">Buscar</span>
                <kbd className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
                  ⌘K
                </kbd>
              </button>

              {/* Notifications */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2.5 rounded-xl transition-all duration-200 ${
                  showNotifications
                    ? "bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
                }`}
                aria-label="Notificaciones"
              >
                <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 flex w-2.5 h-2.5">
                    <span className="absolute inline-flex w-full h-full rounded-full bg-rose-400 opacity-75 animate-ping"></span>
                    <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-rose-500 border-2 border-white dark:border-slate-900"></span>
                  </span>
                )}
              </button>

              {/* User Menu Button */}
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 p-1.5 rounded-xl transition-all hover:bg-slate-50 dark:hover:bg-slate-800 group outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                <div className="relative overflow-hidden w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-primary-200 to-indigo-100 dark:from-primary-800 dark:to-indigo-900 flex items-center justify-center ring-2 ring-white dark:ring-slate-800 shadow-sm group-hover:shadow-md transition-shadow">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt={user.nombre} className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-sm font-bold text-primary-700 dark:text-primary-300">
                      {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
                    </span>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 hidden sm:block ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Search Modal - Pantalla completa */}
      <div
        ref={searchRef}
        className={`fixed inset-0 z-50 transition-all duration-300 ${
          showSearch ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-lg" onClick={() => setShowSearch(false)} />
        <div className="relative h-full flex items-start justify-center pt-20 sm:pt-32 px-4">
          <div className={`w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl ring-1 ring-slate-900/10 dark:ring-white/10 overflow-hidden transform transition-all duration-300 ${
            showSearch ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
          }`}>
            {/* Search Header */}
            <div className="flex items-center gap-4 px-6 py-5 border-b border-slate-200 dark:border-slate-700">
              <Search className="w-6 h-6 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar estudiantes, grados, reportes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent text-lg font-medium text-slate-900 dark:text-white placeholder-slate-400 outline-none"
                autoFocus
              />
              <button
                onClick={() => setShowSearch(false)}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Results */}
            <div className="max-h-96 overflow-y-auto p-4 space-y-2">
              {searchQuery === "" ? (
                <div className="py-12 text-center">
                  <Search className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Comienza a escribir para buscar...</p>
                  <div className="mt-6 grid grid-cols-2 gap-3 max-w-md mx-auto">
                    <button className="p-3 text-left rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <TrendingUp className="w-5 h-5 text-primary-500 mb-2" />
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">Asistencias</p>
                    </button>
                    <button className="p-3 text-left rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                      <Clock className="w-5 h-5 text-indigo-500 mb-2" />
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">Reportes</p>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Buscando "{searchQuery}"...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications Panel - Pantalla completa */}
      <div
        ref={notificationsRef}
        className={`fixed inset-0 z-50 transition-all duration-500 ${
          showNotifications ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowNotifications(false)} />
        <div className={`absolute right-0 top-0 h-full w-full sm:w-[450px] bg-white dark:bg-slate-900 shadow-2xl transform transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          showNotifications ? "translate-x-0" : "translate-x-full"
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-primary-50 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm">
                <Bell className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Notificaciones</h3>
                {unreadCount > 0 && (
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {unreadCount} nueva{unreadCount !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setShowNotifications(false)}
              className="p-2 rounded-xl text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="h-[calc(100%-80px)] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full px-6 text-center">
                <div className="p-4 mb-4 rounded-2xl bg-slate-100 dark:bg-slate-800">
                  <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                </div>
                <p className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Sin notificaciones</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Te avisaremos cuando suceda algo importante.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={`group relative p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer ${
                      !notification.leida ? "bg-primary-50/50 dark:bg-primary-900/10" : ""
                    }`}
                  >
                    <div className="flex gap-4">
                      <div className={`mt-1 p-2 rounded-xl flex-shrink-0 ${
                        !notification.leida
                          ? "bg-primary-100 dark:bg-primary-900/30"
                          : "bg-slate-100 dark:bg-slate-800"
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${
                          !notification.leida ? "bg-primary-500" : "bg-slate-300 dark:bg-slate-600"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm mb-1 ${
                          !notification.leida
                            ? "font-bold text-slate-900 dark:text-white"
                            : "font-semibold text-slate-700 dark:text-slate-300"
                        }`}>
                          {notification.titulo}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                          {notification.mensaje}
                        </p>
                        <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                          {formatRelativeTime(notification.creada_en)}
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

      {/* User Menu Panel - Pantalla completa */}
      <div
        ref={userMenuRef}
        className={`fixed inset-0 z-50 transition-all duration-500 ${
          showUserMenu ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setShowUserMenu(false)} />
        <div className={`absolute right-0 top-0 h-full w-full sm:w-[400px] bg-white dark:bg-slate-900 shadow-2xl transform transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          showUserMenu ? "translate-x-0" : "translate-x-full"
        }`}>
          {/* Header with gradient */}
          <div className="relative h-48 bg-gradient-to-br from-primary-500 via-primary-600 to-indigo-600 overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJ2Mmgydi0yem0tNCAwdi0yaDJ2Mmgydi0yaDJ2Mmgydi0yaDJ2LTJoLTJ2LTJoMnYtMmgtMnYtMmgydi0yaC0ydi0yaC0ydjJoLTJ2LTJoLTJ2MmgtMnYtMmgtMnYyaC0ydi0yaC0ydjJoLTJ2MmgydjJoLTJ2MmgydjJoLTJ2MmgydjJoMnYyaDJ2LTJoMnYyaDJ2LTJoMnYyaDJ2LTJoMnYtMmgtMnYtMmgydi0yem0tMiAyaC0ydi0yaDJ2MnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>

            <button
              onClick={() => setShowUserMenu(false)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="relative h-full flex flex-col items-center justify-center px-6">
              <div className="relative mb-4">
                <div className="w-24 h-24 rounded-2xl bg-white dark:bg-slate-800 p-1 shadow-xl">
                  <div className="w-full h-full rounded-xl bg-gradient-to-br from-primary-400 via-primary-500 to-indigo-500 flex items-center justify-center">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt={user.nombre} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <span className="text-3xl font-black text-white">
                        {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-slate-800 flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                </div>
              </div>
              <h3 className="text-2xl font-black text-white mb-1">
                {user?.nombre} {user?.apellido}
              </h3>
              <p className="text-sm font-medium text-white/80 mb-1">{user?.email}</p>
              <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-bold text-white uppercase tracking-wider">
                {getRoleDisplay(user?.rol)}
              </span>
            </div>
          </div>

          {/* Menu Options */}
          <div className="p-6 space-y-2">
            <button className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all group">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 shadow-sm group-hover:shadow-md transition-shadow">
                <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Mi Perfil</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Ver y editar información</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>

            <button className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all group">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 shadow-sm group-hover:shadow-md transition-shadow">
                <Key className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Cambiar Contraseña</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Actualizar seguridad</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>

            <button className="w-full flex items-center gap-4 px-4 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all group">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 shadow-sm group-hover:shadow-md transition-shadow">
                <Bell className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-slate-900 dark:text-white">Notificaciones</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Preferencias de avisos</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Logout Button */}
          <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-sm">
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 transition-all transform hover:scale-[1.02] active:scale-95"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Helper functions (kept simple)
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 18) return "Buenas tardes";
  return "Buenas noches";
};

const getRoleDisplay = (role) => {
  const roles = {
    'ADMIN': 'Administrador',
    'DIRECCION': 'Dirección',
    'DOCENTE_AULA': 'Docente de Aula',
    'DOCENTE': 'Docente'
  };
  return roles[role] || role?.replace('_', ' ');
};

export default Navbar;

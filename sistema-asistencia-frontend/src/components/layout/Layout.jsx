import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useUIStore } from "../../store/uiStore";
import { useEffect, useState } from "react";

const Layout = () => {
  const { sidebarOpen, darkMode } = useUIStore();
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Page transition effect
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => setIsTransitioning(false), 300);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-slate-950' : 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
    }`}>
      <Sidebar />

      <div
        className={`transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          sidebarOpen ? "lg:pl-72" : "lg:pl-0"
        }`}
      >
        <Navbar />

        {/* Main Content */}
        <main className={`min-h-screen pt-20 lg:pt-24 pb-8 transition-all duration-300 ${
          isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
        }`}>
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            {/* Page Header Slot */}
            <div className="mb-6 animate-fade-in-up">
              <Outlet />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm py-6">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                <span className="font-semibold">S.A.E.</span> - Sistema de Asistencia Escolar
              </div>
              <div className="flex items-center gap-6 text-xs text-slate-500 dark:text-slate-500">
                <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Ayuda
                </a>
                <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Privacidad
                </a>
                <a href="#" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  Términos
                </a>
                <span className="text-slate-400 dark:text-slate-600">v1.0.0</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
        {/* Gradient Orbs */}
        <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-3xl opacity-20 transition-opacity duration-1000 ${
          darkMode
            ? 'bg-gradient-to-br from-primary-900 via-indigo-900 to-transparent'
            : 'bg-gradient-to-br from-primary-100 via-indigo-100 to-transparent'
        }`} style={{ transform: 'translate(40%, -40%)' }}></div>

        <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl opacity-20 transition-opacity duration-1000 ${
          darkMode
            ? 'bg-gradient-to-tr from-purple-900 via-pink-900 to-transparent'
            : 'bg-gradient-to-tr from-purple-100 via-pink-100 to-transparent'
        }`} style={{ transform: 'translate(-40%, 40%)' }}></div>

        {/* Grid Pattern */}
        <div className={`absolute inset-0 transition-opacity duration-1000 ${
          darkMode ? 'opacity-[0.02]' : 'opacity-[0.03]'
        }`}
          style={{
            backgroundImage: `linear-gradient(${darkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.15)'} 1px, transparent 1px), linear-gradient(90deg, ${darkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.15)'} 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        ></div>
      </div>

      {/* Global Loading Indicator */}
      {isTransitioning && (
        <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-gradient-to-r from-primary-500 via-indigo-500 to-purple-500 animate-shimmer"></div>
      )}

      {/* Custom Styles */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out;
        }

        .animate-shimmer {
          animation: shimmer 1.5s ease-in-out infinite;
        }

        /* Custom Scrollbar */
        ::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }

        ::-webkit-scrollbar-track {
          background: ${darkMode ? 'rgb(15, 23, 42)' : 'rgb(248, 250, 252)'};
        }

        ::-webkit-scrollbar-thumb {
          background: ${darkMode ? 'rgb(51, 65, 85)' : 'rgb(203, 213, 225)'};
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: ${darkMode ? 'rgb(71, 85, 105)' : 'rgb(148, 163, 184)'};
        }
      `}</style>
    </div>
  );
};

export default Layout;

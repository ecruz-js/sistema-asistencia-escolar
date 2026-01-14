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
    <div className="h-screen w-full flex items-center justify-center p-4">
      <div className="w-full h-full max-w-[1920px] bg-[#615fff] rounded-[40px] shadow-2xl overflow-hidden relative flex">

        {/* --- SIDEBAR (z-20, fijo como parte del layout) --- */}
        <div className={`hidden lg:block h-full transition-all duration-300 z-20 ${sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'
          }`}>
          <Sidebar />
        </div>

        {/* Sidebar móvil */}
        <div className="lg:hidden">
          <Sidebar />
        </div>

        {/* --- MAIN CONTENT WRAPPER (z-30, superpuesto) --- */}
        <div className="flex-1 flex flex-col h-full relative z-30  overflow-hidden rounded-[40px] shadow-inner">

          {/* Navbar */}
          <div className="sticky top-0 z-40">
            <Navbar />
          </div>

          {/* Main Content Scrollable Area */}
          <main
            className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth bg-slate-100"
            id="main-scroll-container"
          >
            <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 min-h-full transition-all duration-500 ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
              }`}>
              <Outlet />
            </div>
          </main>
        </div>

        {/* --- INDICADOR DE CARGA --- */}
        {isTransitioning && (
          <div className="absolute top-0 left-0 right-0 z-[100] h-1 bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 via-indigo-500 to-indigo-600 w-full h-full animate-progress origin-left"></div>
          </div>
        )}

      </div>

      {/* --- ESTILOS GLOBALES --- */}
      <style>{`
        @keyframes progress {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress {
          animation: progress 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        /* Scrollbar Personalizado */
        #main-scroll-container::-webkit-scrollbar {
          width: 6px;
        }
        #main-scroll-container::-webkit-scrollbar-track {
          background: transparent;
        }
        #main-scroll-container::-webkit-scrollbar-thumb {
          background-color: ${darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.08)'};
          border-radius: 20px;
        }
        #main-scroll-container::-webkit-scrollbar-thumb:hover {
          background-color: ${darkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.12)'};
        }
      `}</style>
    </div>
  );
};

export default Layout;
import { useState, useEffect, useRef, useMemo } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { es } from "date-fns/locale"; // Para español
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CalendarDays,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { useUIStore } from "../../../store/uiStore";
import { formatDateAsNumber } from "../../../utils/formatters";
import { reporteService } from "../../../services/reporte.service";

const AttendanceCalendar = () => {
  const { currentDate: selectedDate, setCurrentDate: onChange } = useUIStore();
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(formatDateAsNumber(selectedDate)); // Para navegar entre meses
  const containerRef = useRef(null);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sincronizar viewDate si cambia la fecha externa
  useEffect(() => {
    if (selectedDate) setViewDate(formatDateAsNumber(selectedDate));
  }, [selectedDate]);

  // --- Lógica del Calendario ---
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { locale: es });
  const endDate = endOfWeek(monthEnd, { locale: es });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ["Lu", "Ma", "Mi", "Ju", "Vi", "Sá", "Do"];

  // --- Obtener Datos Reales de Asistencia ---
  const { data: attendanceData } = useQuery({
    queryKey: ["calendar-attendance"],
    queryFn: () => reporteService.getEstadisticasGenerales(),
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });

  // Transformar datos de la API en un mapa { "2024-01-15": 95.5, ... }
  const attendanceMap = useMemo(() => {
    if (!attendanceData?.data) return {};

    const map = {};
    const totalEstudiantes = attendanceData.data.totales?.estudiantes || 1;

    // Procesar el array asistencias_por_fecha
    const asistencias = attendanceData.data.asistencias_por_fecha || [];
    asistencias.forEach((item) => {
      if (item.fecha && item.presentes !== undefined) {
        // Calcular porcentaje de asistencia
        const porcentaje = (item.presentes / totalEstudiantes) * 100;
        map[item.fecha] = porcentaje;
      }
    });

    return map;
  }, [attendanceData]);

  const getDayStatus = (day) => {
    const dayFormatted = format(day, "yyyy-MM-dd");

    // Convertimos el día actual del bucle a "yyyy-MM-dd" y comparamos strings idénticos.
    if (dayFormatted === selectedDate) return "selected";

    if (!isSameMonth(day, viewDate)) return "disabled";

    // Usar datos reales de asistencia
    const attendance = attendanceMap[dayFormatted];

    // Si no hay datos para ese día, mostrarlo neutral
    if (attendance === undefined) return "neutral";

    // Clasificar según el porcentaje de asistencia
    if (attendance >= 85) return "good";
    if (attendance >= 70) return "warning";
    return "bad";
  };

  const getStyles = (status) => {
    const base =
      "w-9 h-9 flex items-center justify-center text-sm rounded-full transition-all cursor-pointer relative";

    switch (status) {
      case "selected":
        return `${base} bg-indigo-600 text-white font-bold shadow-md shadow-indigo-500/30 ring-2 ring-indigo-200 dark:ring-indigo-900`;
      case "good":
        return `${base} bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium`;
      case "warning":
        return `${base} bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 font-medium`;
      case "bad":
        return `${base} bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-400 font-medium`;
      case "disabled":
        return `${base} text-slate-300 dark:text-slate-600 cursor-default`;
      default:
        return `${base} text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800`;
    }
  };

  const handleDayClick = (day) => {
    // Ajustar la zona horaria es importante, aquí usamos string simple para input date
    const formatted = format(day, "yyyy-MM-dd"); // for instance 2026-01-15
    onChange(formatted);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Input Trigger (Lo que se ve siempre) */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
      >
        <CalendarIcon className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
        <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
          {format(formatDateAsNumber(selectedDate), "EEEE, d 'de' MMMM", {
            locale: es,
          })}
        </span>
        <div
          className={`ml-2 w-2 h-2 rounded-full ${
            isOpen ? "bg-indigo-500" : "bg-slate-300"
          }`}
        />
      </div>

      {/* Popover del Calendario */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-3 p-4 z-50 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 w-[340px] animate-in fade-in zoom-in-95 duration-200">
          {/* Header del Calendario */}
          <div className="flex items-center justify-between mb-4 px-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setViewDate(subMonths(viewDate, 1));
              }}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize">
                {format(viewDate, "MMMM yyyy", { locale: es })}
              </h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const today = new Date();
                  setViewDate(today);
                  onChange(format(today, "yyyy-MM-dd"));
                  setIsOpen(false);
                }}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-100 text-indigo-700 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-1"
                title="Ir a hoy"
              >
                <CalendarDays className="w-3 h-3" />
                Hoy
              </button>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setViewDate(addMonths(viewDate, 1));
              }}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 mb-2">
            {weekDays.map((d) => (
              <div
                key={d}
                className="text-center text-xs font-semibold text-slate-400 uppercase"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Rejilla de días */}
          <div className="grid grid-cols-7 gap-y-2 gap-x-1">
            {calendarDays.map((day, idx) => {
              const status = getDayStatus(day);
              return (
                <div key={idx} className="flex justify-center">
                  <button
                    onClick={() => handleDayClick(day)}
                    disabled={status === "disabled"}
                    className={getStyles(status)}
                  >
                    {format(day, "d")}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Leyenda */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-center gap-4 text-[10px] text-slate-500 font-medium uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400"></div>Alto
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-amber-400"></div>Medio
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-rose-400"></div>Bajo
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceCalendar;

import { useState, useMemo } from "react";
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
  isToday,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Clock,
  CalendarDays,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { reporteService } from "../../../services/reporte.service";
import { formatDateAsNumber } from "../../../utils/formatters";

const FullAttendanceCalendar = () => {
  const [viewDate, setViewDate] = useState(new Date());
  const navigate = useNavigate();

  // Lógica del calendario
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { locale: es });
  const endDate = endOfWeek(monthEnd, { locale: es });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = [
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
    "Domingo",
  ];

  // Obtener datos de asistencia
  const { data: attendanceData, isLoading } = useQuery({
    queryKey: ["calendar-attendance-full"],
    queryFn: () => reporteService.getEstadisticasGenerales(),
    staleTime: 5 * 60 * 1000,
  });

  // Crear un mapa de asistencias por fecha
  const attendanceByDate = useMemo(() => {
    if (!attendanceData?.data?.asistencias_por_fecha) return {};

    const map = {};
    attendanceData.data.asistencias_por_fecha.forEach((item) => {
      if (item.fecha) {
        map[item.fecha] = {
          presentes: item.presentes || 0,
          ausentes: item.ausentes || 0,
          tardanzas: item.tardanzas || 0,
          justificados: item.justificados || 0,
          total:
            (item.presentes || 0) +
            (item.ausentes || 0) +
            (item.tardanzas || 0) +
            (item.justificados || 0),
        };
      }
    });

    return map;
  }, [attendanceData]);

  const handleDayClick = (day) => {
    const formatted = format(day, "yyyy-MM-dd");
    // Navegar a la página de reportes con la fecha seleccionada
    navigate(`/reportes?fecha=${formatted}`);
  };

  const getDayData = (day) => {
    const formatted = format(day, "yyyy-MM-dd");
    return attendanceByDate[formatted] || null;
  };

  const getAttendancePercentage = (dayData) => {
    if (!dayData || dayData.total === 0) return 0;
    return ((dayData.presentes / dayData.total) * 100).toFixed(0);
  };

  const getDayStatusColor = (dayData) => {
    if (!dayData) return "bg-gray-50";

    const percentage = getAttendancePercentage(dayData);

    if (percentage >= 85) return "bg-green-50 hover:bg-green-100";
    if (percentage >= 70) return "bg-yellow-50 hover:bg-yellow-100";
    return "bg-red-50 hover:bg-red-100";
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header del calendario */}
      <div className="bg-gradient-to-r from-[#615fff] to-indigo-600 px-6 py-5">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setViewDate(subMonths(viewDate, 1))}
            className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white capitalize">
              {format(viewDate, "MMMM yyyy", { locale: es })}
            </h2>
            <button
              onClick={() => setViewDate(new Date())}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white/20 text-white hover:bg-white/30 transition-colors flex items-center gap-1.5"
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Hoy
            </button>
          </div>

          <button
            onClick={() => setViewDate(addMonths(viewDate, 1))}
            className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
        {weekDays.map((day) => (
          <div
            key={day}
            className="px-4 py-3 text-center text-sm font-semibold text-gray-600 uppercase tracking-wide"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Grid de días */}
      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#615fff]"></div>
        </div>
      ) : (
        <div className="grid grid-cols-7 auto-rows-fr min-h-[600px]">
          {calendarDays.map((day, idx) => {
            const dayData = getDayData(day);
            const isCurrentMonth = isSameMonth(day, viewDate);
            const isTodayDay = isToday(day);
            const hasData = dayData && dayData.total > 0;

            return (
              <div
                key={idx}
                onClick={() => isCurrentMonth && handleDayClick(day)}
                className={`
                  relative border-r border-b border-gray-100 p-3
                  transition-all duration-200
                  ${
                    isCurrentMonth
                      ? hasData
                        ? `${getDayStatusColor(dayData)} cursor-pointer`
                        : "bg-white hover:bg-gray-50 cursor-pointer"
                      : "bg-gray-50/50 cursor-default"
                  }
                  ${isTodayDay && isCurrentMonth ? "ring-2 ring-[#615fff] ring-inset" : ""}
                `}
              >
                {/* Número del día */}
                <div className="flex items-start justify-between mb-2">
                  <span
                    className={`
                      text-sm font-semibold
                      ${
                        isTodayDay && isCurrentMonth
                          ? "bg-[#615fff] text-white w-7 h-7 rounded-full flex items-center justify-center"
                          : isCurrentMonth
                          ? "text-gray-900"
                          : "text-gray-400"
                      }
                    `}
                  >
                    {format(day, "d")}
                  </span>

                  {/* Indicador de porcentaje */}
                  {hasData && isCurrentMonth && (
                    <span
                      className={`
                        text-xs font-bold px-2 py-0.5 rounded-full
                        ${
                          getAttendancePercentage(dayData) >= 85
                            ? "bg-green-600 text-white"
                            : getAttendancePercentage(dayData) >= 70
                            ? "bg-yellow-600 text-white"
                            : "bg-red-600 text-white"
                        }
                      `}
                    >
                      {getAttendancePercentage(dayData)}%
                    </span>
                  )}
                </div>

                {/* Detalles de asistencia */}
                {hasData && isCurrentMonth && (
                  <div className="space-y-1">
                    {/* Presentes */}
                    {dayData.presentes > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle2 className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-xs font-medium text-gray-700">
                          {dayData.presentes}
                        </span>
                      </div>
                    )}

                    {/* Ausentes */}
                    {dayData.ausentes > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
                          <XCircle className="w-3 h-3 text-red-600" />
                        </div>
                        <span className="text-xs font-medium text-gray-700">
                          {dayData.ausentes}
                        </span>
                      </div>
                    )}

                    {/* Tardanzas */}
                    {dayData.tardanzas > 0 && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-yellow-100 flex items-center justify-center">
                          <Clock className="w-3 h-3 text-yellow-600" />
                        </div>
                        <span className="text-xs font-medium text-gray-700">
                          {dayData.tardanzas}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Mensaje para días sin datos */}
                {!hasData && isCurrentMonth && (
                  <div className="flex items-center justify-center h-16">
                    <span className="text-xs text-gray-400">Sin datos</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Leyenda */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-gray-600 font-medium">
              Alta asistencia ({">"}85%)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-yellow-500"></div>
            <span className="text-gray-600 font-medium">Media (70-85%)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500"></div>
            <span className="text-gray-600 font-medium">
              Baja ({"<"}70%)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FullAttendanceCalendar;

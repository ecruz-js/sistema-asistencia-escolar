import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Calendar,
  RefreshCw,
  Users,
  Clock,
  ArrowUpRight,
  School,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Filter,
} from "lucide-react";
import { direccionService } from "../../services/direccion.service";
import { useUIStore } from "../../store/uiStore";
import { formatDate, formatDateAsNumber } from "../../utils/formatters";
import AttendanceCalendar from "../../components/common/ui/AttendanceCalendar";
// Componente pequeño para las tarjetas de KPI
const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  color = "indigo",
}) => (
  <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
    <div
      className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-${color}-500`}
    >
      <Icon className="w-16 h-16 transform group-hover:scale-110 transition-transform" />
    </div>
    <div className="relative z-10">
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">
          {title}
        </span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-slate-900 dark:text-white">
          {value}
        </span>
        {subtitle && (
          <span className="text-sm text-slate-500 font-medium">{subtitle}</span>
        )}
      </div>
      {trend && (
        <div
          className={`mt-3 flex items-center gap-1 text-xs font-medium ${
            trend === "up" ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {trend === "up" ? (
            <ArrowUpRight className="w-3 h-3" />
          ) : (
            <AlertCircle className="w-3 h-3" />
          )}
          {trendLabel}
        </div>
      )}
    </div>
  </div>
);

const AdminDashboard = () => {
  const { currentDate, setCurrentDate } = useUIStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewFilter, setViewFilter] = useState("all"); // all, pending, completed

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["dashboard", currentDate],
    queryFn: () => direccionService.getDashboard(currentDate),
  });

  const dashboard = data?.data;

  // Extracción de datos segura
  const stats = useMemo(() => {
    if (!dashboard) return null;
    const est = dashboard.estudiantes || {};
    const total = est.total || 0;
    const presentes = est.presentes || 0;

    // Cálculo de porcentaje
    const tasa = total > 0 ? (presentes / total) * 100 : 0;

    return {
      estudiantes: { ...est, tasa },
      personal: dashboard.personal || {},
      grados: dashboard.progreso_grados || {
        completados: 0,
        pendientes: 0,
        total: 0,
      },
      // Simulamos listas de grados si el backend no las devuelve aún (Ajustar según tu API real)
      listasGrados: {
        completados: dashboard.grados_completados_recientes || [],
        // Si el backend no devuelve los pendientes explícitamente, esto debería venir de la API
        pendientes: dashboard.grados_pendientes_lista || [],
      },
    };
  }, [dashboard]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[500px]">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-medium animate-pulse">
          Analizando datos del centro...
        </p>
      </div>
    );
  }

  return (
    <div className="h-full animate-in fade-in zoom-in-95 duration-500 space-y-6 p-6 sm:p-8 max-w-[1600px] mx-auto">
      {/* Header Premium */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Panel General
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Resumen de operaciones del{" "}
            <span className="font-medium text-indigo-600 dark:text-indigo-400">
              {formatDate(formatDateAsNumber(currentDate), "EEEE, d 'de' MMMM")}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="relative">
            <AttendanceCalendar />
          </div>
          <button
            onClick={handleRefresh}
            className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl transition-all"
            title="Actualizar datos"
          >
            <RefreshCw
              className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Grid Principal de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Asistencia Global"
          value={`${stats.estudiantes.tasa.toFixed(1)}%`}
          subtitle="del alumnado"
          icon={BarChart3}
          color="indigo"
          trend={stats.estudiantes.tasa > 85 ? "up" : "down"}
          trendLabel={
            stats.estudiantes.tasa > 85 ? "Nivel óptimo" : "Atención requerida"
          }
        />
        <StatCard
          title="Estudiantes Hoy"
          value={stats.estudiantes.presentes}
          subtitle={`de ${stats.estudiantes.total} inscritos`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Reporte Grados"
          value={`${stats.grados.porcentaje}%`}
          subtitle={`${stats.grados.completados} reportados`}
          icon={School}
          color="emerald"
          trend="up"
          trendLabel={`${stats.grados.pendientes} pendientes`}
        />
        <StatCard
          title="Ausentismo"
          value={stats.estudiantes.ausentes}
          subtitle="Estudiantes faltaron"
          icon={AlertTriangle}
          color="rose"
          trend="down"
          trendLabel="Impacto crítico"
        />
      </div>

      {/* Sección Central: Desglose y Estado de Cursos */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Columna Izquierda (2/3): Estado de los Grados - LA INFORMACIÓN VALIOSA */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Card: Monitor de Entrega de Asistencia */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex-1 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-indigo-500" />
                  Monitor de Reportes por Grado
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Control de qué secciones han enviado la asistencia hoy.
                </p>
              </div>
              <div className="flex gap-2">
                {["all", "pending", "completed"].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setViewFilter(filter)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors capitalize ${
                      viewFilter === filter
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
                    }`}
                  >
                    {filter === "all"
                      ? "Todos"
                      : filter === "pending"
                      ? "Pendientes"
                      : "Completados"}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-0">
              {/* Aquí simulamos una tabla/lista con estados. En producción usarías los datos reales */}
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3">Grado / Sección</th>
                      <th className="px-6 py-3">Docente</th>
                      <th className="px-6 py-3">Hora</th>
                      <th className="px-6 py-3 text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {/* Renderizado condicional de la lista de completados */}
                    {(viewFilter === "all" || viewFilter === "completed") &&
                      stats.listasGrados.completados.map((item, idx) => (
                        <tr
                          key={`comp-${idx}`}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                            {item.grado?.nombre || "Desconocido"}
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                            {item.docente?.nombre || "---"}
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-mono">
                            {item.hora_completada}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" /> Enviado
                            </span>
                          </td>
                        </tr>
                      ))}

                    {/* Fila Mockup para PENDIENTES (Si tu API aún no devuelve la lista de pendientes explícita, visualiza esto) */}
                    {(viewFilter === "all" || viewFilter === "pending") &&
                      Array.from({
                        length: Math.max(stats.grados.pendientes, 0),
                      }).map((_, idx) => (
                        <tr
                          key={`pend-${idx}`}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors bg-rose-50/30 dark:bg-rose-900/10"
                        >
                          <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                            {/* Aquí iría el nombre real si la API lo da */}
                            Grado Pendiente #{idx + 1}
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-400">
                            -- No asignado --
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-mono">
                            --:--
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400">
                              <Clock className="w-3 h-3" /> Pendiente
                            </span>
                          </td>
                        </tr>
                      ))}

                    {stats.grados.total === 0 && (
                      <tr>
                        <td
                          colSpan="4"
                          className="px-6 py-8 text-center text-slate-500"
                        >
                          No hay grados registrados para mostrar.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha (1/3): Resumen y Acciones */}
        <div className="space-y-6">
          {/* Gráfico Visual de Asistencia */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-6">
              Desglose de Asistencia
            </h3>

            <div className="space-y-6">
              {/* Barra de Progreso Maestra */}
              <div className="relative pt-2">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300">
                      Asistencia Total
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-indigo-600 dark:text-indigo-400">
                      {stats.estudiantes.tasa.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    style={{ width: `${stats.estudiantes.tasa}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500 transition-all duration-1000"
                  ></div>
                </div>
              </div>

              {/* Estadísticas Secundarias */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-500 mb-1">Tardanzas</p>
                  <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {dashboard?.estudiantes?.tardanzas || 0}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-xs text-slate-500 mb-1">Ausentes</p>
                  <p className="text-lg font-bold text-rose-600 dark:text-rose-400">
                    {dashboard?.estudiantes?.ausentes || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Estado MINERD (Accionable) */}
          <div
            className={`rounded-2xl border p-6 shadow-sm transition-all ${
              dashboard?.puede_enviar_minerd && !dashboard?.ya_enviado_minerd
                ? "bg-indigo-600 border-indigo-500 text-white ring-4 ring-indigo-500/20"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3
                  className={`font-bold text-lg ${
                    dashboard?.puede_enviar_minerd &&
                    !dashboard?.ya_enviado_minerd
                      ? "text-white"
                      : "text-slate-900 dark:text-white"
                  }`}
                >
                  Sincronización MINERD
                </h3>
                <p
                  className={`text-sm mt-1 opacity-90 ${
                    dashboard?.puede_enviar_minerd &&
                    !dashboard?.ya_enviado_minerd
                      ? "text-indigo-100"
                      : "text-slate-500"
                  }`}
                >
                  {dashboard?.ya_enviado_minerd
                    ? "Los datos han sido enviados exitosamente."
                    : dashboard?.puede_enviar_minerd
                    ? "Todos los grados han completado el reporte. Listo para enviar."
                    : `Esperando ${stats.grados.pendientes} grados para habilitar el envío.`}
                </p>
              </div>
              <div
                className={`p-3 rounded-xl ${
                  dashboard?.puede_enviar_minerd &&
                  !dashboard?.ya_enviado_minerd
                    ? "bg-white/20"
                    : "bg-slate-100 dark:bg-slate-800"
                }`}
              >
                {dashboard?.ya_enviado_minerd ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                ) : (
                  <School className="w-6 h-6" />
                )}
              </div>
            </div>

            {dashboard?.puede_enviar_minerd &&
              !dashboard?.ya_enviado_minerd && (
                <button
                  onClick={() => (window.location.href = "/direccion/minerd")}
                  className="mt-6 w-full py-3 bg-white text-indigo-600 font-bold rounded-xl shadow-lg hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
                >
                  Enviar Reporte Oficial <ChevronRight className="w-4 h-4" />
                </button>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

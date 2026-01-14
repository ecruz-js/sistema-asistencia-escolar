import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Calendar, 
  Download, 
  Filter, 
  Search,
  UserCheck,
  UserX,
  Clock,
  CheckCircle,
  ChevronDown,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { reporteService } from "../../services/reporte.service";
import { useUIStore } from "../../store/uiStore";
import { formatDate, getNombreCompleto } from "../../utils/formatters";

const ListaAsistencia = () => {
  const { darkMode } = useUIStore();
  const [fechaInicio, setFechaInicio] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [fechaFin, setFechaFin] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [gradoFilter, setGradoFilter] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("");
  const [search, setSearch] = useState("");

  // Obtener asistencias
  const { data, isLoading } = useQuery({
    queryKey: ["asistencias-rango", fechaInicio, fechaFin, gradoFilter],
    queryFn: () =>
      reporteService.getAsistenciaPorRango({
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        grado_id: gradoFilter || undefined,
      }),
  });

  const asistencias = data?.data?.asistencias || [];
  const estadisticas = data?.data?.estadisticas;

  // Filtrar por búsqueda y estado
  const asistenciasFiltradas = asistencias.filter((asistencia) => {
    const matchSearch =
      !search ||
      getNombreCompleto(asistencia.estudiante)
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      asistencia.estudiante?.codigo_estudiante
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchEstado = !estadoFilter || asistencia.estado === estadoFilter;

    return matchSearch && matchEstado;
  });

  const getStatusBadge = (estado) => {
    const badges = {
      presente: {
        bg: "bg-emerald-50 dark:bg-emerald-900/30",
        border: "border-emerald-100 dark:border-emerald-800",
        text: "text-emerald-600 dark:text-emerald-400",
        icon: CheckCircle,
        label: "Presente"
      },
      ausente: {
        bg: "bg-rose-50 dark:bg-rose-900/30",
        border: "border-rose-100 dark:border-rose-800",
        text: "text-rose-600 dark:text-rose-400",
        icon: UserX,
        label: "Ausente"
      },
      tardanza: {
        bg: "bg-amber-50 dark:bg-amber-900/30",
        border: "border-amber-100 dark:border-amber-800",
        text: "text-amber-600 dark:text-amber-400",
        icon: Clock,
        label: "Tardanza"
      },
      justificado: {
        bg: "bg-blue-50 dark:bg-blue-900/30",
        border: "border-blue-100 dark:border-blue-800",
        text: "text-blue-600 dark:text-blue-400",
        icon: CheckCircle,
        label: "Justificado"
      }
    };

    const badge = badges[estado] || badges.presente;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold border ${badge.bg} ${badge.border} ${badge.text}`}>
        <Icon className="w-3.5 h-3.5 mr-1.5" strokeWidth={3} />
        {badge.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Lista de Asistencias
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Historial de asistencias registradas
          </p>
        </div>

        <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-sm transition-colors shadow-sm">
          <Download className="w-4 h-4" />
          Exportar Excel
        </button>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total */}
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Registros</p>
              <div className="h-9 w-9 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {estadisticas.total_registros}
            </p>
          </div>

          {/* Presentes */}
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Presentes</p>
              <div className="h-9 w-9 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {estadisticas.presentes}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {((estadisticas.presentes / estadisticas.total_registros) * 100).toFixed(1)}%
            </p>
          </div>

          {/* Ausentes */}
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Ausentes</p>
              <div className="h-9 w-9 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
                <UserX className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">
              {estadisticas.ausentes}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {((estadisticas.ausentes / estadisticas.total_registros) * 100).toFixed(1)}%
            </p>
          </div>

          {/* Tardanzas */}
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tardanzas</p>
              <div className="h-9 w-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {estadisticas.tardanzas}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {((estadisticas.tardanzas / estadisticas.total_registros) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      )}

      {/* Main Card con Tabla */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Filter Bar */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Búsqueda */}
            <div className="lg:col-span-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar estudiante..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
                />
              </div>
            </div>

            {/* Fecha Inicio */}
            <div>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

            {/* Fecha Fin */}
            <div>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

            {/* Grado */}
            <div>
              <select
                value={gradoFilter}
                onChange={(e) => setGradoFilter(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              >
                <option value="">Todos los grados</option>
              </select>
            </div>

            {/* Estado */}
            <div>
              <select
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
              >
                <option value="">Todos los estados</option>
                <option value="presente">Presente</option>
                <option value="ausente">Ausente</option>
                <option value="tardanza">Tardanza</option>
                <option value="justificado">Justificado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabla */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="w-12 h-12 border-3 border-slate-200 dark:border-slate-800 rounded-full" />
              <div className="absolute top-0 left-0 w-12 h-12 border-3 border-indigo-500 rounded-full border-t-transparent animate-spin" />
            </div>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[900px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="p-5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300">
                      Fecha
                      <ChevronDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300">
                      Estudiante
                      <ChevronDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300">
                      Grado
                      <ChevronDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300">
                      Estado
                      <ChevronDown className="w-3 h-3" />
                    </div>
                  </th>
                  <th className="p-5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Observaciones
                  </th>
                  <th className="p-5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Docente
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {asistenciasFiltradas.map((asistencia) => (
                  <tr 
                    key={asistencia.id} 
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150"
                  >
                    <td className="p-5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {formatDate(asistencia.fecha)}
                        </span>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-9 h-9 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                          {asistencia.estudiante?.nombre?.charAt(0)}
                          {asistencia.estudiante?.apellido?.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-800 dark:text-white leading-tight">
                            {getNombreCompleto(asistencia.estudiante)}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                            {asistencia.estudiante?.codigo_estudiante}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 whitespace-nowrap">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {asistencia.grado?.nombre}
                      </span>
                    </td>
                    <td className="p-5 whitespace-nowrap">
                      {getStatusBadge(asistencia.estado)}
                    </td>
                    <td className="p-5">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {asistencia.observaciones || "-"}
                      </span>
                    </td>
                    <td className="p-5 whitespace-nowrap">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {asistencia.docente?.nombre} {asistencia.docente?.apellido}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && asistenciasFiltradas.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-semibold mb-1">
              No se encontraron registros
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        )}

      </div>
    </div>
  );
};

export default ListaAsistencia;
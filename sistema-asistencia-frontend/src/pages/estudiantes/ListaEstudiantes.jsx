import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ChevronDown,
  ArrowUpDown,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  MoreHorizontal,
  UserCheck,
  UserX,
  Clock,
} from "lucide-react";
import { estudianteService } from "../../services/estudiante.service";
import { useUIStore } from "../../store/uiStore";
import { gradoService } from "../../services/grado.service";

const ListaEstudiantes = () => {
  const navigate = useNavigate();
  const { darkMode } = useUIStore();
  const [search, setSearch] = useState("");
  const [gradoFilter, setGradoFilter] = useState("");
  const [grados, setGrados] = useState([]);
  const [estatusFilter, setEstatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);

  const { data, isLoading } = useQuery({
    queryKey: ["estudiantes", search, gradoFilter, estatusFilter, page],
    queryFn: () =>
      estudianteService.getAll({
        search,
        grado_id: gradoFilter || undefined,
        activo: estatusFilter || undefined,
        page,
      }),
  });
  const { data: gradosData } = useQuery({
    queryKey: ["grados"],
    queryFn: () => gradoService.getAll(),
  });
  console.log(gradosData);

  const estudiantes = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;
  const totalEstudiantes =
    data?.pagination?.total || data?.pagination?.totalCount || 0;

  console.log(estudiantes);
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(estudiantes.map((est) => est.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const getStatusBadge = (activo) => {
    if (activo) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-emerald-50 border border-emerald-100 text-emerald-600">
          <UserCheck className="w-3.5 h-3.5 mr-1.5" strokeWidth={3} />
          Activo
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-slate-50 border border-slate-100 text-slate-600">
        <UserX className="w-3.5 h-3.5 mr-1.5" strokeWidth={3} />
        Inactivo
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Estudiantes
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          {totalEstudiantes} estudiantes registrados
        </p>
      </div>

      {/* Main Card */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 border-b border-slate-100 dark:border-slate-800">
          {/* Search */}
          <div className="relative w-full lg:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition"
              placeholder="Buscar estudiante..."
            />
          </div>

          {/* Right Side Filters */}
          <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0">
            {/* Grado Dropdown */}
            <select
              value={gradoFilter}
              onChange={(e) => setGradoFilter(e.target.value)}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todos los grados</option>
              {gradosData?.data
                ?.slice()
                .sort((a, b) => a.id - b.id)
                .map((grado) => (
                  <option key={grado.id} value={grado.id}>
                    {grado.nombre}
                  </option>
                ))}
            </select>

            {/* Status Dropdown */}
            <select
              value={estatusFilter}
              onChange={(e) => setEstatusFilter(e.target.value)}
              className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todos los estados</option>
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
            </select>

            {/* Separator */}
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

            {/* Sort Button */}
            <button className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300">
              <ArrowUpDown className="w-4 h-4" />
            </button>

            {/* Filter Button */}
            <button className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="relative">
              <div className="w-12 h-12 border-3 border-slate-200 dark:border-slate-800 rounded-full" />
              <div className="absolute top-0 left-0 w-12 h-12 border-3 border-indigo-500 rounded-full border-t-transparent animate-spin" />
            </div>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[800px] text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800">
                  <th className="p-5 w-14">
                    <div className="flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={
                          selectedIds.length === estudiantes.length &&
                          estudiantes.length > 0
                        }
                        onChange={handleSelectAll}
                        className="w-4 h-4 text-indigo-600 border-slate-300 dark:border-slate-600 rounded focus:ring-indigo-500 cursor-pointer"
                      />
                    </div>
                  </th>
                  <th className="p-5 text-xs font-medium text-slate-400 uppercase tracking-wider">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-slate-600 dark:hover:text-slate-300">
                      Código
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
                  <th className="p-5 text-xs font-medium text-slate-400 uppercase tracking-wider text-right">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {estudiantes.map((estudiante) => (
                  <tr
                    key={estudiante.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-150 group"
                  >
                    <td className="p-5">
                      <div className="flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(estudiante.id)}
                          onChange={() => handleSelectOne(estudiante.id)}
                          className="w-4 h-4 text-indigo-600 border-slate-200 dark:border-slate-700 rounded focus:ring-indigo-500 cursor-pointer"
                        />
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {estudiante.codigo || "N/A"}
                      </span>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="flex-shrink-0 w-9 h-9 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                          {estudiante.foto_url ? (
                            <img
                              src={estudiante.foto_url}
                              alt={estudiante.nombre}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            estudiante.nombre?.charAt(0) || "E"
                          )}
                        </div>
                        {/* Student Details */}
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-slate-800 dark:text-white leading-tight">
                            {estudiante.nombre} {estudiante.apellido}
                          </span>
                          <span className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                            {estudiante.cedula || "Sin cédula"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {estudiante.grado?.nombre || "Sin grado"}
                      </span>
                    </td>
                    <td className="p-5">{getStatusBadge(estudiante.activo)}</td>
                    <td className="p-5">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            navigate(`/estudiantes/${estudiante.id}`)
                          }
                          className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all hover:shadow-sm"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 transition-all hover:shadow-sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && estudiantes.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Search className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-600 dark:text-slate-400 font-semibold mb-1">
              No se encontraron estudiantes
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500">
              Intenta ajustar los filtros de búsqueda
            </p>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && estudiantes.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 border-t border-slate-100 dark:border-slate-800">
            {/* Pagination Controls */}
            <div className="flex items-center gap-2 order-2 sm:order-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Anterior
              </button>

              <div className="flex items-center gap-1">
                {[...Array(Math.min(totalPages, 5))].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      page === i + 1
                        ? "bg-indigo-500 text-white"
                        : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                {totalPages > 5 && (
                  <>
                    <div className="w-9 h-9 flex items-center justify-center text-slate-400 text-sm">
                      ...
                    </div>
                    <button
                      onClick={() => setPage(totalPages)}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                        page === totalPages
                          ? "bg-indigo-500 text-white"
                          : "border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                      }`}
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>

            {/* Results Count */}
            <div className="text-sm text-slate-500 dark:text-slate-400 order-1 sm:order-2">
              Mostrando{" "}
              <span className="font-medium text-slate-900 dark:text-white">
                {estudiantes.length}
              </span>{" "}
              de{" "}
              <span className="font-medium text-slate-900 dark:text-white">
                {totalEstudiantes}
              </span>{" "}
              estudiantes
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaEstudiantes;

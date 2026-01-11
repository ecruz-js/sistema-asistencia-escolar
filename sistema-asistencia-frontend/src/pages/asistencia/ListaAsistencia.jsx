import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Download, Filter, Search } from "lucide-react";
import { reporteService } from "../../services/reporte.service";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Input from "../../components/common/Input";
import Spinner from "../../components/common/Spinner";
import { formatDate, getNombreCompleto } from "../../utils/formatters";
import {
  ESTADOS_ASISTENCIA_COLORS,
  ESTADOS_ASISTENCIA_LABELS,
} from "../../utils/constants";

const ListaAsistencia = () => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Lista de Asistencias
          </h1>
          <p className="text-gray-500 mt-1">
            Historial de asistencias registradas
          </p>
        </div>

        <Button variant="outline" icon={Download}>
          Exportar Excel
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Búsqueda */}
          <div className="lg:col-span-2">
            <Input
              placeholder="Buscar estudiante..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
            />
          </div>

          {/* Fecha Inicio */}
          <div>
            <label className="label">Desde</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="input"
            />
          </div>

          {/* Fecha Fin */}
          <div>
            <label className="label">Hasta</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="input"
            />
          </div>

          {/* Estado */}
          <div>
            <label className="label">Estado</label>
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              className="input"
            >
              <option value="">Todos</option>
              <option value="presente">Presente</option>
              <option value="ausente">Ausente</option>
              <option value="tardanza">Tardanza</option>
              <option value="justificado">Justificado</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card padding={true}>
            <p className="text-sm text-gray-500">Total Registros</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {estadisticas.total_registros}
            </p>
          </Card>

          <Card padding={true}>
            <p className="text-sm text-gray-500">Presentes</p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {estadisticas.presentes}
            </p>
          </Card>

          <Card padding={true}>
            <p className="text-sm text-gray-500">Ausentes</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {estadisticas.ausentes}
            </p>
          </Card>

          <Card padding={true}>
            <p className="text-sm text-gray-500">Tardanzas</p>
            <p className="text-2xl font-bold text-yellow-600 mt-1">
              {estadisticas.tardanzas}
            </p>
          </Card>
        </div>
      )}

      {/* Tabla de Asistencias */}
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estudiante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Grado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Observaciones
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Docente
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {asistenciasFiltradas.map((asistencia) => (
                  <tr key={asistencia.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(asistencia.fecha)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-700 font-semibold text-sm">
                            {asistencia.estudiante?.nombre?.charAt(0)}
                            {asistencia.estudiante?.apellido?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {getNombreCompleto(asistencia.estudiante)}
                          </p>
                          <p className="text-xs text-gray-500">
                            {asistencia.estudiante?.codigo_estudiante}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm font-medium text-gray-900">
                        {asistencia.grado?.nombre}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        className={ESTADOS_ASISTENCIA_COLORS[asistencia.estado]}
                      >
                        {ESTADOS_ASISTENCIA_LABELS[asistencia.estado]}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">
                        {asistencia.observaciones || "-"}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="text-sm text-gray-600">
                        {asistencia.docente?.nombre}{" "}
                        {asistencia.docente?.apellido}
                      </p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {asistenciasFiltradas.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  No se encontraron registros de asistencia
                </p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ListaAsistencia;

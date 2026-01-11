import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Download,
  Printer,
  TrendingUp,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { reporteService } from "../../services/reporte.service";
import { useUIStore } from "../../store/uiStore";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Spinner from "../../components/common/Spinner";
import { formatDate, formatPercentage } from "../../utils/formatters";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = {
  presente: "#10b981",
  ausente: "#ef4444",
  tardanza: "#f59e0b",
  justificado: "#3b82f6",
};

const ReporteDiario = () => {
  const { currentDate, setCurrentDate } = useUIStore();

  // Obtener reporte diario
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["reporte-diario", currentDate],
    queryFn: () => reporteService.getAsistenciaDiaria(currentDate),
  });

  const reporte = data?.data;
  const resumen = reporte?.resumen;
  const asistencias = reporte?.asistencias || [];

  // Preparar datos para gráficas
  const dataPie = resumen
    ? [
        { name: "Presentes", value: resumen.presentes, color: COLORS.presente },
        { name: "Ausentes", value: resumen.ausentes, color: COLORS.ausente },
        { name: "Tardanzas", value: resumen.tardanzas, color: COLORS.tardanza },
        {
          name: "Justificados",
          value: resumen.justificados,
          color: COLORS.justificado,
        },
      ]
    : [];

  // Agrupar por grado
  const asistenciasPorGrado = asistencias.reduce((acc, asistencia) => {
    const gradoNombre = asistencia.grado?.nombre || "Sin grado";
    if (!acc[gradoNombre]) {
      acc[gradoNombre] = {
        grado: gradoNombre,
        presentes: 0,
        ausentes: 0,
        tardanzas: 0,
        justificados: 0,
      };
    }
    acc[gradoNombre][asistencia.estado + "s"]++;
    return acc;
  }, {});

  const dataBar = Object.values(asistenciasPorGrado);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Reporte Diario de Asistencia
          </h1>
          <p className="text-gray-500 mt-1">
            Vista detallada de asistencias del día
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            className="input"
          />
          <Button variant="outline" icon={Download}>
            Exportar
          </Button>
          <Button variant="outline" icon={Printer}>
            Imprimir
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Cards de Resumen */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {/* Total */}
            <Card padding={true}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {resumen?.total || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </Card>

            {/* Presentes */}
            <Card padding={true}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Presentes</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {resumen?.presentes || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatPercentage(
                      resumen?.presentes || 0,
                      resumen?.total || 1
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            {/* Ausentes */}
            <Card padding={true}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Ausentes</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">
                    {resumen?.ausentes || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatPercentage(
                      resumen?.ausentes || 0,
                      resumen?.total || 1
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </Card>

            {/* Tardanzas */}
            <Card padding={true}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Tardanzas</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-1">
                    {resumen?.tardanzas || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatPercentage(
                      resumen?.tardanzas || 0,
                      resumen?.total || 1
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </Card>

            {/* Justificados */}
            <Card padding={true}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Justificados</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">
                    {resumen?.justificados || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatPercentage(
                      resumen?.justificados || 0,
                      resumen?.total || 1
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Gráficas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfica de Pastel */}
            <Card title="Distribución de Asistencias">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={dataPie}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {dataPie.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            {/* Gráfica de Barras por Grado */}
            <Card title="Asistencias por Grado">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dataBar}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="grado" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="presentes"
                    fill={COLORS.presente}
                    name="Presentes"
                  />
                  <Bar
                    dataKey="ausentes"
                    fill={COLORS.ausente}
                    name="Ausentes"
                  />
                  <Bar
                    dataKey="tardanzas"
                    fill={COLORS.tardanza}
                    name="Tardanzas"
                  />
                  <Bar
                    dataKey="justificados"
                    fill={COLORS.justificado}
                    name="Justificados"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          {/* Tabla Detallada */}
          <Card
            title="Detalle de Asistencias"
            subtitle={`${asistencias.length} registros`}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
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
                  {asistencias.map((asistencia) => (
                    <tr key={asistencia.id} className="hover:bg-gray-50">
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
                              {asistencia.estudiante?.nombre}{" "}
                              {asistencia.estudiante?.apellido}
                            </p>
                            <p className="text-xs text-gray-500">
                              {asistencia.estudiante?.codigo_estudiante}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm font-medium text-gray-900">
                          {asistencia.grado?.nombre || "-"}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          className={
                            asistencia.estado === "presente"
                              ? "bg-green-100 text-green-800"
                              : asistencia.estado === "ausente"
                              ? "bg-red-100 text-red-800"
                              : asistencia.estado === "tardanza"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                          }
                        >
                          {asistencia.estado}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600">
                          {asistencia.observaciones || "-"}
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="text-sm text-gray-600">
                          {asistencia.docente?.nombre || "-"}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {asistencias.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    No hay registros de asistencia para esta fecha
                  </p>
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default ReporteDiario;

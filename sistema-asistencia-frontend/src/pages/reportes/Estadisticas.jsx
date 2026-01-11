import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  TrendingUp,
  Users,
  GraduationCap,
  Download,
} from "lucide-react";
import { reporteService } from "../../services/reporte.service";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import { formatDate, formatPercentage } from "../../utils/formatters";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Estadisticas = () => {
  const [fechaInicio, setFechaInicio] = useState(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [fechaFin, setFechaFin] = useState(
    new Date().toISOString().split("T")[0]
  );

  // Obtener estadísticas
  const { data, isLoading } = useQuery({
    queryKey: ["estadisticas", fechaInicio, fechaFin],
    queryFn: () =>
      reporteService.getEstadisticasGenerales({
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      }),
  });

  const estadisticas = data?.data;
  const totales = estadisticas?.totales;
  const asistenciasPorFecha = estadisticas?.asistencias_por_fecha || [];

  // Preparar datos para gráfica
  const dataGrafica = asistenciasPorFecha.map((item) => ({
    fecha: formatDate(item.fecha, "dd/MM"),
    Presentes: item.presentes,
    Ausentes: item.ausentes,
    Tardanzas: item.tardanzas,
    Justificados: item.justificados,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Estadísticas Generales
          </h1>
          <p className="text-gray-500 mt-1">
            Análisis de asistencias en el tiempo
          </p>
        </div>

        <Button variant="outline" icon={Download}>
          Exportar Reporte
        </Button>
      </div>

      {/* Filtros de Fecha */}
      <Card>
        <div className="flex flex-col sm:flex-row items-end gap-4">
          <div className="flex-1">
            <label className="label">Fecha Inicio</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="input"
            />
          </div>
          <div className="flex-1">
            <label className="label">Fecha Fin</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="input"
            />
          </div>
          <Button variant="primary">Aplicar Filtros</Button>
        </div>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Cards de Totales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card padding={true}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Estudiantes</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {totales?.estudiantes || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card padding={true}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Grados</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {totales?.grados || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </Card>

            <Card padding={true}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Docentes</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {totales?.docentes || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Promedio de Asistencia */}
          <Card
            title="Promedio de Asistencia"
            subtitle="En el periodo seleccionado"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Promedio Presentes</p>
                  <p className="text-4xl font-bold text-primary-600">
                    {estadisticas?.promedio_presentes || 0}
                  </p>
                  <p className="text-sm text-gray-500">estudiantes por día</p>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-2">
                    Porcentaje de Asistencia
                  </p>
                  <div className="relative inline-flex items-center justify-center w-32 h-32">
                    <svg className="w-full h-full">
                      <circle
                        className="text-gray-200"
                        strokeWidth="8"
                        stroke="currentColor"
                        fill="transparent"
                        r="56"
                        cx="64"
                        cy="64"
                      />
                      <circle
                        className="text-primary-600"
                        strokeWidth="8"
                        strokeDasharray={2 * Math.PI * 56}
                        strokeDashoffset={
                          2 *
                          Math.PI *
                          56 *
                          (1 -
                            (estadisticas?.promedio_presentes || 0) /
                              (totales?.estudiantes || 1))
                        }
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="56"
                        cx="64"
                        cy="64"
                      />
                    </svg>
                    <span className="absolute text-2xl font-bold text-gray-900">
                      {formatPercentage(
                        estadisticas?.promedio_presentes || 0,
                        totales?.estudiantes || 1
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Gráfica de Tendencia */}
          <Card
            title="Tendencia de Asistencias"
            subtitle={`Del ${formatDate(fechaInicio)} al ${formatDate(
              fechaFin
            )}`}
          >
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={dataGrafica}>
                <defs>
                  <linearGradient
                    id="colorPresentes"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient
                    id="colorAusentes"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="Presentes"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorPresentes)"
                />
                <Area
                  type="monotone"
                  dataKey="Ausentes"
                  stroke="#ef4444"
                  fillOpacity={1}
                  fill="url(#colorAusentes)"
                />
                <Line type="monotone" dataKey="Tardanzas" stroke="#f59e0b" />
                <Line type="monotone" dataKey="Justificados" stroke="#3b82f6" />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          {/* Tabla de Datos Diarios */}
          <Card
            title="Datos Diarios"
            subtitle={`${asistenciasPorFecha.length} días registrados`}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Presentes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Ausentes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Tardanzas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Justificados
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      % Asistencia
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {asistenciasPorFecha.map((item, index) => {
                    const total =
                      item.presentes +
                      item.ausentes +
                      item.tardanzas +
                      item.justificados;
                    const porcentaje = formatPercentage(
                      item.presentes + item.tardanzas,
                      total
                    );

                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="font-medium text-gray-900">
                              {formatDate(item.fecha)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-green-600 font-semibold">
                            {item.presentes}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-red-600 font-semibold">
                            {item.ausentes}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-yellow-600 font-semibold">
                            {item.tardanzas}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-blue-600 font-semibold">
                            {item.justificados}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-primary-600 h-2 rounded-full"
                                style={{
                                  width: porcentaje,
                                }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900 w-12">
                              {porcentaje}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {asistenciasPorFecha.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500">
                    No hay datos para el periodo seleccionado
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

export default Estadisticas;

import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  Download,
  Printer,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import { reporteService } from "../../services/reporte.service";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import FullAttendanceCalendar from "../../components/common/ui/FullAttendanceCalendar";
import { formatPercentage } from "../../utils/formatters";

const CalendarioAsistencia = () => {
  // Obtener estadísticas generales
  const { data, isLoading } = useQuery({
    queryKey: ["estadisticas-calendario"],
    queryFn: () => reporteService.getEstadisticasGenerales(),
  });

  const estadisticas = data?.data;
  const totales = estadisticas?.totales;

  // Calcular totales de asistencia
  const totalAsistencias = estadisticas?.asistencias_por_fecha?.reduce(
    (acc, item) => {
      return {
        presentes: acc.presentes + (item.presentes || 0),
        ausentes: acc.ausentes + (item.ausentes || 0),
        tardanzas: acc.tardanzas + (item.tardanzas || 0),
        justificados: acc.justificados + (item.justificados || 0),
      };
    },
    { presentes: 0, ausentes: 0, tardanzas: 0, justificados: 0 }
  ) || { presentes: 0, ausentes: 0, tardanzas: 0, justificados: 0 };

  const totalRegistros =
    totalAsistencias.presentes +
    totalAsistencias.ausentes +
    totalAsistencias.tardanzas +
    totalAsistencias.justificados;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Calendario de Asistencia
          </h1>
          <p className="text-gray-500 mt-1">
            Vista mensual completa con detalles de asistencia por día
          </p>
        </div>

        <div className="flex items-center gap-3">
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
          {/* Cards de Estadísticas Generales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Estudiantes */}
            <Card padding={true}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Estudiantes</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {totales?.estudiantes || 0}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {totales?.grados || 0} grados
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </Card>

            {/* Presentes */}
            <Card padding={true}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Presentes</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {totalAsistencias.presentes}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatPercentage(
                      totalAsistencias.presentes,
                      totalRegistros || 1
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
                  <p className="text-sm text-gray-500">Total Ausentes</p>
                  <p className="text-3xl font-bold text-red-600 mt-1">
                    {totalAsistencias.ausentes}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatPercentage(
                      totalAsistencias.ausentes,
                      totalRegistros || 1
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
                  <p className="text-sm text-gray-500">Total Tardanzas</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-1">
                    {totalAsistencias.tardanzas}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatPercentage(
                      totalAsistencias.tardanzas,
                      totalRegistros || 1
                    )}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">
                  Cómo usar el calendario
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  Haz clic en cualquier día del calendario para ver el reporte
                  detallado de asistencia de esa fecha. Los días están
                  coloreados según el porcentaje de asistencia: verde (
                  {">"}85%), amarillo (70-85%), y rojo ({"<"}70%).
                </p>
              </div>
            </div>
          </div>

          {/* Calendario Completo */}
          <FullAttendanceCalendar />
        </>
      )}
    </div>
  );
};

export default CalendarioAsistencia;

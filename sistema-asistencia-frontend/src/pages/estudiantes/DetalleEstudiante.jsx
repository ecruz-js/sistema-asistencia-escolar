import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  User,
  Calendar,
  GraduationCap,
  MapPin,
  Phone,
  Mail,
  Edit,
  TrendingUp,
} from "lucide-react";
import { estudianteService } from "../../services/estudiante.service";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Spinner from "../../components/common/Spinner";
import {
  formatDate,
  getNombreCompleto,
  formatPercentage,
} from "../../utils/formatters";
import {
  ESTADOS_ASISTENCIA_COLORS,
  ESTADOS_ASISTENCIA_LABELS,
} from "../../utils/constants";

const DetalleEstudiante = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Obtener datos del estudiante
  const { data: estudianteData, isLoading: loadingEstudiante } = useQuery({
    queryKey: ["estudiante", id],
    queryFn: () => estudianteService.getById(id),
  });

  // Obtener historial de asistencia
  const { data: historialData, isLoading: loadingHistorial } = useQuery({
    queryKey: ["estudiante-asistencia", id],
    queryFn: () => estudianteService.getHistorialAsistencia(id, { limit: 30 }),
  });

  const estudiante = estudianteData?.data
  const historial = historialData?.data?.asistencias || [];
  const estadisticas = historialData?.data?.estadisticas;

  if (loadingEstudiante) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!estudiante) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-gray-500">Estudiante no encontrado</p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => navigate("/estudiantes")}
          >
            Volver
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/estudiantes")}
          icon={ArrowLeft}
        >
          Volver
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">
            {getNombreCompleto(estudiante)}
          </h1>
          <p className="text-gray-500 mt-1">
            SIGERD ID: {estudiante.sigerd_id_estudiante || "Sin código"}
          </p>
        </div>
        <Button variant="primary" icon={Edit}>
          Editar
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Personal */}
        <div className="lg:col-span-1 space-y-6">
          {/* Datos Básicos */}
          <Card title="Información Personal">
            <div className="space-y-4">
              {/* Avatar */}
              <div className="flex justify-center">
                <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 font-bold text-3xl">
                    {estudiante.nombre?.charAt(0)}
                    {estudiante.apellido?.charAt(0)}
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-3">
                <InfoItem
                  icon={User}
                  label="Nombre Completo"
                  value={getNombreCompleto(estudiante)}
                />

                {estudiante.fecha_nacimiento && (
                  <InfoItem
                    icon={Calendar}
                    label="Fecha de Nacimiento"
                    value={formatDate(estudiante.fecha_nacimiento)}
                  />
                )}

                {estudiante.grado && (
                  <InfoItem
                    icon={GraduationCap}
                    label="Grado"
                    value={`${estudiante.grado.nombre} - ${estudiante.grado.nivel}`}
                  />
                )}

                {estudiante.direccion && (
                  <InfoItem
                    icon={MapPin}
                    label="Dirección"
                    value={estudiante.direccion}
                  />
                )}

                {estudiante.telefono_contacto && (
                  <InfoItem
                    icon={Phone}
                    label="Teléfono"
                    value={estudiante.telefono_contacto}
                  />
                )}

                {estudiante.email_contacto && (
                  <InfoItem
                    icon={Mail}
                    label="Email"
                    value={estudiante.email_contacto}
                  />
                )}
              </div>

              {/* Estado */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estado:</span>
                  <Badge variant={estudiante.activo ? "success" : "default"}>
                    {estudiante.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </div>

                {estudiante.sigerd_estudiante_id && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-600">Origen:</span>
                    <Badge variant="info" size="sm">
                      Sincronizado con SIGERD
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Estadísticas Generales */}
          <Card title="Estadísticas de Asistencia">
            {loadingHistorial ? (
              <div className="flex justify-center py-8">
                <Spinner />
              </div>
            ) : (
              <div className="space-y-4">
                {/* Porcentaje */}
                <div className="text-center p-4 bg-primary-50 rounded-lg">
                  <p className="text-4xl font-bold text-primary-600">
                    {estadisticas?.porcentaje_asistencia || 0}%
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Asistencia General
                  </p>
                </div>

                {/* Desglose */}
                <div className="space-y-2">
                  <StatBar
                    label="Presente"
                    value={estadisticas?.presentes || 0}
                    total={estadisticas?.total || 1}
                    color="bg-green-500"
                  />
                  <StatBar
                    label="Ausente"
                    value={estadisticas?.ausentes || 0}
                    total={estadisticas?.total || 1}
                    color="bg-red-500"
                  />
                  <StatBar
                    label="Tardanza"
                    value={estadisticas?.tardanzas || 0}
                    total={estadisticas?.total || 1}
                    color="bg-yellow-500"
                  />
                  <StatBar
                    label="Justificado"
                    value={estadisticas?.justificados || 0}
                    total={estadisticas?.total || 1}
                    color="bg-blue-500"
                  />
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total de días:</span>
                    <span className="font-semibold text-gray-900">
                      {estadisticas?.total || 0}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Historial de Asistencia */}
        <div className="lg:col-span-2">
          <Card title="Historial de Asistencia" subtitle="Últimos 30 días">
            {loadingHistorial ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : (
              <div className="space-y-3">
                {historial.map((asistencia) => (
                  <div
                    key={asistencia.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">
                          {new Date(asistencia.fecha).getDate()}
                        </p>
                        <p className="text-xs text-gray-500 uppercase">
                          {new Date(asistencia.fecha).toLocaleDateString(
                            "es-ES",
                            { month: "short" }
                          )}
                        </p>
                      </div>

                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {formatDate(asistencia.fecha, "EEEE, dd/MM/yyyy")}
                        </p>
                        {asistencia.observaciones && (
                          <p className="text-sm text-gray-500 mt-1">
                            {asistencia.observaciones}
                          </p>
                        )}
                        {asistencia.docente && (
                          <p className="text-xs text-gray-400 mt-1">
                            Por: {asistencia.docente.nombre}{" "}
                            {asistencia.docente.apellido}
                          </p>
                        )}
                      </div>
                    </div>

                    <Badge
                      className={ESTADOS_ASISTENCIA_COLORS[asistencia.estado]}
                    >
                      {ESTADOS_ASISTENCIA_LABELS[asistencia.estado]}
                    </Badge>
                  </div>
                ))}

                {historial.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      No hay historial de asistencia
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

// Componente auxiliar para mostrar información
const InfoItem = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 text-gray-400">
      <Icon className="w-5 h-5" />
    </div>
    <div className="flex-1">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  </div>
);

// Componente auxiliar para barras de estadísticas
const StatBar = ({ label, value, total, color }) => (
  <div>
    <div className="flex items-center justify-between mb-1">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-sm font-semibold text-gray-900">
        {value} ({formatPercentage(value, total)})
      </span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`${color} h-2 rounded-full transition-all duration-500`}
        style={{ width: `${(value / total) * 100}%` }}
      />
    </div>
  </div>
);

export default DetalleEstudiante;

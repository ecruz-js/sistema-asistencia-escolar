import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  ClipboardCheck,
  CheckCircle2,
  AlertCircle,
  Users,
  Calendar,
  Clock,
} from "lucide-react";
import { useAsistencia } from "../../hooks/useAsistencia";
import { useUIStore } from "../../store/uiStore";
import { useAuthStore } from "../../store/authStore";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Spinner from "../../components/common/Spinner";
import { formatDate } from "../../utils/formatters";

const DocenteDashboard = () => {
  const navigate = useNavigate();
  const { currentDate } = useUIStore();
  const { user } = useAuthStore();

  const {
    grados,
    loadingGrados,
    dentroHorarioAsistencia,
    dentroHorarioModificacion,
    horarios,
  } = useAsistencia(currentDate);

  const gradosCompletados = grados.filter((g) => g.completado);
  const gradosPendientes = grados.filter((g) => !g.completado);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          ¡Bienvenido, {user?.nombre}!
        </h1>
        <p className="text-gray-500 mt-1">
          {formatDate(currentDate, "EEEE, dd MMMM yyyy")}
        </p>
      </div>

      {/* Alertas de Horario */}
      {!dentroHorarioAsistencia && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-900">
                Fuera del horario normal de asistencia
              </p>
              <p className="text-sm text-yellow-700">
                Horario: {horarios?.inicio} - {horarios?.limite}
              </p>
            </div>
          </div>
        </div>
      )}

      {!dentroHorarioModificacion && dentroHorarioAsistencia && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div>
              <p className="font-medium text-red-900">
                Hora límite para modificar asistencia superada
              </p>
              <p className="text-sm text-red-700">
                Las asistencias solo pueden modificarse hasta las{" "}
                {horarios?.limite_modificacion}
              </p>
            </div>
          </div>
        </div>
      )}

      {loadingGrados ? (
        <div className="flex items-center justify-center min-h-[300px]">
          <Spinner size="lg" />
        </div>
      ) : (
        <>
          {/* Resumen de Estado */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card padding={true}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Mis Grados</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {grados.length}
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
                  <p className="text-sm text-gray-500">Completados</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">
                    {gradosCompletados.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card padding={true}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pendientes</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-1">
                    {gradosPendientes.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
            </Card>
          </div>

          {/* Grados Pendientes */}
          {gradosPendientes.length > 0 && (
            <Card
              title="⚠️ Grados Pendientes"
              subtitle="Debes completar la asistencia de estos grados"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gradosPendientes.map((grado) => (
                  <div
                    key={grado.id}
                    className="p-4 border-2 border-yellow-200 bg-yellow-50 rounded-lg hover:border-yellow-300 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {grado.nombre}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {grado.nivel} - Sección {grado.seccion}
                        </p>
                      </div>
                      <Badge variant="warning" size="sm">
                        Pendiente
                      </Badge>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Estudiantes:</span>
                        <span className="font-medium text-gray-900">
                          {grado.total_estudiantes}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(`/asistencia/grado/${grado.id}`)}
                      icon={ClipboardCheck}
                    >
                      Tomar Asistencia
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Grados Completados */}
          {gradosCompletados.length > 0 && (
            <Card
              title="✅ Grados Completados"
              subtitle="Ya completaste la asistencia de estos grados"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gradosCompletados.map((grado) => (
                  <div
                    key={grado.id}
                    className="p-4 border border-green-200 bg-green-50 rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {grado.nombre}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {grado.nivel} - Sección {grado.seccion}
                        </p>
                      </div>
                      <Badge variant="success" size="sm">
                        Completado
                      </Badge>
                    </div>

                    <div className="mb-3 space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Estudiantes:</span>
                        <span className="font-medium text-gray-900">
                          {grado.total_estudiantes}
                        </span>
                      </div>
                      {grado.hora_completada && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Completado:</span>
                          <span className="font-medium text-gray-900">
                            {grado.hora_completada}
                          </span>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(`/asistencia/grado/${grado.id}`)}
                    >
                      {dentroHorarioModificacion ? "Editar" : "Ver"}
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Sin grados asignados */}
          {grados.length === 0 && (
            <Card>
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No tienes grados asignados
                </h3>
                <p className="text-gray-500">
                  Contacta con la dirección para que te asignen grados
                </p>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default DocenteDashboard;

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Save,
  CheckCircle2,
  XCircle,
  Clock,
  FileCheck,
  AlertCircle,
} from "lucide-react";
import { useAsistencia } from "../../hooks/useAsistencia";
import { useUIStore } from "../../store/uiStore";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Spinner from "../../components/common/Spinner";
import { formatDate } from "../../utils/formatters";
import { ESTADOS_ASISTENCIA } from "../../utils/constants";
import toast from "react-hot-toast";

const TomarAsistencia = () => {
  const { gradoId } = useParams();
  const navigate = useNavigate();
  const { currentDate } = useUIStore();

  const [asistencias, setAsistencias] = useState({});
  const [isModified, setIsModified] = useState(false);

  const {
    grados,
    loadingGrados,
    getListaEstudiantes,
    tomarAsistencia,
    tomarAsistenciaLoading,
    dentroHorarioAsistencia,
    dentroHorarioModificacion,
  } = useAsistencia(currentDate);

  // Si viene con gradoId en la URL, cargar ese grado
  const selectedGradoId = gradoId || null;

  // Obtener lista de estudiantes si hay grado seleccionado
  const {
    data: estudiantesData,
    isLoading: loadingEstudiantes,
    refetch,
  } = useQuery({
    queryKey: ["lista-estudiantes", selectedGradoId, currentDate],
    queryFn: () => getListaEstudiantes(selectedGradoId).queryFn(),
    enabled: !!selectedGradoId,
  });

  const estudiantes = estudiantesData?.data?.estudiantes || [];
  const asistenciasExistentes = estudiantesData?.data?.asistencias_existentes;

  // Inicializar asistencias con datos existentes
  useEffect(() => {
    if (estudiantes.length > 0) {
      const initialAsistencias = {};
      estudiantes.forEach((estudiante) => {
        const existente = asistenciasExistentes?.find(
          (a) => a.estudiante_id === estudiante.id
        );
        initialAsistencias[estudiante.id] = {
          estado: existente?.estado || null,
          observaciones: existente?.observaciones || "",
        };
      });
      setAsistencias(initialAsistencias);
      setIsModified(false);
    }
  }, [estudiantes, asistenciasExistentes]);

  // Cambiar estado de un estudiante
  const handleEstadoChange = (estudianteId, estado) => {
    setAsistencias((prev) => ({
      ...prev,
      [estudianteId]: {
        ...prev[estudianteId],
        estado,
      },
    }));
    setIsModified(true);
  };

  // Cambiar observaciones
  const handleObservacionesChange = (estudianteId, observaciones) => {
    setAsistencias((prev) => ({
      ...prev,
      [estudianteId]: {
        ...prev[estudianteId],
        observaciones,
      },
    }));
    setIsModified(true);
  };

  // Marcar todos como presente
  const handleMarcarTodosPresentes = () => {
    const nuevasAsistencias = {};
    estudiantes.forEach((est) => {
      nuevasAsistencias[est.id] = {
        estado: ESTADOS_ASISTENCIA.PRESENTE,
        observaciones: asistencias[est.id]?.observaciones || "",
      };
    });
    setAsistencias(nuevasAsistencias);
    setIsModified(true);
    toast.success("Todos marcados como presentes");
  };

  // Guardar asistencia
  const handleGuardar = async () => {
    // Validar que todos tengan estado
    const sinEstado = estudiantes.filter((est) => !asistencias[est.id]?.estado);

    if (sinEstado.length > 0) {
      toast.error(
        `Faltan ${sinEstado.length} estudiantes por marcar asistencia`
      );
      return;
    }

    // Preparar datos
    const asistenciasArray = estudiantes.map((est) => ({
      estudiante_id: est.id,
      estado: asistencias[est.id].estado,
      observaciones: asistencias[est.id].observaciones || null,
    }));

    try {
      await tomarAsistencia({
        gradoId: selectedGradoId,
        asistencias: asistenciasArray,
        fecha: currentDate,
      });

      setIsModified(false);
      refetch();
    } catch (error) {
      // Error manejado en el hook
    }
  };

  if (loadingGrados) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  // Si no hay grado seleccionado, mostrar lista de grados
  if (!selectedGradoId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tomar Asistencia</h1>
          <p className="text-gray-500 mt-1">
            Selecciona un grado para tomar asistencia
          </p>
        </div>

        {/* Alerta de horario */}
        {!dentroHorarioAsistencia && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-sm text-yellow-800">
                Estás fuera del horario normal de toma de asistencia
              </p>
            </div>
          </div>
        )}

        {/* Lista de grados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {grados.map((grado) => (
            <Card key={grado.id} padding={true}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {grado.nombre}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {grado.nivel} - Sección {grado.seccion}
                  </p>
                </div>
                {grado.completado ? (
                  <Badge variant="success" size="sm">
                    Completado
                  </Badge>
                ) : (
                  <Badge variant="warning" size="sm">
                    Pendiente
                  </Badge>
                )}
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Estudiantes:</span>
                  <span className="font-medium text-gray-900">
                    {grado.total_estudiantes}
                  </span>
                </div>
              </div>

              <Button
                variant={grado.completado ? "secondary" : "primary"}
                className="w-full"
                onClick={() => navigate(`/asistencia/grado/${grado.id}`)}
              >
                {grado.completado ? "Ver/Editar" : "Tomar Asistencia"}
              </Button>
            </Card>
          ))}
        </div>

        {grados.length === 0 && (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500">
                No tienes grados asignados para tomar asistencia
              </p>
            </div>
          </Card>
        )}
      </div>
    );
  }

  // Vista de toma de asistencia
  const gradoActual = grados.find((g) => g.id === parseInt(selectedGradoId));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/asistencia")}
          icon={ArrowLeft}
        >
          Volver
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">
            {gradoActual?.nombre}
          </h1>
          <p className="text-gray-500 mt-1">
            {formatDate(currentDate)} - {estudiantes.length} estudiantes
          </p>
        </div>
      </div>

      {/* Alertas */}
      {!dentroHorarioModificacion && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-800">
              Estás fuera del horario permitido para modificar asistencia
            </p>
          </div>
        </div>
      )}

      {/* Acciones Rápidas */}
      <Card>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarcarTodosPresentes}
          >
            Marcar Todos Presentes
          </Button>

          <div className="flex-1" />

          {isModified && <Badge variant="warning">Cambios sin guardar</Badge>}

          <Button
            variant="success"
            icon={Save}
            onClick={handleGuardar}
            loading={tomarAsistenciaLoading}
            disabled={!isModified || !dentroHorarioModificacion}
          >
            Guardar Asistencia
          </Button>
        </div>
      </Card>

      {/* Lista de Estudiantes */}
      {loadingEstudiantes ? (
        <Card>
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        </Card>
      ) : (
        <Card title="Lista de Estudiantes">
          <div className="space-y-3">
            {estudiantes.map((estudiante, index) => (
              <div
                key={estudiante.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {/* Número */}
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center font-semibold text-gray-600 text-sm">
                    {index + 1}
                  </div>

                  {/* Info Estudiante */}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {estudiante.nombre} {estudiante.nombre2}{" "}
                      {estudiante.apellido} {estudiante.apellido2}
                    </p>
                    {estudiante.codigo_estudiante && (
                      <p className="text-sm text-gray-500">
                        Código: {estudiante.codigo_estudiante}
                      </p>
                    )}
                  </div>

                  {/* Botones de Estado */}
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        handleEstadoChange(
                          estudiante.id,
                          ESTADOS_ASISTENCIA.PRESENTE
                        )
                      }
                      className={`p-3 rounded-lg transition-all ${
                        asistencias[estudiante.id]?.estado ===
                        ESTADOS_ASISTENCIA.PRESENTE
                          ? "bg-green-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-green-100"
                      }`}
                      title="Presente"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() =>
                        handleEstadoChange(
                          estudiante.id,
                          ESTADOS_ASISTENCIA.TARDANZA
                        )
                      }
                      className={`p-3 rounded-lg transition-all ${
                        asistencias[estudiante.id]?.estado ===
                        ESTADOS_ASISTENCIA.TARDANZA
                          ? "bg-yellow-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-yellow-100"
                      }`}
                      title="Tardanza"
                    >
                      <Clock className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() =>
                        handleEstadoChange(
                          estudiante.id,
                          ESTADOS_ASISTENCIA.AUSENTE
                        )
                      }
                      className={`p-3 rounded-lg transition-all ${
                        asistencias[estudiante.id]?.estado ===
                        ESTADOS_ASISTENCIA.AUSENTE
                          ? "bg-red-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-red-100"
                      }`}
                      title="Ausente"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>

                    <button
                      onClick={() =>
                        handleEstadoChange(
                          estudiante.id,
                          ESTADOS_ASISTENCIA.JUSTIFICADO
                        )
                      }
                      className={`p-3 rounded-lg transition-all ${
                        asistencias[estudiante.id]?.estado ===
                        ESTADOS_ASISTENCIA.JUSTIFICADO
                          ? "bg-blue-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-blue-100"
                      }`}
                      title="Justificado"
                    >
                      <FileCheck className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Observaciones */}
                {(asistencias[estudiante.id]?.estado ===
                  ESTADOS_ASISTENCIA.AUSENTE ||
                  asistencias[estudiante.id]?.estado ===
                    ESTADOS_ASISTENCIA.TARDANZA ||
                  asistencias[estudiante.id]?.estado ===
                    ESTADOS_ASISTENCIA.JUSTIFICADO) && (
                  <div className="mt-3 ml-12">
                    <input
                      type="text"
                      placeholder="Observaciones (opcional)"
                      value={asistencias[estudiante.id]?.observaciones || ""}
                      onChange={(e) =>
                        handleObservacionesChange(estudiante.id, e.target.value)
                      }
                      className="input"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {estudiantes.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay estudiantes en este grado</p>
            </div>
          )}
        </Card>
      )}

      {/* Resumen */}
      <Card title="Resumen">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">
              {
                Object.values(asistencias).filter(
                  (a) => a.estado === ESTADOS_ASISTENCIA.PRESENTE
                ).length
              }
            </p>
            <p className="text-sm text-gray-600">Presentes</p>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <p className="text-2xl font-bold text-red-600">
              {
                Object.values(asistencias).filter(
                  (a) => a.estado === ESTADOS_ASISTENCIA.AUSENTE
                ).length
              }
            </p>
            <p className="text-sm text-gray-600">Ausentes</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <p className="text-2xl font-bold text-yellow-600">
              {
                Object.values(asistencias).filter(
                  (a) => a.estado === ESTADOS_ASISTENCIA.TARDANZA
                ).length
              }
            </p>
            <p className="text-sm text-gray-600">Tardanzas</p>
          </div>
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">
              {
                Object.values(asistencias).filter(
                  (a) => a.estado === ESTADOS_ASISTENCIA.JUSTIFICADO
                ).length
              }
            </p>
            <p className="text-sm text-gray-600">Justificados</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TomarAsistencia;

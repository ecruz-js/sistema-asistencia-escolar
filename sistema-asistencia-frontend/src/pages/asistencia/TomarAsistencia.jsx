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
  Users,
  GraduationCap,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { useAsistencia } from "../../hooks/useAsistencia";
import { useUIStore } from "../../store/uiStore";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import { asistenciaService } from "../../services/asistencia.service";
import { formatDate } from "../../utils/formatters";
import { ESTADOS_ASISTENCIA } from "../../utils/constants";

const TomarAsistencia = () => {
  const { gradoId } = useParams();
  const navigate = useNavigate();
  const { currentDate, darkMode } = useUIStore();
  const { user } = useAuthStore();

  const [asistencias, setAsistencias] = useState({});
  const [isModified, setIsModified] = useState(false);

  // Verificar si el usuario puede editar asistencia
  const puedeEditarAsistencia =
    user?.rol === "admin" || user?.rol === "direccion";

  const {
    grados,
    loadingGrados,
    tomarAsistencia,
    tomarAsistenciaLoading,
    dentroHorarioAsistencia,
    dentroHorarioModificacion,
  } = useAsistencia(currentDate);

  const selectedGradoId = gradoId || null;

  // Obtener lista de estudiantes
  const {
    data: estudiantesData,
    isLoading: loadingEstudiantes,
    refetch,
  } = useQuery({
    queryKey: ["lista-estudiantes", selectedGradoId, currentDate],
    queryFn: () =>
      asistenciaService.getListaEstudiantes(selectedGradoId, currentDate),
    enabled: !!selectedGradoId,
  });

  const estudiantes =
    estudiantesData?.data?.estudiantes || estudiantesData?.estudiantes || [];
  const asistenciaCompletada =
    estudiantesData?.data?.asistencia_completada || false;
  const docenteInfo = estudiantesData?.data?.docente_info || null;

  // Inicializar asistencias
  useEffect(() => {
    if (estudiantes.length > 0) {
      const initialAsistencias = {};
      estudiantes.forEach((estudiante) => {
        initialAsistencias[estudiante.id] = {
          estado: estudiante.asistencia?.estado || null,
          observaciones: estudiante.asistencia?.observaciones || "",
        };
      });
      setAsistencias(initialAsistencias);
      setIsModified(false);
    }
  }, [estudiantes]);

  const handleEstadoChange = (estudianteId, estado) => {
    // Verificar si puede modificar
    if (asistenciaCompletada && !puedeEditarAsistencia) {
      toast.error("No tienes permiso para modificar esta asistencia");
      return;
    }

    setAsistencias((prev) => ({
      ...prev,
      [estudianteId]: {
        ...prev[estudianteId],
        estado,
      },
    }));
    setIsModified(true);
  };

  const handleObservacionesChange = (estudianteId, observaciones) => {
    // Verificar si puede modificar
    if (asistenciaCompletada && !puedeEditarAsistencia) {
      return;
    }

    setAsistencias((prev) => ({
      ...prev,
      [estudianteId]: {
        ...prev[estudianteId],
        observaciones,
      },
    }));
    setIsModified(true);
  };

  const handleMarcarTodosPresentes = () => {
    // Verificar si puede modificar
    if (asistenciaCompletada && !puedeEditarAsistencia) {
      toast.error("No tienes permiso para modificar esta asistencia");
      return;
    }

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

  const handleGuardar = async () => {
    const sinEstado = estudiantes.filter((est) => !asistencias[est.id]?.estado);

    if (sinEstado.length > 0) {
      toast.error(
        `Faltan ${sinEstado.length} estudiantes por marcar asistencia`,
      );
      return;
    }

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
        <div className="relative">
          <div className="w-12 h-12 border-3 border-slate-200 dark:border-slate-800 rounded-full" />
          <div className="absolute top-0 left-0 w-12 h-12 border-3 border-indigo-500 rounded-full border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  // Vista de selección de grado
  if (!selectedGradoId) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Tomar Asistencia
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            Selecciona un grado para tomar asistencia
          </p>
        </div>

        {/* Alerta de horario */}
        {!dentroHorarioAsistencia && (
          <div className="rounded-xl p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
                Estás fuera del horario normal de toma de asistencia
              </p>
            </div>
          </div>
        )}

        {/* Lista de grados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {grados.map((grado) => {
            const estaDeshabilitado =
              grado.asistencia_completada && !puedeEditarAsistencia;

            return (
              <div
                key={grado.id}
                onClick={() => navigate(`/asistencia/grado/${grado.id}`)}
                className={`group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-all cursor-pointer ${
                  estaDeshabilitado
                    ? "opacity-60 hover:shadow-sm"
                    : "hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800"
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3
                        className="text-lg font-bold text-slate-900 dark:text-white"
                        title={grado.nombre}
                      >
                        {grado.nombre.length > 25
                          ? `${grado.nombre.substring(0, 20)}...`
                          : grado.nombre}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {grado.nivel} - Sección {grado.seccion}
                      </p>
                    </div>
                  </div>
                  {grado.asistencia_completada ? (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                      Completado
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
                      Pendiente
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Estudiantes
                    </span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white">
                      {grado.total_estudiantes}
                    </span>
                  </div>
                </div>

                {/* Información del docente que tomó asistencia */}
                {grado.asistencia_completada && grado.docente_nombre && (
                  <div className="mb-4 text-xs text-slate-600 dark:text-slate-400">
                    <p className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      <span>Tomada por: {grado.docente_nombre.toUpperCase()}</span>
                    </p>
                  </div>
                )}

                {/* CTA */}
                <div
                  className={`flex items-center justify-between text-sm font-semibold transition-colors ${
                    estaDeshabilitado
                      ? "text-slate-400 dark:text-slate-600"
                      : "text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300"
                  }`}
                >
                  <span>
                    {grado.asistencia_completada
                      ? puedeEditarAsistencia
                        ? "Ver/Editar"
                        : "Ver Asistencia"
                      : "Tomar Asistencia"}
                  </span>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {grados.length === 0 && (
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
            <GraduationCap className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 font-semibold">
              No tienes grados asignados para tomar asistencia
            </p>
          </div>
        )}
      </div>
    );
  }

  // Vista de toma de asistencia
  const gradoActual = grados.find((g) => g.id === parseInt(selectedGradoId));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <button
          onClick={() => navigate("/asistencia")}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 font-medium text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <div className="flex-1 min-w-0">
          <h1
            className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 dark:text-white"
            title={gradoActual?.nombre}
          >
            {gradoActual?.nombre && gradoActual.nombre.length > 25
              ? `${gradoActual.nombre.substring(0, 25)}...`
              : gradoActual?.nombre}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            {formatDate(currentDate)} · {estudiantes.length} estudiantes
          </p>
        </div>
      </div>

      {/* Alerta de asistencia completada */}
      {asistenciaCompletada && !puedeEditarAsistencia && docenteInfo && (
        <div className="rounded-xl p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                Asistencia completada por {docenteInfo.nombre}
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                Solo puedes visualizar esta asistencia. Para modificarla
                necesitas permisos de administrador o dirección.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Alerta fuera de horario */}
      {!dentroHorarioModificacion && puedeEditarAsistencia && (
        <div className="rounded-xl p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <p className="text-sm text-rose-800 dark:text-rose-300 font-medium">
              Estás fuera del horario permitido para modificar asistencia
            </p>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={handleMarcarTodosPresentes}
            disabled={asistenciaCompletada && !puedeEditarAsistencia}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-xs sm:text-sm transition-colors"
          >
            <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Marcar Todos Presentes</span>
            <span className="sm:hidden">Todos</span>
          </button>

          <div className="flex-1" />

          {isModified && (
            <span className="inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
              Cambios sin guardar
            </span>
          )}

          <button
            onClick={handleGuardar}
            disabled={
              !isModified ||
              tomarAsistenciaLoading ||
              (asistenciaCompletada && !puedeEditarAsistencia)
            }
            className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-xs sm:text-sm transition-colors shadow-sm"
          >
            <Save className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">
              {tomarAsistenciaLoading ? "Guardando..." : "Guardar Asistencia"}
            </span>
            <span className="sm:hidden">
              {tomarAsistenciaLoading ? "..." : "Guardar"}
            </span>
          </button>
        </div>
      </div>

      {/* Lista de Estudiantes */}
      {loadingEstudiantes ? (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 text-center shadow-sm">
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="w-12 h-12 border-3 border-slate-200 dark:border-slate-800 rounded-full" />
              <div className="absolute top-0 left-0 w-12 h-12 border-3 border-indigo-500 rounded-full border-t-transparent animate-spin" />
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-3 sm:p-5 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Lista de Estudiantes
            </h2>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {estudiantes.map((estudiante, index) => (
              <div
                key={estudiante.id}
                className="p-3 sm:p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-2 sm:gap-4">
                  {/* Número */}
                  <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                    {index + 1}
                  </div>

                  <div className="flex-1 flex flex-col sm:flex-row gap-2 sm:gap-3">
                    {/* Avatar + Info */}
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      <div className="shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-[10px] sm:text-xs font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800">
                        {estudiante.nombre?.charAt(0)}
                        {estudiante.apellido?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white truncate">
                          {estudiante.nombre} {estudiante.nombre2}{" "}
                          {estudiante.apellido} {estudiante.apellido2}
                        </p>
                        {estudiante.codigo_estudiante && (
                          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 truncate">
                            Código: {estudiante.codigo_estudiante}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Botones de Estado */}
                    <div className="flex gap-1.5 sm:gap-2">
                      {/* Presente */}
                      <button
                        onClick={() =>
                          handleEstadoChange(
                            estudiante.id,
                            ESTADOS_ASISTENCIA.PRESENTE,
                          )
                        }
                        disabled={
                          asistenciaCompletada && !puedeEditarAsistencia
                        }
                        className={`p-2 sm:p-3 rounded-xl transition-all disabled:cursor-not-allowed ${
                          asistencias[estudiante.id]?.estado ===
                          ESTADOS_ASISTENCIA.PRESENTE
                            ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600 dark:hover:text-emerald-400 disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-800 disabled:hover:text-slate-400"
                        }`}
                        title="Presente"
                      >
                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>

                      {/* Tardanza */}
                      <button
                        onClick={() =>
                          handleEstadoChange(
                            estudiante.id,
                            ESTADOS_ASISTENCIA.TARDANZA,
                          )
                        }
                        disabled={
                          asistenciaCompletada && !puedeEditarAsistencia
                        }
                        className={`p-2 sm:p-3 rounded-xl transition-all disabled:cursor-not-allowed ${
                          asistencias[estudiante.id]?.estado ===
                          ESTADOS_ASISTENCIA.TARDANZA
                            ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-600 dark:hover:text-amber-400 disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-800 disabled:hover:text-slate-400"
                        }`}
                        title="Tardanza"
                      >
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>

                      {/* Ausente */}
                      <button
                        onClick={() =>
                          handleEstadoChange(
                            estudiante.id,
                            ESTADOS_ASISTENCIA.AUSENTE,
                          )
                        }
                        disabled={
                          asistenciaCompletada && !puedeEditarAsistencia
                        }
                        className={`p-2 sm:p-3 rounded-xl transition-all disabled:cursor-not-allowed ${
                          asistencias[estudiante.id]?.estado ===
                          ESTADOS_ASISTENCIA.AUSENTE
                            ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:text-rose-600 dark:hover:text-rose-400 disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-800 disabled:hover:text-slate-400"
                        }`}
                        title="Ausente"
                      >
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>

                      {/* Justificado */}
                      <button
                        onClick={() =>
                          handleEstadoChange(
                            estudiante.id,
                            ESTADOS_ASISTENCIA.JUSTIFICADO,
                          )
                        }
                        disabled={
                          asistenciaCompletada && !puedeEditarAsistencia
                        }
                        className={`p-2 sm:p-3 rounded-xl transition-all disabled:cursor-not-allowed ${
                          asistencias[estudiante.id]?.estado ===
                          ESTADOS_ASISTENCIA.JUSTIFICADO
                            ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-800 disabled:hover:text-slate-400"
                        }`}
                        title="Justificado"
                      >
                        <FileCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Observaciones (opcional, si está activo) */}
                {asistencias[estudiante.id]?.estado && (
                  <div className="mt-3 pl-0 sm:pl-14">
                    <input
                      type="text"
                      placeholder="Observaciones (opcional)"
                      value={asistencias[estudiante.id]?.observaciones || ""}
                      onChange={(e) =>
                        handleObservacionesChange(estudiante.id, e.target.value)
                      }
                      disabled={asistenciaCompletada && !puedeEditarAsistencia}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed transition"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TomarAsistencia;

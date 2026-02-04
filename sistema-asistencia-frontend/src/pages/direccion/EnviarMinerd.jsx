import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  AlertCircle,
  Users,
  Calendar,
  Clock,
  XCircle,
  Info,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { minerdService } from "../../services/minerd.service";
import { useUIStore } from "../../store/uiStore";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import { formatDate, formatDateTime } from "../../utils/formatters";
import toast from "react-hot-toast";

const EnviarMinerd = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentDate } = useUIStore();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showFinalModal, setShowFinalModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [envioId, setEnvioId] = useState(null);

  // Obtener resumen
  const { data: resumenData, isLoading: loadingResumen } = useQuery({
    queryKey: ["minerd-resumen", currentDate],
    queryFn: () => minerdService.getResumen(currentDate),
  });
  // Obtener historial
  const { data: historialData } = useQuery({
    queryKey: ["minerd-historial"],
    queryFn: () => minerdService.getHistorial(1, 5),
  });

  const resumen = resumenData?.data;
  const historial = historialData?.data?.envios || [];

  // Calcular estadísticas desde los datos planos
  const stats = useMemo(() => {
    if (!resumen?.datos?.detalles) return null;

    // Inicializar contadores
    let totalEstudiantes = 0;
    let totalPresentes = 0;

    // Sumar desde detalles
    resumen.datos.detalles.forEach(detalle => {
      totalEstudiantes += (detalle.matriculasNivelInicial || 0) +
        (detalle.matriculasNivelPrimario || 0) +
        (detalle.matriculasNivelSecundario || 0) +
        (detalle.matriculasNivelAdultos || 0);

      totalPresentes += (detalle.presentesNivelInicial || 0) +
        (detalle.presentesNivelPrimario || 0) +
        (detalle.presentesNivelSecundario || 0) +
        (detalle.presentesNivelAdultos || 0);
    });

    const totalAusentes = totalEstudiantes - totalPresentes;

    return {
      estudiantes: {
        total: totalEstudiantes,
        presentes: totalPresentes,
        ausentes: totalAusentes
      },
      personal: {
        docente: {
          total: resumen.datos.personalCentro?.personalDocenteContratado || 0,
          presentes: resumen.datos.personalCentro?.personalDocentePresente || 0,
        },
        administrativo: {
          total: resumen.datos.personalCentro?.personalAdministrativoAsignado || 0,
          presentes: resumen.datos.personalCentro?.personalAdministrativoPresente || 0,
        },
        monitores: {
          total: resumen.datos.personalCentro?.monitoresAsignados || 0,
          presentes: resumen.datos.personalCentro?.monitoresPresentes || 0,
        }
      }
    };
  }, [resumen]);

  // Mutación para preparar envío
  const prepararMutation = useMutation({
    mutationFn: () => minerdService.prepararEnvio(currentDate),
    onSuccess: (data) => {
      setEnvioId(data.data?.envio_id);
      setShowConfirmModal(false);
      setShowFinalModal(true);
      queryClient.invalidateQueries(["minerd-resumen"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Error al preparar envío");
    },
  });

  // Mutación para confirmar y enviar
  const confirmarMutation = useMutation({
    mutationFn: () => minerdService.confirmarYEnviar(envioId),
    onSuccess: () => {
      toast.success("Datos enviados al MINERD exitosamente");
      setShowFinalModal(false);
      setEnvioId(null);
      queryClient.invalidateQueries(["minerd-resumen"]);
      queryClient.invalidateQueries(["minerd-historial"]);
      queryClient.invalidateQueries(["dashboard"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Error al enviar al MINERD");
    },
  });

  // Mutación para cancelar envío preparado
  const cancelarMutation = useMutation({
    mutationFn: () => minerdService.cancelarEnvio(envioId),
    onSuccess: () => {
      toast.success("Envío preparado cancelado exitosamente");
      setShowCancelModal(false);
      setEnvioId(null);
      queryClient.invalidateQueries(["minerd-resumen"]);
      queryClient.invalidateQueries(["minerd-historial"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Error al cancelar envío");
    },
  });

  const handlePrepararEnvio = () => {
    prepararMutation.mutate();
  };

  const handleUsarEnvioPreparado = () => {
    setEnvioId(resumen?.envio_preparado?.id);
    setShowFinalModal(true);
  };

  const handleCancelarEnvio = () => {
    setShowCancelModal(true);
  };

  const handleConfirmarCancelacion = () => {
    cancelarMutation.mutate();
  };

  const handleConfirmarEnvio = () => {
    confirmarMutation.mutate();
  };

  if (loadingResumen) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-125">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-800 rounded-full" />
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium mt-4 animate-pulse">
          Cargando información...
        </p>
      </div>
    );
  }

  return (
    <div className="h-full animate-in fade-in zoom-in-95 duration-500 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Enviar Datos al MINERD
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-1">
            Envío de datos de asistencia para {formatDate(currentDate)}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => navigate("/direccion")}
          icon={ArrowLeft}
        >
          Volver
        </Button>
      </div>

      {/* Estado del Envío */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Caso 1: Ya enviado */}
        {resumen?.ya_enviado ? (
          <div className="p-4 sm:p-6 bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-200 dark:border-emerald-800 rounded-2xl">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-emerald-900 dark:text-emerald-100">
                  Datos ya Enviados
                </h3>
                <p className="text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                  Los datos de {formatDate(currentDate)} ya fueron enviados al
                  MINERD
                </p>
              </div>
            </div>
          </div>
        ) : resumen?.tiene_envio_preparado ? (
          /* Caso 3: Existe envío preparado */
          <div className="p-4 sm:p-6 bg-purple-50 dark:bg-purple-900/10 border-2 border-purple-200 dark:border-purple-800 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex items-start gap-3 sm:gap-4 flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center shrink-0">
                  <Info className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-purple-900 dark:text-purple-100">
                    Envío ya Preparado
                  </h3>
                  <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-300 mt-1">
                    Ya existe un envío preparado para {formatDate(currentDate)}.
                    Puede confirmarlo para enviarlo al MINERD o cancelarlo para
                    crear uno nuevo.
                  </p>
                  <div className="mt-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-purple-200 dark:border-purple-700">
                    <div className="flex items-start gap-2 text-xs sm:text-sm">
                      <Users className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                      <span className="text-slate-700 dark:text-slate-300 wrap-break-word">
                        Preparado por:{" "}
                        <strong className="text-slate-900 dark:text-white">
                          {resumen.envio_preparado?.usuario?.nombre_completo}
                        </strong>
                      </span>
                    </div>
                    <div className="flex items-start gap-2 text-xs sm:text-sm mt-1">
                      <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                      <span className="text-slate-700 dark:text-slate-300 wrap-break-word">
                        {formatDateTime(resumen.envio_preparado?.fecha)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0">
                <Button
                  variant="primary"
                  size="lg"
                  icon={Send}
                  onClick={handleUsarEnvioPreparado}
                  className="w-full sm:w-auto"
                >
                  Confirmar y Enviar
                </Button>
                <Button
                  variant="danger"
                  size="lg"
                  icon={XCircle}
                  onClick={handleCancelarEnvio}
                  className="w-full sm:w-auto"
                >
                  Cancelar Preparación
                </Button>
              </div>
            </div>
          </div>
        ) : resumen?.puede_enviar ? (
          /* Caso 4: Listo para preparar */
          <div className="p-4 sm:p-6 bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-200 dark:border-blue-800 rounded-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4 flex-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center shrink-0">
                  <Send className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base sm:text-lg font-semibold text-blue-900 dark:text-blue-100">
                    Listo para Enviar
                  </h3>
                  <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 mt-1">
                    Todos los grados han completado su asistencia. Los datos están
                    listos para enviar al MINERD.
                  </p>
                </div>
              </div>
              <Button
                variant="primary"
                size="lg"
                icon={Send}
                onClick={() => setShowConfirmModal(true)}
                className="w-full sm:w-auto"
              >
                Preparar Envío
              </Button>
            </div>
          </div>
        ) : (
          /* Caso 2: Grados incompletos */
          <div className="p-4 sm:p-6 bg-yellow-50 dark:bg-yellow-900/10 border-2 border-yellow-200 dark:border-yellow-800 rounded-2xl">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-base sm:text-lg font-semibold text-yellow-900 dark:text-yellow-100">
                  No se puede enviar aún
                </h3>
                <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                  {resumen?.mensaje ||
                    "Algunos grados aún no han completado el registro de asistencia. Todos los grados deben completar su asistencia antes de poder enviar al MINERD."}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Vista Previa de Datos */}
      {/* Vista Previa de Datos */}
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Datos de Estudiantes */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-3 sm:mb-4">
              Resumen de Estudiantes
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  {stats.estudiantes.total}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="p-3 sm:p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-800">
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    Presentes
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
                    {stats.estudiantes.presentes}
                  </p>
                </div>
                <div className="p-3 sm:p-4 bg-rose-50 dark:bg-rose-900/20 rounded-xl border border-rose-100 dark:border-rose-800">
                  <p className="text-xs font-medium text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    Ausentes
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-rose-700 dark:text-rose-300 mt-1">
                    {stats.estudiantes.ausentes}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Datos de Personal */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm">
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-3 sm:mb-4">
              Resumen de Personal
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <PersonalResumen
                titulo="Docentes de Aula"
                datos={stats.personal.docente}
                color="blue"
              />
              <PersonalResumen
                titulo="Personal Administrativo"
                datos={stats.personal.administrativo}
                color="green"
              />
              <PersonalResumen
                titulo="Monitores"
                datos={stats.personal.monitores}
                color="purple"
              />
            </div>
          </div>
        </div>
      )}

      {/* Historial de Envíos */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
            Historial de Envíos
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Últimos 5 envíos realizados
          </p>
        </div>
        {historial.length === 0 ? (
          <div className="text-center py-8 sm:py-12 px-4">
            <Calendar className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400">
              No hay envíos registrados
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-160">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Enviado Por
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Hora
                  </th>
                  <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {historial.map((envio) => (
                  <tr
                    key={envio.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 dark:text-slate-500" />
                        <span className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white">
                          {formatDate(envio.fecha)}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                        {envio.usuario?.nombre} {envio.usuario?.apellido}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 dark:text-slate-500" />
                        <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                          {formatDateTime(envio.hora_confirmacion)}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          envio.estado === "enviado" ? "success" : "danger"
                        }
                      >
                        {envio.estado}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Primera Confirmación */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirmar Preparación de Envío"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              Estás a punto de preparar el envío de datos de asistencia para:
            </p>
            <p className="text-lg font-semibold text-blue-900 dark:text-blue-100 mt-2">
              {formatDate(currentDate)}
            </p>
          </div>

          <div className="space-y-2 text-slate-700 dark:text-slate-300">
            <p className="text-sm flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
              Se generará un resumen completo de asistencias
            </p>
            <p className="text-sm flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
              Después deberás confirmar nuevamente para enviar
            </p>
            <p className="text-sm flex items-start gap-2">
              <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
              Este proceso es irreversible
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handlePrepararEnvio}
            loading={prepararMutation.isPending}
          >
            Preparar Envío
          </Button>
        </div>
      </Modal>

      {/* Modal de Confirmación Final */}
      <Modal
        isOpen={showFinalModal}
        onClose={() => !confirmarMutation.isPending && setShowFinalModal(false)}
        title="⚠️ Confirmación Final"
        size="md"
        closeOnOverlayClick={false}
      >
        <div className="space-y-4">
          <div className="p-4 bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-200 dark:border-rose-800 rounded-xl">
            <p className="text-lg font-semibold text-rose-900 dark:text-rose-100">
              ¡ATENCIÓN!
            </p>
            <p className="text-sm text-rose-800 dark:text-rose-200 mt-2">
              Estás a punto de enviar los datos al MINERD. Esta acción NO se
              puede deshacer.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              Al confirmar, los datos serán enviados inmediatamente al sistema
              del MINERD.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="confirm-check"
              className="mt-1 w-4 h-4 text-indigo-600 border-slate-300 dark:border-slate-600 rounded focus:ring-indigo-500"
            />
            <label
              htmlFor="confirm-check"
              className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none"
            >
              Confirmo que he revisado los datos y deseo enviarlos al MINERD
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => setShowFinalModal(false)}
            disabled={confirmarMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmarEnvio}
            loading={confirmarMutation.isPending}
            icon={Send}
          >
            Confirmar y Enviar
          </Button>
        </div>
      </Modal>

      {/* Modal de Cancelación de Envío Preparado */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => !cancelarMutation.isPending && setShowCancelModal(false)}
        title="Cancelar Envío Preparado"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl">
            <p className="text-lg font-semibold text-amber-900 dark:text-amber-100">
              ¿Estás seguro?
            </p>
            <p className="text-sm text-amber-800 dark:text-amber-200 mt-2">
              Al cancelar el envío preparado, tendrás que volver a prepararlo si
              deseas enviar los datos al MINERD.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <strong className="text-slate-900 dark:text-white">Fecha del envío:</strong>{" "}
              {formatDate(currentDate)}
            </p>
            <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
              <strong className="text-slate-900 dark:text-white">Preparado por:</strong>{" "}
              {resumen?.envio_preparado?.usuario?.nombre}{" "}
              {resumen?.envio_preparado?.usuario?.apellido}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => setShowCancelModal(false)}
            disabled={cancelarMutation.isPending}
          >
            No, mantener
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirmarCancelacion}
            loading={cancelarMutation.isPending}
            icon={XCircle}
          >
            Sí, cancelar
          </Button>
        </div>
      </Modal>
    </div>
  );
};

// Componente auxiliar para resumen de personal
const PersonalResumen = ({ titulo, datos, color }) => {
  const colors = {
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-100 dark:border-blue-800",
      text: "text-blue-900 dark:text-blue-100",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-900/20",
      border: "border-purple-100 dark:border-purple-800",
      text: "text-purple-900 dark:text-purple-100",
    },
    green: {
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "border-emerald-100 dark:border-emerald-800",
      text: "text-emerald-900 dark:text-emerald-100",
    },
  };

  const colorScheme = colors[color] || colors.blue;
  const safeData = {
    total: datos?.total || 0,
    presentes: datos?.presentes || 0,
    ausentes: (datos?.total || 0) - (datos?.presentes || 0),
  };

  return (
    <div
      className={`p-3 sm:p-4 rounded-xl border ${colorScheme.bg} ${colorScheme.border}`}
    >
      <p className={`text-xs sm:text-sm font-semibold mb-2 sm:mb-3 ${colorScheme.text}`}>
        {titulo}
      </p>
      <div className="grid grid-cols-3 gap-2 sm:gap-3 text-sm">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
            Total
          </p>
          <p className={`text-lg sm:text-xl font-bold ${colorScheme.text} mt-1`}>
            {safeData.total}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
            Presentes
          </p>
          <p className={`text-lg sm:text-xl font-bold ${colorScheme.text} mt-1`}>
            {safeData.presentes}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">
            Ausentes
          </p>
          <p className={`text-lg sm:text-xl font-bold ${colorScheme.text} mt-1`}>
            {safeData.ausentes}
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnviarMinerd;

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Send,
  CheckCircle2,
  AlertCircle,
  FileText,
  Users,
  Calendar,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { minerdService } from "../../services/minerd.service";
import { useUIStore } from "../../store/uiStore";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import Spinner from "../../components/common/Spinner";
import { formatDate, formatDateTime } from "../../utils/formatters";
import toast from "react-hot-toast";

const EnviarMinerd = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentDate } = useUIStore();

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showFinalModal, setShowFinalModal] = useState(false);
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

  // Mutación para preparar envío
  const prepararMutation = useMutation({
    mutationFn: () => minerdService.prepararEnvio(currentDate),
    onSuccess: (data) => {
      setEnvioId(data.data.envio.id);
      setShowConfirmModal(false);
      setShowFinalModal(true);
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
      queryClient.invalidateQueries(["minerd-resumen"]);
      queryClient.invalidateQueries(["minerd-historial"]);
      queryClient.invalidateQueries(["dashboard"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Error al enviar al MINERD");
    },
  });

  const handlePrepararEnvio = () => {
    prepararMutation.mutate();
  };

  const handleConfirmarEnvio = () => {
    confirmarMutation.mutate();
  };

  if (loadingResumen) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/direccion")}
          icon={ArrowLeft}
        >
          Volver
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">
            Enviar Datos al MINERD
          </h1>
          <p className="text-gray-500 mt-1">
            Envío de datos de asistencia diaria
          </p>
        </div>
      </div>

      {/* Estado del Envío */}
      <Card>
        {resumen?.ya_enviado ? (
          <div className="p-6 bg-green-50 border-2 border-green-200 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-900">
                  Datos ya Enviados
                </h3>
                <p className="text-sm text-green-700">
                  Los datos de {formatDate(currentDate)} ya fueron enviados al
                  MINERD
                </p>
              </div>
            </div>
          </div>
        ) : resumen?.puede_enviar ? (
          <div className="p-6 bg-blue-50 border-2 border-blue-200 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Send className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900">
                  Listo para Enviar
                </h3>
                <p className="text-sm text-blue-700">
                  Todos los grados han completado la asistencia. Puedes enviar
                  los datos al MINERD.
                </p>
              </div>
              <Button
                variant="primary"
                size="lg"
                icon={Send}
                onClick={() => setShowConfirmModal(true)}
              >
                Preparar Envío
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-900">
                  No se puede enviar aún
                </h3>
                <p className="text-sm text-yellow-700">
                  {resumen?.mensaje ||
                    "Algunos grados no han completado la asistencia"}
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Vista Previa de Datos */}
      {resumen?.datos && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Datos de Estudiantes */}
          <Card title="Resumen de Estudiantes">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Total</span>
                <span className="text-2xl font-bold text-gray-900">
                  {resumen.datos.estudiantes.total}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Presentes</p>
                  <p className="text-xl font-bold text-green-600">
                    {resumen.datos.estudiantes.presentes}
                  </p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-gray-600">Ausentes</p>
                  <p className="text-xl font-bold text-red-600">
                    {resumen.datos.estudiantes.ausentes}
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-gray-600">Tardanzas</p>
                  <p className="text-xl font-bold text-yellow-600">
                    {resumen.datos.estudiantes.tardanzas}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Justificados</p>
                  <p className="text-xl font-bold text-blue-600">
                    {resumen.datos.estudiantes.justificados}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Datos de Personal */}
          <Card title="Resumen de Personal">
            <div className="space-y-3">
              <PersonalResumen
                titulo="Docentes de Aula"
                datos={resumen.datos.personal.docentes_aula}
                color="blue"
              />
              <PersonalResumen
                titulo="Personal Directivo"
                datos={resumen.datos.personal.personal_directivo}
                color="purple"
              />
              <PersonalResumen
                titulo="Personal Administrativo"
                datos={resumen.datos.personal.personal_administrativo}
                color="green"
              />
            </div>
          </Card>
        </div>
      )}

      {/* Historial de Envíos */}
      <Card title="Historial de Envíos" subtitle="Últimos 5 envíos">
        {historial.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No hay envíos registrados</p>
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
                    Enviado Por
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historial.map((envio) => (
                  <tr key={envio.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-900">
                          {formatDate(envio.fecha)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {envio.usuario?.nombre} {envio.usuario?.apellido}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {formatDateTime(envio.hora_confirmacion)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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
      </Card>

      {/* Modal de Primera Confirmación */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirmar Preparación de Envío"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              Estás a punto de preparar el envío de datos de asistencia para:
            </p>
            <p className="text-lg font-semibold text-blue-900 mt-2">
              {formatDate(currentDate)}
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              • Se generará un resumen completo de asistencias
            </p>
            <p className="text-sm text-gray-700">
              • Después deberás confirmar nuevamente para enviar
            </p>
            <p className="text-sm text-gray-700">
              • Este proceso es irreversible
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
          <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg">
            <p className="text-lg font-semibold text-red-900">¡ATENCIÓN!</p>
            <p className="text-sm text-red-800 mt-2">
              Estás a punto de enviar los datos al MINERD. Esta acción NO se
              puede deshacer.
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              Al confirmar, los datos serán enviados inmediatamente al sistema
              del MINERD.
            </p>
          </div>

          <div className="flex items-start gap-2">
            <input type="checkbox" id="confirm-check" className="mt-1" />
            <label htmlFor="confirm-check" className="text-sm text-gray-700">
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
    </div>
  );
};

// Componente auxiliar para resumen de personal
const PersonalResumen = ({ titulo, datos, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-900",
    purple: "bg-purple-50 text-purple-900",
    green: "bg-green-50 text-green-900",
  };

  return (
    <div className={`p-3 rounded-lg ${colors[color]}`}>
      <p className="text-sm font-medium mb-2">{titulo}</p>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div>
          <p className="text-xs opacity-75">Total</p>
          <p className="font-semibold">{datos.total}</p>
        </div>
        <div>
          <p className="text-xs opacity-75">Presentes</p>
          <p className="font-semibold">{datos.presentes}</p>
        </div>
        <div>
          <p className="text-xs opacity-75">Ausentes</p>
          <p className="font-semibold">{datos.ausentes}</p>
        </div>
      </div>
    </div>
  );
};

export default EnviarMinerd;

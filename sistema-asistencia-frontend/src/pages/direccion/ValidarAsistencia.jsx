import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, Edit, AlertCircle, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { direccionService } from "../../services/direccion.service";
import { useUIStore } from "../../store/uiStore";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import Spinner from "../../components/common/Spinner";
import { formatDate, getNombreCompleto } from "../../utils/formatters";
import {
  ESTADOS_ASISTENCIA_COLORS,
  ESTADOS_ASISTENCIA_LABELS,
  ESTADOS_ASISTENCIA,
} from "../../utils/constants";
import toast from "react-hot-toast";

const ValidarAsistencia = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { currentDate } = useUIStore();

  const [showValidateModal, setShowValidateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedAsistencia, setSelectedAsistencia] = useState(null);
  const [editData, setEditData] = useState({
    estado: "",
    observaciones: "",
  });

  // Obtener dashboard
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["direccion-dashboard", currentDate],
    queryFn: () => direccionService.getDashboard(currentDate),
  });

  const dashboard = data?.data;

  // Mutación para validar
  const validarMutation = useMutation({
    mutationFn: () => direccionService.validarAsistencia(currentDate),
    onSuccess: () => {
      toast.success("Asistencias validadas correctamente");
      setShowValidateModal(false);
      refetch();
      queryClient.invalidateQueries(["dashboard"]);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Error al validar asistencias"
      );
    },
  });

  // Mutación para modificar asistencia
  const modificarMutation = useMutation({
    mutationFn: (data) =>
      direccionService.modificarAsistencia(
        data.estudiante_id,
        data.fecha,
        data.estado,
        data.observaciones
      ),
    onSuccess: () => {
      toast.success("Asistencia modificada correctamente");
      setShowEditModal(false);
      setSelectedAsistencia(null);
      refetch();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Error al modificar asistencia"
      );
    },
  });

  const handleOpenEdit = (asistencia) => {
    setSelectedAsistencia(asistencia);
    setEditData({
      estado: asistencia.estado,
      observaciones: asistencia.observaciones || "",
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!selectedAsistencia) return;

    modificarMutation.mutate({
      estudiante_id: selectedAsistencia.estudiante_id,
      fecha: currentDate,
      estado: editData.estado,
      observaciones: editData.observaciones,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  const todasValidadas =
    dashboard?.progreso_grados?.completados > 0 &&
    dashboard?.progreso_grados?.pendientes === 0;

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
            Validar Asistencias
          </h1>
          <p className="text-gray-500 mt-1">
            Revisar y validar asistencias de {formatDate(currentDate)}
          </p>
        </div>

        {todasValidadas && (
          <Button
            variant="success"
            icon={CheckCircle2}
            onClick={() => setShowValidateModal(true)}
          >
            Validar Todas
          </Button>
        )}
      </div>

      {/* Estado */}
      {!todasValidadas ? (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-900">
                No se pueden validar las asistencias aún
              </p>
              <p className="text-sm text-yellow-700">
                {dashboard?.progreso_grados?.pendientes} grados pendientes de
                completar asistencia
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <p className="font-medium text-green-900">
              Todas las asistencias están completas y listas para validar
            </p>
          </div>
        </div>
      )}

      {/* Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card padding={true}>
          <p className="text-sm text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {dashboard?.resumen_estudiantes?.total || 0}
          </p>
        </Card>
        <Card padding={true}>
          <p className="text-sm text-gray-500">Presentes</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {dashboard?.resumen_estudiantes?.presentes || 0}
          </p>
        </Card>
        <Card padding={true}>
          <p className="text-sm text-gray-500">Ausentes</p>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {dashboard?.resumen_estudiantes?.ausentes || 0}
          </p>
        </Card>
        <Card padding={true}>
          <p className="text-sm text-gray-500">Tardanzas</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">
            {dashboard?.resumen_estudiantes?.tardanzas || 0}
          </p>
        </Card>
      </div>

      {/* Listado de Asistencias por Grado */}
      <Card title="Asistencias por Grado">
        <div className="space-y-6">
          {dashboard?.grados_completados_recientes?.map((grado) => (
            <GradoAsistenciaSection
              key={grado.grado_id}
              grado={grado}
              currentDate={currentDate}
              onEdit={handleOpenEdit}
            />
          ))}

          {(!dashboard?.grados_completados_recientes ||
            dashboard.grados_completados_recientes.length === 0) && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No hay asistencias registradas para validar
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Modal de Validación */}
      <Modal
        isOpen={showValidateModal}
        onClose={() => setShowValidateModal(false)}
        title="Confirmar Validación"
        size="md"
      >
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-900">
              Al validar las asistencias confirmas que todos los datos son
              correctos y están listos para ser enviados al MINERD.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              • Total de registros: {dashboard?.resumen_estudiantes?.total}
            </p>
            <p className="text-sm text-gray-700">
              • Grados completados: {dashboard?.progreso_grados?.completados}
            </p>
            <p className="text-sm text-gray-700">
              • Esta acción marcará todas las asistencias como validadas
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => setShowValidateModal(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="success"
            onClick={() => validarMutation.mutate()}
            loading={validarMutation.isPending}
            icon={CheckCircle2}
          >
            Validar Asistencias
          </Button>
        </div>
      </Modal>

      {/* Modal de Edición */}
      <Modal
        isOpen={showEditModal}
        onClose={() => !modificarMutation.isPending && setShowEditModal(false)}
        title="Modificar Asistencia"
        size="md"
      >
        {selectedAsistencia && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">
                {getNombreCompleto(selectedAsistencia.estudiante)}
              </p>
              <p className="text-sm text-gray-600">
                {selectedAsistencia.grado?.nombre}
              </p>
            </div>

            <div>
              <label className="label">Estado</label>
              <select
                value={editData.estado}
                onChange={(e) =>
                  setEditData({ ...editData, estado: e.target.value })
                }
                className="input"
              >
                <option value={ESTADOS_ASISTENCIA.PRESENTE}>Presente</option>
                <option value={ESTADOS_ASISTENCIA.AUSENTE}>Ausente</option>
                <option value={ESTADOS_ASISTENCIA.TARDANZA}>Tardanza</option>
                <option value={ESTADOS_ASISTENCIA.JUSTIFICADO}>
                  Justificado
                </option>
              </select>
            </div>

            <div>
              <label className="label">Observaciones</label>
              <textarea
                value={editData.observaciones}
                onChange={(e) =>
                  setEditData({ ...editData, observaciones: e.target.value })
                }
                className="input"
                rows={3}
                placeholder="Observaciones (opcional)"
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => setShowEditModal(false)}
            disabled={modificarMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveEdit}
            loading={modificarMutation.isPending}
          >
            Guardar Cambios
          </Button>
        </div>
      </Modal>
    </div>
  );
};

// Componente para sección de grado
const GradoAsistenciaSection = ({ grado, currentDate, onEdit }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["grado-detalle", grado.grado_id, currentDate],
    queryFn: () =>
      direccionService.getDetalleGrado(grado.grado_id, currentDate),
  });

  const asistencias = data?.data?.asistencias || [];

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{grado.grado?.nombre}</h3>
          <p className="text-sm text-gray-500">
            {asistencias.length} estudiantes
          </p>
        </div>
        <Badge variant="success">Completado</Badge>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-4">
          <Spinner />
        </div>
      ) : (
        <div className="space-y-2">
          {asistencias.map((asistencia) => (
            <div
              key={asistencia.id}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-700 font-semibold text-xs">
                    {asistencia.estudiante?.nombre?.charAt(0)}
                    {asistencia.estudiante?.apellido?.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">
                    {getNombreCompleto(asistencia.estudiante)}
                  </p>
                  {asistencia.observaciones && (
                    <p className="text-xs text-gray-500">
                      {asistencia.observaciones}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  className={ESTADOS_ASISTENCIA_COLORS[asistencia.estado]}
                  size="sm"
                >
                  {ESTADOS_ASISTENCIA_LABELS[asistencia.estado]}
                </Badge>

                <button
                  onClick={() => onEdit(asistencia)}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                  title="Modificar"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ValidarAsistencia;

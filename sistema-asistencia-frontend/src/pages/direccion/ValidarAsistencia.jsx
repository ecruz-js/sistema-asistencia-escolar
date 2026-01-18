import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CheckCircle2,
  Edit,
  AlertCircle,
  Users,
  UserCheck,
  UserX,
  Clock,
  Search,
  Filter
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { direccionService } from "../../services/direccion.service";
import { useUIStore } from "../../store/uiStore";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Modal from "../../components/common/Modal";
import Spinner from "../../components/common/Spinner";
import { formatDate } from "../../utils/formatters";
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
      handleCloseEdit(); // Clean close
      refetch();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Error al modificar asistencia"
      );
    },
  });

  const handleOpenEdit = ({ asistencia, ...rest }) => {
    // We separate the 'asistencia' object from the rest of the student data
    // to flatten the state for editing
    setSelectedAsistencia(rest);
    setEditData({
      estado: asistencia.estado,
      observaciones: asistencia.observaciones || "",
    });
    setShowEditModal(true);
  };

  const handleCloseEdit = () => {
    if (modificarMutation.isPending) return;
    setShowEditModal(false);
    // Slight delay to prevent content flash during modal fade out
    setTimeout(() => {
      setSelectedAsistencia(null);
      setEditData({ estado: "", observaciones: "" });
    }, 200);
  };

  const handleSaveEdit = () => {
    if (!selectedAsistencia) return;
    modificarMutation.mutate({
      estudiante_id: selectedAsistencia.id,
      fecha: currentDate,
      estado: editData.estado,
      observaciones: editData.observaciones,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" className="text-primary-600" />
          <p className="text-gray-500 animate-pulse">Cargando datos de asistencia...</p>
        </div>
      </div>
    );
  }

  const todasValidadas =
    dashboard?.progreso_grados?.completados > 0 &&
    dashboard?.progreso_grados?.pendientes === 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <button onClick={() => navigate("/direccion")} className="hover:text-primary-600 flex items-center gap-1 transition-colors">
              <ArrowLeft size={16} /> Dirección
            </button>
            <span>/</span>
            <span className="text-gray-900 font-medium">Validación</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Validar Asistencias
          </h1>
          <p className="text-gray-500 flex items-center gap-2">
            Fecha de revisión: <span className="font-semibold text-gray-700">{formatDate(currentDate)}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {todasValidadas ? (
            <Button
              variant="success"
              icon={CheckCircle2}
              onClick={() => setShowValidateModal(true)}
              className="shadow-lg shadow-green-100"
            >
              Validar y Enviar
            </Button>
          ) : (
            <div className="bg-yellow-50 text-yellow-800 px-4 py-2 rounded-lg text-sm font-medium border border-yellow-200 flex items-center gap-2">
              <AlertCircle size={16} />
              Faltan {dashboard?.progreso_grados?.pendientes} grados por reportar
            </div>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Matrícula Total"
          value={dashboard?.estudiantes?.total || 0}
          icon={Users}
          color="blue"
        />
        <StatCard
          label="Presentes"
          value={dashboard?.estudiantes?.presentes || 0}
          icon={UserCheck}
          color="green"
        />
        <StatCard
          label="Ausentes"
          value={dashboard?.estudiantes?.ausentes || 0}
          icon={UserX}
          color="red"
        />
        <StatCard
          label="Tardanzas"
          value={dashboard?.estudiantes?.tardanzas || 0}
          icon={Clock}
          color="yellow"
        />
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            Detalle por Grado
          </h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {dashboard?.grados_completados_recientes?.length || 0} grados reportados
          </span>
        </div>

        <div className="grid gap-6">
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
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">Sin registros pendientes</h3>
                <p className="text-gray-500 mt-1">
                  No hay asistencias registradas para validar en esta fecha.
                </p>
              </div>
            )}
        </div>
      </div>

      {/* Modal de Validación */}
      <Modal
        isOpen={showValidateModal}
        onClose={() => setShowValidateModal(false)}
        title="Confirmar Validación"
        size="md"
      >
        <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3">
            <div className="p-2 bg-blue-100 rounded-lg h-fit">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-blue-900 font-medium">Validación Final</h4>
              <p className="text-sm text-blue-700 mt-1 leading-relaxed">
                Estás a punto de cerrar la asistencia del día. Esto enviará los datos oficiales al MINERD.
              </p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-3 border border-gray-100">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Total Matrícula</span>
              <span className="font-medium text-gray-900">{dashboard?.estudiantes?.total}</span>
            </div>
            <div className="h-px bg-gray-200 w-full"></div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Grados Completados</span>
              <span className="font-medium text-green-600">{dashboard?.progreso_grados?.completados}</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
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
              Confirmar y Validar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Edición */}
      <Modal
        isOpen={showEditModal}
        onClose={handleCloseEdit}
        title="Modificar Registro"
        size="md"
      >
        {selectedAsistencia && (
          <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1">
            <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-100 rounded-xl">
              <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center text-lg font-bold text-gray-700 shadow-sm">
                {selectedAsistencia.nombre_completo.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">
                  {selectedAsistencia.nombre_completo}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedAsistencia.grado?.nombre}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Estado de Asistencia</label>
                <select
                  value={editData.estado}
                  onChange={(e) =>
                    setEditData({ ...editData, estado: e.target.value })
                  }
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 py-2.5"
                >
                  <option value={ESTADOS_ASISTENCIA.PRESENTE}>Presente</option>
                  <option value={ESTADOS_ASISTENCIA.AUSENTE}>Ausente</option>
                  <option value={ESTADOS_ASISTENCIA.TARDANZA}>Tardanza</option>
                  <option value={ESTADOS_ASISTENCIA.JUSTIFICADO}>
                    Justificado
                  </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Observaciones</label>
                <textarea
                  value={editData.observaciones}
                  onChange={(e) =>
                    setEditData({ ...editData, observaciones: e.target.value })
                  }
                  className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 min-h-[100px]"
                  placeholder="Añada detalles sobre la modificación..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <Button
                variant="secondary"
                onClick={handleCloseEdit}
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
          </div>
        )}
      </Modal>
    </div>
  );
};

// Componente helper para Stats
const StatCard = ({ label, value, icon: Icon, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    red: "bg-red-50 text-red-600 border-red-100",
    yellow: "bg-yellow-50 text-yellow-600 border-yellow-100",
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex items-start justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
      </div>
      <div className={`p-3 rounded-lg border ${colors[color]}`}>
        <Icon size={24} />
      </div>
    </div>
  )
}

// Componente para sección de grado
const GradoAsistenciaSection = ({ grado, currentDate, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["grado-detalle", grado.grado_id, currentDate],
    queryFn: () =>
      direccionService.getDetalleGrado(grado.grado_id, currentDate),
  });

  const estudiantes = data?.data?.estudiantes || [];
  const registro = data?.data?.registro || [];

  const filteredEstudiantes = useMemo(() => {
    if (!searchTerm) return estudiantes;
    return estudiantes.filter(est =>
      est.nombre_completo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [estudiantes, searchTerm]);

  const handleDataEdit = (estudiante) => ({
    ...estudiante,
    grado: grado.grado,
    registro,
  });

  return (
    <Card className="overflow-hidden border-0 shadow-sm ring-1 ring-gray-200">
      <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{grado.grado?.nombre}</h3>
          <p className="text-sm text-gray-500 flex items-center gap-2 mt-1">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            {estudiantes.length} estudiantes registrados
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar estudiante..."
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : (
        <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto custom-scrollbar">
          {filteredEstudiantes.length > 0 ? (
            filteredEstudiantes.map((estudiante) => (
              <div
                key={estudiante.id}
                className="group flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 bg-white border border-gray-200 text-gray-600 rounded-full flex items-center justify-center font-bold text-sm shadow-sm group-hover:border-primary-200 group-hover:text-primary-600 transition-colors">
                    {estudiante.nombre_completo.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {estudiante.nombre_completo}
                    </p>
                    {estudiante.observaciones ? (
                      <p className="text-xs text-orange-600 mt-0.5 flex items-center gap-1">
                        <AlertCircle size={12} /> {estudiante.observaciones}
                      </p>
                    ) : (
                      <p className="text-xs text-gray-400 mt-0.5">Sin observaciones</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 pl-4">
                  <Badge
                    className={`${ESTADOS_ASISTENCIA_COLORS[estudiante.asistencia.estado]} px-3 py-1 text-xs font-medium shadow-sm`}
                  >
                    {ESTADOS_ASISTENCIA_LABELS[estudiante.asistencia.estado]}
                  </Badge>

                  <button
                    onClick={() => onEdit(handleDataEdit(estudiante))}
                    className="p-2 text-gray-300 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all"
                    title="Modificar asistencia"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-gray-400 text-sm">
              No se encontraron estudiantes
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default ValidarAsistencia;
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  Search,
  Save,
  X,
  AlertCircle,
} from "lucide-react";
import { configuracionService } from "../../services/configuracion.service";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Modal from "../../components/common/Modal";
import Spinner from "../../components/common/Spinner";
import Input from "../../components/common/Input";
import { formatDateTime, getNombreCompleto } from "../../utils/formatters";
import toast from "react-hot-toast";

const TIPOS_CONFIGURACION = [
  { value: "string", label: "Texto" },
  { value: "number", label: "Número" },
  { value: "boolean", label: "Booleano" },
  { value: "time", label: "Hora" },
  { value: "json", label: "JSON" },
];

const Configuracion = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [formData, setFormData] = useState({
    clave: "",
    valor: "",
    tipo: "string",
    descripcion: "",
  });

  // Obtener configuraciones
  const { data, isLoading } = useQuery({
    queryKey: ["configuraciones"],
    queryFn: () => configuracionService.getAll(),
  });

  const configuraciones = data?.data || [];

  // Filtrar configuraciones por búsqueda
  const filteredConfiguraciones = configuraciones.filter((config) =>
    config.clave.toLowerCase().includes(search.toLowerCase()) ||
    (config.descripcion && config.descripcion.toLowerCase().includes(search.toLowerCase()))
  );

  // Mutación para crear
  const createMutation = useMutation({
    mutationFn: (data) => configuracionService.create(data),
    onSuccess: () => {
      toast.success("Configuración creada correctamente");
      setShowCreateModal(false);
      resetForm();
      queryClient.invalidateQueries(["configuraciones"]);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Error al crear configuración"
      );
    },
  });

  // Mutación para actualizar
  const updateMutation = useMutation({
    mutationFn: ({ clave, data }) => configuracionService.update(clave, data),
    onSuccess: () => {
      toast.success("Configuración actualizada correctamente");
      setShowEditModal(false);
      setSelectedConfig(null);
      resetForm();
      queryClient.invalidateQueries(["configuraciones"]);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Error al actualizar configuración"
      );
    },
  });

  // Mutación para eliminar
  const deleteMutation = useMutation({
    mutationFn: (clave) => configuracionService.delete(clave),
    onSuccess: () => {
      toast.success("Configuración eliminada correctamente");
      setShowDeleteModal(false);
      setSelectedConfig(null);
      queryClient.invalidateQueries(["configuraciones"]);
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Error al eliminar configuración"
      );
    },
  });

  const resetForm = () => {
    setFormData({
      clave: "",
      valor: "",
      tipo: "string",
      descripcion: "",
    });
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowCreateModal(true);
  };

  const handleOpenEdit = (config) => {
    setSelectedConfig(config);
    setFormData({
      clave: config.clave,
      valor: typeof config.valor === "object" ? JSON.stringify(config.valor, null, 2) : String(config.valor),
      tipo: config.tipo,
      descripcion: config.descripcion || "",
    });
    setShowEditModal(true);
  };

  const handleOpenDelete = (config) => {
    setSelectedConfig(config);
    setShowDeleteModal(true);
  };

  const handleCreate = () => {
    // Validar campos requeridos
    if (!formData.clave.trim()) {
      toast.error("La clave es requerida");
      return;
    }

    if (formData.valor === undefined || formData.valor === "") {
      toast.error("El valor es requerido");
      return;
    }

    // Preparar datos según el tipo
    let valorFinal = formData.valor;
    if (formData.tipo === "number") {
      valorFinal = parseFloat(formData.valor);
      if (isNaN(valorFinal)) {
        toast.error("El valor debe ser un número válido");
        return;
      }
    } else if (formData.tipo === "boolean") {
      valorFinal = formData.valor === "true" || formData.valor === true;
    } else if (formData.tipo === "json") {
      try {
        valorFinal = JSON.parse(formData.valor);
      } catch (e) {
        toast.error("El valor JSON no es válido");
        return;
      }
    }

    createMutation.mutate({
      clave: formData.clave.trim(),
      valor: valorFinal,
      tipo: formData.tipo,
      descripcion: formData.descripcion.trim() || null,
    });
  };

  const handleUpdate = () => {
    if (!selectedConfig) return;

    // Validar valor
    if (formData.valor === undefined || formData.valor === "") {
      toast.error("El valor es requerido");
      return;
    }

    // Preparar datos según el tipo
    let valorFinal = formData.valor;
    if (selectedConfig.tipo === "number") {
      valorFinal = parseFloat(formData.valor);
      if (isNaN(valorFinal)) {
        toast.error("El valor debe ser un número válido");
        return;
      }
    } else if (selectedConfig.tipo === "boolean") {
      valorFinal = formData.valor === "true" || formData.valor === true;
    } else if (selectedConfig.tipo === "json") {
      try {
        valorFinal = JSON.parse(formData.valor);
      } catch (e) {
        toast.error("El valor JSON no es válido");
        return;
      }
    }

    updateMutation.mutate({
      clave: selectedConfig.clave,
      data: {
        valor: valorFinal,
        descripcion: formData.descripcion.trim() || null,
      },
    });
  };

  const handleDelete = () => {
    if (!selectedConfig) return;
    deleteMutation.mutate(selectedConfig.clave);
  };

  const renderValue = (config) => {
    if (config.tipo === "boolean") {
      return config.valor ? "Sí" : "No";
    }
    if (config.tipo === "json") {
      return JSON.stringify(config.valor);
    }
    return String(config.valor);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Configuraciones del Sistema
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {configuraciones.length} configuraciones registradas
          </p>
        </div>
        <Button
          variant="primary"
          icon={Plus}
          onClick={handleOpenCreate}
        >
          Nueva Configuración
        </Button>
      </div>

      {/* Búsqueda */}
      <Card>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por clave o descripción..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
          />
        </div>
      </Card>

      {/* Lista de Configuraciones */}
      {filteredConfiguraciones.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <Settings className="w-16 h-16 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400 font-semibold">
              {search ? "No se encontraron configuraciones" : "No hay configuraciones registradas"}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-500 mt-2">
              {search
                ? "Intenta ajustar los filtros de búsqueda"
                : "Crea una nueva configuración para comenzar"}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredConfiguraciones.map((config) => (
            <Card key={config.id}>
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                      <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                        {config.clave}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 mt-1">
                        {TIPOS_CONFIGURACION.find((t) => t.value === config.tipo)?.label || config.tipo}
                      </span>
                    </div>
                  </div>

                  {config.descripcion && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                      {config.descripcion}
                    </p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        Valor
                      </span>
                      <p className="text-sm font-mono text-slate-900 dark:text-white mt-1 break-all">
                        {renderValue(config)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
                        Actualizado
                      </span>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {config.actualizado_en
                          ? formatDateTime(config.actualizado_en)
                          : "-"}
                      </p>
                      {config.actualizadoPor && (
                        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          por {getNombreCompleto(config.actualizadoPor)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 md:flex-col md:items-end">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={Edit}
                    onClick={() => handleOpenEdit(config)}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={Trash2}
                    onClick={() => handleOpenDelete(config)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Crear */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => !createMutation.isPending && setShowCreateModal(false)}
        title="Nueva Configuración"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Clave *"
            value={formData.clave}
            onChange={(e) =>
              setFormData({ ...formData, clave: e.target.value })
            }
            placeholder="ej: hora_inicio_asistencia"
            helperText="Solo letras minúsculas, números y guiones bajos"
            disabled={createMutation.isPending}
          />

          <div>
            <label className="label">Tipo *</label>
            <select
              value={formData.tipo}
              onChange={(e) =>
                setFormData({ ...formData, tipo: e.target.value, valor: "" })
              }
              className="input"
              disabled={createMutation.isPending}
            >
              {TIPOS_CONFIGURACION.map((tipo) => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Valor *</label>
            {formData.tipo === "boolean" ? (
              <select
                value={formData.valor}
                onChange={(e) =>
                  setFormData({ ...formData, valor: e.target.value })
                }
                className="input"
                disabled={createMutation.isPending}
              >
                <option value="">Seleccionar...</option>
                <option value="true">Sí (true)</option>
                <option value="false">No (false)</option>
              </select>
            ) : formData.tipo === "json" ? (
              <textarea
                value={formData.valor}
                onChange={(e) =>
                  setFormData({ ...formData, valor: e.target.value })
                }
                className="input font-mono text-sm"
                rows={6}
                placeholder='{"clave": "valor"}'
                disabled={createMutation.isPending}
              />
            ) : (
              <input
                type={formData.tipo === "number" ? "number" : formData.tipo === "time" ? "time" : "text"}
                value={formData.valor}
                onChange={(e) =>
                  setFormData({ ...formData, valor: e.target.value })
                }
                className="input"
                placeholder={
                  formData.tipo === "time" ? "HH:mm" : "Valor de la configuración"
                }
                disabled={createMutation.isPending}
              />
            )}
          </div>

          <div>
            <label className="label">Descripción</label>
            <textarea
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              className="input"
              rows={3}
              placeholder="Descripción de la configuración (opcional)"
              disabled={createMutation.isPending}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => setShowCreateModal(false)}
            disabled={createMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleCreate}
            loading={createMutation.isPending}
            icon={Save}
          >
            Crear
          </Button>
        </div>
      </Modal>

      {/* Modal de Editar */}
      <Modal
        isOpen={showEditModal}
        onClose={() => !updateMutation.isPending && setShowEditModal(false)}
        title="Editar Configuración"
        size="lg"
      >
        {selectedConfig && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="font-medium text-slate-900 dark:text-white">
                Clave: {selectedConfig.clave}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Tipo: {TIPOS_CONFIGURACION.find((t) => t.value === selectedConfig.tipo)?.label || selectedConfig.tipo}
              </p>
            </div>

            <div>
              <label className="label">Valor *</label>
              {selectedConfig.tipo === "boolean" ? (
                <select
                  value={formData.valor}
                  onChange={(e) =>
                    setFormData({ ...formData, valor: e.target.value })
                  }
                  className="input"
                  disabled={updateMutation.isPending}
                >
                  <option value="true">Sí (true)</option>
                  <option value="false">No (false)</option>
                </select>
              ) : selectedConfig.tipo === "json" ? (
                <textarea
                  value={formData.valor}
                  onChange={(e) =>
                    setFormData({ ...formData, valor: e.target.value })
                  }
                  className="input font-mono text-sm"
                  rows={6}
                  disabled={updateMutation.isPending}
                />
              ) : (
                <input
                  type={selectedConfig.tipo === "number" ? "number" : selectedConfig.tipo === "time" ? "time" : "text"}
                  value={formData.valor}
                  onChange={(e) =>
                    setFormData({ ...formData, valor: e.target.value })
                  }
                  className="input"
                  disabled={updateMutation.isPending}
                />
              )}
            </div>

            <div>
              <label className="label">Descripción</label>
              <textarea
                value={formData.descripcion}
                onChange={(e) =>
                  setFormData({ ...formData, descripcion: e.target.value })
                }
                className="input"
                rows={3}
                placeholder="Descripción de la configuración (opcional)"
                disabled={updateMutation.isPending}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => setShowEditModal(false)}
            disabled={updateMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdate}
            loading={updateMutation.isPending}
            icon={Save}
          >
            Guardar
          </Button>
        </div>
      </Modal>

      {/* Modal de Eliminar */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !deleteMutation.isPending && setShowDeleteModal(false)}
        title="Eliminar Configuración"
        size="md"
      >
        {selectedConfig && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
              <p className="text-sm text-red-800 dark:text-red-300">
                ¿Estás seguro de que deseas eliminar esta configuración? Esta acción no se puede deshacer.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="font-medium text-slate-900 dark:text-white">
                {selectedConfig.clave}
              </p>
              {selectedConfig.descripcion && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  {selectedConfig.descripcion}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={() => setShowDeleteModal(false)}
            disabled={deleteMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            loading={deleteMutation.isPending}
            icon={Trash2}
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Configuracion;

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Search, Plus, Eye, Edit, Trash2, Users } from "lucide-react";
import { gradoService } from "../../services/grado.service";
import { useAuthStore } from "../../store/authStore";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Spinner from "../../components/common/Spinner";
import Input from "../../components/common/Input";

const ListaGrados = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");
  const [nivelFilter, setNivelFilter] = useState("");

  const canManage = user?.rol === "admin" || user?.rol === "direccion";

  // Obtener grados
  const { data, isLoading } = useQuery({
    queryKey: ["grados", search, nivelFilter],
    queryFn: () =>
      gradoService.getAll({
        search,
        nivel: nivelFilter || undefined,
      }),
  });

  const grados = data?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Grados</h1>
          <p className="text-gray-500 mt-1">
            {grados.length} grados registrados
          </p>
        </div>

        {canManage && (
          <Button variant="primary" icon={Plus}>
            Nuevo Grado
          </Button>
        )}
      </div>

      {/* Filtros */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Buscar grado..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
          />

          <select
            value={nivelFilter}
            onChange={(e) => setNivelFilter(e.target.value)}
            className="input"
          >
            <option value="">Todos los niveles</option>
            <option value="Inicial">Inicial</option>
            <option value="Primaria">Primaria</option>
            <option value="Secundaria">Secundaria</option>
          </select>
        </div>
      </Card>

      {/* Lista de Grados */}
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {grados.map((grado) => (
            <Card key={grado.id} padding={true}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {grado.nombre}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {grado.nivel}{" "}
                    {grado.seccion && `- Sección ${grado.seccion}`}
                  </p>
                </div>
                {grado.sigerd_grado_id && (
                  <Badge variant="info" size="sm">
                    SIGERD
                  </Badge>
                )}
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Estudiantes:</span>
                  <span className="font-medium text-gray-900">
                    {grado.total_estudiantes || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Docentes:</span>
                  <span className="font-medium text-gray-900">
                    {grado.docentes?.length || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Año Escolar:</span>
                  <span className="font-medium text-gray-900">
                    {grado.año_escolar}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Estado:</span>
                  <Badge variant={grado.activo ? "success" : "default"}>
                    {grado.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => navigate(`/grados/${grado.id}`)}
                  icon={Eye}
                >
                  Ver
                </Button>

                {canManage && (
                  <>
                    <button
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {grados.length === 0 && !isLoading && (
        <Card>
          <div className="text-center py-12">
            <p className="text-gray-500">No se encontraron grados</p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ListaGrados;

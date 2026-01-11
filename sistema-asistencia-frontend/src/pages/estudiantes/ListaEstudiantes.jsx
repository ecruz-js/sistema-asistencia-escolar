import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  UserPlus,
  Eye,
  Edit,
  Trash2,
  Download,
} from "lucide-react";
import { estudianteService } from "../../services/estudiante.service";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Spinner from "../../components/common/Spinner";
import Input from "../../components/common/Input";
import { getNombreCompleto } from "../../utils/formatters";

const ListaEstudiantes = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [gradoFilter, setGradoFilter] = useState("");
  const [activoFilter, setActivoFilter] = useState("true");

  // Obtener estudiantes
  const { data, isLoading } = useQuery({
    queryKey: ["estudiantes", search, gradoFilter, activoFilter],
    queryFn: () =>
      estudianteService.getAll({
        search,
        grado_id: gradoFilter || undefined,
        activo: activoFilter === "true",
      }),
  });

  console.log("ESTUDIANTES DATA:", data);
  const estudiantes = data?.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estudiantes</h1>
          <p className="text-gray-500 mt-1">
            {estudiantes.length} estudiantes registrados
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" icon={Download}>
            Exportar
          </Button>
          <Button variant="primary" icon={UserPlus}>
            Nuevo Estudiante
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="md:col-span-2">
            <Input
              placeholder="Buscar por nombre, apellido o código..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
            />
          </div>

          {/* Filtro por Grado */}
          <div>
            <select
              value={gradoFilter}
              onChange={(e) => setGradoFilter(e.target.value)}
              className="input"
            >
              <option value="">Todos los grados</option>
              <option value="1">Pre-primairia</option>
              <option value="2">1er Grado</option>
              <option value="3">2do Grado</option>
              <option value="4">3er Grado</option>
              <option value="6">4to Grado</option>
              <option value="6">5to Grado</option>
              <option value="7">6to Grado</option>
            </select>
          </div>

          {/* Filtro por Estado */}
          <div>
            <select
              value={activoFilter}
              onChange={(e) => setActivoFilter(e.target.value)}
              className="input"
            >
              <option value="true">Activos</option>
              <option value="false">Inactivos</option>
              <option value="">Todos</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Tabla de Estudiantes */}
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner size="lg" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nombre Completo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Grado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Origen
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {estudiantes.map((estudiante) => (
                  <tr
                    key={estudiante.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => navigate(`/estudiantes/${estudiante.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900">
                        {estudiante.codigo_estudiante || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-700 font-semibold text-sm">
                            {estudiante.nombre?.charAt(0)}
                            {estudiante.apellido?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {getNombreCompleto(estudiante)}
                          </p>
                          {estudiante.sigerd_estudiante_id && (
                            <p className="text-xs text-gray-500">
                              SIGERD: {estudiante.sigerd_estudiante_id}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {estudiante.grado ? (
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {estudiante.grado.nombre}
                          </p>
                          <p className="text-xs text-gray-500">
                            {estudiante.grado.nivel}
                          </p>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">
                          Sin asignar
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={estudiante.activo ? "success" : "default"}
                      >
                        {estudiante.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {estudiante.sigerd_estudiante_id ? (
                        <Badge variant="info" size="sm">
                          SIGERD
                        </Badge>
                      ) : (
                        <Badge variant="default" size="sm">
                          Manual
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div
                        className="flex items-center justify-end gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() =>
                            navigate(`/estudiantes/${estudiante.id}`)
                          }
                          className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {estudiantes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No se encontraron estudiantes</p>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ListaEstudiantes;

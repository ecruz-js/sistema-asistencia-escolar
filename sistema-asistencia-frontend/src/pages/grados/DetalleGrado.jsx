import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Users,
  GraduationCap,
  Edit,
  UserPlus,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { gradoService } from "../../services/grado.service";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";
import Spinner from "../../components/common/Spinner";
import { getNombreCompleto } from "../../utils/formatters";

const DetalleGrado = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Obtener datos del grado
  const { data: gradoData, isLoading: loadingGrado } = useQuery({
    queryKey: ["grado", id],
    queryFn: () => gradoService.getById(id),
  });

  // Obtener estudiantes del grado
  const { data: estudiantesData, isLoading: loadingEstudiantes } = useQuery({
    queryKey: ["grado-estudiantes", id],
    queryFn: () => gradoService.getEstudiantes(id),
  });

  const grado = gradoData?.data?.grado;
  const estudiantes = estudiantesData?.data?.estudiantes || [];

  if (loadingGrado) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!grado) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-gray-500">Grado no encontrado</p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => navigate("/grados")}
          >
            Volver
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/grados")}
          icon={ArrowLeft}
        >
          Volver
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{grado.nombre}</h1>
          <p className="text-gray-500 mt-1">
            {grado.nivel} {grado.seccion && `- Sección ${grado.seccion}`}
          </p>
        </div>
        <Button variant="primary" icon={Edit}>
          Editar Grado
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información del Grado */}
        <div className="lg:col-span-1 space-y-6">
          {/* Datos Básicos */}
          <Card title="Información del Grado">
            <div className="space-y-4">
              <InfoItem label="Nombre" value={grado.nombre} />
              <InfoItem label="Nivel" value={grado.nivel} />
              {grado.seccion && (
                <InfoItem label="Sección" value={grado.seccion} />
              )}
              <InfoItem label="Año Escolar" value={grado.año_escolar} />

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estado:</span>
                  <Badge variant={grado.activo ? "success" : "default"}>
                    {grado.activo ? "Activo" : "Inactivo"}
                  </Badge>
                </div>

                {grado.sigerd_grado_id && (
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-600">Origen:</span>
                    <Badge variant="info" size="sm">
                      Sincronizado con SIGERD
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Docentes Asignados */}
          <Card title="Docentes Asignados">
            {grado.docentes && grado.docentes.length > 0 ? (
              <div className="space-y-3">
                {grado.docentes.map((docente) => (
                  <div
                    key={docente.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-700 font-semibold text-sm">
                        {docente.nombre?.charAt(0)}
                        {docente.apellido?.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {getNombreCompleto(docente)}
                      </p>
                      <p className="text-xs text-gray-500">{docente.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500">
                  No hay docentes asignados
                </p>
              </div>
            )}
          </Card>

          {/* Estadísticas */}
          <Card title="Estadísticas">
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Estudiantes</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {estudiantes.length}
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Activos</p>
                    <p className="text-2xl font-bold text-green-600">
                      {estudiantes.filter((e) => e.activo).length}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Lista de Estudiantes */}
        <div className="lg:col-span-2">
          <Card
            title="Estudiantes del Grado"
            subtitle={`${estudiantes.length} estudiantes`}
            actions={
              <Button variant="primary" size="sm" icon={UserPlus}>
                Agregar Estudiante
              </Button>
            }
          >
            {loadingEstudiantes ? (
              <div className="flex justify-center py-12">
                <Spinner size="lg" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Nombre Completo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Código
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {estudiantes.map((estudiante, index) => (
                      <tr
                        key={estudiante.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() =>
                          navigate(`/estudiantes/${estudiante.id}`)
                        }
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">
                            {index + 1}
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
                          <span className="text-sm font-mono text-gray-600">
                            {estudiante.codigo_estudiante || "-"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant={estudiante.activo ? "success" : "default"}
                          >
                            {estudiante.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigate(`/estudiantes/${estudiante.id}`)
                            }
                          >
                            Ver Detalle
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {estudiantes.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      No hay estudiantes en este grado
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

// Componente auxiliar
const InfoItem = ({ label, value }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-gray-600">{label}:</span>
    <span className="font-medium text-gray-900">{value}</span>
  </div>
);

export default DetalleGrado;

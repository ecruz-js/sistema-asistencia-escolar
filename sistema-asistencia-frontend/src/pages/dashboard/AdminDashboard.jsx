import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { direccionService } from '../../services/direccion.service';
import { useUIStore } from '../../store/uiStore';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { formatDate, formatPercentage } from '../../utils/formatters';

const AdminDashboard = () => {
  const { currentDate, setCurrentDate } = useUIStore();

  // Obtener datos del dashboard
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['dashboard', currentDate],
    queryFn: () => direccionService.getDashboard(currentDate),
  });

  const dashboard = data?.data;

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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Vista general del sistema de asistencia
          </p>
        </div>

        {/* Selector de Fecha */}
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={currentDate}
            onChange={(e) => setCurrentDate(e.target.value)}
            className="input"
          />
          <Button onClick={() => refetch()} variant="secondary">
            Actualizar
          </Button>
        </div>
      </div>

      {/* Stats Cards - Estudiantes */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Resumen de Estudiantes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total */}
          <Card padding={true}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Estudiantes</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {dashboard?.estudiantes.total || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          {/* Presentes */}
          <Card padding={true}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Presentes</p>
                <p className="text-3xl font-bold text-green-600 mt-1">
                  {dashboard?.estudiantes?.presentes || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatPercentage(
                    dashboard?.estudiantes?.presentes || 0,
                    dashboard?.estudiantes?.total || 1
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          {/* Ausentes */}
          <Card padding={true}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ausentes</p>
                <p className="text-3xl font-bold text-red-600 mt-1">
                  {dashboard?.estudiantes?.ausentes || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatPercentage(
                    dashboard?.estudiantes?.ausentes || 0,
                    dashboard?.estudiantes?.total || 1
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <UserX className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>

          {/* Tardanzas */}
          <Card padding={true}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tardanzas</p>
                <p className="text-3xl font-bold text-yellow-600 mt-1">
                  {dashboard?.estudiantes?.tardanzas || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatPercentage(
                    dashboard?.estudiantes?.tardanzas || 0,
                    dashboard?.estudiantes?.total || 1
                  )}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Progreso de Grados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progreso */}
        <Card
          title="Progreso de Asistencia"
          subtitle={`${dashboard?.progreso_grados?.completados || 0} de ${
            dashboard?.progreso_grados?.total || 0
          } grados completados`}
        >
          <div className="space-y-4">
            {/* Barra de progreso */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Completado
                </span>
                <span className="text-sm font-semibold text-primary-600">
                  {dashboard?.progreso_grados?.porcentaje || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-primary-600 h-3 rounded-full transition-all duration-500"
                  style={{
                    width: `${dashboard?.progreso_grados?.porcentaje || 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">
                  {dashboard?.progreso_grados?.completados || 0}
                </p>
                <p className="text-sm text-gray-600">Completados</p>
              </div>
              <div className="text-center p-3 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-600">
                  {dashboard?.progreso_grados?.pendientes || 0}
                </p>
                <p className="text-sm text-gray-600">Pendientes</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Estado MINERD */}
        <Card
          title="Estado de Envío MINERD"
          subtitle="Verificación diaria"
        >
          <div className="space-y-4">
            {dashboard?.ya_enviado_minerd ? (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-900">
                      Enviado Exitosamente
                    </p>
                    <p className="text-sm text-green-700">
                      Los datos han sido enviados al MINERD
                    </p>
                  </div>
                </div>
              </div>
            ) : dashboard?.puede_enviar_minerd ? (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-8 h-8 text-blue-600" />
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900">
                      Listo para Enviar
                    </p>
                    <p className="text-sm text-blue-700">
                      Todos los grados completados
                    </p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  className="w-full mt-4"
                  onClick={() => (window.location.href = '/direccion/minerd')}
                >
                  Enviar al MINERD
                </Button>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-8 h-8 text-yellow-600" />
                  <div>
                    <p className="font-semibold text-yellow-900">
                      Pendiente
                    </p>
                    <p className="text-sm text-yellow-700">
                      {dashboard?.progreso_grados?.pendientes || 0} grados sin
                      completar asistencia
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Grados Pendientes */}
      {dashboard?.grados_pendientes?.length > 0 && (
        <Card
          title="Grados Pendientes"
          subtitle={`${dashboard?.grados_pendientes?.length} grados sin completar asistencia`}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Grado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Nivel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Docentes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboard?.grados_pendientes?.map((grado) => (
                  <tr key={grado.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {grado.nombre}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="default">{grado.nivel}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        {grado.docentes?.length > 0 ? grado.docentes.map(d => d.nombre || d).join(', ') : 'Sin asignar'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="warning">Pendiente</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Grados Completados Recientes */}
      {dashboard?.grados_completados_recientes?.length > 0 && (
        <Card
          title="Últimas Asistencias Completadas"
          subtitle="Grados que completaron asistencia hoy"
        >
          <div className="space-y-3">
            {dashboard?.grados_completados_recientes?.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.grado?.nombre}
                    </p>
                    {item.docente?.nombre && (
                      <p className="text-sm text-gray-500">
                        Por: {item.docente?.nombre}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {item.hora_completada}
                  </p>
                  <Badge variant="success" size="sm">
                    Completado
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Resumen Personal */}
      <Card title="Resumen de Personal" subtitle="Asistencia del personal">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Docentes de Aula */}
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Docentes de Aula</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900">
                {dashboard?.personal?.docentes_aula?.presentes || 0}
              </p>
              <p className="text-sm text-gray-500">
                / {dashboard?.personal?.docentes_aula?.total || 0}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatPercentage(
                dashboard?.personal?.docentes_aula?.presentes || 0,
                dashboard?.personal?.docentes_aula?.total || 1
              )}{' '}
              presentes
            </p>
          </div>

          {/* Personal Directivo */}
          <div className="p-4 bg-purple-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Personal Directivo</p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900">
                {dashboard?.personal?.directivo?.presentes || 0}
              </p>
              <p className="text-sm text-gray-500">
                / {dashboard?.personal?.directivo?.total || 0}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatPercentage(
                dashboard?.personal?.directivo?.presentes || 0,
                dashboard?.personal?.directivo?.total || 1
              )}{' '}
              presentes
            </p>
          </div>

          {/* Personal Administrativo */}
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">
              Personal Administrativo
            </p>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-gray-900">
                {dashboard?.personal?.administrativo?.presentes || 0}
              </p>
              <p className="text-sm text-gray-500">
                / {dashboard?.personal?.administrativo?.total || 0}
              </p>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatPercentage(
                dashboard?.personal?.administrativo?.presentes || 0,
                dashboard?.personal?.administrativo?.total || 1
              )}{' '}
              presentes
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
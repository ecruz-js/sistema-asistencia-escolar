import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Calendar,
  RefreshCw,
  ArrowRight,
  Users,
  UserCheck,
  UserX,
  Clock,
  ShieldCheck,
  Bell,
  CloudSync,
  GraduationCap,
  Send,
} from 'lucide-react';
import { direccionService } from '../../services/direccion.service';
import { useUIStore } from '../../store/uiStore';
import { formatDate } from '../../utils/formatters';

const AdminDashboard = () => {
  const { currentDate, setCurrentDate, darkMode } = useUIStore();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoSyncSigerd, setAutoSyncSigerd] = useState(true);
  const [notificacionesActivas, setNotificacionesActivas] = useState(true);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['dashboard', currentDate],
    queryFn: () => direccionService.getDashboard(currentDate),
  });

  const dashboard = data?.data;

  const totalEstudiantes = dashboard?.estudiantes?.total || 0;
  const presentes = dashboard?.estudiantes?.presentes || 0;
  const ausentes = dashboard?.estudiantes?.ausentes || 0;
  const tardanzas = dashboard?.estudiantes?.tardanzas || 0;

  const totalPersonal = useMemo(() => {
    const personal = dashboard?.personal;
    if (!personal) return 0;
    return (
      (personal?.docente_aula?.total || 0) +
      (personal?.directivo?.total || 0) +
      (personal?.administrativo?.total || 0)
    );
  }, [dashboard?.personal]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-slate-200 dark:border-slate-800 rounded-full" />
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">
          Cargando dashboard...
        </p>
      </div>
    );
  }

  const tasaAsistencia = dashboard?.estudiantes?.total
    ? ((dashboard?.estudiantes?.presentes || 0) / dashboard.estudiantes.total) * 100
    : 0;

  const asistenciaAngle = Math.min(Math.max(tasaAsistencia, 0), 100) * 3.6;

  const progresoGrados = dashboard?.progreso_grados?.porcentaje || 0;
  const gradosCompletados = dashboard?.progreso_grados?.completados || 0;
  const gradosPendientes = dashboard?.progreso_grados?.pendientes || 0;

  const minerdStatus = dashboard?.ya_enviado_minerd
    ? { label: 'Enviado', hint: 'Sincronización completa', icon: CheckCircle2 }
    : dashboard?.puede_enviar_minerd
      ? { label: 'Listo', hint: 'Datos completos para enviar', icon: CheckCircle2 }
      : { label: 'Pendiente', hint: `Faltan ${gradosPendientes} grados`, icon: Clock };

  const pct = (value, total) => (total ? Math.round((value / total) * 100) : 0);

  return (
    <div className="animate-in fade-in duration-500 h-full">
      <div className="w-full h-full">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between px-6 sm:px-8 pt-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold shadow-lg shadow-indigo-500/30">
              S
            </div>
            <div>
              <p className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">Sistema</p>
              <p className="text-base font-semibold text-slate-900 dark:text-white">Asistencia Escolar</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">{formatDate(new Date(), 'EEEE, d MMMM yyyy')}</span>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Fecha</span>
              <input
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                className="bg-transparent border-none focus:outline-none text-slate-800 dark:text-slate-100 font-medium text-sm"
              />
            </div>
            <button
              onClick={handleRefresh}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-500 text-white px-4 py-2 font-medium text-sm shadow-md hover:bg-indigo-600 hover:shadow-lg transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </button>
          </div>
        </div>

        {/* Contenido Principal */}
        <div id='main-content' className="px-6 sm:px-8 pb-8 pt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

            {/* Detalles del día */}
            <div className="lg:col-span-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-6">
              <p className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">Detalles del día</p>
              <div className="mt-3">
                <p className="text-4xl font-bold text-slate-900 dark:text-white">{presentes}</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">
                  estudiantes presentes de {totalEstudiantes}
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Ausentes</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{ausentes}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{pct(ausentes, totalEstudiantes)}%</p>
                </div>
                <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Tardanzas</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{tardanzas}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{pct(tardanzas, totalEstudiantes)}%</p>
                </div>
              </div>

              {/* Gauge de asistencia simplificado */}
              <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Asistencia</span>
                  <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">{tasaAsistencia.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(Math.max(tasaAsistencia, 0), 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Personal (Centro) */}
            <div className="lg:col-span-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">Personal</p>
                <Users className="w-5 h-5 text-slate-400" />
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Docentes', presentes: dashboard?.personal?.docente_aula?.presentes || 0, total: dashboard?.personal?.docente_aula?.total || 0, icon: UserCheck },
                  { label: 'Directivos', presentes: dashboard?.personal?.directivo?.presentes || 0, total: dashboard?.personal?.directivo?.total || 0, icon: ShieldCheck },
                  { label: 'Administrativos', presentes: dashboard?.personal?.administrativo?.presentes || 0, total: dashboard?.personal?.administrativo?.total || 0, icon: Users }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {item.presentes} de {item.total}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">{pct(item.presentes, item.total)}%</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 pt-5 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Total Personal</span>
                  <span className="text-2xl font-semibold text-slate-900 dark:text-white">{totalPersonal}</span>
                </div>
              </div>
            </div>

            {/* Progreso y MINERD */}
            <div className="lg:col-span-4 space-y-4">
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">Progreso Grados</p>
                  <GraduationCap className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white">{progresoGrados}%</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">
                  {gradosCompletados} completados
                </p>
                <div className="mt-4 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(Math.max(progresoGrados, 0), 100)}%` }}
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">Estado MINERD</p>
                  <Send className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-semibold text-slate-900 dark:text-white">{minerdStatus.label}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">{minerdStatus.hint}</p>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <minerdStatus.icon className="w-6 h-6" />
                  </div>
                </div>
                {dashboard?.puede_enviar_minerd && !dashboard?.ya_enviado_minerd && (
                  <button
                    onClick={() => (window.location.href = '/direccion/minerd')}
                    className="mt-4 w-full rounded-xl bg-indigo-500 text-white py-2.5 text-sm font-medium hover:bg-indigo-600 transition-colors shadow-md"
                  >
                    Enviar ahora
                  </button>
                )}
              </div>
            </div>

            {/* Actividad Reciente */}
            <div className="lg:col-span-8">
              <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">Actividad Reciente</p>
                  <button
                    onClick={() => (window.location.href = '/direccion/grados')}
                    className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                  >
                    Ver todo →
                  </button>
                </div>

                <div className="space-y-3">
                  {dashboard?.grados_completados_recientes?.length > 0 ? (
                    dashboard.grados_completados_recientes.slice(0, 5).map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                            <CheckCircle2 className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{item.grado?.nombre || 'Grado'}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.docente?.nombre || 'Docente'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.hora_completada || '--:--'}</p>
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-8 text-center">
                      <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Sin actividad registrada hoy</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Configuraciones */}
            <div className="lg:col-span-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {[
                  {
                    title: 'Sincronización SIGERD',
                    subtitle: 'Automática',
                    icon: CloudSync,
                    value: autoSyncSigerd,
                    onChange: setAutoSyncSigerd,
                  },
                  {
                    title: 'Notificaciones',
                    subtitle: 'Recordatorios',
                    icon: Bell,
                    value: notificacionesActivas,
                    onChange: setNotificacionesActivas,
                  },
                ].map((t) => (
                  <div key={t.title} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                          <t.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 dark:text-white">{t.title}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{t.subtitle}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => t.onChange(!t.value)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${t.value ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'
                          }`}
                        aria-pressed={t.value}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${t.value ? 'translate-x-5' : 'translate-x-1'
                            }`}
                        />
                      </button>
                    </div>

                    <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400">
                      <div className={`h-2 w-2 rounded-full ${t.value ? 'bg-indigo-500' : 'bg-slate-400'}`} />
                      <span>{t.value ? 'Activo' : 'Desactivado'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
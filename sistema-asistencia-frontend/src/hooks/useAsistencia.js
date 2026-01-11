import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { asistenciaService } from "../services/asistencia.service";
import toast from "react-hot-toast";

export const useAsistencia = (fecha) => {
  const queryClient = useQueryClient();

  // Obtener mis grados
  const {
    data: gradosData,
    isLoading: loadingGrados,
    refetch: refetchGrados,
  } = useQuery({
    queryKey: ["mis-grados", fecha],
    queryFn: () => asistenciaService.getMisGrados(fecha),
  });

  // Obtener lista de estudiantes de un grado
  const getListaEstudiantes = (gradoId) => {
    return useQuery({
      queryKey: ["lista-estudiantes", gradoId, fecha],
      queryFn: () => asistenciaService.getListaEstudiantes(gradoId, fecha),
      enabled: !!gradoId,
    });
  };

  // Tomar asistencia
  const tomarAsistenciaMutation = useMutation({
    mutationFn: ({ gradoId, asistencias, fecha }) =>
      asistenciaService.tomarAsistencia(gradoId, asistencias, fecha),
    onSuccess: () => {
      toast.success("Asistencia guardada exitosamente");
      queryClient.invalidateQueries(["mis-grados"]);
      queryClient.invalidateQueries(["lista-estudiantes"]);
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || "Error al guardar asistencia";
      toast.error(message);
    },
  });

  // Registrar asistencia personal
  const registrarPersonalMutation = useMutation({
    mutationFn: ({ estado, observaciones, fecha }) =>
      asistenciaService.registrarAsistenciaPersonal(
        estado,
        observaciones,
        fecha
      ),
    onSuccess: () => {
      toast.success("Asistencia personal registrada");
      queryClient.invalidateQueries(["asistencia-personal"]);
    },
    onError: (error) => {
      const message =
        error.response?.data?.message ||
        "Error al registrar asistencia personal";
      toast.error(message);
    },
  });

  return {
    grados: gradosData?.data?.grados || [],
    horarios: gradosData?.data?.horarios,
    dentroHorarioAsistencia: gradosData?.data?.dentro_horario_asistencia,
    dentroHorarioModificacion: gradosData?.data?.dentro_horario_modificacion,
    loadingGrados,
    refetchGrados,
    getListaEstudiantes,
    tomarAsistencia: tomarAsistenciaMutation.mutate,
    tomarAsistenciaLoading: tomarAsistenciaMutation.isPending,
    registrarPersonal: registrarPersonalMutation.mutate,
    registrarPersonalLoading: registrarPersonalMutation.isPending,
  };
};

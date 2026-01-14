import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";

export const asistenciaService = {
  getMisGrados: async (fecha) => {
    const response = await api.get(ENDPOINTS.MY_GRADES, {
      params: { fecha },
    });
    console.log("MIS GRADOS RESPONSE:", response);

    return response.data;
  },

  getListaEstudiantes: async (gradoId, fecha) => {
    const response = await api.get(ENDPOINTS.GRADE_ATTENDANCE_LIST(gradoId), {
      params: { fecha },
    });
    return response.data;
  },

  tomarAsistencia: async (gradoId, asistencias, fecha) => {
    const response = await api.post(ENDPOINTS.TAKE_ATTENDANCE(gradoId), {
      asistencias,
      fecha,
    });
    return response.data;
  },

  getMiAsistenciaPersonal: async (fecha) => {
    const response = await api.get(ENDPOINTS.MY_PERSONAL_ATTENDANCE, {
      params: { fecha },
    });
    return response.data;
  },

  registrarAsistenciaPersonal: async (estado, observaciones, fecha) => {
    const response = await api.post(ENDPOINTS.REGISTER_PERSONAL_ATTENDANCE, {
      estado,
      observaciones,
      fecha,
    });
    return response.data;
  },

  getMiHistorial: async (limit = 30) => {
    const response = await api.get(ENDPOINTS.MY_ATTENDANCE_HISTORY, {
      params: { limit },
    });
    return response.data;
  },
};

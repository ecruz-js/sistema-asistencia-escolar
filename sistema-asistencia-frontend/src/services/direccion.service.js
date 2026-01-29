import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";

export const direccionService = {
  getDashboard: async (fecha) => {
    const response = await api.get(ENDPOINTS.DIRECTION_DASHBOARD, {
      params: { fecha },
    });

    return response.data;
  },

  getDetalleGrado: async (gradoId, fecha) => {
    const response = await api.get(ENDPOINTS.DIRECTION_GRADE_DETAIL(gradoId), {
      params: { fecha },
    });
    return response.data;
  },

  enviarRecordatorio: async (docente_ids) => {
    const response = await api.post(ENDPOINTS.SEND_REMINDER, {
      docente_ids,
    });
    return response.data;
  },

  modificarAsistencia: async (estudiante_id, fecha, estado, observaciones) => {
    const response = await api.put(ENDPOINTS.MODIFY_ATTENDANCE, {
      estudiante_id,
      fecha,
      estado,
      observaciones,
    });
    return response.data;
  },

  getAsistenciaPersonal: async (fecha) => {
    const response = await api.get(ENDPOINTS.STAFF_ATTENDANCE, {
      params: { fecha },
    });
    return response.data;
  },
};

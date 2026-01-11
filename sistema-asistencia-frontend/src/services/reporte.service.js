import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";

export const reporteService = {
  getAsistenciaDiaria: async (fecha) => {
    const response = await api.get(ENDPOINTS.DAILY_REPORT, {
      params: { fecha },
    });
    return response.data;
  },

  getAsistenciaPorRango: async (params) => {
    const response = await api.get(ENDPOINTS.RANGE_REPORT, { params });
    return response.data;
  },

  getEstadisticasGenerales: async (params = {}) => {
    const response = await api.get(ENDPOINTS.GENERAL_STATS, { params });
    return response.data;
  },

  getReporteEstudiante: async (id, params = {}) => {
    const response = await api.get(ENDPOINTS.STUDENT_REPORT(id), {
      params,
    });
    return response.data;
  },

  getReporteGrado: async (id, params = {}) => {
    const response = await api.get(ENDPOINTS.GRADE_REPORT(id), { params });
    return response.data;
  },
};

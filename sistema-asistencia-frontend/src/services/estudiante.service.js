import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";

export const estudianteService = {
  getAll: async (params = {}) => {
    const response = await api.get(ENDPOINTS.STUDENTS, { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(ENDPOINTS.STUDENT_BY_ID(id));
    return response.data;
  },

  getHistorialAsistencia: async (id, params = {}) => {
    const response = await api.get(ENDPOINTS.STUDENT_ATTENDANCE(id), {
      params,
    });
    return response.data;
  },

  create: async (data) => {
    const response = await api.post(ENDPOINTS.STUDENTS, data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(ENDPOINTS.STUDENT_BY_ID(id), data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(ENDPOINTS.STUDENT_BY_ID(id));
    return response.data;
  },
};

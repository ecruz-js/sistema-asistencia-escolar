import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";

export const gradoService = {
  getAll: async (params = {}) => {
    const response = await api.get(ENDPOINTS.GRADES, { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(ENDPOINTS.GRADE_BY_ID(id));
    return response.data;
  },

  getEstudiantes: async (id, activo = true) => {
    const response = await api.get(ENDPOINTS.GRADE_STUDENTS(id), {
      params: { activo },
    });
    return response.data;
  },

  create: async (data) => {
    const response = await api.post(ENDPOINTS.GRADES, data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(ENDPOINTS.GRADE_BY_ID(id), data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(ENDPOINTS.GRADE_BY_ID(id));
    return response.data;
  },
};

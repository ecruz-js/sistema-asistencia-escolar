import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";

export const configuracionService = {
  getAll: async () => {
    const response = await api.get(ENDPOINTS.CONFIGURACION);
    return response.data;
  },

  getByClave: async (clave) => {
    const response = await api.get(ENDPOINTS.CONFIGURACION_BY_CLAVE(clave));
    return response.data;
  },

  create: async (data) => {
    const response = await api.post(ENDPOINTS.CONFIGURACION, data);
    return response.data;
  },

  update: async (clave, data) => {
    const response = await api.put(ENDPOINTS.CONFIGURACION_BY_CLAVE(clave), data);
    return response.data;
  },

  delete: async (clave) => {
    const response = await api.delete(ENDPOINTS.CONFIGURACION_BY_CLAVE(clave));
    return response.data;
  },
};

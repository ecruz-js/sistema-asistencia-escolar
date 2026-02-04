import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";

export const minerdService = {
  getResumen: async (fecha) => {
    const response = await api.get(ENDPOINTS.MINERD_SUMMARY, {
      params: { fecha },
    });
    return response.data;
  },

  prepararEnvio: async (fecha) => {
    const response = await api.post(ENDPOINTS.MINERD_PREPARE, { fecha });
    return response.data;
  },

  confirmarYEnviar: async (envio_id) => {
    const response = await api.post(ENDPOINTS.MINERD_CONFIRM, { envio_id });
    return response.data;
  },

  getHistorial: async (page = 1, pageSize = 10) => {
    const response = await api.get(ENDPOINTS.MINERD_HISTORY, {
      params: { page, pageSize },
    });
    return response.data;
  },

  getDetalle: async (id) => {
    const response = await api.get(ENDPOINTS.MINERD_DETAIL(id));
    return response.data;
  },

  cancelarEnvio: async (id) => {
    const response = await api.delete(ENDPOINTS.MINERD_CANCEL(id));
    return response.data;
  },
};

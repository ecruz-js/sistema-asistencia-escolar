import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";

export const authService = {
  login: async (email, password) => {
    const response = await api.post(ENDPOINTS.LOGIN, { email, password });
    return response.data;
  },

  logout: async () => {
    const response = await api.post(ENDPOINTS.LOGOUT);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get(ENDPOINTS.PROFILE);
    return response.data;
  },

  changePassword: async (passwordActual, passwordNuevo, confirmarPassword) => {
    const response = await api.put(ENDPOINTS.CHANGE_PASSWORD, {
      passwordActual,
      passwordNuevo,
      confirmarPassword,
    });
    return response.data;
  },

  refreshToken: async (refreshToken) => {
    const response = await api.post(ENDPOINTS.REFRESH, { refreshToken });
    return response.data;
  },
};

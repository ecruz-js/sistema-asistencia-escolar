import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";

export const authService = {
  login: async (credentials) => {
    // credentials puede ser { email, password } o { passcode }
    const response = await api.post(ENDPOINTS.LOGIN, credentials);
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

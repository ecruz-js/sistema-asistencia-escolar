import api from "../api/axios";
import { ENDPOINTS } from "../api/endpoints";

export const notificacionService = {
  getAll: async (limit = 20, solo_no_leidas = false) => {
    const response = await api.get(ENDPOINTS.NOTIFICATIONS, {
      params: { limit, solo_no_leidas },
    });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get(ENDPOINTS.NOTIFICATIONS_UNREAD);
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.put(ENDPOINTS.MARK_NOTIFICATION_READ(id));
    return response.data;F
  },

  markAllAsRead: async () => {
    const response = await api.put(ENDPOINTS.MARK_ALL_READ);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(ENDPOINTS.NOTIFICATIONS + `/${id}`);
    return response.data;
  },
};

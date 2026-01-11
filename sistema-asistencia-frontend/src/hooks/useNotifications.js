import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificacionService } from "../services/notificacion.service";
import { useNotificationStore } from "../store/notificationStore";

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const { setNotifications, markAsRead, markAllAsRead } =
    useNotificationStore();

  // Obtener notificaciones
  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificacionService.getAll(20, false),
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });

  // Actualizar store cuando cambian las notificaciones
  useEffect(() => {
    if (data?.data?.notificaciones) {
      setNotifications(data.data.notificaciones);
    }
  }, [data, setNotifications]);

  // Marcar como leída
  const markAsReadMutation = useMutation({
    mutationFn: (id) => notificacionService.markAsRead(id),
    onSuccess: (_, id) => {
      markAsRead(id);
      queryClient.invalidateQueries(["notifications"]);
    },
  });

  // Marcar todas como leídas
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificacionService.markAllAsRead(),
    onSuccess: () => {
      markAllAsRead();
      queryClient.invalidateQueries(["notifications"]);
    },
  });

  return {
    notifications: data?.data?.notificaciones || [],
    unreadCount: data?.data?.total_no_leidas || 0,
    isLoading,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
  };
};

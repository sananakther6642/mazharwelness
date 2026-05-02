import api from "./api";

export const notificationsAPI = {
  list: (params) => api.get("/notifications", { params }),
  markRead: (notificationId) =>
    api.put(`/notifications/${notificationId}/read`),
  markAllRead: () => api.put("/notifications/read-all"),
};

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";

const NotificationContext = createContext(null);

const getApiUrl = () => {
  if (typeof window !== "undefined" && window.location.hostname.includes("vercel.app")) {
    return `${window.location.origin}/api`;
  }
  return import.meta.env.VITE_API_URL || "http://localhost:5000/api";
};

const getSocketUrl = () => {
  const api = getApiUrl();
  try {
    const url = new URL(api);
    url.pathname = "";
    return url.toString().replace(/\/?$/, "");
  } catch (_err) {
    return api.replace(/\/?api$/, "");
  }
};

export function NotificationProvider({ user, children }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const apiBase = getApiUrl();

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  useEffect(() => {
    if (!user || !token) {
      setNotifications([]);
      return;
    }

    let cancelled = false;
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${apiBase}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed to load notifications");
        const data = await res.json();
        if (!cancelled) {
          setNotifications(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Fetch notifications error:", err);
        if (!cancelled) setNotifications([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchNotifications();

    return () => {
      cancelled = true;
    };
  }, [user?.id, token, apiBase]);

  useEffect(() => {
    if (!user || !token) return;

    const socketUrl = getSocketUrl();
    const socket = io(socketUrl, {
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      setSocketConnected(true);
      socket.emit("join", { userId: user.id || user._id, role: user.role });
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    socket.on("notification:new", (notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id, user?.role, token]);

  const markAsRead = async (id) => {
    if (!id) return;
    try {
      const res = await fetch(`${apiBase}/notifications/${id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) throw new Error("Failed to mark notification as read");
      const updated = await res.json();
      setNotifications((prev) =>
        prev.map((n) => (n._id === updated._id ? updated : n))
      );
    } catch (err) {
      console.error("Mark notification read error:", err);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch(`${apiBase}/notifications/mark-all-read`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to mark all notifications as read");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Mark all notifications error:", err);
    }
  };

  const value = {
    notifications,
    unreadCount,
    loading,
    socketConnected,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return ctx;
}

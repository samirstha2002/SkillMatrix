import Chat from "./pages/Chat";
import Home from "./pages/Home";
import { Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import SwapRequests from "./pages/SwapRequests";

import { useAuth } from "./context/AuthContext";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import socket from "./lib/socket";

// Context so any page can add notifications without prop drilling
import { createContext, useContext } from "react";
import Profile from "./pages/Profile";
import PublicProfile from "./pages/PublicProfile";

export const NotificationContext = createContext(null);
export const useNotifications = () => useContext(NotificationContext);

function App() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);

  // Add a single notification (deduplicates by requestId)
  const addNotification = (notif) => {
    setNotifications((prev) => {
      const exists = prev.some((n) => n.requestId === notif.requestId);
      if (exists) return prev;
      return [notif, ...prev];
    });
  };

  // Remove one notification by requestId
  const removeNotification = (requestId) => {
    setNotifications((prev) => prev.filter((n) => n.requestId !== requestId));
  };

  // Clear all
  const clearNotifications = () => setNotifications([]);

  // Socket: incoming notifications from server
  useEffect(() => {
    if (!user?._id) return;

    const handler = (data) => {
      addNotification(data);
      toast.success(data.message);
    };

    socket.on("notification", handler);
    return () => socket.off("notification", handler);
  }, [user]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
      }}
    >
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />
        <Route
          path="/requests"
          element={
            <ProtectedRoute>
              <SwapRequests />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile/:id"
          element={
            <ProtectedRoute>
              <PublicProfile />
            </ProtectedRoute>
          }
        />
        {/* ✅ new */}'
      </Routes>
    </NotificationContext.Provider>
  );
}

export default App;

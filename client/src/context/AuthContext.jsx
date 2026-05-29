import { createContext, useState, useEffect, useContext } from "react";
import API from "../lib/api";
import socket from "../lib/socket";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const res = await API.get("/users/me");
      setUser(res.data);

      // ✅ Connect socket after confirming user is logged in
      if (!socket.connected) {
        socket.connect();
      }
    } catch (error) {
      console.log(error);
      sessionStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("token");
    setUser(null);
    socket.disconnect(); // ✅ Disconnect socket on logout
  };

  useEffect(() => {
    fetchMe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout, fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

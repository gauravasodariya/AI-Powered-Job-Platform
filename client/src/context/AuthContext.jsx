import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";

const AuthContext = createContext();
const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 
  (window.location.hostname === "localhost" ? "http://localhost:5000/api" : "/api")
).replace(/\/+$/, "");

console.log("Using API Base URL:", API_BASE_URL);

if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
  console.warn("VITE_API_URL is not set in production. Falling back to relative path /api");
}
const INITIAL_TOKEN = localStorage.getItem("token");

// Apply API config immediately so first-render requests use backend URL in production.
axios.defaults.baseURL = API_BASE_URL;
if (INITIAL_TOKEN) {
  axios.defaults.headers.common["Authorization"] = `Bearer ${INITIAL_TOKEN}`;
}

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(INITIAL_TOKEN);

  // Configure axios base URL and auth header whenever token changes
  useEffect(() => {
    axios.defaults.baseURL = API_BASE_URL;
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Load authenticated user
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await axios.get("/auth/me");
          setUser(res.data.data);
        } catch (err) {
          localStorage.removeItem("token");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const register = async (userData) => {
    const res = await axios.post("/auth/register", userData);
    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const login = async (userData) => {
    const res = await axios.post("/auth/login", userData);
    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const googleLogin = async (data) => {
    // tokenId can be passed as a string (legacy) or as an object with user info
    const payload = typeof data === "string" ? { tokenId: data } : data;
    const res = await axios.post("/auth/google-login", payload);
    localStorage.setItem("token", res.data.token);
    setToken(res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        googleLogin,
        logout,
        token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

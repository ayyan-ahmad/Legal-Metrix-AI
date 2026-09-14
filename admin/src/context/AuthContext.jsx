import { createContext, useContext, useState } from "react";
import api from "../api/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = async (email, password) => {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const { token, user } = response.data;

    if (user.role !== "admin") {
      throw new Error("Access denied. Admin only.");
    }

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
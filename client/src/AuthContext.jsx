import { createContext, useContext, useEffect, useState } from "react";
import { api, getToken, setToken } from "./api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setReady(true);
      return;
    }
    api("/api/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => setToken(null))
      .finally(() => setReady(true));
  }, []);

  async function login(username, password) {
    const data = await api("/api/auth/login", { method: "POST", body: { username, password } });
    setToken(data.token);
    setUser(data.user);
  }

  function logout() {
    api("/api/auth/logout", { method: "POST" }).catch(() => {});
    setToken(null);
    setUser(null);
  }

  return <AuthContext.Provider value={{ user, ready, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

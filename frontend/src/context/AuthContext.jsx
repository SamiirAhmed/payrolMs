import { createContext, useContext, useEffect, useMemo, useState } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

function normalizeUser(profile) {
  if (!profile) return null;

  return {
    ...profile,
    id: profile.user_id,
    name: profile.full_name || profile.username || profile.email,
    role: profile.role_name,
    department: profile.department_id,
    title: profile.role_name
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getProfile().then((profile) => {
      setUser(normalizeUser(profile));
      setLoading(false);
    });
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      async login(credentials) {
        const response = await authService.login(credentials);
        localStorage.setItem("payflow_token", response.token);
        const normalizedUser = normalizeUser(response.user);
        localStorage.setItem("payflow_user", JSON.stringify(normalizedUser));
        setUser(normalizedUser);
        return { ...response, user: normalizedUser };
      },
      logout() {
        localStorage.removeItem("payflow_token");
        localStorage.removeItem("payflow_user");
        setUser(null);
      },
      updateProfile(payload) {
        const next = { ...user, ...payload };
        localStorage.setItem("payflow_user", JSON.stringify(next));
        setUser(next);
      }
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}

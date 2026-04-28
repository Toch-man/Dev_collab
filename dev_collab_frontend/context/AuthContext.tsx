"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  log_in: (user_data: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  log_in: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // load from localStorage on app start
  useEffect(() => {
    try {
      const stored_user = localStorage.getItem("user");
      const stored_token = localStorage.getItem("access_token");
      if (stored_user && stored_token) {
        setUser(JSON.parse(stored_user));
        setToken(stored_token);
      }
    } catch (err) {
      console.error("Auth init error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const log_in = (user_data: User, user_token: string) => {
    localStorage.setItem("user", JSON.stringify(user_data));
    localStorage.setItem("access_token", user_token);
    setUser(user_data);
    setToken(user_token);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    setUser(null);
    setToken(null);
    router.push("/auth/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, log_in, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

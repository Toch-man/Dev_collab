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
import { isTokenExpired, refresh_token, register_logout } from "@/lib/api";

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

  useEffect(() => {
    //  async function defined AND called inside useEffect
    const init = async () => {
      try {
        const stored_token = localStorage.getItem("access_token");
        const stored_user = localStorage.getItem("user");

        // nothing stored  not logged in
        if (!stored_token || !stored_user) {
          setLoading(false);
          return;
        }

        if (isTokenExpired(stored_token)) {
          //  access token expired — try refresh
          const data = await refresh_token();

          if (data.success) {
            // consistent key — your backend returns "accessToken"
            localStorage.setItem("access_token", data.accessToken);
            setToken(data.accessToken);
            setUser(JSON.parse(stored_user));
          } else {
            //  refresh also failed — clear and redirect
            localStorage.removeItem("user");
            localStorage.removeItem("access_token");
            router.push("/auth/login");
          }
        } else {
          // token still valid — load normally
          setToken(stored_token);
          setUser(JSON.parse(stored_user));
        }
      } catch (err) {
        console.error("Auth init error:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("access_token");
      } finally {
        // ✅ setLoading inside init's finally — runs after await completes
        setLoading(false);
      }
    };

    init();

    // ✅ register logout so api.ts can trigger it on any 401
    register_logout(() => {
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
      setUser(null);
      setToken(null);
      router.push("/auth/login");
    });
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

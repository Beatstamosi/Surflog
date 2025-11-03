import { useEffect, useState } from "react";
import AuthContext from "./AuthContext.js";
import type { User } from "./types/User.js";

interface AuthProviderProps {
  children: React.ReactNode;
}

function isTokenExpired(token: string): boolean {
  try {
    const [, payloadBase64] = token.split(".");
    const payload = JSON.parse(atob(payloadBase64));
    const now = Date.now() / 1000;

    return payload.exp < now;
  } catch (err) {
    console.error("Error checking if token expired: ", err);
    return true; // Treat invalid tokens as expired
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/user/me`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!res.ok) {
        setUser(null);
      } else {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token || isTokenExpired(token)) {
      localStorage.removeItem("token");
      setUser(null);
      setLoading(false);
      return;
    }

    fetchUser();
  }, []);

  const value = {
    user,
    isAuthenticated: Boolean(user),
    loading,
    fetchUser,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

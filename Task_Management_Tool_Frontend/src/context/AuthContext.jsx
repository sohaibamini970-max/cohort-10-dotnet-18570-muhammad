import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in on refresh
    const stored = localStorage.getItem("tm_user");
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      // Direct call to .NET
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password }),
      });

      // Check if response is JSON before parsing
      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        return { success: false, message: "Server returned an invalid response" };
      }

      if (!response.ok) {
        return { success: false, message: data.message || "Invalid credentials" };
      }

      // data contains { token, user: { email, name, role } }
      const safeUser = data.user;

      localStorage.setItem("tm_token", data.token);
      localStorage.setItem("tm_user", JSON.stringify(safeUser));

      setUser(safeUser);
      return { success: true, role: safeUser.role };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Failed to connect to the server" };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("tm_user");
    localStorage.removeItem("tm_token");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
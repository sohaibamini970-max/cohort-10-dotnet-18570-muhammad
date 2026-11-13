import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

const USERS = [
  { email: "admin@task.com", password: "admin123", role: "admin", name: "Admin User" },
  { email: "user@task.com", password: "user123", role: "user", name: "John Doe" },
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("tm_user");
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const login = (email, password) => {
    const found = USERS.find(
      (u) => u.email === email && u.password === password
    );
    if (!found) return { success: false, message: "Invalid credentials" };
    const { password: _, ...safeUser } = found;
    setUser(safeUser);
    localStorage.setItem("tm_user", JSON.stringify(safeUser));
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("tm_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
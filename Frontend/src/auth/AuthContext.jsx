import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    } else if (token) {
      // Token exists but no user data
      setIsAuthenticated(true);
    }
  }, []);

  const loginUser = (token, userData) => {
    console.log("loginUser called with userData:", userData);
    console.log("User role:", userData?.role);
    
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setIsAuthenticated(true);
    
    // Redirect based on role
    if (userData.role === 'admin') {
      console.log("Navigating admin to /dashboard");
      navigate("/dashboard"); // Super admin sees dashboard
    } else {
      console.log("Navigating regular user to /home");
      navigate("/home"); // Other users (receptionist, mechanic) see home
    }
  };

  const logoutUser = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    navigate("/login");
  };

  const goToSignup = () => {
    navigate("/signup");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loginUser, logoutUser, goToSignup }}>
      {children}
    </AuthContext.Provider>
  );
}

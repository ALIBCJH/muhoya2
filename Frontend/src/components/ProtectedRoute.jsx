import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../auth/AuthContext";

/**
 * Protected Route Component
 * Restricts access to routes based on user role
 */
export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, isAuthenticated } = useContext(AuthContext);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If no specific roles required, allow access
  if (allowedRoles.length === 0) {
    return children;
  }

  // Check if user has required role
  if (user && allowedRoles.includes(user.role)) {
    return children;
  }

  // If user doesn't have required role, redirect to home
  return <Navigate to="/home" replace />;
}

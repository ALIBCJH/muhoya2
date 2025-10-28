import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./auth/AuthContext.jsx";
import { useContext } from "react";

// Enhanced Components (Modern UI)
import NavbarEnhanced from "./components/NavbarEnhanced";
import DashboardEnhanced from "./components/DashboardEnhanced";
import ClientFormEnhanced from "./components/ClientFormEnhanced";
import ClientPageEnhanced from "./components/ClientPageEnhanced";
import ClientVehiclesPage from "./components/ClientVehiclesPage";
import OrganizationFormEnhanced from "./components/OrganizationFormEnhanced";
import OrganizationPageEnhanced from "./components/OrganizationPageEnhanced";
import OrganizationVehiclesPage from "./components/OrganizationVehiclesPage";
import LoginEnhanced from "./components/LoginEnhanced";
import SignupEnhanced from "./components/SignupEnhanced";
import ProtectedRoute from "./components/ProtectedRoute";

import Footer from "./components/Footer";
import Layout from "./components/Layout";

// Landing / Home
import Welcome from "./components/Welcome";
import Home from "./Home/Home";

// Dashboard & Features (Legacy - can be replaced)
import Purchases from "./components/Purchases";

// Maintenance & Service
import Maintenance from "./components/Maintenance";
import Service from "./components/Service";

import "./index.css";

function AppContent() {
  const location = useLocation();
  const { isAuthenticated } = useContext(AuthContext);

  // Pages where navbar/footer should never show
  const noLayoutPages = ["/login", "/signup"];
  const isNoLayoutPage = noLayoutPages.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Show Navbar only when authenticated and NOT on login/signup pages */}
      {isAuthenticated && !isNoLayoutPage && <NavbarEnhanced />}

      <div className="flex-grow">
        {isNoLayoutPage ? (
          // Authentication pages - NO LAYOUT, NO PADDING
          <Routes>
            <Route path="/login" element={<LoginEnhanced />} />
            <Route path="/signup" element={<SignupEnhanced />} />
          </Routes>
        ) : (
          // All other pages - WITH LAYOUT
          <Layout>
            <Routes>
              {/* Landing / Welcome - Redirect to login if not authenticated */}
              <Route 
                path="/" 
                element={isAuthenticated ? <Welcome /> : <Navigate to="/login" replace />} 
              />

              {/* Dashboard - Admin Only */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <DashboardEnhanced />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/purchases" 
                element={isAuthenticated ? <Purchases /> : <Navigate to="/login" replace />} 
              />

              {/* Home */}
              <Route 
                path="/home" 
                element={isAuthenticated ? <Home /> : <Navigate to="/login" replace />} 
              />

              {/* Organizations - Using Enhanced Components */}
              <Route 
                path="/organizations" 
                element={isAuthenticated ? <OrganizationFormEnhanced /> : <Navigate to="/login" replace />} 
              />
              <Route 
                path="/organizations-list" 
                element={isAuthenticated ? <OrganizationPageEnhanced /> : <Navigate to="/login" replace />} 
              />
              <Route 
                path="/organizations/:id/vehicles" 
                element={isAuthenticated ? <OrganizationVehiclesPage /> : <Navigate to="/login" replace />} 
              />

              {/* Clients - Using Enhanced Components */}
              <Route 
                path="/clients" 
                element={isAuthenticated ? <ClientFormEnhanced /> : <Navigate to="/login" replace />} 
              />
              <Route 
                path="/clients-list" 
                element={isAuthenticated ? <ClientPageEnhanced /> : <Navigate to="/login" replace />} 
              />
              <Route 
                path="/clients/:id/vehicles" 
                element={isAuthenticated ? <ClientVehiclesPage /> : <Navigate to="/login" replace />} 
              />

              {/* Maintenance & Service */}
              <Route 
                path="/maintenance/:orgId" 
                element={isAuthenticated ? <Maintenance /> : <Navigate to="/login" replace />} 
              />
              <Route 
                path="/service/:regNo" 
                element={isAuthenticated ? <Service /> : <Navigate to="/login" replace />} 
              />
            </Routes>
          </Layout>
        )}
      </div>

      {/* Show Footer only when authenticated and NOT on login/signup pages */}
      {isAuthenticated && !isNoLayoutPage && <Footer />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

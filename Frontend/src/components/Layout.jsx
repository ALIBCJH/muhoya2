// src/components/Layout.jsx
import React from "react";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar is now conditionally rendered in App.jsx */}
      <main className="pt-16">{children}</main>
    </div>
  );
};

export default Layout;

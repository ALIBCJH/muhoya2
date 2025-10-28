// src/components/Welcome.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const Welcome = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    // Go directly to dashboard
    navigate("/dashboard");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-orange-500 to-teal-400 text-gray-800">
      <h1 className="text-5xl font-extrabold mb-6 text-center text-white drop-shadow-lg">
        Muhoya Auto Garage
      </h1>
      <p className="text-lg mb-8 text-center text-gray-100">
        Manage your clients, vehicles, and revenue with ease.
      </p>
      <button
        onClick={handleGetStarted}
        className="px-8 py-4 bg-orange-500 text-white font-bold rounded-lg shadow-lg hover:bg-orange-600 transition"
      >
        Get Started
      </button>
    </div>
  );
};

export default Welcome;

import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6 bg-gray-50 p-4">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 text-center">
        Muhoya Auto Garage
      </h1>

      <p className="text-gray-600 text-sm sm:text-base md:text-lg text-center max-w-xs sm:max-w-md">
        Manage your clients, vehicles, and revenue with ease.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full max-w-xs sm:max-w-md">
        <button
          onClick={() => navigate("/organizations-list")}
          className="w-full sm:w-auto px-6 py-3 bg-orange-500 text-white rounded-lg shadow-lg hover:bg-orange-600 transition"
        >
          Organizational Clients
        </button>

        <button
          onClick={() => navigate("/clients-list")}
          className="w-full sm:w-auto px-6 py-3 bg-teal-400 text-white rounded-lg shadow-lg hover:bg-teal-500 transition"
        >
          Walk-In Clients
        </button>
      </div>
    </div>
  );
}

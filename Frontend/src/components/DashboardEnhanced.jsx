import React, { useEffect, useState } from "react";
import api from "../Services/api";
import Card from "./ui/Card";
import { CardSkeleton } from "./ui/Skeleton";

const DashboardEnhanced = () => {
  const [loading, setLoading] = useState(true);
  const [vehicles, setVehicles] = useState([]);
  const [walkInClients, setWalkInClients] = useState([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [storeStock, setStoreStock] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [vehiclesRes, clientsRes, maintenanceRes, stockRes] = await Promise.all([
          api.admin.getVehicles().catch(() => ({ data: [] })),        // expects vehicles_with_owners
          api.admin.getWalkInClients().catch(() => ({ data: [] })),   // expects clients
          api.admin.getMaintenance().catch(() => ({ data: [] })),     // expects service_records_detailed
          api.admin.getStock().catch(() => ({ data: [] })),           // expects parts
        ]);

        setVehicles(vehiclesRes.data);
        setWalkInClients(clientsRes.data);
        setMaintenanceRecords(maintenanceRes.data);
        setStoreStock(stockRes.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <CardSkeleton />;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  // Helper to compute stock status
  const getStockStatus = (item) => {
    if (item.stock_quantity <= item.reorder_level / 2) return "critical";
    if (item.stock_quantity <= item.reorder_level) return "low";
    return "normal";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>

      {/* Vehicles */}
      <Card hoverable>
        <Card.Header>
          <h2 className="text-xl font-semibold text-gray-800">All Vehicles</h2>
          <span className="text-sm text-gray-500">{vehicles.length} vehicles</span>
        </Card.Header>
        <Card.Body>
          {vehicles.length === 0 ? (
            <p className="text-gray-500">No vehicles found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Reg. No</th>
                    <th className="px-4 py-2 text-left">Make/Model</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v) => (
                    <tr key={v.id} className="bg-white hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono">{v.registration_number}</td>
                      <td className="px-4 py-2">{v.make_model}</td>
                      <td className="px-4 py-2">{v.vehicle_type}</td>
                      <td className="px-4 py-2">{v.owner_name || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Walk-In Clients */}
      <Card hoverable>
        <Card.Header>
          <h2 className="text-xl font-semibold text-gray-800">Walk-In Clients</h2>
          <span className="text-sm text-gray-500">{walkInClients.length} clients</span>
        </Card.Header>
        <Card.Body>
          {walkInClients.length === 0 ? (
            <p className="text-gray-500">No walk-in clients found.</p>
          ) : (
            <ul className="space-y-2">
              {walkInClients.map((c) => (
                <li
                  key={c.id}
                  className="flex justify-between p-3 bg-gray-100 rounded hover:bg-gray-200"
                >
                  <span>{c.name}</span>
                  <span className="text-gray-500">{c.phone || "N/A"}</span>
                </li>
              ))}
            </ul>
          )}
        </Card.Body>
      </Card>

      {/* Maintenance Records */}
      <Card hoverable>
        <Card.Header>
          <h2 className="text-xl font-semibold text-gray-800">Maintenance Records</h2>
          <span className="text-sm text-gray-500">{maintenanceRecords.length} records</span>
        </Card.Header>
        <Card.Body>
          {maintenanceRecords.length === 0 ? (
            <p className="text-gray-500">No maintenance records found.</p>
          ) : (
            <ul className="space-y-2">
              {maintenanceRecords.map((m) => (
                <li key={m.id} className="p-3 bg-white rounded shadow hover:bg-gray-50">
                  <div className="flex justify-between">
                    <span className="font-medium">{m.registration_number}</span>
                    <span className="text-gray-500">{m.description}</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    {new Date(m.service_date).toLocaleDateString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card.Body>
      </Card>

      {/* Store Stock */}
      <Card hoverable>
        <Card.Header>
          <h2 className="text-xl font-semibold text-gray-800">Store Stock</h2>
          <span className="text-sm text-gray-500">{storeStock.length} items</span>
        </Card.Header>
        <Card.Body>
          {storeStock.length === 0 ? (
            <p className="text-gray-500">No stock data found.</p>
          ) : (
            <ul className="space-y-2">
              {storeStock.map((item) => (
                <li
                  key={item.id}
                  className="flex justify-between p-3 rounded bg-gray-50 hover:bg-gray-100"
                >
                  <span>{item.part_name}</span>
                  <span
                    className={`px-2 py-1 rounded text-sm font-semibold ${
                      getStockStatus(item) === "critical"
                        ? "bg-red-100 text-red-700"
                        : getStockStatus(item) === "low"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {item.stock_quantity} units
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default DashboardEnhanced;

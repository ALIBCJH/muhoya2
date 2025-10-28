import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Table from "./ui/Table";
import Badge from "./ui/Badge";
import { TableSkeleton } from "./ui/Skeleton";
import useToast from "../hooks/useToast";
import api from "../Services/api";

const ClientVehiclesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [client, setClient] = useState(null);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    fetchClientDetails();
    fetchVehicles();
    // eslint-disable-next-line
  }, [id]);

  const fetchClientDetails = async () => {
    try {
      const response = await api.clients.getById(id);
      setClient(response.data?.client || response.data || response);
    } catch (error) {
      toast.error("Failed to load client details");
      console.error("Error fetching client:", error);
    }
  };

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const response = await api.clients.getVehicles(id);
      setVehicles(response.data || response || []);
    } catch (error) {
      toast.error("Failed to load vehicles");
      console.error("Error fetching vehicles:", error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const getVehicleTypeColor = (type) => {
    const colors = {
      sedan: "info",
      suv: "warning",
      truck: "danger",
      van: "success",
      motorcycle: "purple",
      bus: "primary",
    };
    return colors[type?.toLowerCase()] || "default";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/clients-list")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" />
            </svg>
          }
        >
          Back to Clients
        </Button>

        {/* Client Profile Card */}
        {client && (
          <Card className="shadow-md border border-gray-200">
            <Card.Body className="flex items-center justify-between">

              {/* Avatar + Info */}
              <div className="flex items-center gap-6">
                <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-semibold shadow">
                  {client.name?.charAt(0)}
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{client.name}</h1>
                  <div className="text-sm text-gray-500 space-y-1 mt-1">
                    {client.email && <p>📧 {client.email}</p>}
                    {client.phone && <p>📞 {client.phone}</p>}
                    {client.address && <p>📍 {client.address}</p>}
                  </div>
                </div>
              </div>

              {/* Vehicle Count Badge */}
              <Badge variant="primary" size="lg">
                {vehicles.length} {vehicles.length === 1 ? "Vehicle" : "Vehicles"}
              </Badge>

            </Card.Body>
          </Card>
        )}

        {/* Vehicles */}
        <Card className="shadow-sm border border-gray-200">
          <Card.Header>
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              🚗 Client Vehicles
            </h2>
          </Card.Header>

          <Card.Body className="p-0">
            {loading ? (
              <div className="p-6">
                <TableSkeleton rows={5} columns={6} />
              </div>
            ) : vehicles.length === 0 ? (
              <div className="text-center py-14">
                <h3 className="text-lg font-medium text-gray-700">No Vehicles Found</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Vehicles are added when creating the client.
                </p>
                <Button className="mt-6" variant="outline" onClick={() => navigate("/clients-list")}>
                  Back to Clients
                </Button>
              </div>
            ) : (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Registration</Table.Head>
                    <Table.Head>Make/Model</Table.Head>
                    <Table.Head>Type</Table.Head>
                    <Table.Head>Year</Table.Head>
                    <Table.Head>Color</Table.Head>
                    <Table.Head>VIN</Table.Head>
                    <Table.Head className="text-right">Actions</Table.Head>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {vehicles.map((vehicle) => (
                    <Table.Row key={vehicle.id}>
                      <Table.Cell className="font-medium text-gray-800">
                        {vehicle.registration_number}
                      </Table.Cell>

                      <Table.Cell>{vehicle.make_model}</Table.Cell>

                      <Table.Cell>
                        <Badge variant={getVehicleTypeColor(vehicle.vehicle_type)}>
                          {vehicle.vehicle_type || "N/A"}
                        </Badge>
                      </Table.Cell>

                      <Table.Cell>{vehicle.year || "—"}</Table.Cell>

                      <Table.Cell className="flex items-center gap-2">
                        {vehicle.color && (
                          <span
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: vehicle.color.toLowerCase() }}
                          />
                        )}
                        {vehicle.color || "N/A"}
                      </Table.Cell>

                      <Table.Cell className="font-mono text-sm text-gray-600">
                        {vehicle.vin || "N/A"}
                      </Table.Cell>

                      <Table.Cell className="text-right space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                        >
                          View
                        </Button>

                        <Button
                          variant="success"
                          size="sm"
                          onClick={() =>
                            navigate(`/service/${encodeURIComponent(vehicle.registration_number)}`)
                          }
                        >
                          Service
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            )}
          </Card.Body>
        </Card>

      </div>
    </div>
  );
};

export default ClientVehiclesPage;

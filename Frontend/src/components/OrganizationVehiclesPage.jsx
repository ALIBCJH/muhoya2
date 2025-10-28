import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Table from "./ui/Table";
import Badge from "./ui/Badge";
import { TableSkeleton } from "./ui/Skeleton";
import useToast from "../hooks/useToast";
import api from "../Services/api";

const OrganizationVehiclesPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState(null);
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    fetchOrganizationDetails();
    fetchVehicles();
    // eslint-disable-next-line
  }, [id]);

  const fetchOrganizationDetails = async () => {
    try {
      console.log("Fetching organization with ID:", id);
      const response = await api.organizations.getById(id);
      console.log("Organization response:", response);
      setOrganization(response.data?.organization || response.data || response);
    } catch (error) {
      toast.error("Failed to load organization details");
      console.error("Error fetching organization:", error);
    }
  };

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      console.log("Fetching vehicles for organization ID:", id);
      const response = await api.organizations.getVehicles(id);
      console.log("Vehicles response:", response);
      const vehicleData = response.data || response || [];
      console.log("Vehicle data:", vehicleData);
      setVehicles(vehicleData);
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

  console.log("OrganizationVehiclesPage rendering - ID:", id, "Loading:", loading, "Vehicles:", vehicles.length);

  if (!id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error: No Organization ID</h1>
          <Button onClick={() => navigate("/organizations-list")} className="mt-4">
            Back to Organizations
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/organizations-list")}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            }
          >
            Back to Organizations
          </Button>
        </div>

        {/* Organization Info */}
        {organization && (
          <Card className="mb-6">
            <Card.Body>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-4 rounded-xl">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">{organization.name}</h1>
                    <p className="text-gray-600 mt-1">Contact: {organization.contact_person}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-500">
                      <span>📧 {organization.email}</span>
                      <span>📞 {organization.phone}</span>
                    </div>
                  </div>
                </div>
                <Badge variant="info" size="lg">
                  {vehicles.length} {vehicles.length === 1 ? 'Vehicle' : 'Vehicles'}
                </Badge>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Vehicles Table */}
        <Card>
          <Card.Header>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Fleet Vehicles</h2>
              {/* TODO: Add vehicle form - for now vehicles are added when creating organization */}
            </div>
          </Card.Header>
          <Card.Body className="p-0">
            {loading ? (
              <div className="p-6">
                <TableSkeleton rows={5} columns={6} />
              </div>
            ) : vehicles.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No vehicles</h3>
                <p className="mt-1 text-sm text-gray-500">Vehicles are added when creating the organization. Go back and edit the organization to add vehicles.</p>
                <div className="mt-6">
                  <Button
                    variant="outline"
                    onClick={() => navigate("/organizations-list")}
                  >
                    Back to Organizations
                  </Button>
                </div>
              </div>
            ) : (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Registration No.</Table.Head>
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
                      <Table.Cell>
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-lg">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{vehicle.registration_number}</div>
                            <div className="text-xs text-gray-500">ID: {vehicle.id}</div>
                          </div>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="font-medium text-gray-900">{vehicle.make_model}</span>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge variant={getVehicleTypeColor(vehicle.vehicle_type)}>
                          {vehicle.vehicle_type || 'N/A'}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-gray-700">{vehicle.year || 'N/A'}</span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center gap-2">
                          {vehicle.color && (
                            <div 
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: vehicle.color.toLowerCase() }}
                              title={vehicle.color}
                            />
                          )}
                          <span className="text-gray-700">{vehicle.color || 'N/A'}</span>
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <span className="text-sm text-gray-600 font-mono">{vehicle.vin || 'N/A'}</span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/vehicles/${vehicle.id}`)}
                            icon={
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            }
                          >
                            View
                          </Button>
                          <Button
                            variant="success"
                            size="sm"
                            onClick={() => navigate(`/service/${encodeURIComponent(vehicle.registration_number)}`)}
                            icon={
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            }
                          >
                            Service
                          </Button>
                        </div>
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

export default OrganizationVehiclesPage;

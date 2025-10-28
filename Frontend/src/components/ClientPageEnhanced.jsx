import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Table from "./ui/Table";
import Input from "./ui/Input";
import Badge from "./ui/Badge";
import { TableSkeleton } from "./ui/Skeleton";
import useToast from "../hooks/useToast";
import api from "../Services/api";

const ClientPageEnhanced = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Fetch clients from API
  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await api.clients.getAll();
      setClients(response.data || response || []);
    } catch (error) {
      toast.error("Failed to load clients");
      console.error("Error fetching clients:", error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter clients based on search
  const filteredClients = clients.filter((client) => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.phone && client.phone.includes(searchTerm));
    
    return matchesSearch;
  });

  const handleStartService = (clientId) => {
    navigate(`/maintenance/${clientId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Walk-In Clients</h1>
              <p className="text-gray-600">Manage individual customers and their vehicles</p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate("/clients")}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
            >
              Add New Client
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card hoverable gradient>
            <Card.Body className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Clients</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{clients.length}</h3>
              </div>
              <div className="bg-blue-100 p-4 rounded-xl">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </Card.Body>
          </Card>

          <Card hoverable gradient>
            <Card.Body className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active This Month</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">24</h3>
              </div>
              <div className="bg-green-100 p-4 rounded-xl">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </Card.Body>
          </Card>

          <Card hoverable gradient>
            <Card.Body className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Vehicles</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">
                  {clients.reduce((sum, c) => sum + (c.vehicles || 0), 0)}
                </h3>
              </div>
              <div className="bg-purple-100 p-4 rounded-xl">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-6">
          <Card.Body>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filterType === "all" ? "primary" : "outline"}
                  onClick={() => setFilterType("all")}
                  size="md"
                >
                  All
                </Button>
                <Button
                  variant={filterType === "active" ? "primary" : "outline"}
                  onClick={() => setFilterType("active")}
                  size="md"
                >
                  Active
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Clients Table */}
        <Card>
          <Card.Header>
            <h2 className="text-xl font-bold text-gray-800">
              {filteredClients.length} {filteredClients.length === 1 ? 'Client' : 'Clients'}
            </h2>
          </Card.Header>
          <Card.Body className="p-0">
            {loading ? (
              <div className="p-6">
                <TableSkeleton rows={5} columns={5} />
              </div>
            ) : (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Client Name</Table.Head>
                    <Table.Head>Contact</Table.Head>
                    <Table.Head>Vehicles</Table.Head>
                    <Table.Head>Last Service</Table.Head>
                    <Table.Head>Actions</Table.Head>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client) => (
                      <Table.Row key={client.id}>
                        <Table.Cell>
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                              {client.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{client.name}</p>
                              <p className="text-sm text-gray-500">ID: #{client.id}</p>
                            </div>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div>
                            <p className="text-sm text-gray-900">{client.email}</p>
                            <p className="text-sm text-gray-500">{client.phone}</p>
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <Badge variant="info">{client.vehicle_count || 0} {client.vehicle_count === 1 ? 'vehicle' : 'vehicles'}</Badge>
                        </Table.Cell>
                        <Table.Cell>
                          <span className="text-sm text-gray-600">{client.lastService || 'N/A'}</span>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleStartService(client.id)}
                              icon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                              }
                            >
                              Service
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/clients/${client.id}/vehicles`)}
                              icon={
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                              }
                            >
                              View Vehicles
                            </Button>
                          </div>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  ) : (
                    <Table.EmptyState
                      message="No clients found"
                      action={
                        <Button
                          variant="primary"
                          onClick={() => navigate("/clients")}
                          className="mt-4"
                        >
                          Add Your First Client
                        </Button>
                      }
                    />
                  )}
                </Table.Body>
              </Table>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default ClientPageEnhanced;

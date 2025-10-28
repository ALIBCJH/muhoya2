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

const OrganizationPageEnhanced = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [organizations, setOrganizations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch organizations from API
  useEffect(() => {
    fetchOrganizations();
    // eslint-disable-next-line
  }, []);

  const fetchOrganizations = async () => {
    setLoading(true);
    try {
      const response = await api.organizations.getAll();
      setOrganizations(response.data || response || []);
    } catch (error) {
      toast.error("Failed to load organizations");
      console.error("Error fetching organizations:", error);
      setOrganizations([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter organizations based on search
  const filteredOrganizations = organizations.filter((org) => {
    const matchesSearch = 
      org.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (org.phone && org.phone.includes(searchTerm));
    
    return matchesSearch;
  });

  const handleViewVehicles = (orgId) => {
    navigate(`/organizations/${orgId}/vehicles`);
  };

  const handleEdit = (orgId) => {
    navigate(`/organizations/${orgId}/edit`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Fleet Organizations</h1>
              <p className="text-gray-600">Manage corporate clients and their vehicle fleets</p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate("/organizations")}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              }
            >
              Add New Organization
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card hoverable gradient>
            <Card.Body className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Organizations</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{organizations.length}</h3>
              </div>
              <div className="bg-purple-100 p-4 rounded-xl">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
            </Card.Body>
          </Card>

          <Card hoverable gradient>
            <Card.Body className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Fleet Vehicles</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">
                  {organizations.reduce((sum, org) => sum + (org.vehicle_count || 0), 0)}
                </h3>
              </div>
              <div className="bg-green-100 p-4 rounded-xl">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </Card.Body>
          </Card>

          <Card hoverable gradient>
            <Card.Body className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active This Month</p>
                <h3 className="text-3xl font-bold text-gray-900 mt-1">{Math.floor(organizations.length * 0.7)}</h3>
              </div>
              <div className="bg-orange-100 p-4 rounded-xl">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
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
                  placeholder="Search by name, contact person, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Organizations Table */}
        <Card>
          <Card.Body>
            {loading ? (
              <TableSkeleton rows={5} columns={6} />
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Organizations ({filteredOrganizations.length})
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={fetchOrganizations}
                    icon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    }
                  >
                    Refresh
                  </Button>
                </div>

                {filteredOrganizations.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No organizations found</h3>
                    <p className="text-gray-600 mb-4">
                      {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first organization"}
                    </p>
                    {!searchTerm && (
                      <Button
                        variant="primary"
                        onClick={() => navigate("/organizations")}
                      >
                        Add Organization
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <Table.Header>
                        <Table.Row>
                          <Table.Head>Organization</Table.Head>
                          <Table.Head>Contact Person</Table.Head>
                          <Table.Head>Phone</Table.Head>
                          <Table.Head>Email</Table.Head>
                          <Table.Head>Location</Table.Head>
                          <Table.Head>Vehicles</Table.Head>
                          <Table.Head className="text-right">Actions</Table.Head>
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {filteredOrganizations.map((org) => (
                          <Table.Row key={org.id}>
                            <Table.Cell>
                              <div className="flex items-center gap-3">
                                <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-2 rounded-lg">
                                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">{org.name}</div>
                                  <div className="text-sm text-gray-500">ID: {org.id}</div>
                                </div>
                              </div>
                            </Table.Cell>
                            <Table.Cell>
                              <div className="text-gray-900">{org.contact_person || "N/A"}</div>
                            </Table.Cell>
                            <Table.Cell>
                              <div className="text-gray-700">{org.phone || "N/A"}</div>
                            </Table.Cell>
                            <Table.Cell>
                              <div className="text-gray-700">{org.email || "N/A"}</div>
                            </Table.Cell>
                            <Table.Cell>
                              <div className="text-gray-700">{org.address || "N/A"}</div>
                            </Table.Cell>
                            <Table.Cell>
                              <Badge variant="info">
                                {org.vehicle_count || 0} vehicles
                              </Badge>
                            </Table.Cell>
                            <Table.Cell>
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewVehicles(org.id)}
                                  icon={
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  }
                                >
                                  View Fleet
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEdit(org.id)}
                                  icon={
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  }
                                >
                                  Edit
                                </Button>
                              </div>
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                  </div>
                )}
              </>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default OrganizationPageEnhanced;

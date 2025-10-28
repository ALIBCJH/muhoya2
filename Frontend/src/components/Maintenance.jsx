import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "./ui/Card";
import Table from "./ui/Table";
import Button from "./ui/Button";
import Badge from "./ui/Badge";
import { TableSkeleton } from "./ui/Skeleton";
import useToast from "../hooks/useToast";
import api from "../Services/api";

export default function Maintenance() {
  const navigate = useNavigate();
  const toast = useToast();

  const [vehicles, setVehicles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      const res = await api.vehicles.getAll();
      setVehicles(res.data || []);
    } catch (error) {
      toast.error("Failed to load vehicles");
      console.error("Error loading vehicles:", error);
    } finally {
      setLoading(false);
    }
  };

  const filtered = vehicles.filter((v) =>
    `${v.make_model} ${v.registration_number}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

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
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800">Maintenance</h1>

        {/* Search */}
        <div className="max-w-md">
          <input
            type="text"
            placeholder="Search vehicle by model or registration..."
            className="w-full border border-gray-300 rounded-md px-4 py-2 focus:ring focus:ring-orange-300 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Vehicles List */}
        <Card className="shadow-sm border border-gray-200">
          <Card.Header>
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              🚗 Vehicles Available for Service
            </h2>
          </Card.Header>

          <Card.Body className="p-0">
            {loading ? (
              <div className="p-6">
                <TableSkeleton rows={5} columns={6} />
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-14">
                <h3 className="text-lg font-medium text-gray-700">
                  No Vehicles Found
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Try adjusting your search.
                </p>
              </div>
            ) : (
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.Head>Registration</Table.Head>
                    <Table.Head>Make / Model</Table.Head>
                    <Table.Head>Type</Table.Head>
                    <Table.Head>Year</Table.Head>
                    <Table.Head>Color</Table.Head>
                    <Table.Head className="text-right">Action</Table.Head>
                  </Table.Row>
                </Table.Header>

                <Table.Body>
                  {filtered.map((v) => (
                    <Table.Row key={v.id}>
                      <Table.Cell className="font-medium text-gray-800">
                        {v.registration_number}
                      </Table.Cell>

                      <Table.Cell>{v.make_model}</Table.Cell>

                      <Table.Cell>
                        <Badge variant={getVehicleTypeColor(v.vehicle_type)}>
                          {v.vehicle_type || "N/A"}
                        </Badge>
                      </Table.Cell>

                      <Table.Cell>{v.year || "—"}</Table.Cell>

                      <Table.Cell>
                        <span className="inline-flex items-center gap-2">
                          {v.color && (
                            <span
                              className="w-4 h-4 rounded-full border"
                              style={{ backgroundColor: v.color.toLowerCase() }}
                            />
                          )}
                          {v.color || "N/A"}
                        </span>
                      </Table.Cell>

                      <Table.Cell className="text-right">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() =>
                            navigate(`/service/${encodeURIComponent(v.registration_number)}`)
                          }
                        >
                          Start Service
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
}

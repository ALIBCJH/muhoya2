import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Card from "./ui/Card";
import Badge from "./ui/Badge";
import useToast from "../hooks/useToast";
import api from "../Services/api";

export default function ClientFormEnhanced() {
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [clientName, setClientName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [vehicleType, setVehicleType] = useState("");
  const [makeModel, setMakeModel] = useState("");
  const [regNo, setRegNo] = useState("");
  const [errors, setErrors] = useState({});

  const validateVehicle = () => {
    const newErrors = {};
    if (!vehicleType.trim()) newErrors.vehicleType = "Vehicle type is required";
    if (!makeModel.trim()) newErrors.makeModel = "Make & model is required";
    if (!regNo.trim()) newErrors.regNo = "Registration number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addVehicle = () => {
    if (!validateVehicle()) return;

    // Check for duplicate registration
    if (vehicles.some(v => v.regNo.toLowerCase() === regNo.toLowerCase())) {
      toast.error("This registration number already exists!");
      return;
    }

    setVehicles([...vehicles, { vehicleType, makeModel, regNo }]);
    setVehicleType("");
    setMakeModel("");
    setRegNo("");
    setErrors({});
    toast.success("Vehicle added successfully!");
  };

  const removeVehicle = (index) => {
    setVehicles(vehicles.filter((_, i) => i !== index));
    toast.info("Vehicle removed");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!clientName.trim()) newErrors.clientName = "Client name is required";
    if (email && !/\S+@\S+\.\S+/.test(email)) newErrors.email = "Email is invalid";
    if (vehicles.length === 0) newErrors.vehicles = "Add at least one vehicle";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    const clientData = { clientName, phone, email, vehicles };

    try {
      await api.clients.createWithVehicles(clientData);
      toast.success("Client created successfully!");
      
      // Navigate to client list after a short delay
      setTimeout(() => navigate("/clients-list"), 1500);
    } catch (error) {
      toast.error(error.message || "Failed to add client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header with Back Button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Add Walk-In Client</h1>
            <p className="text-gray-600 mt-1">Register a new individual client and their vehicles</p>
          </div>
                    <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/clients-list")}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            }
          >
            Back to Clients
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Client Information Card */}
          <Card gradient>
            <Card.Header>
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <svg className="w-6 h-6 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Client Information
              </h2>
            </Card.Header>
            <Card.Body>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Client Name *"
                  placeholder="John Doe"
                  value={clientName}
                  onChange={(e) => {
                    setClientName(e.target.value);
                    if (errors.clientName) setErrors({ ...errors, clientName: null });
                  }}
                  error={errors.clientName}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  }
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="+254 700 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  }
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors({ ...errors, email: null });
                  }}
                  error={errors.email}
                  containerClassName="md:col-span-2"
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  }
                />
              </div>
            </Card.Body>
          </Card>

          {/* Vehicles Card */}
          <Card gradient>
            <Card.Header>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Vehicles
                </h2>
                {vehicles.length > 0 && (
                  <Badge variant="primary">{vehicles.length} vehicle(s)</Badge>
                )}
              </div>
            </Card.Header>
            <Card.Body>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <Input
                  placeholder="Vehicle Type (e.g., Car, SUV)"
                  value={vehicleType}
                  onChange={(e) => {
                    setVehicleType(e.target.value);
                    if (errors.vehicleType) setErrors({ ...errors, vehicleType: null });
                  }}
                  error={errors.vehicleType}
                />
                <Input
                  placeholder="Make & Model (e.g., Toyota Corolla)"
                  value={makeModel}
                  onChange={(e) => {
                    setMakeModel(e.target.value);
                    if (errors.makeModel) setErrors({ ...errors, makeModel: null });
                  }}
                  error={errors.makeModel}
                />
                <Input
                  placeholder="Registration (e.g., KAA 123A)"
                  value={regNo}
                  onChange={(e) => {
                    setRegNo(e.target.value.toUpperCase());
                    if (errors.regNo) setErrors({ ...errors, regNo: null });
                  }}
                  error={errors.regNo}
                />
              </div>
              
              <Button
                type="button"
                onClick={addVehicle}
                variant="secondary"
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
              >
                Add Vehicle
              </Button>

              {errors.vehicles && vehicles.length === 0 && (
                <p className="mt-2 text-sm text-red-600">{errors.vehicles}</p>
              )}

              {/* Vehicle List */}
              {vehicles.length > 0 && (
                <div className="mt-6 space-y-3">
                  {vehicles.map((v, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg hover:shadow-md transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-teal-100 p-3 rounded-lg">
                          <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{v.makeModel}</p>
                          <p className="text-sm text-gray-600">{v.vehicleType} • {v.regNo}</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={() => removeVehicle(i)}
                        variant="danger"
                        size="sm"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Submit Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/clients-list")}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              }
            >
              Save Client
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Button from "./ui/Button";
import Card from "./ui/Card";
import Input from "./ui/Input";
import useToast from "../hooks/useToast";
import api from "../Services/api";

export default function VehicleService() {
  const { regNo } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [parts, setParts] = useState([{ name: "", code: "", quantity: "", price: "" }]);
  const [labourCost, setLabourCost] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [paymentReference, setPaymentReference] = useState("");
  const [serviceNotes, setServiceNotes] = useState("");

  useEffect(() => {
    fetchVehicle();
    // eslint-disable-next-line
  }, [regNo]);

  const fetchVehicle = async () => {
    setLoading(true);
    try {
      // Try to get vehicle by registration number
      const response = await api.vehicles.getAll({ search: decodeURIComponent(regNo) });
      const vehicles = response.data || [];
      
      if (vehicles.length > 0) {
        // Find exact match
        const matchedVehicle = vehicles.find(
          v => v.registration_number?.toLowerCase() === decodeURIComponent(regNo).toLowerCase()
        );
        setVehicle(matchedVehicle || vehicles[0]);
      } else {
        toast.error("Vehicle not found");
        setTimeout(() => navigate(-1), 2000);
      }
    } catch (error) {
      console.error("Error fetching vehicle:", error);
      toast.error("Failed to load vehicle details");
    } finally {
      setLoading(false);
    }
  };

  const handlePartChange = (index, field, value) => {
    const updatedParts = [...parts];
    updatedParts[index][field] = value;
    setParts(updatedParts);
  };

  const addPart = () => setParts([...parts, { name: "", code: "", quantity: "", price: "" }]);

  const removePart = (index) => setParts(parts.filter((_, i) => i !== index));

  const calculateTotal = () => {
    const totalPartsCost = parts.reduce(
      (sum, p) => sum + Number(p.quantity || 0) * Number(p.price || 0),
      0
    );
    return totalPartsCost + Number(labourCost || 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!vehicle) {
      toast.error("Vehicle information not loaded");
      return;
    }

    // Validation
    if (!labourCost || Number(labourCost) <= 0) {
      toast.error("Please enter labour cost");
      return;
    }

    if ((paymentMethod === "mpesa" || paymentMethod === "bank") && !paymentReference.trim()) {
      toast.error(`Please enter ${paymentMethod === "mpesa" ? "M-Pesa" : "Bank"} reference code`);
      return;
    }

    setSubmitting(true);

    try {
      // Prepare service data
      const serviceData = {
        vehicle_id: vehicle.id,
        description: serviceNotes || `Service for ${vehicle.registration_number}`,
        labor_cost: Number(labourCost),
        status: 'completed',
        payment_method: paymentMethod,
        payment_reference: paymentReference || null,
      };

      // Create the service record
      await api.services.create(serviceData);
      
      toast.success("Service completed successfully!");
      
      // Navigate back after a short delay
      setTimeout(() => {
        navigate(-1);
      }, 1500);
      
    } catch (error) {
      console.error("Error creating service:", error);
      toast.error(error.message || "Failed to save service record");
    } finally {
      setSubmitting(false);
    }
  };

  const paymentMethods = [
    { id: "mpesa", label: "M-Pesa", icon: "📱", requiresReference: true },
    { id: "bank", label: "Bank Transfer", icon: "🏦", requiresReference: true },
    { id: "credit", label: "Credit/Card", icon: "💳", requiresReference: false },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vehicle details...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Vehicle Not Found</h2>
          <p className="text-gray-600 mb-4">Could not find vehicle with registration: {decodeURIComponent(regNo)}</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(-1)}
            disabled={submitting}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            }
          >
            Back
          </Button>
        </div>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Vehicle Service</h1>
          <div className="flex items-center gap-2 text-lg text-gray-600">
            <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-semibold">{vehicle.registration_number}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-600">{vehicle.make_model}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Section - Parts & Labor */}
            <div className="lg:col-span-2 space-y-6">
              {/* Parts Section */}
              <Card>
                <Card.Header>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <h2 className="text-xl font-bold text-gray-800">Parts Used</h2>
                    </div>
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={addPart}
                      icon={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      }
                    >
                      Add Part
                    </Button>
                  </div>
                </Card.Header>
                <Card.Body className="p-0">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Part Name
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Code
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Qty
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Price (KSh)
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Total (KSh)
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {parts.map((part, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition">
                            <td className="px-6 py-4">
                              <input
                                type="text"
                                placeholder="Enter part name"
                                value={part.name}
                                onChange={(e) => handlePartChange(index, "name", e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="text"
                                placeholder="Code"
                                value={part.code}
                                onChange={(e) => handlePartChange(index, "code", e.target.value)}
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="number"
                                placeholder="0"
                                value={part.quantity}
                                onChange={(e) => handlePartChange(index, "quantity", e.target.value)}
                                className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                min="0"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="number"
                                placeholder="0.00"
                                value={part.price}
                                onChange={(e) => handlePartChange(index, "price", e.target.value)}
                                className="w-28 border border-gray-300 rounded-lg px-3 py-2 text-center focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                                min="0"
                                step="0.01"
                              />
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="font-semibold text-gray-900">
                                {(Number(part.quantity || 0) * Number(part.price || 0)).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <button
                                type="button"
                                onClick={() => removePart(index)}
                                className="text-red-600 hover:text-red-800 transition"
                                disabled={parts.length === 1}
                              >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card.Body>
              </Card>

              {/* Labor Cost */}
              <Card>
                <Card.Header>
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h2 className="text-xl font-bold text-gray-800">Labour Cost</h2>
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className="max-w-md">
                    <Input
                      type="number"
                      placeholder="Enter labour cost"
                      value={labourCost}
                      onChange={(e) => setLabourCost(e.target.value)}
                      min="0"
                      step="0.01"
                      leftIcon={
                        <span className="text-gray-500">KSh</span>
                      }
                    />
                  </div>
                </Card.Body>
              </Card>

              {/* Service Notes */}
              <Card>
                <Card.Header>
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h2 className="text-xl font-bold text-gray-800">Service Notes</h2>
                  </div>
                </Card.Header>
                <Card.Body>
                  <textarea
                    placeholder="Add any additional notes about the service..."
                    value={serviceNotes}
                    onChange={(e) => setServiceNotes(e.target.value)}
                    rows="4"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                  />
                </Card.Body>
              </Card>
            </div>

            {/* Sidebar - Payment & Summary */}
            <div className="lg:col-span-1 space-y-6">
              {/* Payment Method */}
              <Card>
                <Card.Header>
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <h2 className="text-xl font-bold text-gray-800">Payment Method</h2>
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className="space-y-3">
                    {paymentMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                          paymentMethod === method.id
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:border-orange-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-5 h-5 text-orange-500 focus:ring-orange-500"
                        />
                        <span className="text-2xl">{method.icon}</span>
                        <span className="font-medium text-gray-900">{method.label}</span>
                      </label>
                    ))}
                  </div>
                </Card.Body>
              </Card>

              {/* Payment Reference (M-Pesa or Bank) */}
              {(paymentMethod === "mpesa" || paymentMethod === "bank") && (
                <Card>
                  <Card.Header>
                    <div className="flex items-center gap-2">
                      <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                      </svg>
                      <h2 className="text-xl font-bold text-gray-800">
                        {paymentMethod === "mpesa" ? "M-Pesa Code" : "Bank Reference"}
                      </h2>
                    </div>
                  </Card.Header>
                  <Card.Body>
                    <Input
                      type="text"
                      placeholder={paymentMethod === "mpesa" ? "Enter M-Pesa transaction code" : "Enter bank reference number"}
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      required
                      leftIcon={
                        <span className="text-gray-500">#</span>
                      }
                    />
                  </Card.Body>
                </Card>
              )}

              {/* Cost Summary */}
              <Card>
                <Card.Header>
                  <div className="flex items-center gap-2">
                    <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <h2 className="text-xl font-bold text-gray-800">Summary</h2>
                  </div>
                </Card.Header>
                <Card.Body>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-gray-600">Parts Total:</span>
                      <span className="font-semibold text-gray-900">
                        KSh {parts.reduce((sum, p) => sum + Number(p.quantity || 0) * Number(p.price || 0), 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                      <span className="text-gray-600">Labour Cost:</span>
                      <span className="font-semibold text-gray-900">
                        KSh {Number(labourCost || 0).toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-3">
                      <span className="text-lg font-bold text-gray-900">Total Amount:</span>
                      <span className="text-2xl font-bold text-orange-600">
                        KSh {calculateTotal().toLocaleString('en-KE', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Submit Button */}
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                loading={submitting}
                disabled={submitting}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                }
              >
                {submitting ? "Saving..." : "Complete Service"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import api from "../Services/api"; // Replace with your actual API service

const Purchases = () => {
  const [parts, setParts] = useState([]);
  const [formData, setFormData] = useState({
    partName: "",
    partCode: "",
    description: "",
    buyingPrice: "",
    sellingPriceMin: "",
    sellingPriceMax: "",
    stockQuantity: 0,
    reorderLevel: 10,
    location: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch current parts from backend
  useEffect(() => {
    const fetchParts = async () => {
      try {
        const res = await api.parts.getAll(); // GET /parts
        setParts(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch parts");
      }
    };
    fetchParts();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload = {
        part_name: formData.partName,
        part_code: formData.partCode,
        description: formData.description,
        buying_price: parseFloat(formData.buyingPrice),
        selling_price_min: parseFloat(formData.sellingPriceMin),
        selling_price_max: parseFloat(formData.sellingPriceMax),
        stock_quantity: parseInt(formData.stockQuantity, 10),
        reorder_level: parseInt(formData.reorderLevel, 10),
        location: formData.location,
      };

      const res = await api.parts.create(payload); // POST /parts
      setParts((prev) => [...prev, res.data]);
      setFormData({
        partName: "",
        partCode: "",
        description: "",
        buyingPrice: "",
        sellingPriceMin: "",
        sellingPriceMax: "",
        stockQuantity: 0,
        reorderLevel: 10,
        location: "",
      });
    } catch (err) {
      console.error(err);
      setError("Failed to add part");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Purchases - Spare Parts</h1>

      {/* Add new purchase form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md mb-8"
      >
        <h2 className="text-xl font-semibold mb-4">Add New Part</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <input
            type="text"
            name="partName"
            placeholder="Part Name"
            value={formData.partName}
            onChange={handleChange}
            className="p-3 border rounded w-full focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="text"
            name="partCode"
            placeholder="Part Code"
            value={formData.partCode}
            onChange={handleChange}
            className="p-3 border rounded w-full focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="text"
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="p-3 border rounded w-full focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="number"
            name="buyingPrice"
            placeholder="Buying Price"
            value={formData.buyingPrice}
            onChange={handleChange}
            className="p-3 border rounded w-full focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="number"
            name="sellingPriceMin"
            placeholder="Selling Price Min"
            value={formData.sellingPriceMin}
            onChange={handleChange}
            className="p-3 border rounded w-full focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="number"
            name="sellingPriceMax"
            placeholder="Selling Price Max"
            value={formData.sellingPriceMax}
            onChange={handleChange}
            className="p-3 border rounded w-full focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="number"
            name="stockQuantity"
            placeholder="Stock Quantity"
            value={formData.stockQuantity}
            onChange={handleChange}
            className="p-3 border rounded w-full focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="number"
            name="reorderLevel"
            placeholder="Reorder Level"
            value={formData.reorderLevel}
            onChange={handleChange}
            className="p-3 border rounded w-full focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            className="p-3 border rounded w-full focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="mt-6 w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
        >
          {loading ? "Adding..." : "Add Part"}
        </button>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </form>

      {/* Stock table */}
      <h2 className="text-2xl font-semibold mb-4">Current Stock</h2>
      {parts.length === 0 ? (
        <p className="text-gray-600">No stock available</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-3 text-left">Part Name</th>
                <th className="border p-3 text-left">Part Code</th>
                <th className="border p-3 text-left">Description</th>
                <th className="border p-3 text-left">Buying Price</th>
                <th className="border p-3 text-left">Selling Price</th>
                <th className="border p-3 text-left">Stock Qty</th>
                <th className="border p-3 text-left">Reorder Level</th>
                <th className="border p-3 text-left">Location</th>
              </tr>
            </thead>
            <tbody>
              {parts.map((part) => (
                <tr key={part.id} className="hover:bg-gray-50 transition-colors">
                  <td className="border p-3">{part.part_name}</td>
                  <td className="border p-3">{part.part_code}</td>
                  <td className="border p-3">{part.description}</td>
                  <td className="border p-3">{part.buying_price}</td>
                  <td className="border p-3">
                    {part.selling_price_min} - {part.selling_price_max}
                  </td>
                  <td className="border p-3">{part.stock_quantity}</td>
                  <td className="border p-3">{part.reorder_level}</td>
                  <td className="border p-3">{part.location}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Purchases;

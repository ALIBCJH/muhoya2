const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Get authentication token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('token');
};

/**
 * Get default headers with authentication
 */
const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Generic fetch wrapper with error handling
 */
const fetchAPI = async (endpoint, options = {}) => {
  const config = {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

/**
 * API Methods
 */
const api = {
  // Authentication
  auth: {
    login: (credentials) => 
      fetchAPI('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    signup: (userData) => 
      fetchAPI('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    getMe: () => fetchAPI('/auth/me'),
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },

  // Clients
  clients: {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return fetchAPI(`/clients${queryString ? `?${queryString}` : ''}`);
    },
    getById: (id) => fetchAPI(`/clients/${id}`),
    create: (clientData) => 
      fetchAPI('/clients', {
        method: 'POST',
        body: JSON.stringify(clientData),
      }),
    createWithVehicles: (data) =>
      fetchAPI('/clients/with-vehicles', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, clientData) => 
      fetchAPI(`/clients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(clientData),
      }),
    delete: (id) => 
      fetchAPI(`/clients/${id}`, {
        method: 'DELETE',
      }),
    getVehicles: (id) => fetchAPI(`/clients/${id}/vehicles`),
    getServices: (id) => fetchAPI(`/clients/${id}/services`),
  },

  // Vehicles
  vehicles: {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return fetchAPI(`/vehicles${queryString ? `?${queryString}` : ''}`);
    },
    getById: (id) => fetchAPI(`/vehicles/${id}`),
    getByRegNo: (regNo) => fetchAPI(`/vehicles/regno/${regNo}`),
    create: (vehicleData) => 
      fetchAPI('/vehicles', {
        method: 'POST',
        body: JSON.stringify(vehicleData),
      }),
    update: (id, vehicleData) => 
      fetchAPI(`/vehicles/${id}`, {
        method: 'PUT',
        body: JSON.stringify(vehicleData),
      }),
    delete: (id) => 
      fetchAPI(`/vehicles/${id}`, {
        method: 'DELETE',
      }),
  },

  // Organizations
  organizations: {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return fetchAPI(`/organizations${queryString ? `?${queryString}` : ''}`);
    },
    getById: (id) => fetchAPI(`/organizations/${id}`),
    create: (orgData) => 
      fetchAPI('/organizations', {
        method: 'POST',
        body: JSON.stringify(orgData),
      }),
    createWithVehicles: (data) =>
      fetchAPI('/organizations/with-vehicles', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id, orgData) => 
      fetchAPI(`/organizations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(orgData),
      }),
    delete: (id) => 
      fetchAPI(`/organizations/${id}`, {
        method: 'DELETE',
      }),
    getVehicles: (id) => fetchAPI(`/organizations/${id}/vehicles`),
  },

  // Services
  services: {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return fetchAPI(`/services${queryString ? `?${queryString}` : ''}`);
    },
    getById: (id) => fetchAPI(`/services/${id}`),
    create: (serviceData) => 
      fetchAPI('/services', {
        method: 'POST',
        body: JSON.stringify(serviceData),
      }),
    update: (id, serviceData) => 
      fetchAPI(`/services/${id}`, {
        method: 'PUT',
        body: JSON.stringify(serviceData),
      }),
    delete: (id) => 
      fetchAPI(`/services/${id}`, {
        method: 'DELETE',
      }),
    addParts: (id, parts) =>
      fetchAPI(`/services/${id}/parts`, {
        method: 'POST',
        body: JSON.stringify({ parts }),
      }),
  },

  // Parts
  parts: {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return fetchAPI(`/parts${queryString ? `?${queryString}` : ''}`);
    },
    getById: (id) => fetchAPI(`/parts/${id}`),
    create: (partData) => 
      fetchAPI('/parts', {
        method: 'POST',
        body: JSON.stringify(partData),
      }),
    update: (id, partData) => 
      fetchAPI(`/parts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(partData),
      }),
    delete: (id) => 
      fetchAPI(`/parts/${id}`, {
        method: 'DELETE',
      }),
    updateStock: (id, quantity) =>
      fetchAPI(`/parts/${id}/stock`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity }),
      }),
  },

  // Invoices
  invoices: {
    getAll: (params = {}) => {
      const queryString = new URLSearchParams(params).toString();
      return fetchAPI(`/invoices${queryString ? `?${queryString}` : ''}`);
    },
    getById: (id) => fetchAPI(`/invoices/${id}`),
    create: (invoiceData) => 
      fetchAPI('/invoices', {
        method: 'POST',
        body: JSON.stringify(invoiceData),
      }),
    update: (id, invoiceData) => 
      fetchAPI(`/invoices/${id}`, {
        method: 'PUT',
        body: JSON.stringify(invoiceData),
      }),
    delete: (id) => 
      fetchAPI(`/invoices/${id}`, {
        method: 'DELETE',
      }),
    updateStatus: (id, status) =>
      fetchAPI(`/invoices/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
  },
};

export default api;

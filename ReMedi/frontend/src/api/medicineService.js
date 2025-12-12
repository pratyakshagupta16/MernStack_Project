import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// ALWAYS attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Medicine API Endpoints

// GET all medicines for logged-in user
export const getMedicines = () => API.get("/medicines");

// ADD new medicine
export const addMedicine = (data) => API.post("/medicines", data);

// UPDATE existing medicine
export const updateMedicine = (id, data) =>
  API.put(`/medicines/${id}`, data);

// DELETE medicine
export const deleteMedicine = (id) =>
  API.delete(`/medicines/${id}`);

// MARK dose as taken
export const markTaken = (id, scheduleId) =>
  API.post(`/medicines/${id}/mark-taken`, { scheduleId });

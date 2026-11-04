// src/api/techApi.js
import axios from "axios";

// Base URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_URL || window.location.origin;

// Optional: Create an axios instance with baseURL (recommended)
const api = axios.create({
  baseURL: API_BASE_URL,
});

export const createTechApi = (data) => api.post("/portfolio/create", data);

export const getCategoriesApi = () => api.get("/category/portfolio"); // Adjust endpoint if needed

export const getTechApi = () => api.get("/portfolio");

export const updateTechApi = (id, data) =>
  api.put(`/portfolio/update/${id}`, data);

export const deleteTechApi = (id) => api.delete(`/portfolio/delete/${id}`);

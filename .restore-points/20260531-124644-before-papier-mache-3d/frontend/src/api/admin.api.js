import { api } from "./client.js";

export const getDashboard = () => api.get("/dashboard");

export const getResource = (resource) => api.get(`/${resource}`);
export const createResource = (resource, body) => api.post(`/${resource}`, body);
export const updateResource = (resource, id, body) =>
  api.put(`/${resource}/${id}`, body);
export const deleteResource = (resource, id) => api.delete(`/${resource}/${id}`);

import { api } from "./client.js";

export const loginAdmin = (credentials) => {
  return api.post("/auth/login", credentials);
};

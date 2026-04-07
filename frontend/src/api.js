import axios from "axios";

export const authApi = axios.create({ baseURL: "http://localhost:4001/api" });
export const garageApi = axios.create({ baseURL: "http://localhost:4002/api" });
export const userApi = axios.create({ baseURL: "http://localhost:4003/api" });

export function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

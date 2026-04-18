import axios from "axios";

export const authApi = axios.create({ baseURL: "https://garage-app-8r7w.onrender.com/api" });
export const garageApi = axios.create({ baseURL: "https://garage-app-8r7w.onrender.com/api" });
export const userApi = axios.create({ baseURL: "https://garage-app-8r7w.onrender.com/api" });

export function authHeader() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

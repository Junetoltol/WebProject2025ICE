// src/api/api.js
import axios from "axios";
import { getAccessToken } from "./auth";
import { API_BASE_URL } from "./config";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(config => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }
  return config;
});

export default api;

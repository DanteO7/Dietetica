import axios from "axios";

const API_URL = import.meta.env.DEV ? import.meta.env.VITE_API_URL : "/api";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Cache-Control": "no-cache",
  },
});

api.interceptors.request.use((config) => {
  const method = config.method?.toLowerCase();

  const methodsNeedHeader = ["post", "put", "patch", "delete"];

  if (methodsNeedHeader.includes(method)) {
    config.headers["X-Requested-With"] = "XMLHttpRequest";
  }

  return config;
});

export const request = async (
  method,
  url,
  data = null,
  params = null,
  headers = {},
) => {
  const res = await api({
    method,
    url,
    data,
    params,
    headers,
  });

  return res.data;
};

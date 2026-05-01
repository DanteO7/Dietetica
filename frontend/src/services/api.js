import axios from "axios";

const { VITE_API_URL } = import.meta.env;

const api = axios.create({
  baseURL: VITE_API_URL,
  withCredentials: true,
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

  console.log(res.data);

  return res.data;
};

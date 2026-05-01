import { request } from "./api";

export const getProducts = (params = null) =>
  request("get", "/products", null, params);

export const getProductById = (id) => request("get", `/products/${id}`);

export const getProductByCode = (value) =>
  request("get", `/products/code/${value}`);

export const createProduct = (data) => request("post", "/products", data);

export const updateProduct = ({ id, data }) =>
  request("put", `/products/${id}`, data);

export const deleteProduct = (id) => request("delete", `/products/${id}`);

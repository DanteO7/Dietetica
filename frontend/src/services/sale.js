import { request } from "./api";

export const getSales = (params = null) =>
  request("get", "/sales", null, params);

export const getSaleById = (id) => request("get", `/sales/${id}`);

export const createSale = (data) => request("post", "/sales", data);

export const changeSaleMethod = (id, methodId) =>
  request("patch", `/sales/${id}/${methodId}`);

export const getSalesCount = (data) =>
  request("get", "/sales/count", null, data);

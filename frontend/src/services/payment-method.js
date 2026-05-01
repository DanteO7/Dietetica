import { request } from "./api";

export const getPaymentMethods = () => request("get", "/payment-methods");

export const updatePaymentMethod = ({ id, data }) =>
  request("put", `/payment-methods/${id}`, data);

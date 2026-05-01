import { request } from "./api";

export const createCode = ({ productId, data }) =>
  request("post", `/codes/${productId}`, data);

export const updateCode = ({ id, data }) =>
  request("put", `/codes/${id}`, data);

export const deleteCode = (id) => request("delete", `/codes/${id}`);

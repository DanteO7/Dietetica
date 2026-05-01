import { request } from "./api";

export const signIn = (data) => request("post", "/auth/login", data);

export const logout = () => request("post", "/auth/logout");

export const health = () => request("get", "/auth/health");

export const me = () => request("get", "/auth/me");

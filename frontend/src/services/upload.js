import { request } from "./api";

export const uploadImage = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return request("post", "/upload/image", formData);
};

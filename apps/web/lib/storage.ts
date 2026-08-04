import { api } from "./api";

export async function uploadFile(file: File) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("folder", "chat");

  return api("/storage/upload", {
    method: "POST",
    body: formData,
  });
}
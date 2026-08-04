import { api } from "./api";

export async function uploadFile(file: File) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("folder", "chat");

  const { data } = await api.post(
    "/storage/upload",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    },
  );

  return data;
}
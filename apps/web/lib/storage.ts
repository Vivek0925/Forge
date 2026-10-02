import { api } from "./api";

export async function uploadFile(file: File, workspaceSlug: string) {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("folder", "chat");
  formData.append("workspaceSlug", workspaceSlug);

  return api("/storage/upload", {
    method: "POST",
    body: formData,
  });
}

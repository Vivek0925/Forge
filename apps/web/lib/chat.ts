const API_URL = process.env.NEXT_PUBLIC_API_URL!;

export async function getWorkspaceMessages(slug: string) {
  const res = await fetch(
    `${API_URL}/workspaces/${slug}/messages`,
    {
      credentials: "include",
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch messages");
  }

  return res.json();
} 
const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:4000";

export async function inviteMember(
  workspaceSlug: string,
  email: string,
  role: string,
) {
  const res = await fetch(
    `${API_URL}/workspaces/${workspaceSlug}/invitations`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type":
          "application/json",
      },
      body: JSON.stringify({
        email,
        role,
      }),
    },
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      data.message ||
        "Failed to send invitation.",
    );
  }

  return data;
}
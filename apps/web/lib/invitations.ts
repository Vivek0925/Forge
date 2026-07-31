const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

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
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        role,
      }),
    },
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message);
  }

  return data;
}

export async function getInvitations() {
  const res = await fetch(
    `${API_URL}/invitations`,
    {
      credentials: "include",
    },
  );

  if (!res.ok) {
    throw new Error("Failed to load invitations");
  }

  return res.json();
}

export async function acceptInvitation(
  id: string,
) {
  const res = await fetch(
    `${API_URL}/invitations/${id}/accept`,
    {
      method: "POST",
      credentials: "include",
    },
  );

  if (!res.ok) {
    throw new Error("Failed to accept invitation");
  }

  return res.json();
}
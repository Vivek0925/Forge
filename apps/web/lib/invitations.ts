const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function inviteMember(
  slug: string,
  email: string,
  role = "MEMBER",
) {
  const res = await fetch(
    `${API_URL}/workspaces/${slug}/invitations`,
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

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message);
  }

  return res.json();
}
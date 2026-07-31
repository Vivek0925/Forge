export interface Invitation {
  id: string;

  role: string;

  workspace: {
    id: string;
    name: string;
    slug: string;
    icon?: string | null;
  };

  invitedBy: {
    id: string;
    name: string;
    email: string;
  };
}
export interface User {
  id: string;
  name: string;
  avatar?: string | null;
}

export interface Message {
  id: string;
  content: string;
  sender: User;

  edited: boolean;

  createdAt: string;
  updatedAt: string;
}
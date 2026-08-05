export interface User {
  id: string;
  name: string;
  avatar?: string | null;
}

export interface Attachment {
  id?: string;

  fileName: string;
  key: string;
  url: string;

  mimeType: string;
  size: number;
}

export interface ReplyMessage {
  id: string;

  content: string;

  sender: {
    id: string;
    name: string;
  };
}

export interface Message {
  id: string;

  content: string;

  sender: User;

  attachments: Attachment[];

  replyTo?: ReplyMessage | null;

  edited: boolean;

  createdAt: string;
  updatedAt: string;
}
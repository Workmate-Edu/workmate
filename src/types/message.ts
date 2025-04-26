export interface Message {
  _id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    role: 'teacher' | 'student';
  };
  conversationId: string;
  createdAt: string;
  updatedAt: string;
  attachments?: {
    url: string;
    type: string;
    name: string;
  }[];
}

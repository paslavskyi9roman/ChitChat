export interface ChatMessage {
  text: string;
  username: string;
  timestamp: Date;
}

export interface User {
  id?: string;
  username: string;
  isActive?: boolean;
}

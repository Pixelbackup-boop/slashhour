export interface MessageResponseDto {
  id: string;
  conversationId: string;
  senderId: string;
  messageText: string;
  messageType: string;
  isRead: boolean;
  readAt?: Date;
  createdAt: Date;
  sender: {
    id: string;
    username: string;
    name?: string;
    avatarUrl?: string;
  };
}

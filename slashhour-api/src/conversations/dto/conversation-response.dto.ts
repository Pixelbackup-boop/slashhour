export interface ConversationResponseDto {
  id: string;
  businessId: string;
  customerId: string;
  lastMessageAt?: Date;
  lastMessageText?: string;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
  business: {
    id: string;
    businessName: string;
    logoUrl?: string;
    category?: string;
  };
  customer: {
    id: string;
    username: string;
    name?: string;
    avatarUrl?: string;
  };
}

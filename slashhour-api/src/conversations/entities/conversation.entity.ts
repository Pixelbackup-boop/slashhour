/**
 * Conversation entity interface
 * Now using Prisma for database operations - this is kept as a TypeScript type
 */
export interface Conversation {
  id: string;
  business_id: string;
  customer_id: string;
  last_message_at?: Date;
  last_message_text?: string;
  unread_count: number;
  created_at: Date;
  updated_at: Date;
}

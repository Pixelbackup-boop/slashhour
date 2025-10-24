/**
 * Message entity interface
 * Now using Prisma for database operations - this is kept as a TypeScript type
 */
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_text: string;
  message_type: string;
  is_read: boolean;
  read_at?: Date;
  created_at: Date;
}

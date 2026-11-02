import { Conversation } from '@/models/message';

// Call after connecting to the database. Invalid IDs fail closed without a query.
export async function isConversationParticipant(conversationId: string, userId: string): Promise<boolean> {
  if (!/^[a-f\d]{24}$/i.test(conversationId) || !/^[a-f\d]{24}$/i.test(userId)) return false;
  return Boolean(await Conversation.exists({
    _id: conversationId,
    'participants.userId': userId,
  }));
}

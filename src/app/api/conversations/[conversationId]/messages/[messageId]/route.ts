import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { NewMessage, Conversation } from "@/models/message";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";
import { encrypt, decrypt } from "@/lib/encryption";
import { v2 as cloudinary } from 'cloudinary';
import mongoose from "mongoose";
import { isConversationParticipant } from '@/lib/conversation-access';

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Edit message
export async function PATCH(
  req: Request,
  { params }: { params: { conversationId: string; messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 401 });

    const { content } = await req.json();
    const encryptedContent = encrypt(content);

    await connectDB();

    if (!await isConversationParticipant(params.conversationId, session.user.id)) {
      return new NextResponse("Conversation not found", { status: 404 });
    }

    // Get the original message
    const originalMessage = await NewMessage.findOne({
      _id: params.messageId,
      conversationId: params.conversationId,
      senderId: session.user.id,
      isDeleted: { $ne: true },
    });
    if (!originalMessage) {
      return new NextResponse("Message not found", { status: 404 });
    }

    // Store original content in edit history
    const originalContent = originalMessage.content;
    
    const message = await NewMessage.findOneAndUpdate(
      { 
        _id: params.messageId,
        conversationId: params.conversationId,
        isDeleted: { $ne: true },
        senderId: session.user.id 
      },
      { 
        $set: {
          content: encryptedContent,
          isEdited: true
        },
        $push: { 
          editHistory: { 
            content: originalContent,
            editedAt: new Date() 
          } 
        }
      },
      { new: true }
    );

    if (!message) {
      return new NextResponse("Message not found", { status: 404 });
    }

    // Return decrypted message
    const decryptedMessage = {
      ...message.toJSON(),
      content: decrypt(message.content)
    };

    // Update last message if this was the last message
    await updateLastMessage(params.conversationId);

    // After updating last message
    const updatedConversation = await Conversation.findById(params.conversationId).lean();
    
    // Notify all participants about conversation update
    for (const participant of updatedConversation.participants) {
      await pusherServer.trigger(
        `private-user-${participant.userId}`,
        'conversation-update',
        { conversation: updatedConversation }
      );
    }

    return NextResponse.json(decryptedMessage);
  } catch (error) {
    return new NextResponse("Internal error", { status: 500 });
  }
}

// Delete message
export async function DELETE(
  req: Request,
  { params }: { params: { conversationId: string; messageId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectDB();

    // Validate ObjectId
    if (!await isConversationParticipant(params.conversationId, session.user.id)) {
      return new NextResponse("Conversation not found", { status: 404 });
    }

    if (!mongoose.Types.ObjectId.isValid(params.messageId)) {
      return new NextResponse("Invalid message ID", { status: 400 });
    }

    const message = await NewMessage.findOne({
      _id: new mongoose.Types.ObjectId(params.messageId),
      conversationId: params.conversationId,
      senderId: session.user.id,
    });

    if (!message) {
      return new NextResponse("Message not found", { status: 404 });
    }

    await NewMessage.findByIdAndUpdate(message._id, {
      isDeleted: true,
      deletedAt: new Date(),
    });

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error("Error deleting message:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

async function updateLastMessage(conversationId: string) {
  try {
    const lastMessage = await NewMessage.findOne({ 
      conversationId,
      isDeleted: { $ne: true }
    })
    .sort({ createdAt: -1 })
    .lean();

    if (lastMessage) {
      // Decrypt content for last message preview
      const displayContent = lastMessage.content.includes(':') 
        ? decrypt(lastMessage.content)
        : lastMessage.content;

      await Conversation.findByIdAndUpdate(conversationId, {
        lastMessage: {
          content: displayContent,
          senderId: lastMessage.senderId,
          createdAt: lastMessage.createdAt
        }
      });
    }
  } catch (error) {
    console.error('Error updating last message:', error);
  }
}

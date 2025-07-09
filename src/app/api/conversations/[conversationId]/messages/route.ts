import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Message, Conversation, NewMessage } from "@/models/message";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import mongoose from "mongoose";
import { pusherServer } from "@/lib/pusher";
import { encrypt, decrypt } from '@/lib/encryption';

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectDB();

    // First verify user is part of conversation
    const conversation = await Conversation.findOne({
      _id: params.conversationId,
      'participants': {
        $elemMatch: { 
          userId: session.user.id 
        }
      }
    });

    if (!conversation) {
      return new NextResponse("Conversation not found", { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = 20;

    const messages = await NewMessage.find({
      conversationId: params.conversationId,
      isDeleted: { $ne: true } // Don't fetch deleted messages
    })
    .sort({ createdAt: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean();

    // Handle decryption with better error handling
    const decryptedMessages = messages.map(msg => {
      try {
        return {
          ...msg,
          content: msg.content ? decrypt(msg.content) : msg.content
        };
      } catch (error) {
        console.error(`Failed to decrypt message ${msg._id}:`, error);
        return msg;
      }
    });

    return NextResponse.json(decryptedMessages.reverse());
  } catch (error) {
    console.error("Error fetching messages:", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal error", 
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { content, attachments, tempId } = await req.json();

    // Validate attachments if present
    if (attachments && Array.isArray(attachments)) {
      for (const attachment of attachments) {
        if (!attachment.url || !attachment.type || !attachment.name) {
          return new NextResponse("Invalid attachment data", { status: 400 });
        }
        // Add fileType based on MIME type
        attachment.fileType = attachment.type.startsWith('image/') ? 'image' : 'document';
      }
    }

    await connectDB();

    // Store original content for last message
    const originalContent = content;
    const encryptedContent = encrypt(content);

    const messageData = {
      _id: tempId ? new mongoose.Types.ObjectId(tempId) : new mongoose.Types.ObjectId(),
      conversationId: params.conversationId,
      senderId: session.user.id,
      senderRole: session.user.role,
      content: encryptedContent,
      attachments: attachments || [],
      readBy: [{ userId: session.user.id, readAt: new Date() }]
    };

    const message = await NewMessage.create(messageData);

    // Update conversation with original unencrypted content
    const updatedConversation = await Conversation.findByIdAndUpdate(
      params.conversationId,
      {
        lastMessage: {
          content: originalContent, // Use original unencrypted content
          senderId: session.user.id,
          createdAt: new Date()
        },
        $inc: { unreadCount: 1 }
      },
      { new: true }
    ).lean();

    // Return decrypted message in response
    const responseMessage = {
      ...message.toJSON(),
      content: originalContent
    };

    // Socket.IO will handle real-time delivery
    // We just need to return the message
    return NextResponse.json(responseMessage);
  } catch (error) {
    console.error("Error creating message:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { NewMessage, Conversation } from "@/models/message";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";
import { encrypt, decrypt } from "@/lib/encryption";
import { v2 as cloudinary } from 'cloudinary';

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

    // Get the original message
    const originalMessage = await NewMessage.findById(params.messageId);
    if (!originalMessage) {
      return new NextResponse("Message not found", { status: 404 });
    }

    // Store original content in edit history
    const originalContent = originalMessage.content;
    
    const message = await NewMessage.findOneAndUpdate(
      { 
        _id: params.messageId,
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

    // Find message first to get attachments
    const message = await NewMessage.findOne({ 
      _id: params.messageId,
      senderId: session.user.id 
    });

    if (!message) {
      return new NextResponse("Message not found", { status: 404 });
    }

    // Delete attachments from Cloudinary if any
    if (message.attachments?.length) {
      for (const attachment of message.attachments) {
        if (attachment.url) {
          try {
            const publicId = attachment.url.split('/').slice(-1)[0].split('.')[0];
            await cloudinary.uploader.destroy(`workmate/messages/${publicId}`);
          } catch (error) {
            console.error('Failed to delete file from Cloudinary:', error);
          }
        }
      }
    }

    // Delete the message
    await NewMessage.findByIdAndDelete(params.messageId);

    // Find new last message
    const lastMessage = await NewMessage.findOne({
      conversationId: params.conversationId
    })
    .sort({ createdAt: -1 })
    .lean();

    // Update conversation
    const conversation = await Conversation.findByIdAndUpdate(
      params.conversationId,
      {
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          senderId: lastMessage.senderId,
          createdAt: lastMessage.createdAt
        } : null
      },
      { new: true }
    ).populate('participants.userId');

    if (conversation) {
      // Notify participants with proper channel names
      for (const participant of conversation.participants) {
        if (participant.userId && participant.userId._id.toString() !== session.user.id) {
          const channelName = `private-user-${participant.userId._id.toString()}`;
          try {
            await pusherServer.trigger(
              channelName,
              'message-deleted',
              {
                messageId: params.messageId,
                conversationId: params.conversationId
              }
            );
          } catch (error) {
            console.error(`Failed to notify participant ${participant.userId._id}:`, error);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting message:", error);
    return new NextResponse(
      error instanceof Error ? error.message : "Internal error",
      { status: 500 }
    );
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

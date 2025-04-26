"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Message } from "@/types/message";
import { MessageAttachment } from "./message-attachment";
import { MessageActions } from "../message-actions";
import { Button } from "@/components/ui/button";
import { X, Check } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSocketContext } from "@/contexts/socket-context";

interface MessageBubbleProps {
  message: {
    _id: string;
    content: string;
    senderId: string;
    conversationId: string;
    readBy?: string[];
    createdAt: string;
  };
  isCurrentUser: boolean;
  onEditMessage: (messageId: string, newContent: string) => void;
  onDeleteMessage: (messageId: string) => Promise<void>;
}

export function MessageBubble({ 
  message, 
  isCurrentUser,
  onEditMessage,
  onDeleteMessage 
}: MessageBubbleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const hasAttachments = message.attachments && message.attachments.length > 0;
  const isTextMessage = !hasAttachments || message.content.trim().length > 0;
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { socket } = useSocketContext();

  useEffect(() => {
    if (!socket || isCurrentUser || message.readBy?.includes(socket.auth.userId)) return;

    // Mark message as read when it's rendered
    socket.emit('mark_message_read', {
      messageId: message._id,
      conversationId: message.conversationId
    });
  }, [message, isCurrentUser, socket]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditContent(message.content);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };

  const handleSaveEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      onEditMessage(message._id, editContent);
    }
    setIsEditing(false);
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDeleteMessage(message._id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error('Failed to delete message:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className={cn(
        "group flex items-start gap-2 w-full mb-4",
        isCurrentUser ? "flex-row-reverse" : "flex-row"
      )}>
        <div className={cn(
          "relative inline-block max-w-[75%] rounded-lg p-3",
          isCurrentUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted"
        )}>
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <input
                type="text"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 rounded border bg-background text-foreground"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Escape') handleCancelEdit();
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSaveEdit();
                  }
                }}
              />
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancelEdit}
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={!editContent.trim() || editContent === message.content}
                >
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <>
              {message.content && (
                <p className="text-sm whitespace-pre-wrap pr-6">{message.content}</p>
              )}
              
              {message.attachments?.map((attachment, index) => (
                <MessageAttachment key={index} attachment={attachment} />
              ))}

              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs opacity-70">
                  {new Date(message.createdAt).toLocaleTimeString()}
                </span>
                {isCurrentUser && (
                  <div className="flex">
                    <Check 
                      className={cn(
                        "h-3 w-3",
                        message.readBy?.length ? "text-blue-500" : "opacity-70"
                      )} 
                    />
                    {message.readBy?.length > 0 && (
                      <Check className="h-3 w-3 -ml-1 text-blue-500" />
                    )}
                  </div>
                )}
              </div>

              <MessageActions
                messageId={message._id}
                conversationId={message.conversationId}
                isSender={isCurrentUser}
                hasAttachments={hasAttachments}
                isTextMessage={isTextMessage}
                onEdit={handleStartEdit}
                onDelete={() => setShowDeleteDialog(true)}
              />
            </>
          )}
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

import { Server as HttpServer } from 'http';
import { NextApiResponse } from 'next';
import { Server as IOServer } from 'socket.io';
import { Socket } from 'socket.io-client';

export interface NextApiResponseWithSocket extends NextApiResponse {
  socket: any & {
    server: HttpServer & {
      io: IOServer;
    };
  };
}

export interface ServerToClientEvents {
  receive_message: (message: any) => void;
  conversation_updated: (data: any) => void;
  typing_status: (data: { userId: string; userName: string; conversationId: string }) => void;
  message_read: (data: { messageId: string; conversationId: string; readBy: string }) => void;
}

export interface ClientToServerEvents {
  join_conversation: (conversationId: string) => void;
  send_message: (data: { conversationId: string; message: any }) => void;
  start_typing: (data: { conversationId: string }) => void;
  stop_typing: (data: { conversationId: string }) => void;
  mark_message_read: (data: { messageId: string; conversationId: string }) => void;
}

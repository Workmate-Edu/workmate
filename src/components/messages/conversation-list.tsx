"use client";

import { useSession } from "next-auth/react";
import { StudentConversationList } from "./student/StudentConversationList";
import { TeacherConversationList } from "./teacher/TeacherConversationList";
import { ParentConversationList } from "./parent/ParentConversationList";

interface ConversationListProps {
  onSelectConversation: (conversation: any) => void;
  activeConversation: any;
  searchQuery?: string;
}

export function ConversationList(props: ConversationListProps) {
  const { data: session } = useSession();

  if (!session?.user?.role) return null;

  switch (session.user.role) {
    case 'student':
      return <StudentConversationList {...props} />;
    case 'teacher':
      return <TeacherConversationList {...props} />;
    case 'parent':
      return <ParentConversationList {...props} />;
    default:
      return null;
  }
}

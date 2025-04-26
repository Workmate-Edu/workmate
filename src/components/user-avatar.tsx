"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "next-auth";
import { Icons } from "@/components/icons";

interface UserAvatarProps {
  user: Pick<User, "name" | "image">;
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  return (
    <Avatar className={className}>
      {user.image ? (
        <AvatarImage src={user.image} alt={user.name || "User"} />
      ) : (
        <AvatarFallback>
          <span className="sr-only">{user.name}</span>
          <Icons.user className="h-4 w-4" />
        </AvatarFallback>
      )}
    </Avatar>
  );
}

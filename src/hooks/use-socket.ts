import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { initSocket, getSocket } from '@/lib/socket';

export const useSocket = () => {
  const { data: session } = useSession();
  const [ready, setReady] = useState(false);
  const socketRef = useRef(getSocket());

  useEffect(() => {
    if (!session?.user || socketRef.current) return;

    socketRef.current = initSocket({ userId: session.user.id });
    setReady(true);

    return () => {
      socketRef.current?.disconnect();
    };
  }, [session]);

  return socketRef.current;
};

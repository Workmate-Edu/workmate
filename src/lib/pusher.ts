import PusherServer from "pusher";
import PusherClient from "pusher-js";

export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export const pusherClient = new PusherClient(
  process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    authEndpoint: '/api/pusher/auth',
    enabledTransports: ['ws', 'wss'],
    forceTLS: true,
    retryWhenOffline: true,
    timeout: 10000
  }
);

// Add connection monitoring
pusherClient.connection.bind('state_change', ({ current }) => {
  console.log('Pusher connection state:', current);
});

pusherClient.connection.bind('error', (err: any) => {
  console.error('Pusher connection error:', err);
});

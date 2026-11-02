# Real-time messaging access

Socket.IO connections now use a five-minute signed credential from authenticated `POST /api/realtime/token`. The credential has a dedicated audience/issuer and uses `NEXTAUTH_SECRET`; browser-supplied user IDs and roles are ignored. Both the standalone process and `/api/socket` apply the same server policy. Connection-state recovery is disabled so it cannot restore rooms without authentication.

Conversation joins and message relays require current membership. Relays accept only a saved message ID and conversation ID, load a non-deleted message owned by the authenticated sender, and deliver database content. Recipient membership is checked before delivery. Browser message views now save through the authorized HTTP API before requesting a relay. Limits are 50 join/send attempts per minute per socket, five conversation rooms, and a 100 KB socket payload limit.

Expired connections disconnect. Clients fetch fresh credentials and rejoin active rooms, with membership checked again. These short-lived bearer credentials are kept in socket memory, not local storage. Existing credentials remain valid until expiry; this does not implement immediate central session revocation or distributed abuse limiting.

Pusher authorizes only the authenticated user's `private-user-<id>` channel and participant-owned `private-chat-<conversationId>` channels. Unknown/public/presence channels are rejected. Typing broadcasts moved from public `chat-` channels to private channels. There were no active public-chat subscribers found in this checkout. Pusher authorization applies at subscription time; immediate eviction after membership removal requires additional provider lifecycle work if mutable memberships are introduced.

## Run and deploy

Restart the Next.js app and the separate socket process together (`yarn dev` starts both locally). The standalone process now loads the checkout's Next.js environment files. It needs the same `NEXTAUTH_SECRET`, `MONGODB_URI` and `MESSAGE_ENCRYPTION_KEY` as the app. Set `NEXT_PUBLIC_APP_URL` to the browser application's origin and `NEXT_PUBLIC_SOCKET_URL` to the reachable socket origin. No secrets were changed by this implementation.

Deploy client and socket changes together: old clients sending raw message payloads or user-ID-only handshakes are intentionally rejected. No deployment or production connection was performed. Local tests use loopback sockets with mocked database/encryption dependencies; staging must still verify parent/teacher delivery, real persistence/decryption, cross-origin configuration, reconnects and expiry.

## Validation

Run the realtime-authorization, socket-client-auth, conversation-authorization and relaunch-authorization Jest suites. They cover token issuance/expiry/tampering, Pusher channel restrictions, actual Socket.IO handshake and room denial, persisted-message relay, membership removal, credential refresh and restoring active rooms.

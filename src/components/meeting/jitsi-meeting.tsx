"use client"

import { useEffect, useState } from 'react'
import { JitsiMeeting } from '@jitsi/react-sdk'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useAuth } from '@/hooks/use-auth'

interface JitsiMeetingProps {
  roomName: string
  displayName: string
  onClose: () => void
}

export function JitsiMeetingDialog({ roomName, displayName, onClose }: JitsiMeetingProps) {
  const [mounted, setMounted] = useState(false)
  const { session } = useAuth()

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  if (!mounted) return null

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <JitsiMeeting
          roomName={roomName}
          getIFrameRef={(node) => {
            node.style.height = '100%'
            node.style.width = '100%'
          }}
          configOverwrite={{
            startWithAudioMuted: true,
            startWithVideoMuted: true,
            prejoinPageEnabled: false,
            disableDeepLinking: true
          }}
          interfaceConfigOverwrite={{
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            MOBILE_APP_PROMO: false,
            DISPLAY_WELCOME_PAGE_CONTENT: false,
            DISPLAY_WELCOME_PAGE_TOOLBAR_ADDITIONAL_CONTENT: false,
            SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'sounds'],
            TOOLBAR_BUTTONS: [
              'camera',
              'chat',
              'closedcaptions',
              'desktop',
              'fullscreen',
              'hangup',
              'microphone',
              'participants-pane',
              'raisehand',
              'settings',
              'shareaudio',
              'sharedvideo',
              'shortcuts',
              'tileview',
            ]
          }}
          userInfo={{
            displayName,
            email: session?.user?.email || ''
          }}
        />
      </DialogContent>
    </Dialog>
  )
}

import { Bell } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface EmptyStateProps {
  title: string
  message: string
}

export function EmptyState({ title, message }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 space-y-3">
        <Bell className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  )
}

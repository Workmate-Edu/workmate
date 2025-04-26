import { Card } from "@/components/ui/card"
import { FiUsers, FiBook, FiClipboard, FiCalendar } from "react-icons/fi"

const icons = {
  users: FiUsers,
  book: FiBook,
  clipboard: FiClipboard,
  calendar: FiCalendar
}

interface CardWithStatsProps {
  title: string
  value: number
  icon: keyof typeof icons
}

export function CardWithStats({ title, value, icon }: CardWithStatsProps) {
  const Icon = icons[icon]

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className="p-3 bg-primary/10 rounded-full">
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </div>
    </Card>
  )
}

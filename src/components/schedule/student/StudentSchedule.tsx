// ...existing imports...
import { AlertTriangle } from "lucide-react"

const ScheduleItem = ({ session }) => {
  const isPastDue = new Date(session.startTime) < new Date();

  return (
    <div className={cn(
      "flex items-center gap-4 p-4 border rounded-lg",
      isPastDue && "border-destructive/50 bg-destructive/5"
    )}>
      // ...existing schedule item content...
      {isPastDue && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertTriangle className="h-4 w-4" />
          <span>Past due</span>
        </div>
      )}
    </div>
  );
};

// ...rest of existing code...

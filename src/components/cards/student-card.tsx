// ...existing imports...
import { Users } from "lucide-react"

interface SubjectTeacher {
  id: string
  name: string
  email: string
}

interface Subject {
  name: string
  area: string
  teacher: SubjectTeacher | null
}

interface StudentCardProps {
  id: string
  name: string
  email: string
  grade: string
  gender: string
  subjects: Subject[]
  onClick?: () => void
}

export function StudentCard({
  // ...existing props...
}) {
  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        // ...existing header...
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          // ...existing content...
          
          {/* Subjects with Teachers */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Subjects & Teachers</h4>
            <div className="grid gap-2">
              {subjects.map(subject => (
                <div 
                  key={`${subject.area}-${subject.name}`}
                  className="flex items-center justify-between text-sm border rounded-md p-2"
                >
                  <span>{subject.name}</span>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    {subject.teacher ? (
                      <span className="text-xs text-muted-foreground">
                        {subject.teacher.name}
                      </span>
                    ) : (
                      <Badge variant="outline" className="text-xs">
                        Unassigned
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      // ...existing footer...
    </Card>
  )
}

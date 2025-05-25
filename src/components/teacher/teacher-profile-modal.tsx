import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { GraduationCap, BookOpen, Star } from "lucide-react"

interface Qualification {
  degree: string
  institution: string
  year: string
  _id?: string
}

interface TeacherProfileProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teacher?: {
    name: string
    bio?: string
    teacherProfile?: {
      verificationStatus: string
      qualifications?: Qualification[]
      subjects?: Array<{
        name: string
        area: string
      }>
      rating?: number
    }
  }
}

export function TeacherProfileModal({ open, onOpenChange, teacher }: TeacherProfileProps) {
  if (!teacher) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{teacher.name}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh]">
          <div className="space-y-6 p-4">
            {/* Verification Status */}
            <div className="flex justify-end">
              <Badge variant={teacher.teacherProfile?.verificationStatus  === 'verified' ? 'default' : 'secondary'}>
                {teacher?.teacherProfile?.verificationStatus || 'Verified'}
              </Badge>
            </div>

            {/* Bio */}
            {teacher.bio && (
              <div>
                <h4 className="font-medium mb-2">About</h4>
                <p className="text-muted-foreground">{teacher.bio}</p>
              </div>
            )}

            {/* Qualifications */}
            {teacher.teacherProfile?.qualifications?.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4" />
                  Qualifications
                </h4>
                <ul className="list-disc list-inside text-muted-foreground">
                  {teacher.teacherProfile.qualifications.map((qual: Qualification, idx) => (
                    <li key={idx}>
                      {qual.degree} from {qual.institution} ({qual.year})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Subjects */}
            {teacher.teacherProfile?.subjects?.length > 0 && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Teaching Subjects
                </h4>
                <div className="flex flex-wrap gap-2">
                  {teacher.teacherProfile.subjects.map((subject, idx) => (
                    <Badge key={idx} variant="outline">
                      {subject.name} ({subject.area})
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Rating */}
            {teacher.teacherProfile?.rating !== undefined && (
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Rating
                </h4>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(teacher.teacherProfile.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm text-muted-foreground ml-2">
                    ({teacher.teacherProfile.rating}/5)
                  </span>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

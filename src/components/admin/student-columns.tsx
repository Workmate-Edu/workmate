import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Star, User, GraduationCap, UserPlus } from "lucide-react"
import { AssignTeacherDialog } from "./assign-teacher-dialog"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { AssignTeacherButton } from "./assign-teacher-button"

// Add proper type for subject
interface Subject {
  name: string
  area: string
  progress: number
}

interface Student {
  id: string
  name: string
  email: string
  type: 'independent' | 'child'
  grade?: string
  parentName?: string
  parentEmail?: string
  subjects: Subject[]
  status: string
  assessmentStatus?: string
  onAssigned?: () => void
}


export const columns: ColumnDef<Student>[] = [
  {
    accessorKey: "name",
    header: "Student",
    cell: ({ row }) => {
      const router = useRouter()
      const data = row.original
      return (
        <div 
          onClick={() => router.push(`/dashboard/admin/students/${data.id}`)}
          className="flex flex-col cursor-pointer hover:bg-muted/50 rounded-md p-2 transition-colors"
        >
          <span className="font-medium">{data.name}</span>
          <span className="text-sm text-muted-foreground">{data.email}</span>
          {data.type === 'child' && (
            <div className="text-sm text-muted-foreground">
              Parent: {data.parentName}
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-1">
            {data.subjects.map(subject => (
              <Badge key={subject.name} variant="outline" className="text-xs">
                {subject.name}
              </Badge>
            ))}
          </div>
          {/* Add assessment status */}
          {data.assessmentStatus && (
            <Badge variant="secondary" className="mt-2 w-fit">
              {data.assessmentStatus}
            </Badge>
          )}
        </div>
      )
    }
  },
  // {
  //   id: "teacher",
  //   header: "Assigned Teacher",
  //   cell: ({ row }) => {
  //     const teacher = row.original.assignedTeacher
  //     if (!teacher) return <span className="text-muted-foreground">No teacher assigned</span>
      
  //     return (
  //       <div className="flex flex-col gap-1">
  //         <div className="flex items-center gap-2">
  //           <span className="font-medium">{teacher.name}</span>
  //           {teacher.rating && (
  //             <div className="flex items-center">
  //               <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
  //               <span className="text-sm ml-1">{teacher.rating.toFixed(1)}</span>
  //             </div>
  //           )}
  //         </div>
  //         <span className="text-sm text-muted-foreground">{teacher.email}</span>
  //         {teacher.subjects && (
  //           <div className="flex flex-wrap gap-1 mt-1">
  //             {teacher.subjects.map(subject => (
  //               <Badge key={subject} variant="secondary" className="text-xs">
  //                 {subject}
  //               </Badge>
  //             ))}
  //           </div>
  //         )}
  //       </div>
  //     )
  //   }
  // },
  {
    accessorKey: "subjects",
    header: "Subjects",
    cell: ({ row }) => {
      const subjects = row.original.subjects
      return (
        <div className="flex flex-wrap gap-1">
          {subjects?.map((subject: Subject, index: number) => (
            <Badge key={`${subject.name}-${index}`} variant="outline">
              {subject.name}
            </Badge>
          ))}
        </div>
      )
    }
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue<string>("status")
      return (
        <Badge variant={status === 'active' ? 'success' : 'secondary'}>
          {status}
        </Badge>
      )
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const router = useRouter()
      const student = row.original

      return (
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => router.push(`/dashboard/admin/students/${student.id}`)}
            className="flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            Details
          </Button>

          <AssignTeacherButton
            studentId={student.id}
            studentName={student.name}
            studentType={student.type}
            subjects={student.subjects}
            onAssigned={() => {
              // Trigger table refresh
              window.dispatchEvent(new Event('adminDashboardUpdate'))
            }}
            variant="outline"
            size="sm"
          />
        </div>
      )
    }
  }
]

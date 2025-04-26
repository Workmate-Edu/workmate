"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"
import { ExternalLink, Eye } from "lucide-react" // Changed imports

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return (
        <div className="flex items-center">
          <div>
            <div className="font-medium">{row.original.name}</div>
            <div className="text-sm text-muted-foreground">{row.original.email}</div>
          </div>
        </div>
      )
    }
  },
  {
    accessorKey: "teacherProfile.subjects",
    header: "Subjects",
    cell: ({ row }) => {
      const subjects = row.original.teacherProfile.subjects
      const totalSubjects = subjects.reduce((acc: number, curr: any) => 
        acc + curr.subjects.length, 0
      )
      return (
        <div className="flex flex-wrap gap-1">
          {subjects.slice(0, 2).map((subject: any, index: number) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {subject.area}
            </Badge>
          ))}
          {totalSubjects > 2 && (
            <Badge variant="outline" className="text-xs">
              +{totalSubjects - 2} more
            </Badge>
          )}
        </div>
      )
    }
  },
  {
    accessorKey: "teacherProfile.rating",
    header: "Rating",
    cell: ({ row }) => {
      const rating = row.original.teacherProfile.rating
      return rating ? (
        <Badge variant="outline">⭐ {rating.toFixed(1)}</Badge>
      ) : null
    }
  },
  {
    accessorKey: "teacherProfile.verificationStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.teacherProfile.verificationStatus
      return (
        <Badge variant={
          status === 'verified' ? 'success' :
          status === 'rejected' ? 'destructive' : 
          'secondary'
        }>
          {status}
        </Badge>
      )
    }
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row, table }) => {
      const { onViewDetails } = table.options.meta || {};

      return (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            if (onViewDetails) {
              onViewDetails(row.original);
            }
          }}
        >
          <Eye className="h-4 w-4" />
          <span className="ml-2">View</span>
        </Button>
      )
    }
  }
]

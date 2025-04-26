"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash, Eye } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { QuestionBank } from "@/types/questions"
import { toast } from "sonner" // Change from react-toastify to sonner

export const questionColumns: ColumnDef<QuestionBank>[] = [
  {
    accessorKey: "subject.name",
    header: "Subject",
  },
  {
    accessorKey: "level",
    header: "Level",
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.getValue("level")}
      </Badge>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge>
        {row.getValue("type")}
      </Badge>
    ),
  },
  {
    accessorKey: "verification.status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("verification.status")
      return (
        <Badge variant={
          status === 'approved' ? 'success' :
          status === 'rejected' ? 'destructive' :
          'outline'
        }>
          {status}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <QuestionActions question={row.original} />,
  },
]

export function QuestionActions({ question }: { question: QuestionBank }) {
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    try {
      const res = await fetch(`/api/questions/${question.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete');
      toast.success("Question deleted successfully"); // Using sonner
    } catch (error) {
      toast.error("Failed to delete question"); // Using sonner
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <Eye className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem>
          <Eye className="mr-2 h-4 w-4" />
          View
        </DropdownMenuItem>
        {/* Only show edit if status is pending */}
        {question.verification.status === 'pending' && (
          <DropdownMenuItem>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
        )}
        <DropdownMenuItem 
          className="text-destructive"
          onClick={handleDelete}
        >
          <Trash className="mr-2 h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

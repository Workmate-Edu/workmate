"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export const studentColumns: ColumnDef<any>[] = [
  {
    accessorKey: "student.name",
    header: "Student Name",
  },
  {
    accessorKey: "subject.name",
    header: "Subject",
  },
  {
    accessorKey: "subject.area",
    header: "Area",
    cell: ({ row }) => (
      <Badge>
        {row.getValue("subject.area")}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.getValue("status") === "pending" ? "outline" : "default"}>
        {row.getValue("status")}
      </Badge>
    ),
  },
  {
    accessorKey: "completedAt",
    header: "Submitted",
    cell: ({ row }) => formatDistanceToNow(new Date(row.getValue("completedAt")), { addSuffix: true })
  },
  {
    id: "actions",
    cell: ({ row, table }) => (
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => (table.options.meta as any)?.onViewAssessment(row.original)}
      >
        <Eye className="h-4 w-4" />
      </Button>
    ),
  },
]

export const columns: ColumnDef<any>[] = [
  {
    accessorKey: "child.name",
    header: "Child Name",
  },
  {
    accessorKey: "parent.name",
    header: "Parent",
  },
  {
    accessorKey: "child.grade",
    header: "Grade",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.getValue("status") === "pending" ? "outline" : "default"}>
        {row.getValue("status")}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Submitted",
    cell: ({ row }) => formatDistanceToNow(new Date(row.getValue("createdAt")), { addSuffix: true })
  },
  {
    id: "actions",
    cell: ({ row, table }) => (
      <Button 
        variant="ghost" 
        size="icon"
        onClick={() => (table.options.meta as any)?.onViewAssessment(row.original)}
      >
        <Eye className="h-4 w-4" />
      </Button>
    ),
  },
]

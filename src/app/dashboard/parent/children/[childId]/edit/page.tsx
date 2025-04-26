"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AddChildForm } from "@/components/forms/add-child-form"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EditChildPage({ params }: { params: { childId: string } }) {
  return (
    <div className="container max-w-md py-8">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href={`/dashboard/parent/children/${params.childId}`}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Link>
        </Button>
      </div>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Edit Child</h1>
          <p className="text-muted-foreground">
            Update your child's information
          </p>
        </div>
        <AddChildForm 
          mode="edit" 
          childId={params.childId} 
        />
      </div>
    </div>
  )
}

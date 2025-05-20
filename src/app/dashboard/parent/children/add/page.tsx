"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AddChildForm } from "@/components/forms/add-child-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function AddChildPage() {
  return (
    <div className="container max-w-lg mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/parent/children" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Children
          </Link>
        </Button>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Add Child</h1>
            <p className="text-muted-foreground">
              Enter your child's information to get started
            </p>
          </div>

          <AddChildForm />
        </div>
      </Card>
    </div>
  )
}

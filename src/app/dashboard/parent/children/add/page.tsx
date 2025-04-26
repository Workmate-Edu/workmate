import { AddChildForm } from "@/components/forms/add-child-form"

export default function AddChildPage() {
  return (
    <div className="container max-w-md py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Add Child</h1>
          <p className="text-muted-foreground">
            Add your child's details to start managing their educational journey
          </p>
        </div>
        <AddChildForm />
      </div>
    </div>
  )
}

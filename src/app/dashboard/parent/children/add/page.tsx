import { AddChildForm } from "@/components/forms/add-child-form"

export default function AddChildPage() {
  return (
    <div className="container max-w-[360px] px-4 py-6 sm:py-8">
      <div className="space-y-4 sm:space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">Add Child</h1>
          <p className="text-sm text-muted-foreground">
            Add your child's details to start managing their educational journey
          </p>
        </div>
        <AddChildForm />
      </div>
    </div>
  )
}

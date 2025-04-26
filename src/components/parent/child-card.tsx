interface ChildCardProps {
  child: {
    id: string
    name: string
    grade: string
    username: string
    password: string
    assessmentStatus: string
    email: string // Add email to props
  }
}

export function ChildCard({ child }: ChildCardProps) {
  return (
    <Card>
      <CardContent className="p-6 space-y-4">
        {/* ...existing child info... */}

        {/* Add credentials section */}
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <h4 className="font-medium mb-2">Login Credentials</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Username/Email:</span>
              <div className="text-right">
                <span className="font-mono block">{child.username}</span>
                <span className="font-mono block text-muted-foreground">{child.email}</span>
              </div>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Password:</span>
              <span className="font-mono">{child.password}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

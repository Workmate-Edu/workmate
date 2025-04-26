import { useState } from "react"
import { z } from "zod"
import { Form, Label, Card } from "@/components/ui"
import { cn } from "@/lib/utils"
import { subjectAreas } from "@/lib/constants/subjects"

// ...existing imports...

export function StudentSignUpForm() {
  const [selectedSubjects, setSelectedSubjects] = useState<Array<{
    area: string;
    name: string;
  }>>([])

  const handleSubjectToggle = (area: string, subject: { label: string; value: string }) => {
    setSelectedSubjects(prev => {
      const exists = prev.some(s => s.area === area && s.name === subject.value)
      if (exists) {
        return prev.filter(s => !(s.area === area && s.name === subject.value))
      }
      return [...prev, { area, name: subject.value }]
    })
  }

  return (
    <Form>
      {/* ...existing form fields... */}
      
      <div className="space-y-6">
        <Label>Select Subjects</Label>
        {subjectAreas.map((area) => (
          <div key={area.value} className="space-y-3">
            <h3 className="text-sm font-medium">{area.label}</h3>
            <div className="grid grid-cols-2 gap-3">
              {area.subjects.map((subject) => (
                <Card
                  key={subject.value}
                  className={cn(
                    "p-3 cursor-pointer hover:border-primary transition-colors",
                    selectedSubjects.some(
                      s => s.area === area.value && s.name === subject.value
                    )
                      ? "border-primary bg-primary/5"
                      : ""
                  )}
                  onClick={() => handleSubjectToggle(area.value, subject)}
                >
                  <div className="text-sm">
                    <p className="font-medium">{subject.label}</p>
                    {subject.description && (
                      <p className="text-muted-foreground text-xs mt-1">
                        {subject.description}
                      </p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* ...rest of form... */}
    </Form>
  )
}

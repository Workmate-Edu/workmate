import { Card } from "@/components/ui/card"
import { LuBook, LuClock, LuMessageSquare, LuShield, LuStar, LuUsers } from "react-icons/lu"

const guidelines = [
  {
    icon: <LuShield className="h-6 w-6" />,
    title: "Professional Standards",
    description: "Maintain high professional standards in conduct, communication, and teaching methods.",
    points: [
      "Dress professionally during video sessions",
      "Use appropriate language and tone",
      "Be punctual and well-prepared for lessons"
    ]
  },
  {
    icon: <LuBook className="h-6 w-6" />,
    title: "Lesson Preparation",
    description: "Prepare comprehensive lesson plans and materials in advance.",
    points: [
      "Create clear learning objectives",
      "Prepare supplementary materials",
      "Plan interactive activities"
    ]
  },
  {
    icon: <LuClock className="h-6 w-6" />,
    title: "Time Management",
    description: "Respect scheduled times and manage lessons efficiently.",
    points: [
      "Start and end sessions on time",
      "Plan lesson segments effectively",
      "Allow time for questions"
    ]
  },
  {
    icon: <LuUsers className="h-6 w-6" />,
    title: "Student Interaction",
    description: "Foster a positive and inclusive learning environment.",
    points: [
      "Encourage student participation",
      "Provide constructive feedback",
      "Adapt to different learning styles"
    ]
  }
]

export default function TeacherGuidelinesPage() {
  return (
    <div className="container max-w-4xl py-8 px-4">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Teaching Guidelines</h1>
          <p className="text-muted-foreground mt-2">
            Follow these guidelines to provide the best learning experience for your students
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {guidelines.map((guideline, index) => (
            <Card key={index} className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="text-primary">{guideline.icon}</div>
                  <h3 className="font-semibold">{guideline.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {guideline.description}
                </p>
                <ul className="text-sm space-y-2">
                  {guideline.points.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

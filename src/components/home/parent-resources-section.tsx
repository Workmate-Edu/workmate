'use client'

import { BookOpen, ChartBar, Clock, Users } from "lucide-react";

export function ParentResourcesSection() {
  return (
    <section className="py-16 bg-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Parent Resources</h2>
          <p className="text-muted-foreground mt-2">
            Tools and insights to support your child's learning journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {resources.map((resource, index) => (
            <div key={index} className="flex gap-4 items-start">
              <div className="rounded-full bg-primary/10 p-3">
                <resource.icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">{resource.title}</h3>
                <p className="text-muted-foreground">{resource.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const resources = [
  {
    icon: ChartBar,
    title: "Progress Tracking",
    description: "Monitor your child's learning progress with detailed reports and insights"
  },
  {
    icon: Clock,
    title: "Flexible Scheduling",
    description: "Set learning schedules that fit your family's routine"
  },
  {
    icon: BookOpen,
    title: "Curriculum Overview",
    description: "Stay informed about what your child is learning"
  },
  {
    icon: Users,
    title: "Parent Community",
    description: "Connect with other parents and share experiences"
  }
];

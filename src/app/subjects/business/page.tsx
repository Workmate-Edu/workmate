'use client'

import { Briefcase, TrendingUp, PieChart, Target, Users, BarChart } from "lucide-react"
import Link from "next/link"

export default function BusinessPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary mb-4">Business & Entrepreneurship</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Transform your business acumen with expert guidance in entrepreneurship, management, and business strategy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          {
            title: "Entrepreneurship",
            icon: Briefcase,
            description: "Launch and grow your business ventures",
            topics: [
              "Business Planning",
              "Startup Fundamentals",
              "Innovation Strategy",
              "Business Model Design"
            ]
          },
          {
            title: "Business Management",
            icon: Users,
            description: "Master essential management skills",
            topics: [
              "Leadership",
              "Operations Management",
              "Strategic Planning",
              "Project Management"
            ]
          },
          {
            title: "Finance & Economics",
            icon: TrendingUp,
            description: "Understand business finances and economics",
            topics: [
              "Financial Planning",
              "Investment Basics",
              "Economic Principles",
              "Risk Management"
            ]
          },
          {
            title: "Marketing & Sales",
            icon: Target,
            description: "Develop effective marketing strategies",
            topics: [
              "Digital Marketing",
              "Sales Techniques",
              "Brand Development",
              "Market Analysis"
            ]
          },
          {
            title: "Data Analytics",
            icon: PieChart,
            description: "Make data-driven business decisions",
            topics: [
              "Business Analytics",
              "Data Visualization",
              "Market Research",
              "Performance Metrics"
            ]
          },
          {
            title: "Business Growth",
            icon: BarChart,
            description: "Scale your business operations",
            topics: [
              "Growth Strategy",
              "Business Development",
              "Market Expansion",
              "Scaling Operations"
            ]
          }
        ].map((category, index) => (
          <div key={index} className="bg-card rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
            <category.icon className="w-12 h-12 text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">{category.title}</h3>
            <p className="text-muted-foreground mb-4">{category.description}</p>
            <ul className="space-y-2">
              {category.topics.map((topic, idx) => (
                <li key={idx} className="text-sm text-primary">{topic}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 bg-muted/50 rounded-lg p-8">
        <h2 className="text-2xl font-semibold mb-6 text-center">Our Business Education Approach</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <Target className="w-8 h-8 mx-auto text-primary mb-2" />
            <h3 className="font-semibold mb-2">Practical Learning</h3>
            <p className="text-sm text-muted-foreground">Real-world case studies and hands-on projects</p>
          </div>
          <div className="text-center">
            <Users className="w-8 h-8 mx-auto text-primary mb-2" />
            <h3 className="font-semibold mb-2">Expert Mentorship</h3>
            <p className="text-sm text-muted-foreground">Learn from successful entrepreneurs and business leaders</p>
          </div>
          <div className="text-center">
            <TrendingUp className="w-8 h-8 mx-auto text-primary mb-2" />
            <h3 className="font-semibold mb-2">Growth Focus</h3>
            <p className="text-sm text-muted-foreground">Emphasis on sustainable business growth and success</p>
          </div>
        </div>
      </div>

      <div className="mt-12 text-center">
        <Link 
          href="/assessment/business"
          className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-white hover:bg-primary/90"
        >
          Start Your Business Journey
        </Link>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from "next/link"
import {
  Brain,
  Code2,
  Cog,
  Calculator,
  Microscope,
  Binary,
  Cpu,
  Database,
  FlaskConical,
  Rocket,
  Ruler,
  Atom
} from "lucide-react"

export default function STEMPage() {
  const [activeTab, setActiveTab] = useState('science')

  const subjects = {
    science: {
      title: "Science",
      description: "Discover the mysteries of the natural world through experimentation and observation",
      icon: <FlaskConical className="w-16 h-16 text-primary" />,
      topics: [
        { name: "Physics", icon: <Atom className="w-6 h-6" />, description: "Understand the fundamental laws of the universe" },
        { name: "Chemistry", icon: <Binary className="w-6 h-6" />, description: "Explore matter and its transformations" },
        { name: "Biology", icon: <Brain className="w-6 h-6" />, description: "Study life in all its fascinating forms" },
        { name: "Lab Work", icon: <Microscope className="w-6 h-6" />, description: "Hands-on experimental learning" }
      ]
    },
    technology: {
      title: "Technology",
      description: "Master modern tools and digital solutions that shape our future",
      icon: <Cpu className="w-16 h-16 text-primary" />,
      topics: [
        { name: "Programming", icon: <Code2 className="w-6 h-6" />, description: "Learn to code and create software" },
        { name: "Data Science", icon: <Database className="w-6 h-6" />, description: "Analyze and visualize data" },
        { name: "Web Development", icon: <Binary className="w-6 h-6" />, description: "Build modern web applications" },
        { name: "Digital Skills", icon: <Cpu className="w-6 h-6" />, description: "Essential tech competencies" }
      ]
    },
    engineering: {
      title: "Engineering",
      description: "Design and build solutions to real-world challenges",
      icon: <Cog className="w-16 h-16 text-primary" />,
      topics: [
        { name: "Mechanical", icon: <Rocket className="w-6 h-6" />, description: "Design mechanical systems" },
        { name: "Electrical", icon: <Binary className="w-6 h-6" />, description: "Work with electrical systems" },
        { name: "Software", icon: <Code2 className="w-6 h-6" />, description: "Develop software solutions" },
        { name: "Robotics", icon: <Cog className="w-6 h-6" />, description: "Build automated systems" }
      ]
    },
    mathematics: {
      title: "Mathematics",
      description: "Develop strong analytical and problem-solving skills",
      icon: <Calculator className="w-16 h-16 text-primary" />,
      topics: [
        { name: "Algebra", icon: <Ruler className="w-6 h-6" />, description: "Master mathematical structures" },
        { name: "Calculus", icon: <Binary className="w-6 h-6" />, description: "Study change and motion" },
        { name: "Statistics", icon: <Database className="w-6 h-6" />, description: "Analyze data patterns" },
        { name: "Geometry", icon: <Ruler className="w-6 h-6" />, description: "Explore shapes and spaces" }
      ]
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-primary mb-6">STEM Education</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Embark on a journey through Science, Technology, Engineering, and Mathematics with expert guidance and hands-on learning.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {Object.entries(subjects).map(([key, subject]) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-6 py-3 rounded-full transition-all ${
                activeTab === key
                  ? 'bg-primary text-white shadow-lg scale-105'
                  : 'bg-muted hover:bg-primary/10'
              }`}
            >
              <span className="font-medium">{subject.title}</span>
            </button>
          ))}
        </div>

        {/* Active Subject Content */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-12">
            <div className="text-center md:text-left">
              <div className="mb-6 inline-block">{subjects[activeTab as keyof typeof subjects].icon}</div>
              <h2 className="text-3xl font-bold mb-4">{subjects[activeTab as keyof typeof subjects].title}</h2>
              <p className="text-lg text-muted-foreground">
                {subjects[activeTab as keyof typeof subjects].description}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {subjects[activeTab as keyof typeof subjects].topics.map((topic, index) => (
                <div
                  key={index}
                  className="bg-card p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-3 mb-2">
                    {topic.icon}
                    <h3 className="font-semibold">{topic.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{topic.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Link
            href="/assessment/stem"
            className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
          >
            Start Your STEM Journey
          </Link>
        </div>
      </div>
    </div>
  )
}

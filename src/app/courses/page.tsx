"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  FiBook, 
  FiClock, 
  FiFilter, 
  FiSearch, 
  FiUser,
  FiAward,
  FiUsers,
  FiTarget,
  FiLayers,
  FiPlay,
  FiStar,
  FiTrendingUp
} from "react-icons/fi"
import { useRouter } from "next/navigation"
import { useThemeContext } from "@/hooks/use-theme-context"
import { useState } from "react"

// Mock data - would come from API in real app
const courseCategories = [
  {
    id: "stem",
    title: "STEM Education",
    description: "Science, Technology, Engineering, and Mathematics",
    courses: [
      {
        id: 1,
        title: "Advanced Mathematics",
        level: "Secondary",
        duration: "Academic Year",
        groupSize: "8 students max",
        description: "Comprehensive mathematics program covering algebra, calculus, and geometry",
        prerequisites: "Basic mathematics knowledge",
        certification: "Mathematics Excellence Certificate",
        schedule: "Fixed schedule",
        featured: true,
        topics: [
          "Advanced Algebra",
          "Calculus",
          "Geometry",
          "Problem Solving"
        ]
      },
      {
        id: 2,
        title: "Computer Science Fundamentals",
        level: "Secondary",
        duration: "6 months",
        groupSize: "10 students max",
        description: "Introduction to programming, algorithms, and computational thinking",
        prerequisites: "Basic computer skills",
        certification: "CS Fundamentals Certificate",
        schedule: "Flexible",
        topics: [
          "Programming Basics",
          "Algorithms",
          "Data Structures",
          "Web Development"
        ]
      },
      {
        id: 3,
        title: "Physics & Engineering",
        level: "Secondary",
        duration: "Academic Year",
        groupSize: "8 students max",
        description: "Applied physics with focus on engineering principles",
        prerequisites: "Basic science knowledge",
        certification: "Physics & Engineering Certificate",
        schedule: "Fixed schedule",
        featured: true,
        topics: [
          "Mechanics",
          "Electronics",
          "Engineering Design",
          "Practical Projects"
        ]
      }
    ]
  },
  {
    id: "business",
    title: "Business & Entrepreneurship",
    description: "Business skills and entrepreneurial mindset development",
    courses: [
      {
        id: 4,
        title: "Young Entrepreneurs Program",
        level: "Secondary",
        duration: "4 months",
        groupSize: "12 students max",
        description: "Develop entrepreneurial skills and business acumen",
        prerequisites: "None",
        certification: "Young Entrepreneur Certificate",
        schedule: "Flexible",
        topics: [
          "Business Planning",
          "Marketing Basics",
          "Financial Literacy",
          "Leadership Skills"
        ]
      },
      {
        id: 5,
        title: "Public Speaking",
        level: "All Levels",
        duration: "3 months",
        groupSize: "10 students max",
        description: "Master the art of public speaking and presentation",
        prerequisites: "None",
        certification: "Public Speaking Certificate",
        schedule: "Flexible",
        featured: true,
        topics: [
          "Speech Writing",
          "Voice Projection",
          "Body Language",
          "Audience Engagement"
        ]
      }
    ]
  }
]

export default function CoursesPage() {
  const router = useRouter()
  const { theme } = useThemeContext()
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredCategories = selectedCategory === "all" 
    ? courseCategories
    : courseCategories.filter(cat => cat.id === selectedCategory)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Interactive Hero Section */}
      <section className={`${theme.gradients.primary} text-white py-12 sm:py-16 lg:py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm"></div>
        <div className="container relative">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-blue-200 animate-fade-in">
                <FiStar className="w-5 h-5" />
                <span className="text-sm">Featured Courses Available</span>
                <FiStar className="w-5 h-5" />
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight animate-slide-up">
                Unlock Your Future with STEM & Business
              </h1>
              <p className={`text-base sm:text-lg lg:text-xl ${theme.text.light} max-w-2xl mx-auto opacity-90`}>
                Discover world-class courses designed for tomorrow's innovators and leaders
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                onClick={() => router.push('/assessment')}
                size="lg"
                className={`w-full sm:w-auto ${theme.button.secondary} group`}
              >
                <FiPlay className="mr-2 group-hover:animate-pulse" />
                Take Free Assessment
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="w-full sm:w-auto bg-transparent text-white border-2 border-white/80 hover:bg-white hover:text-blue-900 transition-colors group"
                onClick={() => router.push('/register')}
              >
                <FiTrendingUp className="mr-2 group-hover:translate-y-[-2px] transition-transform" />
                Start Learning
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-8 sm:mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 transform hover:scale-105 transition-transform">
                <div className="text-3xl sm:text-4xl font-bold text-blue-300 mb-2">20+</div>
                <div className="text-sm text-blue-100">Expert-Led Courses</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 transform hover:scale-105 transition-transform">
                <div className="text-3xl sm:text-4xl font-bold text-blue-300 mb-2">100%</div>
                <div className="text-sm text-blue-100">Project-Based Learning</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 sm:p-6 transform hover:scale-105 transition-transform">
                <div className="text-3xl sm:text-4xl font-bold text-blue-300 mb-2">1:8</div>
                <div className="text-sm text-blue-100">Teacher-Student Ratio</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Filters Section */}
      <section className="py-4 sm:py-8 border-b bg-white sticky top-0 z-10 shadow-sm">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative group">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 group-hover:text-primary transition-colors" />
                <Input
                  placeholder="Search courses..."
                  className="pl-10 w-full focus:ring-2 focus:ring-primary/20"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="stem">STEM</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="skills">Professional Skills</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Primary</SelectItem>
                  <SelectItem value="secondary">Secondary</SelectItem>
                  <SelectItem value="all">All Levels</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" className="w-full sm:w-auto hover:bg-primary/5">
                <FiFilter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Course Categories */}
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="space-y-8 sm:space-y-12 lg:space-y-16">
            {filteredCategories.map((category) => (
              <div key={category.id} className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold group flex items-center gap-2">
                      {category.title}
                      <span className="text-sm text-gray-500 font-normal">
                        ({category.courses.length} courses)
                      </span>
                    </h2>
                    <p className="text-gray-600 text-sm sm:text-base">{category.description}</p>
                  </div>
                  <Button 
                    variant="link" 
                    onClick={() => router.push(`/courses/${category.id}`)}
                    className="sm:self-end group"
                  >
                    View All
                    <FiPlay className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>

                <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
                  {category.courses
                    .filter(course => 
                      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      course.description.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((course) => (
                    <Card key={course.id} className="p-4 sm:p-6 hover:shadow-lg transition-all hover:border-primary/20 group">
                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div>
                            <h3 className="text-lg sm:text-xl font-bold group-hover:text-primary transition-colors">
                              {course.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-2">
                              {course.featured && (
                                <span className="px-2 py-1 rounded-full bg-amber-100 text-amber-700 text-xs flex items-center gap-1">
                                  <FiStar className="w-3 h-3" />
                                  Featured
                                </span>
                              )}
                              <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs">
                                {course.level}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            onClick={() => router.push(`/courses/${category.id}/${course.id}`)}
                            className="w-full sm:w-auto group-hover:bg-primary group-hover:text-white transition-colors"
                          >
                            Learn More
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center gap-2 group-hover:text-primary transition-colors">
                            <FiClock className="text-gray-400 group-hover:text-primary transition-colors" />
                            <span>{course.duration}</span>
                          </div>
                          <div className="flex items-center gap-2 group-hover:text-primary transition-colors">
                            <FiUsers className="text-gray-400 group-hover:text-primary transition-colors" />
                            <span>{course.groupSize}</span>
                          </div>
                          <div className="flex items-center gap-2 group-hover:text-primary transition-colors">
                            <FiTarget className="text-gray-400 group-hover:text-primary transition-colors" />
                            <span>{course.prerequisites}</span>
                          </div>
                          <div className="flex items-center gap-2 group-hover:text-primary transition-colors">
                            <FiAward className="text-gray-400 group-hover:text-primary transition-colors" />
                            <span>{course.certification}</span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-600">{course.description}</p>

                        <div className="space-y-2">
                          <div className="text-sm font-medium">Key Topics:</div>
                          <div className="flex flex-wrap gap-2">
                            {course.topics.map((topic, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 group-hover:bg-primary/5 rounded-full text-xs text-gray-600 transition-colors"
                              >
                                {topic}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 border-t py-16">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
              <FiTarget className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Ready to Excel?</h2>
            <p className="text-gray-600 mb-8">
              Take our assessment to find the perfect course for your level, or contact us for a personalized learning plan.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => router.push('/register')}
                className="bg-primary hover:bg-primary/90 group"
              >
                <FiUser className="mr-2 group-hover:scale-110 transition-transform" />
                Register Now
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/contact')}
                className="group"
              >
                <FiBook className="mr-2 group-hover:rotate-12 transition-transform" />
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

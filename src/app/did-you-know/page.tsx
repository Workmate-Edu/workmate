'use client'

import { useState } from 'react'
import { Lightbulb, Star, GraduationCap, Globe2, Puzzle, Book, Beaker } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Fact {
  category: string
  title: string
  description: string
  source: string
  icon: any
  tags: string[]
}

const allFacts: Fact[] = [
  {
    category: "Science",
    title: "Great Zimbabwe's Architectural Marvel",
    description: "Built between the 11th and 15th centuries, Great Zimbabwe's walls were constructed using a dry-stone technique, perfectly fitting millions of blocks without mortar.",
    source: "UNESCO World Heritage",
    icon: GraduationCap,
    tags: ["Architecture", "History", "Innovation"]
  },
  {
    category: "Language",
    title: "Africa's Linguistic Diversity",
    description: "Africa has over 2000 languages, with Nigeria alone having more than 500 languages, making it one of the most linguistically diverse countries in the world.",
    source: "UNESCO Language Atlas",
    icon: Globe2,
    tags: ["Languages", "Culture", "Diversity"]
  },
  {
    category: "Innovation",
    title: "Ancient African Math",
    description: "The Ishango bone, found in the Congo, shows mathematical notations dating back 20,000 years, representing one of the earliest known mathematical artifacts.",
    source: "Royal Belgian Institute of Natural Sciences",
    icon: Puzzle,
    tags: ["Math", "History", "Discovery"]
  },
  {
    category: "Culture",
    title: "The Griots: Africa's Living Libraries",
    description: "In West African tradition, Griots are oral historians who preserve and share centuries of history, genealogy, and cultural traditions through storytelling and music.",
    source: "UNESCO Cultural Heritage",
    icon: Book,
    tags: ["Culture", "History", "Tradition"]
  },
  {
    category: "Innovation",
    title: "Traditional Medicine in Modern Healthcare",
    description: "The African plant Hoodia, traditionally used by the San people to suppress hunger during long hunting trips, has influenced modern appetite suppressant medications.",
    source: "World Health Organization",
    icon: Beaker,
    tags: ["Medicine", "Innovation", "Traditional Knowledge"]
  }
]

export default function DidYouKnowPage() {
  const [currentFacts, setCurrentFacts] = useState<Fact[]>(allFacts.slice(0, 3))
  const [randomFact, setRandomFact] = useState<Fact | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const getRandomFact = () => {
    const randomIndex = Math.floor(Math.random() * allFacts.length)
    setRandomFact(allFacts[randomIndex])
    setIsDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block animate-pulse mb-6">
            <Lightbulb className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Did You Know?</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Fascinating facts about African science, languages, and innovations throughout history
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {['All', 'Science', 'Language', 'Innovation', 'History', 'Culture'].map((category) => (
            <button
              key={category}
              className="px-4 py-2 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              {category}
            </button>
          ))}
        </div>

        {/* Facts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentFacts.map((fact, index) => (
            <div 
              key={index} 
              className="group bg-card rounded-lg border p-6 hover:border-primary transition-all hover:shadow-lg"
            >
              <div className="flex items-center gap-2 text-sm text-primary mb-4">
                <fact.icon className="h-4 w-4" />
                <span>{fact.category}</span>
              </div>
              
              <h3 className="text-xl font-semibold mb-3 group-hover:text-primary transition-colors">
                {fact.title}
              </h3>
              
              <p className="text-muted-foreground mb-4">
                {fact.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {fact.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              
              <div className="text-sm text-muted-foreground">
                Source: {fact.source}
              </div>
              
              <Button
                variant="ghost"
                className="w-full mt-4 group-hover:bg-primary/10"
              >
                Learn More
              </Button>
            </div>
          ))}
        </div>

        {/* Random Fact Generator */}
        <div className="mt-16 bg-primary/5 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Discover Something New</h2>
          <p className="text-muted-foreground mb-6">
            Click to reveal a random interesting fact about Africa
          </p>
          <Button 
            size="lg" 
            onClick={getRandomFact}
            className="hover:scale-105 transition-transform"
          >
            <Star className="mr-2 h-4 w-4" />
            Show Random Fact
          </Button>
        </div>

        {/* Random Fact Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {randomFact?.icon && <randomFact.icon className="h-5 w-5 text-primary" />}
                <span>{randomFact?.category}</span>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">{randomFact?.title}</h3>
              <p className="text-muted-foreground">{randomFact?.description}</p>
              <div className="flex flex-wrap gap-2">
                {randomFact?.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="text-sm text-muted-foreground">
                Source: {randomFact?.source}
              </div>
              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={getRandomFact}>
                  <Star className="mr-2 h-4 w-4" />
                  Another Fact
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

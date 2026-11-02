export const SUBJECT_AREAS = {
  languages: "African Languages",
  stem: "STEM"
} as const

export const subjectAreas = [
  { 
    label: "STEM", 
    value: "stem",
    subjects: [
      { label: "Artificial Intelligence", value: "ai" },
      { 
        label: "Math", 
        value: "math",
        topics: ["Algebra", "Geometry", "Calculus", "Statistics"],
        description: "Master fundamental mathematical concepts"
      },
      { label: "Physics", value: "physics" },
      { label: "Chemistry", value: "chemistry" },
      { label: "Biology", value: "biology" },
      { label: "Computer Science", value: "computer_science" }
    ]
  },
  {
    label: "Languages",
    value: "languages",
    subjects: [
      { 
        label: "English", 
        value: "english",
        region: "West Africa",
        country: "Nigeria",
        description: "Learn English Language from expert teachers"
      },
      { 
        label: "Yoruba", 
        value: "yoruba",
        region: "West Africa",
        country: "Nigeria",
        description: "Learn Yoruba language and cultural heritage"
      },
      { 
        label: "Hausa", 
        value: "hausa",
        region: "West Africa",
        countries: ["Nigeria", "Niger"],
        description: "Master Hausa, widely spoken across West Africa"
      },
      { 
        label: "Igbo", 
        value: "igbo",
        region: "West Africa",
        country: "Nigeria",
        description: "Study Igbo language and traditions"
      },
      { 
        label: "Swahili", 
        value: "swahili",
        region: "East Africa",
        countries: ["Tanzania", "Kenya", "Uganda"],
        description: "Learn East Africa's most widely spoken language"
      },
      { 
        label: "Arabic", 
        value: "arabic",
        region: "North Africa", 
        countries: ["Egypt", "Sudan"],
        description: "Study Classical and Modern Arabic"
      }
    ]
  }
]

export type SubjectArea = (typeof subjectAreas)[number]
export type Subject = SubjectArea['subjects'][number]

export function getSubjectLabel(value: string): string {
  for (const area of subjectAreas) {
    const subject = area.subjects.find(s => s.value === value)
    if (subject) return subject.label
  }
  return value
}

// Helper functions
export function getSubjectDetails(value: string) {
  for (const area of subjectAreas) {
    const subject = area.subjects.find(s => s.value === value)
    if (subject) {
      return {
        ...subject,
        area: area.value
      }
    }
  }
  return null
}

export function getSubjectsByArea(areaValue: string) {
  return subjectAreas.find(area => area.value === areaValue)?.subjects || []
}

export const subjects = [
  // STEM Subjects
  { id: "ai", label: "Artificial Intelligence", category: "STEM" },
  { id: "math", label: "Math", category: "STEM" }, // Changed from mathematics to math
  { id: "physics", label: "Physics", category: "STEM" },
  { id: "chemistry", label: "Chemistry", category: "STEM" },
  { id: "biology", label: "Biology", category: "STEM" },
  { id: "computer_science", label: "Computer Science", category: "STEM" },
  { id: "robotics", label: "Robotics", category: "STEM" },
  
  // Business/Entrepreneurship Subjects
  { id: "business_basics", label: "Business Basics", category: "Business" },
  { id: "entrepreneurship", label: "Entrepreneurship", category: "Business" },
  { id: "financial_literacy", label: "Financial Literacy", category: "Business" },
  { id: "marketing", label: "Marketing", category: "Business" },
  
  // Languages
  { id: "hausa", label: "Hausa", category: "African Languages" },
  { id: "yoruba", label: "Yoruba", category: "African Languages" },
  { id: "igbo", label: "Igbo", category: "African Languages" },
  { id: "swahili", label: "Swahili", category: "African Languages" },
  { id: "english", label: "English", category: "African Languages" },
  
  // Arabic & Islamic Studies - Fix subject IDs to match form values
  { id: "arabic_language", label: "Arabic Language", category: "Arabic" },
  { id: "quran_studies", label: "Qur'an Studies", category: "Arabic" },
  { id: "islamic_studies", label: "Islamic Studies", category: "Arabic" },
  { id: "arabic_culture", label: "Arabic Culture & Heritage", category: "Arabic" }
] as const;

// Add a mapping for legacy subject IDs
const subjectIdMappings: Record<string, string> = {
  'mathematics': 'math',
  'arabic': 'arabic_language',
  // Add other mappings as needed
};

export function normalizeSubjectId(id: string): string {
  return subjectIdMappings[id] || id;
}

export type SubjectId = typeof subjects[number]['id'];
export type SubjectCategory = typeof subjects[number]['category'];

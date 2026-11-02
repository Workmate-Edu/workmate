export const educationLevels = [
  { label: "Personal learning / Not in school", value: "personal" },
  { label: "Primary School", value: "primary" },
  { label: "High School", value: "high_school" },
  { label: "Undergraduate", value: "undergraduate" },
  { label: "Graduate", value: "graduate" },
  { label: "Professional", value: "professional" },
] as const

export const gradesByLevel = {
  personal: [{ label: "Not applicable", value: "personal_learning" }],
  primary: [
    { label: "Grade 1", value: "1" },
    { label: "Grade 2", value: "2" },
    { label: "Grade 3", value: "3" },
    { label: "Grade 4", value: "4" },
    { label: "Grade 5", value: "5" },
    { label: "Grade 6", value: "6" },
  ],
  high_school: [
    { label: "Grade 7", value: "7" },
    { label: "Grade 8", value: "8" },
    { label: "Grade 9", value: "9" },
    { label: "Grade 10", value: "10" },
    { label: "Grade 11", value: "11" },
    { label: "Grade 12", value: "12" },
  ],
  undergraduate: [
    { label: "First Year", value: "year_1" },
    { label: "Second Year", value: "year_2" },
    { label: "Third Year", value: "year_3" },
    { label: "Fourth Year / Final Year", value: "year_4" },
  ],
  graduate: [
    { label: "Bachelor's", value: "bachelors" },
    { label: "Master's", value: "masters" },
    { label: "Doctorate", value: "doctorate" },
  ],
  professional: [
    { label: "Professional Development", value: "professional" },
  ],
} as const

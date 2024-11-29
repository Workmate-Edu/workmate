import { LearningStyleAssessment } from "./types";

const questions = [
  {
    id: "q1",
    text: "When learning something new, I prefer to:",
    options: [
      { text: "Watch a video demonstration", type: "visual" },
      { text: "Listen to an explanation", type: "auditory" },
      { text: "Try it hands-on", type: "kinesthetic" },
      { text: "Read detailed instructions", type: "readingWriting" },
    ],
  },
  {
    id: "q2",
    text: "When studying, I find it most helpful to:",
    options: [
      { text: "Use charts and diagrams", type: "visual" },
      { text: "Discuss the topic with others", type: "auditory" },
      { text: "Work through practice problems", type: "kinesthetic" },
      { text: "Take detailed notes", type: "readingWriting" },
    ],
  },
  {
    id: "q3",
    text: "I remember information best when:",
    options: [
      { text: "I see pictures or visualizations", type: "visual" },
      { text: "I hear it explained", type: "auditory" },
      { text: "I can practice it physically", type: "kinesthetic" },
      { text: "I write it down", type: "readingWriting" },
    ],
  },
  // Add more questions as needed
];

export function analyzeLearningStyle(answers: { questionId: string; selectedType: string }[]): LearningStyleAssessment {
  const initialScores = {
    visual: 0,
    auditory: 0,
    kinesthetic: 0,
    readingWriting: 0,
  };

  const scores = answers.reduce((acc, answer) => {
    const type = answer.selectedType as keyof LearningStyleAssessment;
    acc[type] += 1;
    return acc;
  }, initialScores);

  // Convert to percentages
  const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
  return {
    visual: (scores.visual / total) * 100,
    auditory: (scores.auditory / total) * 100,
    kinesthetic: (scores.kinesthetic / total) * 100,
    readingWriting: (scores.readingWriting / total) * 100,
  };
}

export function getLearningStyleRecommendations(assessment: LearningStyleAssessment) {
  const recommendations = {
    visual: [
      "Use mind maps and diagrams",
      "Watch video tutorials",
      "Create visual summaries",
    ],
    auditory: [
      "Record and listen to lessons",
      "Participate in group discussions",
      "Use verbal repetition",
    ],
    kinesthetic: [
      "Practice with hands-on exercises",
      "Take frequent study breaks",
      "Use physical movement while learning",
    ],
    readingWriting: [
      "Take detailed notes",
      "Create written summaries",
      "Use flashcards",
    ],
  };

  // Find dominant style
  const dominantStyle = Object.entries(assessment).reduce((a, b) => 
    a[1] > b[1] ? a : b
  )[0] as keyof typeof recommendations;

  return {
    dominantStyle,
    recommendations: recommendations[dominantStyle],
  };
}

export { questions };

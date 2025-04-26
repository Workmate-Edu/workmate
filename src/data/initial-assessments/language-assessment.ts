export const languageAssessmentQuestions = {
  motivation: {
    question: "What's your primary reason for learning {language}?",
    type: "single_choice",
    options: [
      {
        id: "heritage",
        text: "Learning my heritage language",
        icon: "🗣️",
        followUp: "How connected do you feel to your heritage currently?"
      },
      {
        id: "family",
        text: "Teaching my child/children",
        icon: "👨‍👩‍👧‍👦",
        followUp: "What age group are your children?"
      },
      {
        id: "relationship",
        text: "For my Nigerian partner",
        icon: "❤️",
        followUp: "Does your partner speak the language fluently?"
      },
      {
        id: "roots",
        text: "Exploring my newfound roots",
        icon: "🌳",
        followUp: "What sparked your interest in exploring these roots?"
      },
      {
        id: "other",
        text: "Other reasons",
        icon: "⚙️",
        followUp: "Could you tell us more about your motivation?"
      }
    ]
  },
  proficiency: {
    question: "How would you rate your current {language} skills?",
    type: "single_choice",
    options: [
      {
        id: "none",
        text: "Complete Beginner",
        description: "I don't know any words yet"
      },
      {
        id: "basic",
        text: "Basic Understanding",
        description: "I know some common words and greetings"
      },
      {
        id: "intermediate",
        text: "Conversational",
        description: "I can have basic conversations"
      },
      {
        id: "advanced",
        text: "Advanced Speaker",
        description: "I can discuss complex topics"
      }
    ]
  },
  goals: {
    question: "What are your main goals with {language}?",
    type: "multiple_choice",
    options: [
      {
        id: "conversation",
        text: "Have conversations with family/friends",
        icon: "💬"
      },
      {
        id: "culture",
        text: "Connect with my culture",
        icon: "🎭"
      },
      {
        id: "business",
        text: "Professional/Business purposes",
        icon: "💼"
      },
      {
        id: "travel",
        text: "Travel and tourism",
        icon: "✈️"
      },
      {
        id: "education",
        text: "Academic purposes",
        icon: "📚"
      }
    ]
  },
  schedule: {
    question: "How much time can you dedicate to learning {language}?",
    type: "single_choice",
    options: [
      {
        id: "minimal",
        text: "5-10 minutes daily",
        icon: "⏱️"
      },
      {
        id: "moderate",
        text: "15-30 minutes daily",
        icon: "⏰"
      },
      {
        id: "dedicated",
        text: "1 hour or more daily",
        icon: "🕐"
      },
      {
        id: "flexible",
        text: "Few hours per week (flexible)",
        icon: "📅"
      }
    ]
  },
  learningStyle: {
    question: "How do you prefer to learn?",
    type: "multiple_choice",
    options: [
      {
        id: "visual",
        text: "Visual learning with images and videos",
        icon: "👀"
      },
      {
        id: "audio",
        text: "Listening and speaking practice",
        icon: "🎧"
      },
      {
        id: "reading",
        text: "Reading and writing exercises",
        icon: "📖"
      },
      {
        id: "interactive",
        text: "Interactive conversations",
        icon: "🗣️"
      },
      {
        id: "cultural",
        text: "Through cultural context and stories",
        icon: "🎭"
      }
    ]
  }
};

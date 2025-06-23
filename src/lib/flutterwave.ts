export const TUTORIAL_PLANS = {
  HOURLY: {
    name: 'Tutorial Session',
    description: '1-on-1 Learning Session',
    basePrice: {
      amount: 5,
      currency: 'USD',
    },
    features: [
      'Personalized 1-on-1 Sessions',
      'Interactive Learning Materials',
      'Progress Tracking',
      'Flexible Scheduling',
      'Learning Resources Access'
    ]
  }
}

// Remove flw export and Node SDK imports
export type Currency = 'USD' | 'NGN'

// Helper functions
export const formatAmount = (amount: number, currency: Currency) => {
  return currency === 'USD' 
    ? `$${amount.toFixed(2)}`
    : `₦${amount.toLocaleString()}`
}

export const generatePaymentRef = () => {
  return `WM-${Date.now()}-${Math.floor(Math.random() * 1000000)}`
}

export const calculateTutorialCost = (
  hourlyRate: number,
  numberOfStudents: number,
  hoursPerSession: number,
  sessionsPerWeek: number
) => {
  return hourlyRate * numberOfStudents * hoursPerSession * sessionsPerWeek
}

// Remove createPaymentConfig and flw exports as we're using React SDK

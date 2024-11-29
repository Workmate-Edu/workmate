'use client'

import { Shield, Lock, UserCheck, AlertTriangle, CheckCircle, HelpCircle } from 'lucide-react'

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Your Safety is Our Priority
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Learn about our commitment to creating a secure and trusted learning environment.
            </p>
          </div>
        </div>
      </section>

      {/* Safety Features */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Platform Security</h3>
              <p className="text-muted-foreground">
                Advanced encryption and security measures to protect your data and privacy while learning.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <UserCheck className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">User Verification</h3>
              <p className="text-muted-foreground">
                Thorough verification process for all users to ensure a safe learning community.
              </p>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Data Protection</h3>
              <p className="text-muted-foreground">
                GDPR-compliant data handling and storage with regular security audits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Guidelines */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Safety Guidelines</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                title: 'Strong Password Policy',
                description: 'Use unique, complex passwords and enable two-factor authentication when available.',
                icon: Lock
              },
              {
                title: 'Personal Information Protection',
                description: 'Be mindful of sharing personal information and only use secure communication channels.',
                icon: Shield
              },
              {
                title: 'Report Suspicious Activity',
                description: 'If you notice any suspicious behavior, report it immediately to our safety team.',
                icon: AlertTriangle
              }
            ].map((guideline, index) => (
              <div key={index} className="bg-card p-6 rounded-lg shadow-sm flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <guideline.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">{guideline.title}</h3>
                  <p className="text-muted-foreground">{guideline.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Resources */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Emergency Resources</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <HelpCircle className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">24/7 Support</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                Our support team is available around the clock to assist with any safety concerns.
              </p>
              <button className="text-primary hover:underline">Contact Support →</button>
            </div>
            <div className="bg-card p-6 rounded-lg shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <AlertTriangle className="w-6 h-6 text-primary" />
                <h3 className="text-xl font-semibold">Report an Issue</h3>
              </div>
              <p className="text-muted-foreground mb-4">
                If you encounter any safety issues, please report them immediately.
              </p>
              <button className="text-primary hover:underline">Report Issue →</button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Safety Commitment */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 mx-auto">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-6">Our Trust & Safety Commitment</h2>
            <p className="text-lg text-muted-foreground mb-8">
              We are committed to maintaining the highest standards of safety and security. 
              Our dedicated trust and safety team works tirelessly to ensure your learning 
              experience remains secure and worry-free.
            </p>
            <button className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors">
              Learn More About Our Policies
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}

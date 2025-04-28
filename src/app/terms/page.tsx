import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Terms of Service | Workmate',
  description: 'Terms and conditions for using the Workmate educational platform'
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          <div className="prose prose-slate max-w-none space-y-12">
            <section>
              <h2 className="text-3xl font-semibold text-primary mb-6">1. Agreement to Terms</h2>
              <div className="space-y-4">
                <p className="text-lg leading-relaxed">
                  By accessing or using Workmate, you agree to be bound by these Terms of Service 
                  and our Privacy Policy. If you disagree with any part of these terms, you may 
                  not access our service.
                </p>
              </div>
            </section>

            <section className="space-y-6">
              <h2 className="text-3xl font-semibold text-primary">2. User Responsibilities</h2>
              
              <div className="grid gap-6">
                <div className="bg-muted/50 p-6 rounded-lg">
                  <h3 className="text-xl font-medium mb-4">2.1 Teacher Responsibilities</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Maintain professional standards in all interactions</li>
                    <li>Provide accurate qualification information</li>
                    <li>Deliver quality educational content</li>
                    <li>Respect student privacy and confidentiality</li>
                    <li>Adhere to scheduled teaching commitments</li>
                  </ul>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg">
                  <h3 className="text-xl font-medium mb-4">2.2 Student Responsibilities</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Complete assignments honestly and timely</li>
                    <li>Respect intellectual property rights</li>
                    <li>Maintain appropriate behavior in all interactions</li>
                    <li>Attend scheduled sessions punctually</li>
                  </ul>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg">
                  <h3 className="text-xl font-medium mb-4">2.3 Parent Responsibilities</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Provide accurate information about children</li>
                    <li>Monitor and support children's learning</li>
                    <li>Ensure appropriate platform use by minors</li>
                    <li>Maintain timely communication</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-primary mb-6">3. Platform Rules</h2>
              <div className="space-y-6">
                <p>Users must not:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Share inappropriate or offensive content</li>
                  <li>Harass or discriminate against others</li>
                  <li>Attempt to gain unauthorized access</li>
                  <li>Use the platform for non-educational commercial purposes</li>
                  <li>Share account credentials</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-primary mb-6">4. Intellectual Property</h2>
              <div className="space-y-4">
                <p>All content on Workmate, including but not limited to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Educational materials</li>
                  <li>Course content</li>
                  <li>Platform features</li>
                  <li>Logos and branding</li>
                </ul>
                <p>are protected by copyright and other intellectual property rights.</p>
              </div>
            </section>

            <section className="border-t pt-8">
              <h2 className="text-3xl font-semibold text-primary mb-6">5. Contact</h2>
              <p className="mb-4">
                For questions about these terms, please contact our legal team:
              </p>
              <div className="bg-muted/50 p-6 rounded-lg inline-block">
                <p>Email: <a href="mailto:legal@workmateteam.com" className="text-primary hover:underline">legal@workmateteam.com</a></p>
                <p>Address: Lagos, Nigeria</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

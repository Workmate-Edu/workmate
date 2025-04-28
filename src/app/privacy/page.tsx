import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Privacy Policy | Workmate',
  description: 'Learn about our commitment to protecting your privacy and data on Workmate'
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
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
              <h2 className="text-3xl font-semibold text-primary mb-6">1. Introduction</h2>
              <p className="text-lg leading-relaxed">
                At Workmate, we take your privacy seriously. This policy describes how we collect, 
                use, and protect your personal information when you use our educational platform.
              </p>
            </section>

            <section className="space-y-6">
              <h2 className="text-3xl font-semibold text-primary">2. Information Collection</h2>
              
              <div>
                <h3 className="text-xl font-medium mb-4">2.1 Account Information</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Full name and contact details</li>
                  <li>Email address and password</li>
                  <li>Profile information and preferences</li>
                  <li>Role-specific information (student/teacher/parent)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-medium mb-4">2.2 Educational Data</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Learning progress and assessment results</li>
                  <li>Course participation and completion data</li>
                  <li>Teacher qualifications and experience</li>
                  <li>Student academic history</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-primary mb-6">3. Data Usage & Protection</h2>
              <div className="grid gap-6">
                <div className="bg-muted/50 p-6 rounded-lg">
                  <h3 className="text-xl font-medium mb-4">How We Use Your Data</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Personalize your learning experience</li>
                    <li>Match students with appropriate teachers</li>
                    <li>Track and report learning progress</li>
                    <li>Improve our educational services</li>
                    <li>Ensure platform security</li>
                  </ul>
                </div>

                <div className="bg-muted/50 p-6 rounded-lg">
                  <h3 className="text-xl font-medium mb-4">Data Protection Measures</h3>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Encryption of sensitive information</li>
                    <li>Regular security audits</li>
                    <li>Secure data storage practices</li>
                    <li>Limited employee data access</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-semibold text-primary mb-6">4. Your Rights</h2>
              <div className="space-y-4">
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate information</li>
                  <li>Request data deletion</li>
                  <li>Export your data</li>
                </ul>
              </div>
            </section>

            <section className="border-t pt-8">
              <h2 className="text-3xl font-semibold text-primary mb-6">5. Contact Us</h2>
              <p className="mb-4">
                For privacy-related inquiries, please contact our Data Protection Officer at:
              </p>
              <div className="bg-muted/50 p-6 rounded-lg inline-block">
                <p>Email: <a href="mailto:privacy@workmateteam.com" className="text-primary hover:underline">privacy@workmateteam.com</a></p>
                <p>Address: Lagos, Nigeria</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

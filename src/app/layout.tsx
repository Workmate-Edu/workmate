import "./globals.css"
import { Inter, Poppins } from "next/font/google"
import { Metadata } from "next"
import { LanguageProvider } from '../components/providers/language-provider'
import { ThemeProvider } from '../components/providers/theme-provider'
import { ThemeContextProvider } from '../hooks/use-theme-context'
import { Navbar } from '../components/navbar'
import { Footer } from '../components/footer'
import { Toaster } from 'sonner'
import { AuthProvider } from '../hooks/use-auth'
import { SessionProvider } from 'next-auth/react'
import { auth } from '@/lib/auth'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
})

export const metadata: Metadata = {
  title: 'Workmate - Your Intelligent Study Partner',
  description: 'Connect with expert teachers for personalized learning experiences',
  icons: {
    icon: [
      {
        url: '/favicon.ico',
        type: 'image/x-icon',
      },
      {
        url: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png',
      },
    ],
    apple: [
      {
        url: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  },
  manifest: '/site.webmanifest',
  themeColor: '#ffffff',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${poppins.variable} font-sans antialiased`}>
        <AuthProvider>
          <LanguageProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <ThemeContextProvider>
                <SessionProvider session={session}>
                  <Toaster />
                  <div className="relative flex min-h-screen flex-col bg-background text-foreground">
                    <Navbar />
                    <main className="flex-1">
                      {children}
                    </main>
                    <Footer />
                  </div>
                </SessionProvider>
              </ThemeContextProvider>
            </ThemeProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

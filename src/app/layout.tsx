import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "sonner"
import Nav from "@/components/nav";
import { Footer } from "@/components/footer";
import { AuthProvider } from "@/providers/auth-provider";
// import { Providers } from "@/providers/providers";
import 'react-phone-input-2/lib/style.css';
import { Providers } from "./providers";
import { NotificationProvider } from "@/contexts/notification-context"
import { PaymentProvider } from "@/providers/payment-provider"

const inter = Inter({ subsets: ["latin"] });

interface RootLayoutProps {
  children: React.ReactNode;
}

export const metadata: Metadata = {
  title: "Workmate - African Languages & STEM Education",
  description: "Learn African languages and explore Science & Technology through an African lens",
};

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://checkout.flutterwave.com/v3.js" async />
      </head>
      <body className={inter.className}>
        <Providers>
          <PaymentProvider>
            <NotificationProvider>
              <div className="relative min-h-screen flex flex-col">
                <Nav />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </NotificationProvider>
          </PaymentProvider>
          <Toaster />
          <SonnerToaster position="top-center" richColors />
        </Providers>
      </body>
    </html>
  );
}

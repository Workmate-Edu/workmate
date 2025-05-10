import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import Nav from "@/components/nav";
import { Footer } from "@/components/footer";
import { AuthProvider } from "@/providers/auth-provider";
// import { Providers } from "@/providers/providers";
import 'react-phone-input-2/lib/style.css';
import { Providers } from "./providers";
import { NotificationProvider } from "@/contexts/notification-context"

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
      <body className={inter.className}>
        <Providers>
          <NotificationProvider>
            <div className="relative min-h-screen flex flex-col">
              <Nav />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </NotificationProvider>
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}

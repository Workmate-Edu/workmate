import Link from "next/link"
import Image from "next/image";
import { Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-16 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <span className="flex items-center">
                <Image
                  src="/workmate_logo.png"
                  alt="Workmate"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
              </span>
              <span className="font-bold">WorkMate</span>
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Transforming education through personalized learning and expert teaching.
            </p>
            <div className="flex space-x-4">
              <Link href="https://facebook.com" className="text-gray-400 hover:text-primary">
                <Facebook className="h-5 w-5" />
              </Link>
              <Link href="https://twitter.com" className="text-gray-400 hover:text-primary">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="https://instagram.com" className="text-gray-400 hover:text-primary">
                <Instagram className="h-5 w-5" />
              </Link>
              <Link href="https://linkedin.com" className="text-gray-400 hover:text-primary">
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">
                  Courses
                </Link>
              </li>
              <li>
                <Link href="/subjects" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">
                  Browse Subjects
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/help" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="/safety" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">
                  Safety Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="/accessibility" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary">
                  Accessibility
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-gray-800 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {new Date().getFullYear()} WorkMate. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <Link href="mailto:contact@workmate.com" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                contact@workmate.com
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

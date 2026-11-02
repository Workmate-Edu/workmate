import Link from "next/link"
import { Globe, Atom, Users, Rocket, Heart, Stars } from "lucide-react"

export function LanguageStemSection() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">Learning Paths</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          Standard curriculum enriched with African perspectives and contemporary innovations
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-[300px]">
          {/* Languages Card */}
          <Link href="/languages" className="group no-underline h-full">
            <div className="bg-gradient-to-br from-[#FF6B6B]/90 to-[#4ECDC4]/90 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all group-hover:-translate-y-1 h-full flex flex-col text-white">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-12 h-12 text-white" />
                <div>
                  <div className="text-sm text-white/90 font-medium">Languages</div>
                  <h3 className="text-xl font-semibold">African Languages</h3>
                </div>
              </div>
              <div className="flex-grow">
                <ul className="text-white/90 space-y-4">
                  <li className="flex items-center gap-2">
                    <Stars className="w-4 h-4" />
                    <span>Fun, Interactive Learning</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span>Available languages:</span>
                  </li>
                  <li className="ml-6 text-sm grid grid-cols-2 gap-2">
                    <span>• Yoruba</span>
                    <span>• Hausa</span>
                    <span>• Igbo</span>
                    <span>• Swahili</span>
                    <span>• Arabic</span>
                  </li>
                </ul>
              </div>
            </div>
          </Link>

          {/* STEM Card */}
          <Link href="/stem" className="group no-underline h-full">
            <div className="bg-gradient-to-br from-[#6C63FF]/90 to-[#3F3D56]/90 rounded-lg p-6 shadow-lg hover:shadow-xl transition-all group-hover:-translate-y-1 h-full flex flex-col text-white">
              <div className="flex items-center gap-3 mb-6">
                <Rocket className="w-12 h-12 text-white" />
                <div>
                  <div className="text-sm text-white/90 font-medium">Science & Technology</div>
                  <h3 className="text-xl font-semibold">STEM & AI Education</h3>
                </div>
              </div>
              <div className="flex-grow">
                <ul className="text-white/90 space-y-4">
                  <li className="flex items-center gap-2">
                    <Stars className="w-4 h-4" />
                    <span>Standard Curriculum + African Innovation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Atom className="w-4 h-4" />
                    <span>Featured Areas:</span>
                  </li>
                  <li className="ml-6 text-sm grid grid-cols-2 gap-2">
                    <span>• Artificial Intelligence (AI)</span>
                    <span>• Mathematics</span>
                    <span>• Physical Sciences</span>
                    <span>• Life Sciences</span>
                  </li>
                </ul>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}

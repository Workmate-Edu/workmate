import { ArrowRight } from "lucide-react"
import { LoadingLinkButton } from "@/components/ui/loading-link-button"

export function CTASection() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold leading-[1.1]">
            Begin Your African Learning Journey
          </h2>
          <p className="max-w-[85%] leading-normal text-sm sm:text-base lg:text-lg opacity-90">
            Help your child explore African languages, STEM and AI with a teacher who fits their needs.
          </p>
          <div className="mt-8">
            <LoadingLinkButton
              href="/sign-up/parent"
              loadingText="Loading..."
              className="inline-flex h-11 items-center justify-center rounded-md bg-primary-foreground px-8 text-sm font-medium text-primary hover:bg-primary-foreground/90 transition-colors group"
            >
              Start Learning Today
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </LoadingLinkButton>
          </div>
        </div>
      </div>
    </section>
  )
}

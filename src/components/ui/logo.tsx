import Image from "next/image"
import { cn } from "@/lib/utils"

interface LogoProps {
  size?: number
  className?: string
}

export function Logo({ size = 32, className }: LogoProps) {
  return (
    <div className={cn("relative", className)} style={{ width: size, height: size }}>
      <Image
        src="/images/logo.png"
        alt="Workmate Logo"
        fill
        sizes={`${size}px`}
        className="object-contain"
        priority
      />
    </div>
  )
}

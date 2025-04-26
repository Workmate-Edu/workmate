import Link from "next/link"
import Image from "next/image"

export function Logo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <Image
        src="/images/logo.png"
        alt="Workmate Logo"
        width={32}
        height={32}
        className="rounded-lg"
      />
      <span className="font-bold text-xl">Workmate</span>
    </Link>
  )
}

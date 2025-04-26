import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 bg-white shadow-sm">
      <Link href="/" className="text-xl font-bold">
        Workmate
      </Link>

      <div className="flex items-center gap-2">
        <Link 
          href="/account/login"
          className="text-gray-600 hover:text-gray-900"
        >
          Login
        </Link>
        <Link 
          href="/account/register"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );
}

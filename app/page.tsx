import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-6">
      <img src="/logo.png" alt="ChatApp Logo" className="w-24 h-24" />
      <h1 className="text-3xl font-bold">ChatApp</h1>
      <div className="flex gap-4">
        <Link href="/sign-in" className="px-6 py-2 bg-black text-white rounded-lg">
          Sign In
        </Link>
        <Link href="/sign-up" className="px-6 py-2 border border-black rounded-lg">
          Sign Up
        </Link>
      </div>
    </div>
  );
}
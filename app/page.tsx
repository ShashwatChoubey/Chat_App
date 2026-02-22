import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F0F4FF] flex items-center justify-center px-4 relative overflow-hidden">

      {/* Decorative background blobs */}
      <div className="absolute top-[-80px] left-[-80px] w-[340px] h-[340px] bg-blue-200 rounded-full opacity-30 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-60px] w-[300px] h-[300px] bg-indigo-300 rounded-full opacity-20 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-100 rounded-full opacity-40 blur-3xl pointer-events-none" />

      {/* Card */}
      <div className="relative z-10 bg-white/70 backdrop-blur-xl border border-white/80 shadow-2xl shadow-blue-100 rounded-3xl px-8 py-12 w-full max-w-sm flex flex-col items-center gap-8">

        {/* Logo / Icon */}
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 shadow-lg shadow-blue-200">
          {/* Chat bubble SVG */}
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 8C6 5.79086 7.79086 4 10 4H30C32.2091 4 34 5.79086 34 8V24C34 26.2091 32.2091 28 30 28H22L14 36V28H10C7.79086 28 6 26.2091 6 24V8Z" fill="white" fillOpacity="0.9" />
            <circle cx="13" cy="16" r="2.5" fill="#6366F1" />
            <circle cx="20" cy="16" r="2.5" fill="#6366F1" />
            <circle cx="27" cy="16" r="2.5" fill="#6366F1" />
          </svg>
        </div>

        {/* Branding */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-800" style={{ fontFamily: "'Georgia', serif", letterSpacing: '-0.02em' }}>
            Simple Talk
          </h1>
          <p className="mt-2 text-slate-500 text-sm font-medium tracking-wide">
            Connect with your friends, instantly.
          </p>
        </div>

        {/* Decorative conversation preview */}
        <div className="w-full flex flex-col gap-2 px-1">
          <div className="flex items-end gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex-shrink-0" />
            <div className="bg-blue-100 text-slate-700 text-xs rounded-2xl rounded-bl-sm px-3 py-2 max-w-[70%] shadow-sm">
              Hey! Long time no see 👋
            </div>
          </div>
          <div className="flex items-end gap-2 flex-row-reverse">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex-shrink-0" />
            <div className="bg-indigo-500 text-white text-xs rounded-2xl rounded-br-sm px-3 py-2 max-w-[70%] shadow-sm">
              Right?! We need to catch up 😄
            </div>
          </div>
          <div className="flex items-end gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 flex-shrink-0" />
            <div className="bg-blue-100 text-slate-700 text-xs rounded-2xl rounded-bl-sm px-3 py-2 max-w-[70%] shadow-sm">
              Let's chat on Simple Talk! ❤️
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-slate-100" />

        {/* CTA Buttons */}
        <div className="w-full flex flex-col gap-3">
          <Link
            href="/sign-in"
            className="w-full text-center py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-semibold text-sm shadow-md shadow-blue-200 hover:shadow-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 active:scale-95"
          >
            Sign In
          </Link>
          <Link
            href="/sign-up"
            className="w-full text-center py-3 rounded-2xl bg-white border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 active:scale-95 shadow-sm"
          >
            Create Account
          </Link>
        </div>

        <p className="text-xs text-slate-400 text-center leading-relaxed">
          By continuing, you agree to our{" "}
          <span className="text-indigo-400 hover:underline cursor-pointer">Terms</span>{" "}
          &amp;{" "}
          <span className="text-indigo-400 hover:underline cursor-pointer">Privacy Policy</span>.
        </p>
      </div>
    </div>
  );
}
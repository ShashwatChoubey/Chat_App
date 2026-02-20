import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Chat bubble container - no background box */}
                <div className="mb-6 space-y-4">
                    {/* Welcome back message bubble - attached to page */}
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                            </svg>
                        </div>
                        <div className="flex-1">
                            <p className="text-slate-700 leading-relaxed text-lg">
                                Welcome back! 👋 Good to see you again. Let's get you signed in.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Sign in form card - ONLY box on page */}
                <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold text-slate-800 mb-2">Sign in to your account</h2>
                        <p className="text-slate-500 text-sm">Welcome back! Please enter your details</p>
                    </div>

                    <SignIn
                        appearance={{
                            elements: {
                                formButtonPrimary:
                                    "bg-blue-500 hover:bg-blue-600 text-sm normal-case",
                                card: "shadow-none",
                                headerTitle: "hidden",
                                headerSubtitle: "hidden",
                                socialButtonsBlockButton:
                                    "border-slate-200 hover:bg-slate-50 text-slate-700",
                                formFieldInput:
                                    "rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500",
                                footerActionLink:
                                    "text-blue-500 hover:text-blue-600",
                                dividerLine: "bg-slate-200",
                                dividerText: "text-slate-400 text-xs",
                                formFieldLabel: "text-slate-700 font-medium",
                                identityPreviewText: "text-slate-600",
                                formResendCodeLink: "text-blue-500 hover:text-blue-600",
                            },
                            layout: {
                                socialButtonsPlacement: "top",
                                socialButtonsVariant: "blockButton",
                            }
                        }}
                    />
                </div>

                {/* Helper message - no box */}
                <div className="mt-4 text-center">
                    <p className="text-slate-500 text-sm">
                        Don't have an account?{" "}
                        <a href="/sign-up" className="text-blue-500 hover:text-blue-600 font-medium">
                            Sign up for free
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
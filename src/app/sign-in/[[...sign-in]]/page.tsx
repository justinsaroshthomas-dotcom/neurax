import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="text-center space-y-2 mb-8">
                <div className="flex justify-center">
                    <div className="w-12 h-12 rounded-xl bg-[#00B140] flex items-center justify-center text-white font-bold text-3xl shadow-sm">
                        N
                    </div>
                </div>
                <h1 className="text-xl font-bold text-gray-900">Welcome back</h1>
                <p className="text-sm text-gray-500">Sign in to Neurax</p>
            </div>

            <SignIn fallbackRedirectUrl="/dashboard" signUpUrl="/sign-up" />
        </div>
    );
}

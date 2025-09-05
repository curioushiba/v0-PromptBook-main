import { Metadata } from "next"
import Link from "next/link"
import { SignupForm } from "@/components/auth/signup-form"
import { Rocket, Heart, Trophy } from "lucide-react"

export const metadata: Metadata = {
  title: "Sign Up - MAGE CRAFT",
  description: "Create your account to start using MAGE CRAFT",
}

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
        {/* Left Panel - Decorative */}
        <div className="hidden lg:flex flex-col justify-center relative">
          <div className="bg-gradient-to-br from-blue-500 to-purple-500 border-4 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
            {/* Floating Icons */}
            <div className="absolute top-12 left-12 animate-pulse">
              <div className="bg-cyan-400 border-3 border-black rounded-xl p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-12">
                <Rocket className="h-6 w-6" />
              </div>
            </div>
            <div className="absolute top-1/2 right-8 animate-bounce">
              <div className="bg-pink-400 border-3 border-black rounded-xl p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -rotate-12">
                <Heart className="h-6 w-6" />
              </div>
            </div>
            <div className="absolute bottom-12 right-12 animate-pulse">
              <div className="bg-yellow-400 border-3 border-black rounded-xl p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Trophy className="h-6 w-6" />
              </div>
            </div>
            
            <div className="relative z-10 text-white">
              <Link href="/" className="inline-block mb-8">
                <h2 className="text-4xl font-black tracking-tight">MAGE CRAFT</h2>
                <p className="text-sm font-bold mt-1">AI PROMPT STUDIO</p>
              </Link>
              
              <div className="space-y-6 mt-12">
                <div className="bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl p-6">
                  <h3 className="text-2xl font-black mb-4">JOIN THE COMMUNITY</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3">
                      <div className="bg-yellow-400 text-black font-black rounded-lg px-2 py-1 text-xs">NEW</div>
                      <span className="font-bold">Access 1000+ Premium Prompts</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="bg-pink-400 text-black font-black rounded-lg px-2 py-1 text-xs">HOT</div>
                      <span className="font-bold">Share & Collaborate with Creators</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <div className="bg-cyan-400 text-black font-black rounded-lg px-2 py-1 text-xs">PRO</div>
                      <span className="font-bold">Advanced AI Studio Features</span>
                    </li>
                  </ul>
                </div>
                
                <div className="flex gap-4 justify-center">
                  <div className="text-center">
                    <div className="text-3xl font-black">10K+</div>
                    <div className="text-xs font-bold opacity-80">CREATORS</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black">50K+</div>
                    <div className="text-xs font-bold opacity-80">PROMPTS</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-black">100+</div>
                    <div className="text-xs font-bold opacity-80">STUDIOS</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Signup Form */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="backdrop-blur-xl bg-white/40 border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
              <div className="text-center mb-8">
                <div className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-2 rounded-xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4">
                  <h1 className="text-3xl font-black">START CREATING!</h1>
                </div>
                <p className="font-bold text-gray-700 mt-2">
                  Join thousands of prompt engineers
                </p>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl border-3 border-black p-6">
                <SignupForm />
              </div>

              <div className="mt-6 p-4 bg-yellow-100 border-2 border-yellow-400 rounded-xl">
                <p className="text-xs text-center font-semibold text-gray-700">
                  By signing up, you agree to our{" "}
                  <Link href="/terms" className="text-blue-600 hover:underline font-bold">
                    Terms
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-blue-600 hover:underline font-bold">
                    Privacy Policy
                  </Link>
                </p>
              </div>

              {/* Mobile Logo */}
              <div className="lg:hidden text-center mt-6">
                <Link href="/" className="text-sm font-bold text-gray-600 hover:text-gray-900">
                  ← Back to MAGE CRAFT
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
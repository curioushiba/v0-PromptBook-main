import { Metadata } from "next"
import Link from "next/link"
import { LoginForm } from "@/components/auth/login-form"
import { Sparkles, Zap, Star } from "lucide-react"

export const metadata: Metadata = {
  title: "Login - MAGE CRAFT",
  description: "Sign in to your MAGE CRAFT account",
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">
        {/* Left Panel - Decorative */}
        <div className="hidden lg:flex flex-col justify-center relative">
          <div className="bg-gradient-to-br from-purple-500 to-blue-500 border-4 border-black rounded-3xl p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
            {/* Floating Icons */}
            <div className="absolute top-8 right-8 animate-bounce">
              <div className="bg-yellow-400 border-3 border-black rounded-xl p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Sparkles className="h-6 w-6" />
              </div>
            </div>
            <div className="absolute bottom-8 left-8 animate-pulse">
              <div className="bg-pink-400 border-3 border-black rounded-xl p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Zap className="h-6 w-6" />
              </div>
            </div>
            
            <div className="relative z-10 text-white">
              <Link href="/" className="inline-block mb-8">
                <h2 className="text-4xl font-black tracking-tight">MAGE CRAFT</h2>
                <p className="text-sm font-bold mt-1">AI PROMPT STUDIO</p>
              </Link>
              
              <div className="space-y-6 mt-12">
                <div className="bg-white/20 backdrop-blur-sm border-2 border-white/30 rounded-xl p-6">
                  <Star className="h-6 w-6 mb-3" />
                  <blockquote className="text-lg font-bold">
                    "Transform your ideas into powerful AI prompts with our intuitive studio interface."
                  </blockquote>
                  <footer className="text-sm mt-3 font-semibold">— The MAGE CRAFT Team</footer>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-yellow-400 border-2 border-black rounded-lg p-2 text-black text-center font-bold text-xs">
                    CREATE
                  </div>
                  <div className="bg-pink-400 border-2 border-black rounded-lg p-2 text-black text-center font-bold text-xs">
                    SHARE
                  </div>
                  <div className="bg-cyan-400 border-2 border-black rounded-lg p-2 text-black text-center font-bold text-xs">
                    INSPIRE
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md">
            <div className="backdrop-blur-xl bg-white/40 border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
              <div className="text-center mb-8">
                <div className="inline-block bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-xl border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4">
                  <h1 className="text-3xl font-black">WELCOME BACK!</h1>
                </div>
                <p className="font-bold text-gray-700 mt-2">
                  Sign in to continue your creative journey
                </p>
              </div>
              
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl border-3 border-black p-6">
                <LoginForm />
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
import { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Sparkles } from "lucide-react"

import { serverAuth } from "@/lib/supabase/auth"
import { LoginForm } from "@/components/auth/login-form"

export const metadata: Metadata = {
  title: "Login - Mage Craft",
  description: "Sign in to your Mage Craft account",
}

export default async function LoginPage() {
  // Check if user is already logged in
  const { user } = await serverAuth.getUser()
  
  if (user) {
    redirect("/")
  }

  return (
    <div className="container relative min-h-screen flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100 -z-10" />
      
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[400px]">
        <div className="flex flex-col space-y-4 text-center">
          <Link href="/" className="mx-auto">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tight">
                Mage Craft
              </h1>
            </div>
          </Link>
          
          <div>
            <h2 className="text-2xl font-black uppercase">Welcome Back</h2>
            <p className="text-sm text-muted-foreground font-medium">
              Enter your credentials to access your prompt library
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <LoginForm />
        </div>

        <p className="px-8 text-center text-xs text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-primary font-bold"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-primary font-bold"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
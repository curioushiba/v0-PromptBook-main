"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"

import { auth } from "@/lib/supabase/auth"
import { signupSchema, type SignupFormData } from "@/lib/validations/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      acceptTerms: false,
    },
  })

  const password = form.watch("password")
  
  // Password strength calculator
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0
    if (password.length >= 8) strength += 25
    if (password.length >= 12) strength += 25
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25
    if (/\d/.test(password)) strength += 12.5
    if (/[^a-zA-Z\d]/.test(password)) strength += 12.5
    return strength
  }

  const passwordStrength = calculatePasswordStrength(password)
  
  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return "bg-red-500"
    if (passwordStrength < 70) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength < 40) return "Weak"
    if (passwordStrength < 70) return "Fair"
    return "Strong"
  }

  async function onSubmit(data: SignupFormData) {
    setIsLoading(true)
    setError(null)

    try {
      const result = await auth.signUp(data.email, data.password, {
        firstName: data.fullName?.split(" ")[0],
        lastName: data.fullName?.split(" ").slice(1).join(" "),
      })
      
      if (result.error) {
        setError(result.error.message)
        toast.error("Signup failed", {
          description: result.error.message,
        })
        return
      }

      // Show success message with email confirmation instructions
      toast.success("Account created successfully!", {
        description: "Please check your email to confirm your account before logging in.",
      })

      // Redirect to login with message about email confirmation
      router.push("/login?message=Please+check+your+email+to+confirm+your+account")
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      toast.error("Error", {
        description: "An unexpected error occurred. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="John Doe"
                    autoComplete="name"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    autoComplete="email"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                {password && (
                  <div className="space-y-2">
                    <Progress value={passwordStrength} className="h-2" />
                    <p className="text-xs font-bold">
                      Password strength: <span className={getPasswordStrengthColor().replace("bg-", "text-")}>{getPasswordStrengthText()}</span>
                    </p>
                    <ul className="text-xs space-y-1">
                      <li className="flex items-center gap-1">
                        {password.length >= 8 ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-gray-400" />
                        )}
                        <span>At least 8 characters</span>
                      </li>
                      <li className="flex items-center gap-1">
                        {/[A-Z]/.test(password) && /[a-z]/.test(password) ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-gray-400" />
                        )}
                        <span>Uppercase and lowercase letters</span>
                      </li>
                      <li className="flex items-center gap-1">
                        {/\d/.test(password) ? (
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-gray-400" />
                        )}
                        <span>At least one number</span>
                      </li>
                    </ul>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirm your password"
                    autoComplete="new-password"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="acceptTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-medium cursor-pointer">
                    I accept the{" "}
                    <Link
                      href="/terms"
                      className="underline underline-offset-4 hover:text-primary"
                    >
                      terms and conditions
                    </Link>
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm">
        <span className="text-muted-foreground">Already have an account? </span>
        <Link
          href="/login"
          className="font-bold text-primary underline-offset-4 hover:underline"
        >
          Sign in
        </Link>
      </div>
    </div>
  )
}
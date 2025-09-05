"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ChevronDown, Home, FileText, Folder, Clock, Heart, Menu, X, Settings, LogOut, User as UserIcon } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { auth } from "@/lib/supabase/auth"
import { toast } from "sonner"
import type { User } from "@supabase/supabase-js"

export default function NavigationBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  // Listen for auth changes
  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setIsLoading(false)
    }

    getUser()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
      
      if (event === 'SIGNED_IN') {
        router.push('/')
        router.refresh()
      } else if (event === 'SIGNED_OUT') {
        router.push('/login')
        router.refresh()
      }
    })

    return () => subscription.unsubscribe()
  }, [router, supabase])

  const handleSignOut = async () => {
    try {
      const { error } = await auth.signOut()
      if (error) {
        toast.error("Error signing out", {
          description: error.message,
        })
        return
      }
      
      toast.success("Signed out successfully")
      setIsMobileMenuOpen(false)
    } catch (err) {
      toast.error("Error signing out", {
        description: "An unexpected error occurred",
      })
    }
  }

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name
    }
    if (user?.email) {
      return user.email.split('@')[0]
    }
    return "User"
  }

  const getUserInitials = () => {
    const displayName = getUserDisplayName()
    return displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  // Show nothing while loading
  if (isLoading) {
    return null
  }

  // Show auth buttons for non-authenticated users
  if (!user) {
    return (
      <nav className="flex items-center gap-4">
        <Link href="/login">
          <Button
            variant="outline"
            className="rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all bg-transparent"
          >
            Sign In
          </Button>
        </Link>
        <Link href="/signup">
          <Button
            className="rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all bg-black text-white hover:bg-gray-800"
          >
            Sign Up
          </Button>
        </Link>
      </nav>
    )
  }

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center gap-2 sm:gap-4">
        {/* Home */}
        <Link href="/">
          <Button
            variant="outline"
            className="flex items-center gap-2 rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all bg-transparent"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Button>
        </Link>

        {/* My Prompts Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all bg-transparent"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">My Prompts</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white"
            align="start"
          >
            <Link href="/recent">
              <DropdownMenuItem className="flex items-center gap-2 font-bold hover:bg-black hover:text-white rounded-lg m-1 cursor-pointer">
                <Clock className="h-4 w-4" />
                Recent Prompts
              </DropdownMenuItem>
            </Link>
            <Link href="/favorites">
              <DropdownMenuItem className="flex items-center gap-2 font-bold hover:bg-black hover:text-white rounded-lg m-1 cursor-pointer">
                <Heart className="h-4 w-4" />
                My Favorite Prompts
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Prompt Folders */}
        <Link href="/folders">
          <Button
            variant="outline"
            className="flex items-center gap-2 rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all bg-transparent"
          >
            <Folder className="h-4 w-4" />
            <span className="hidden sm:inline">Prompt Folders</span>
          </Button>
        </Link>

        {/* Settings */}
        <Link href="/settings">
          <Button
            variant="outline"
            className="flex items-center gap-2 rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all bg-transparent"
          >
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
        </Link>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all bg-transparent h-10"
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:inline max-w-24 truncate">
                {getUserDisplayName()}
              </span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white"
            align="end"
          >
            <div className="flex items-center gap-2 p-2 border-b border-gray-200">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-bold">{getUserDisplayName()}</span>
                <span className="text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </div>
            <Link href="/settings">
              <DropdownMenuItem className="flex items-center gap-2 font-bold hover:bg-black hover:text-white rounded-lg m-1 cursor-pointer">
                <Settings className="h-4 w-4" />
                Settings
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="flex items-center gap-2 font-bold hover:bg-red-500 hover:text-white rounded-lg m-1 cursor-pointer text-red-600"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden flex items-center gap-2">
        {/* User Avatar on Mobile */}
        <Avatar className="h-8 w-8">
          <AvatarImage src={user?.user_metadata?.avatar_url} />
          <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
            {getUserInitials()}
          </AvatarFallback>
        </Avatar>

        <Button
          variant="outline"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center gap-2 rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all bg-transparent"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-white border-2 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mx-4 z-50">
            <div className="p-4 space-y-3">
              {/* User Info Section */}
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-bold">{getUserDisplayName()}</span>
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                </div>
              </div>

              <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 rounded-xl font-bold hover:bg-black hover:text-white"
                >
                  <Home className="h-5 w-5" />
                  Home
                </Button>
              </Link>

              <div className="space-y-2">
                <div className="flex items-center gap-3 px-4 py-2 font-bold text-sm text-gray-600">
                  <FileText className="h-5 w-5" />
                  My Prompts
                </div>
                <Link href="/recent" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 rounded-xl font-bold hover:bg-black hover:text-white ml-4"
                  >
                    <Clock className="h-4 w-4" />
                    Recent Prompts
                  </Button>
                </Link>
                <Link href="/favorites" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 rounded-xl font-bold hover:bg-black hover:text-white ml-4"
                  >
                    <Heart className="h-4 w-4" />
                    My Favorite Prompts
                  </Button>
                </Link>
              </div>

              <Link href="/folders" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 rounded-xl font-bold hover:bg-black hover:text-white"
                >
                  <Folder className="h-5 w-5" />
                  Prompt Folders
                </Button>
              </Link>

              {/* Settings */}
              <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 rounded-xl font-bold hover:bg-black hover:text-white"
                >
                  <Settings className="h-5 w-5" />
                  Settings
                </Button>
              </Link>

              {/* Sign Out */}
              <Button
                variant="ghost"
                onClick={handleSignOut}
                className="w-full justify-start gap-3 rounded-xl font-bold hover:bg-red-500 hover:text-white text-red-600"
              >
                <LogOut className="h-5 w-5" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

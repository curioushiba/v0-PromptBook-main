"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown, Home, FileText, Folder, Clock, Heart, Menu, X, Settings } from "lucide-react"

export default function NavigationBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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
            <DropdownMenuItem className="flex items-center gap-2 font-bold hover:bg-black hover:text-white rounded-lg m-1">
              <Clock className="h-4 w-4" />
              Recent Prompts
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2 font-bold hover:bg-black hover:text-white rounded-lg m-1">
              <Heart className="h-4 w-4" />
              Favorite Prompts
            </DropdownMenuItem>
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
      </nav>

      {/* Mobile Navigation */}
      <div className="md:hidden">
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
                    My Favorite Prompt
                  </Button>
                </Link>
              </div>

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
            </div>
          </div>
        )}
      </div>
    </>
  )
}

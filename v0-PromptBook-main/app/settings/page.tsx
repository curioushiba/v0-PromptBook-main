"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Moon, Sun, LogOut, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const handleSignOut = () => {
    // Add sign out logic here
    console.log("User signed out")
    // You can add actual authentication logic here
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    // Add theme switching logic here
    document.documentElement.classList.toggle("dark")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-blue-100 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button
              variant="outline"
              size="icon"
              className="rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all bg-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-4xl font-black text-black">SETTINGS</h1>
        </div>

        <div className="space-y-6">
          {/* Appearance Settings */}
          <Card className="border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
            <CardHeader>
              <CardTitle className="text-2xl font-black flex items-center gap-2 text-black">
                {isDarkMode ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
                APPEARANCE
              </CardTitle>
              <CardDescription className="text-lg font-bold text-gray-600">
                Customize your visual experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="theme-toggle" className="text-lg font-bold text-black">
                    {isDarkMode ? "DARK MODE" : "LIGHT MODE"}
                  </Label>
                  <p className="text-sm text-gray-600 font-medium">Switch between light and dark themes</p>
                </div>
                <Switch
                  id="theme-toggle"
                  checked={isDarkMode}
                  onCheckedChange={toggleTheme}
                  className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-200"
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Settings */}
          <Card className="border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
            <CardHeader>
              <CardTitle className="text-2xl font-black flex items-center gap-2 text-black">
                <LogOut className="h-6 w-6" />
                ACCOUNT
              </CardTitle>
              <CardDescription className="text-lg font-bold text-gray-600">
                Manage your account settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Separator className="my-4 bg-black h-0.5" />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label className="text-lg font-bold text-red-600">SIGN OUT</Label>
                    <p className="text-sm text-gray-600 font-medium">Sign out of your account</p>
                  </div>
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="bg-red-500 hover:bg-red-600 text-white border-2 border-black rounded-xl font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    SIGN OUT
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Settings */}
          
        </div>
      </div>
    </div>
  )
}

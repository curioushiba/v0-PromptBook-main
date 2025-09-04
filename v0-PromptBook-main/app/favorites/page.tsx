"use client"

import { useState } from "react"
import { Copy, Heart, MoreVertical, Menu } from "lucide-react"
import MobileNavigation from "@/components/mobile-navigation"
import SearchBar from "@/components/search-bar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

export default function FavoritePromptsPage() {
  const [favoritePrompts] = useState([
    {
      id: 1,
      title: "Marketing Copy Generator",
      description: "Create compelling marketing copy for social media campaigns",
      emoji: "📝",
      favoritedAt: "2024-01-14T12:00:00Z",
      role: "Marketing Copywriter",
      instruction: "Generate engaging social media posts",
      context: "For a tech startup launching a new app",
      example: "🚀 Ready to revolutionize your workflow? Our new app...",
    },
    {
      id: 2,
      title: "Creative Story Writer",
      description: "Generate creative short stories and narratives",
      emoji: "📚",
      favoritedAt: "2024-01-13T16:30:00Z",
      role: "Creative Writer",
      instruction: "Write engaging short stories",
      context: "Fantasy genre with magical elements",
      example: "In the depths of the Whispering Woods...",
    },
    {
      id: 3,
      title: "Learning Tutor",
      description: "Explain complex topics in simple terms",
      emoji: "🎓",
      favoritedAt: "2024-01-12T09:45:00Z",
      role: "Educational Tutor",
      instruction: "Break down complex concepts into digestible parts",
      context: "Teaching advanced mathematics to high school students",
      example: "Let's think of calculus like...",
    },
    {
      id: 4,
      title: "Recipe Creator",
      description: "Create delicious and healthy recipe suggestions",
      emoji: "🍳",
      favoritedAt: "2024-01-11T14:20:00Z",
      role: "Chef",
      instruction: "Create healthy meal recipes",
      context: "Mediterranean diet with seasonal ingredients",
      example: "Mediterranean Quinoa Bowl with...",
    },
  ])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "Favorited 1 day ago"
    if (diffDays < 7) return `Favorited ${diffDays} days ago`
    if (diffDays < 30) return `Favorited ${Math.ceil(diffDays / 7)} weeks ago`
    return `Favorited ${Math.ceil(diffDays / 30)} months ago`
  }

  const handleSearch = (query: string) => {
    console.log("Searching favorite prompts for:", query)
    // TODO: Implement search logic for favorite prompts
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-black mb-2">MY FAVORITE PROMPTS</h1>
            <p className="text-gray-600 text-lg">Your most loved prompts, saved for quick access</p>
          </div>

          <div className="flex items-center gap-3">
            <SearchBar placeholder="Search favorite prompts..." onSearch={handleSearch} />

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-xl border-2 border-black bg-transparent">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="border-r-4 border-black p-0">
                <MobileNavigation />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Favorites Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favoritePrompts.map((prompt) => (
            <div
              key={prompt.id}
              className="bg-white border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_#000] hover:shadow-[12px_12px_0px_0px_#000] transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-400 to-pink-500 rounded-xl border-2 border-black flex items-center justify-center text-2xl">
                    {prompt.emoji}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-black leading-tight">{prompt.title}</h3>
                    <p className="text-sm text-gray-600">{formatDate(prompt.favoritedAt)}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Favorite Badge */}
              <div className="flex items-center gap-2 mb-3">
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-full border border-red-300">
                  FAVORITE
                </span>
              </div>

              {/* Description */}
              <p className="text-gray-700 mb-4 text-sm leading-relaxed">{prompt.description}</p>

              {/* Prompt Details Preview */}
              <div className="space-y-2 mb-4">
                <div className="text-xs">
                  <span className="font-bold text-gray-800">ROLE:</span>
                  <span className="text-gray-600 ml-1">{prompt.role}</span>
                </div>
                <div className="text-xs">
                  <span className="font-bold text-gray-800">INSTRUCTION:</span>
                  <span className="text-gray-600 ml-1">{prompt.instruction.substring(0, 50)}...</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 flex items-center justify-center gap-2">
                  <Copy className="w-4 h-4" />
                  Copy
                </button>
                <button className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 flex items-center justify-center">
                  <Heart className="w-4 h-4 fill-white" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State (if no favorites) */}
        {favoritePrompts.length === 0 && (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">No Favorite Prompts Yet</h3>
            <p className="text-gray-500">Start favoriting prompts to see them here!</p>
          </div>
        )}
      </div>
    </div>
  )
}

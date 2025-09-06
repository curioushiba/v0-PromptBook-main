"use client"

import { useState, useEffect } from "react"
import { Copy, Heart, MoreVertical, Menu, Loader2 } from "lucide-react"
import MobileNavigation from "@/components/mobile-navigation"
import SearchBar from "@/components/search-bar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { prompts } from "@/lib/api/prompts"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function FavoritePromptsPage() {
  const router = useRouter()
  const [favoritePrompts, setFavoritePrompts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Load favorite prompts from Supabase
  useEffect(() => {
    loadFavoritePrompts()
  }, [])

  const loadFavoritePrompts = async () => {
    try {
      setIsLoading(true)
      const favorites = await prompts.getFavorites()
      setFavoritePrompts(favorites)
    } catch (error) {
      console.error("Failed to load favorite prompts:", error)
      toast.error("Failed to load favorites", {
        description: error instanceof Error ? error.message : "Please try again later"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Toggle favorite status
  const handleToggleFavorite = async (promptId: string) => {
    try {
      await prompts.toggleFavorite(promptId)
      // Reload the favorites list
      await loadFavoritePrompts()
      toast.success("Removed from favorites")
    } catch (error) {
      toast.error("Failed to update favorite status")
    }
  }

  // Copy prompt to clipboard
  const handleCopyPrompt = async (prompt: any) => {
    try {
      const promptText = prompt.meta_prompt || `${prompt.role_field}\n\n${prompt.instruction_field}`
      await navigator.clipboard.writeText(promptText)
      toast.success("Copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy prompt")
    }
  }

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
    setSearchQuery(query)
    // Filter prompts based on search query
    if (query.trim()) {
      const filtered = favoritePrompts.filter(prompt => 
        prompt.title?.toLowerCase().includes(query.toLowerCase()) ||
        prompt.role_field?.toLowerCase().includes(query.toLowerCase()) ||
        prompt.instruction_field?.toLowerCase().includes(query.toLowerCase())
      )
      // For now, just update the display - you could update state here
    }
  }

  // Get emoji for prompt (use a default if not available)
  const getPromptEmoji = (prompt: any) => {
    // You can map different roles to emojis or use a default
    const roleEmojis: { [key: string]: string } = {
      'writer': '✍️',
      'developer': '💻',
      'designer': '🎨',
      'teacher': '🎓',
      'chef': '🍳',
      'poet': '📝',
      'marketing': '📈'
    }
    
    const role = prompt.role_field?.toLowerCase() || ''
    for (const [key, emoji] of Object.entries(roleEmojis)) {
      if (role.includes(key)) return emoji
    }
    return '✨' // Default emoji
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

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading favorites...</span>
          </div>
        )}

        {/* Favorites Grid */}
        {!isLoading && (
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
                      {getPromptEmoji(prompt)}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-black leading-tight">{prompt.title}</h3>
                      <p className="text-sm text-gray-600">{formatDate(prompt.updated_at || prompt.created_at)}</p>
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
                <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                  {prompt.instruction_field?.substring(0, 100)}...
                </p>

                {/* Prompt Details Preview */}
                <div className="space-y-2 mb-4">
                  <div className="text-xs">
                    <span className="font-bold text-gray-800">ROLE:</span>
                    <span className="text-gray-600 ml-1">{prompt.role_field}</span>
                  </div>
                  {prompt.context_field && (
                    <div className="text-xs">
                      <span className="font-bold text-gray-800">CONTEXT:</span>
                      <span className="text-gray-600 ml-1">{prompt.context_field.substring(0, 50)}...</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleCopyPrompt(prompt)}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                  <button 
                    onClick={() => handleToggleFavorite(prompt.id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 flex items-center justify-center"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State (if no favorites) */}
        {!isLoading && favoritePrompts.length === 0 && (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-600 mb-2">No Favorite Prompts Yet</h3>
            <p className="text-gray-500 mb-4">Start saving prompts to see them here!</p>
            <Button 
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold"
            >
              Create Your First Prompt
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

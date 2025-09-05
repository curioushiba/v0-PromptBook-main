"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Menu, Plus, Heart, Copy, Edit3, ChevronLeft, ChevronRight } from "lucide-react"
import NavigationBar from "@/components/navigation-bar"
import MobileNavigation from "@/components/mobile-navigation"
import SearchBar from "@/components/search-bar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PromptEditor } from "@/components/prompt-editor/prompt-editor"
import { type PromptFormData } from "@/lib/validations/prompt"
import { toast } from "sonner"

export default function Dashboard() {
  const [myPromptsIndex, setMyPromptsIndex] = useState(0)
  const [favoritePromptsIndex, setFavoritePromptsIndex] = useState(0)
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
  const [selectedPromptForFolder, setSelectedPromptForFolder] = useState<number | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null)
  const [prompts, setPrompts] = useState<any[]>([])
  const [favoritePrompts, setFavoritePrompts] = useState<any[]>([])
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(true)
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true)

  const myPrompts = [
    {
      emoji: "📝",
      title: "Content Writer",
      description: "Create engaging blog posts about technology trends...",
      time: "Created 2 hours ago",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      emoji: "🎨",
      title: "Creative Director",
      description: "Design innovative marketing campaigns for social media...",
      time: "Created 1 day ago",
      gradient: "from-blue-400 to-blue-500",
    },
    {
      emoji: "💼",
      title: "Business Analyst",
      description: "Analyze market trends and provide strategic insights...",
      time: "Created 3 days ago",
      gradient: "from-blue-600 to-blue-700",
    },
  ]

  const availableFolders = [
    { id: "work", name: "Work Projects", color: "from-blue-500 to-blue-600" },
    { id: "personal", name: "Personal", color: "from-green-500 to-emerald-500" },
    { id: "creative", name: "Creative Ideas", color: "from-purple-500 to-pink-500" },
    { id: "business", name: "Business Strategy", color: "from-orange-500 to-red-500" },
  ]

  const favoritePrompts = [
    {
      emoji: "🚀",
      title: "Product Launch Expert",
      description: "Create compelling product launch strategies and messaging...",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      emoji: "📊",
      title: "Data Storyteller",
      description: "Transform complex data into engaging narratives and insights...",
      gradient: "from-orange-500 to-red-500",
    },
    {
      emoji: "🎯",
      title: "Marketing Strategist",
      description: "Develop comprehensive marketing strategies for digital campaigns...",
      gradient: "from-indigo-500 to-purple-500",
    },
  ]

  // Load prompts from database
  const loadPrompts = useCallback(async () => {
    try {
      setIsLoadingPrompts(true)
      const response = await fetch('/api/prompts?limit=10')
      
      if (!response.ok) {
        throw new Error('Failed to load prompts')
      }

      const data = await response.json()
      setPrompts(data.prompts || [])
    } catch (error) {
      console.error('Error loading prompts:', error)
      toast.error("Failed to load prompts", {
        description: "Could not load your recent prompts."
      })
    } finally {
      setIsLoadingPrompts(false)
    }
  }, [])

  // Load favorite prompts from database
  const loadFavoritePrompts = useCallback(async () => {
    try {
      setIsLoadingFavorites(true)
      const response = await fetch('/api/prompts?isFavorite=true&limit=10')
      
      if (!response.ok) {
        throw new Error('Failed to load favorite prompts')
      }

      const data = await response.json()
      setFavoritePrompts(data.prompts || [])
    } catch (error) {
      console.error('Error loading favorite prompts:', error)
      toast.error("Failed to load favorites", {
        description: "Could not load your favorite prompts."
      })
    } finally {
      setIsLoadingFavorites(false)
    }
  }, [])

  // Load data on component mount
  useEffect(() => {
    loadPrompts()
    loadFavoritePrompts()
  }, [])

  // Helper function to format database prompt for UI
  const formatPromptForUI = (prompt: any) => {
    // Generate a simple emoji based on the title or use default
    const getEmojiFromTitle = (title: string) => {
      const lowercaseTitle = title.toLowerCase()
      if (lowercaseTitle.includes('writer') || lowercaseTitle.includes('content')) return "📝"
      if (lowercaseTitle.includes('creative') || lowercaseTitle.includes('design')) return "🎨"
      if (lowercaseTitle.includes('business') || lowercaseTitle.includes('analyst')) return "💼"
      if (lowercaseTitle.includes('marketing') || lowercaseTitle.includes('strategy')) return "🎯"
      if (lowercaseTitle.includes('data') || lowercaseTitle.includes('research')) return "📊"
      if (lowercaseTitle.includes('product') || lowercaseTitle.includes('launch')) return "🚀"
      return "✨" // Default emoji
    }

    // Generate gradient based on prompt ID or title
    const gradients = [
      "from-purple-500 to-pink-500",
      "from-blue-400 to-blue-500", 
      "from-blue-600 to-blue-700",
      "from-green-500 to-emerald-500",
      "from-orange-500 to-red-500",
      "from-indigo-500 to-purple-500"
    ]
    const gradientIndex = prompt.id ? prompt.id.length % gradients.length : 0

    return {
      id: prompt.id,
      emoji: getEmojiFromTitle(prompt.title),
      title: prompt.title,
      description: prompt.meta_prompt?.substring(0, 100) + "..." || "No description available",
      time: `Created ${new Date(prompt.created_at).toLocaleDateString()}`,
      gradient: gradients[gradientIndex],
      isFavorite: prompt.is_favorite,
      usageCount: prompt.usage_count || 0
    }
  }

  const handleSearch = (query: string) => {
    console.log("Searching for:", query)
    // TODO: Implement search logic
  }

  const handleAddToFolder = (promptIndex: number) => {
    setSelectedPromptForFolder(promptIndex)
    setIsFolderModalOpen(true)
  }

  const handleSaveToFolder = (folderId: string) => {
    console.log(`Saving prompt ${selectedPromptForFolder} to folder ${folderId}`)
    // TODO: Implement save to folder logic
    setIsFolderModalOpen(false)
    setSelectedPromptForFolder(null)
  }

  // Handle copying prompt to clipboard
  const handleCopyPrompt = useCallback(async (prompt: any) => {
    try {
      const formattedPrompt = formatPromptForUI(prompt)
      await navigator.clipboard.writeText(prompt.meta_prompt || formattedPrompt.description)
      
      toast.success("Copied to clipboard!", {
        description: "The prompt has been copied to your clipboard."
      })
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      toast.error("Copy failed", {
        description: "Could not copy to clipboard. Please try again."
      })
    }
  }, [])

  // Handle toggling favorite status
  const handleToggleFavorite = useCallback(async (prompt: any) => {
    try {
      const response = await fetch(`/api/prompts/${prompt.id}/favorite`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to toggle favorite')
      }

      const result = await response.json()
      
      // Update the prompts lists
      setPrompts(prev => 
        prev.map(p => 
          p.id === prompt.id 
            ? { ...p, is_favorite: result.isFavorite }
            : p
        )
      )

      // If we're updating a favorite, also refresh the favorites list
      if (result.isFavorite) {
        // Add to favorites
        setFavoritePrompts(prev => [result.prompt, ...prev])
        toast.success("Added to favorites!", {
          description: "This prompt has been added to your favorites."
        })
      } else {
        // Remove from favorites
        setFavoritePrompts(prev => prev.filter(p => p.id !== prompt.id))
        toast.success("Removed from favorites", {
          description: "This prompt has been removed from your favorites."
        })
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error("Failed to update favorite", {
        description: "Could not update favorite status. Please try again."
      })
    }
  }, [])

  // Handle showing folder selection dialog
  const handleShowFolderDialog = useCallback((promptIndex: number) => {
    setSelectedPromptForFolder(promptIndex)
    setIsFolderModalOpen(true)
  }, [])

  const handleGeneratePrompt = useCallback(async (data: PromptFormData): Promise<string> => {
    setIsGenerating(true)
    
    try {
      const response = await fetch('/api/prompts/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: data.role,
          personality: data.personality,
          instruction: data.instruction,
          context: data.context,
          example: data.example,
          title: data.title,
          provider: 'openai' // Default to OpenAI, could be configurable
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate prompt')
      }

      const result = await response.json()
      setGeneratedPrompt(result.metaPrompt)
      
      toast.success("Meta prompt generated!", {
        description: "Your structured prompt has been enhanced with AI."
      })

      return result.metaPrompt
    } catch (error) {
      console.error('Error generating prompt:', error)
      toast.error("Generation failed", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      })
      throw error
    } finally {
      setIsGenerating(false)
    }
  }, [])

  const handleSavePrompt = useCallback(async (prompt: PromptFormData & { metaPrompt: string }) => {
    try {
      const response = await fetch('/api/prompts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: prompt.title || 'Untitled Prompt',
          role: prompt.role,
          personality: prompt.personality,
          instruction: prompt.instruction,
          context: prompt.context,
          example: prompt.example,
          metaPrompt: prompt.metaPrompt,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save prompt')
      }

      const result = await response.json()
      
      toast.success("Prompt saved!", {
        description: "Your prompt has been saved to your library."
      })

      // Refresh the prompts list to show the new prompt
      await loadPrompts()
      console.log('Saved prompt:', result.prompt)
    } catch (error) {
      console.error('Error saving prompt:', error)
      toast.error("Save failed", {
        description: error instanceof Error ? error.message : "Failed to save your prompt. Please try again."
      })
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-2 sm:p-4 md:p-8">
      {/* Glassmorphic container */}
      <div className="w-full max-w-7xl mx-auto backdrop-blur-xl bg-white/30 border-4 border-black rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        {/* Header */}
        <header className="border-b-4 border-black p-4 sm:p-6 bg-white/40 backdrop-blur-md">
          <div className="flex justify-between items-center gap-4">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight">MAGE CRAFT</h1>

            <div className="hidden md:flex">
              <NavigationBar />
            </div>

            <div className="flex items-center gap-3">
              <SearchBar placeholder="Search prompts..." onSearch={handleSearch} />

              {/* Mobile menu */}
              <div className="flex md:hidden">
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

            {/* Desktop buttons */}
            <div className="hidden sm:flex items-center gap-3">
              <Button className="bg-black hover:bg-black/80 text-white rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                Sign In
              </Button>
              <Button
                variant="outline"
                className="rounded-xl border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-transparent"
              >
                Settings
              </Button>
            </div>
          </div>
        </header>

        <div className="overflow-auto p-4 sm:p-6">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-black">MY PROMPTS</h2>
              <div className="flex md:hidden items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMyPromptsIndex(Math.max(0, myPromptsIndex - 1))}
                  disabled={myPromptsIndex === 0 || isLoadingPrompts}
                  className="rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-bold">
                  {isLoadingPrompts ? "-/-" : `${myPromptsIndex + 1}/${prompts.length + 1}`}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMyPromptsIndex(Math.min(prompts.length, myPromptsIndex + 1))}
                  disabled={myPromptsIndex === prompts.length || isLoadingPrompts}
                  className="rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="md:hidden">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${myPromptsIndex * 100}%)` }}
                >
                  {isLoadingPrompts ? (
                    // Loading skeleton for mobile
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="w-full flex-shrink-0 px-2">
                        <div className="bg-gray-200 border-4 border-black rounded-xl p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-pulse">
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-8 h-8 bg-gray-300 rounded"></div>
                            <div className="flex gap-2">
                              <div className="w-6 h-6 bg-gray-300 rounded"></div>
                              <div className="w-6 h-6 bg-gray-300 rounded"></div>
                              <div className="w-6 h-6 bg-gray-300 rounded"></div>
                            </div>
                          </div>
                          <div className="w-3/4 h-6 bg-gray-300 rounded mb-2"></div>
                          <div className="w-full h-4 bg-gray-300 rounded mb-1"></div>
                          <div className="w-2/3 h-4 bg-gray-300 rounded"></div>
                        </div>
                      </div>
                    ))
                  ) : prompts.length > 0 ? (
                    prompts.map((prompt, index) => {
                      const formattedPrompt = formatPromptForUI(prompt)
                      return (
                      <div key={formattedPrompt.id} className="w-full flex-shrink-0 px-2">
                        <div
                          className={`bg-gradient-to-br ${formattedPrompt.gradient} border-4 border-black rounded-xl p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-white`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-2xl">{formattedPrompt.emoji}</span>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-white hover:bg-white/20 p-1"
                                onClick={() => handleCopyPrompt(prompt)}
                                title="Copy to clipboard"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-white hover:bg-white/20 p-1"
                                onClick={() => handleToggleFavorite(prompt)}
                                title={formattedPrompt.isFavorite ? "Remove from favorites" : "Add to favorites"}
                              >
                                <Heart className={`h-4 w-4 ${formattedPrompt.isFavorite ? 'fill-current' : ''}`} />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-white hover:bg-white/20 p-1"
                                onClick={() => handleShowFolderDialog(index)}
                                title="Add to folder"
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <h3 className="font-black text-lg mb-2">{formattedPrompt.title}</h3>
                          <p className="text-sm opacity-90 line-clamp-2">{formattedPrompt.description}</p>
                          <div className="mt-3 text-xs opacity-75">{formattedPrompt.time}</div>
                        </div>
                      </div>
                      )
                    })) : (
                    // Empty state for mobile
                    <div className="w-full flex-shrink-0 px-2">
                      <div className="bg-white/50 border-4 border-dashed border-black rounded-xl p-8 text-center">
                        <div className="text-6xl mb-4">📝</div>
                        <h3 className="font-black text-lg mb-2">No Prompts Yet</h3>
                        <p className="text-sm text-gray-600">Create your first prompt below!</p>
                      </div>
                    </div>
                  )}
                  <div className="w-full flex-shrink-0 px-2">
                    <Button className="h-full min-h-[140px] w-full border-4 border-dashed border-black rounded-xl flex flex-col items-center justify-center gap-2 bg-white/50 hover:bg-white/70">
                      <Plus className="h-8 w-8" />
                      <span className="font-bold">Create New Prompt</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop grid view for MY PROMPTS */}
            <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoadingPrompts ? (
                // Loading skeletons for desktop
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-gray-200 border-4 border-black rounded-xl p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-pulse">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 bg-gray-300 rounded"></div>
                      <div className="flex gap-2">
                        <div className="w-6 h-6 bg-gray-300 rounded"></div>
                        <div className="w-6 h-6 bg-gray-300 rounded"></div>
                        <div className="w-6 h-6 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                    <div className="w-3/4 h-6 bg-gray-300 rounded mb-2"></div>
                    <div className="w-full h-4 bg-gray-300 rounded mb-1"></div>
                    <div className="w-2/3 h-4 bg-gray-300 rounded mb-1"></div>
                    <div className="w-1/2 h-3 bg-gray-300 rounded"></div>
                  </div>
                ))
              ) : prompts.length > 0 ? (
                prompts.map((prompt, index) => {
                  const formattedPrompt = formatPromptForUI(prompt)
                  return (
                    <div
                      key={formattedPrompt.id}
                      className={`bg-gradient-to-br ${formattedPrompt.gradient} border-4 border-black rounded-xl p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-white`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{formattedPrompt.emoji}</span>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-white hover:bg-white/20 p-1"
                            onClick={() => handleCopyPrompt(prompt)}
                            title="Copy to clipboard"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-white hover:bg-white/20 p-1"
                            onClick={() => handleToggleFavorite(prompt)}
                            title={formattedPrompt.isFavorite ? "Remove from favorites" : "Add to favorites"}
                          >
                            <Heart className={`h-4 w-4 ${formattedPrompt.isFavorite ? 'fill-current' : ''}`} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-white hover:bg-white/20 p-1"
                            onClick={() => handleShowFolderDialog(index)}
                            title="Add to folder"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <h3 className="font-black text-lg mb-2">{formattedPrompt.title}</h3>
                      <p className="text-sm opacity-90 line-clamp-2">{formattedPrompt.description}</p>
                      <div className="mt-3 text-xs opacity-75">{formattedPrompt.time}</div>
                    </div>
                  )
                })
              ) : (
                // Empty state for desktop
                <div className="col-span-full bg-white/50 border-4 border-dashed border-black rounded-xl p-8 text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="font-black text-lg mb-2">No Prompts Yet</h3>
                  <p className="text-sm text-gray-600">Create your first prompt below to get started!</p>
                </div>
              )}

              {!isLoadingPrompts && (
                <Button className="h-full min-h-[120px] border-4 border-dashed border-black rounded-xl flex flex-col items-center justify-center gap-2 bg-white/50 hover:bg-white/70">
                  <Plus className="h-8 w-8" />
                  <span className="font-bold">Create New Prompt</span>
                </Button>
              )}
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-xl sm:text-2xl font-black mb-6">CREATE PROMPT</h2>
            <div className="bg-white/50 border-4 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <PromptEditor
                onGenerate={handleGeneratePrompt}
                onSave={handleSavePrompt}
                isGenerating={isGenerating}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl sm:text-2xl font-black">FAVORITE PROMPTS</h2>
              <div className="flex md:hidden items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFavoritePromptsIndex(Math.max(0, favoritePromptsIndex - 1))}
                  disabled={favoritePromptsIndex === 0 || isLoadingFavorites}
                  className="rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-bold">
                  {isLoadingFavorites ? "-/-" : favoritePrompts.length > 0 ? `${favoritePromptsIndex + 1}/${favoritePrompts.length}` : "0/0"}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFavoritePromptsIndex(Math.min(favoritePrompts.length - 1, favoritePromptsIndex + 1))
                  }
                  disabled={favoritePromptsIndex >= favoritePrompts.length - 1 || isLoadingFavorites}
                  className="rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="md:hidden">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${favoritePromptsIndex * 100}%)` }}
                >
                  {isLoadingFavorites ? (
                    // Loading skeleton for mobile favorites
                    Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="w-full flex-shrink-0 px-2">
                        <div className="bg-gray-200 border-4 border-black rounded-xl p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-pulse">
                          <div className="flex items-center justify-between mb-3">
                            <div className="w-8 h-8 bg-gray-300 rounded"></div>
                            <div className="flex gap-2">
                              <div className="w-6 h-6 bg-gray-300 rounded"></div>
                              <div className="w-6 h-6 bg-gray-300 rounded"></div>
                            </div>
                          </div>
                          <div className="w-3/4 h-6 bg-gray-300 rounded mb-2"></div>
                          <div className="w-full h-4 bg-gray-300 rounded mb-1"></div>
                          <div className="w-2/3 h-4 bg-gray-300 rounded mb-3"></div>
                          <div className="flex items-center justify-between">
                            <div className="w-16 h-3 bg-gray-300 rounded"></div>
                            <div className="w-4 h-4 bg-gray-300 rounded"></div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : favoritePrompts.length > 0 ? (
                    favoritePrompts.map((prompt, index) => {
                      const formattedPrompt = formatPromptForUI(prompt)
                      return (
                        <div key={formattedPrompt.id} className="w-full flex-shrink-0 px-2">
                          <div
                            className={`bg-gradient-to-br ${formattedPrompt.gradient} border-4 border-black rounded-xl p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-white`}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="text-2xl">{formattedPrompt.emoji}</span>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="text-white hover:bg-white/20 p-1"
                                  onClick={() => handleCopyPrompt(prompt)}
                                  title="Copy to clipboard"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="text-white hover:bg-white/20 p-1"
                                  title="Edit prompt"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <h3 className="font-black text-lg mb-2">{formattedPrompt.title}</h3>
                            <p className="text-sm opacity-90 line-clamp-2">{formattedPrompt.description}</p>
                            <div className="mt-3 flex items-center justify-between">
                              <div className="text-xs opacity-75">Favorited</div>
                              <Heart className="h-4 w-4 fill-current" />
                            </div>
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    // Empty state for mobile favorites  
                    <div className="w-full flex-shrink-0 px-2">
                      <div className="bg-white/50 border-4 border-dashed border-black rounded-xl p-8 text-center">
                        <div className="text-6xl mb-4">💖</div>
                        <h3 className="font-black text-lg mb-2">No Favorites Yet</h3>
                        <p className="text-sm text-gray-600">Heart some prompts to see them here!</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop grid view for FAVORITE PROMPTS */}
            <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoadingFavorites ? (
                // Loading skeletons for desktop favorites
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-gray-200 border-4 border-black rounded-xl p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] animate-pulse">
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 bg-gray-300 rounded"></div>
                      <div className="flex gap-2">
                        <div className="w-6 h-6 bg-gray-300 rounded"></div>
                        <div className="w-6 h-6 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                    <div className="w-3/4 h-6 bg-gray-300 rounded mb-2"></div>
                    <div className="w-full h-4 bg-gray-300 rounded mb-1"></div>
                    <div className="w-2/3 h-4 bg-gray-300 rounded mb-3"></div>
                    <div className="flex items-center justify-between">
                      <div className="w-16 h-3 bg-gray-300 rounded"></div>
                      <div className="w-4 h-4 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                ))
              ) : favoritePrompts.length > 0 ? (
                favoritePrompts.map((prompt, index) => {
                  const formattedPrompt = formatPromptForUI(prompt)
                  return (
                    <div
                      key={formattedPrompt.id}
                      className={`bg-gradient-to-br ${formattedPrompt.gradient} border-4 border-black rounded-xl p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-white`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{formattedPrompt.emoji}</span>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-white hover:bg-white/20 p-1"
                            onClick={() => handleCopyPrompt(prompt)}
                            title="Copy to clipboard"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="text-white hover:bg-white/20 p-1"
                            title="Edit prompt"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <h3 className="font-black text-lg mb-2">{formattedPrompt.title}</h3>
                      <p className="text-sm opacity-90 line-clamp-2">{formattedPrompt.description}</p>
                      <div className="mt-3 flex items-center justify-between">
                        <div className="text-xs opacity-75">Favorited</div>
                        <Heart className="h-4 w-4 fill-current" />
                      </div>
                    </div>
                  )
                })
              ) : (
                // Empty state for desktop favorites
                <div className="col-span-full bg-white/50 border-4 border-dashed border-black rounded-xl p-8 text-center">
                  <div className="text-6xl mb-4">💖</div>
                  <h3 className="font-black text-lg mb-2">No Favorites Yet</h3>
                  <p className="text-sm text-gray-600">Heart some prompts to see them here!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isFolderModalOpen} onOpenChange={setIsFolderModalOpen}>
        <DialogContent className="border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-black uppercase tracking-wide">Save to Folder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm font-medium">
              Choose a folder to save "
              {selectedPromptForFolder !== null ? myPrompts[selectedPromptForFolder]?.title : ""}" to:
            </p>
            <div className="grid grid-cols-1 gap-3">
              {availableFolders.map((folder) => (
                <Button
                  key={folder.id}
                  onClick={() => handleSaveToFolder(folder.id)}
                  className={`bg-gradient-to-r ${folder.color} hover:opacity-90 text-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold p-4 h-auto justify-start`}
                >
                  {folder.name}
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

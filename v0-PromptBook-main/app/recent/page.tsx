"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { Copy, Heart, MoreVertical, Menu } from "lucide-react"
import NavigationBar from "@/components/navigation-bar"
import MobileNavigation from "@/components/mobile-navigation"
import SearchBar from "@/components/search-bar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"

export default function RecentPromptsPage() {
  const [prompts, setPrompts] = useState<any[]>([])
  const [filteredPrompts, setFilteredPrompts] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Sample data for demonstration
  const samplePrompts = [
    {
      id: 1,
      title: "Marketing Copy Generator",
      description: "Create compelling marketing copy for social media campaigns",
      emoji: "📝",
      createdAt: "2024-01-15T10:30:00Z",
      role: "Marketing Copywriter",
      instruction: "Generate engaging social media posts",
      context: "For a tech startup launching a new app",
      example: "🚀 Ready to revolutionize your workflow? Our new app...",
    },
    {
      id: 2,
      title: "Code Review Assistant",
      description: "Help review and improve code quality",
      emoji: "💻",
      createdAt: "2024-01-14T15:45:00Z",
      role: "Senior Developer",
      instruction: "Review code for best practices and bugs",
      context: "React TypeScript project with modern patterns",
      example: "This component looks good overall, but consider...",
    },
    {
      id: 3,
      title: "Creative Story Writer",
      description: "Generate creative short stories and narratives",
      emoji: "📚",
      createdAt: "2024-01-13T09:20:00Z",
      role: "Creative Writer",
      instruction: "Write engaging short stories",
      context: "Fantasy genre with magical elements",
      example: "In the depths of the Whispering Woods...",
    },
    {
      id: 4,
      title: "Business Strategy Advisor",
      description: "Provide strategic business insights and recommendations",
      emoji: "💼",
      createdAt: "2024-01-12T14:10:00Z",
      role: "Business Consultant",
      instruction: "Analyze market trends and provide strategic advice",
      context: "SaaS company looking to expand internationally",
      example: "Based on current market analysis...",
    },
    {
      id: 5,
      title: "Recipe Creator",
      description: "Create delicious and healthy recipe suggestions",
      emoji: "🍳",
      createdAt: "2024-01-11T11:55:00Z",
      role: "Chef",
      instruction: "Create healthy meal recipes",
      context: "Mediterranean diet with seasonal ingredients",
      example: "Mediterranean Quinoa Bowl with...",
    },
    {
      id: 6,
      title: "Learning Tutor",
      description: "Explain complex topics in simple terms",
      emoji: "🎓",
      createdAt: "2024-01-10T16:30:00Z",
      role: "Educational Tutor",
      instruction: "Break down complex concepts into digestible parts",
      context: "Teaching advanced mathematics to high school students",
      example: "Let's think of calculus like...",
    },
  ]

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) return "1 day ago"
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return `${Math.ceil(diffDays / 30)} months ago`
  }

  // Load recent prompts on mount
  useEffect(() => {
    loadRecentPrompts()
  }, [])

  const loadRecentPrompts = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/prompts?orderBy=created_at&limit=10')
      
      if (!response.ok) {
        // Use sample data as fallback
        setPrompts(samplePrompts)
        setFilteredPrompts(samplePrompts)
        return
      }

      const data = await response.json()
      const loadedPrompts = data.prompts || samplePrompts
      setPrompts(loadedPrompts)
      setFilteredPrompts(loadedPrompts)
    } catch (error) {
      console.error('Error loading recent prompts:', error)
      setPrompts(samplePrompts)
      setFilteredPrompts(samplePrompts)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setFilteredPrompts(prompts)
      return
    }

    const lowerQuery = query.toLowerCase()
    const filtered = prompts.filter(prompt => 
      prompt.title?.toLowerCase().includes(lowerQuery) ||
      prompt.description?.toLowerCase().includes(lowerQuery) ||
      prompt.role?.toLowerCase().includes(lowerQuery)
    )
    
    setFilteredPrompts(filtered)
    
    if (filtered.length === 0) {
      toast.info("No recent prompts match your search")
    }
  }, [prompts])

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <header className="border-b-4 border-black p-4 sm:p-6 bg-white/40 backdrop-blur-md mb-8">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Page title */}
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl md:text-2xl font-black text-black tracking-tight whitespace-nowrap">RECENT PROMPTS</h1>
              <p className="text-gray-600 text-xs sm:text-sm mt-0.5 truncate">Your most recently created prompts</p>
            </div>

            {/* Center: Navigation - hidden on mobile */}
            <div className="hidden lg:flex flex-1 justify-center">
              <NavigationBar />
            </div>

            {/* Right: Search and Mobile menu */}
            <div className="flex items-center gap-3">
              <SearchBar placeholder="Search recent prompts..." onSearch={handleSearch} />

              <div className="flex lg:hidden">
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
          </div>
        </header>

        {/* Prompts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.map((prompt) => (
            <div
              key={prompt.id}
              className="bg-white border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_#000] hover:shadow-[12px_12px_0px_0px_#000] transition-all duration-200 hover:-translate-x-1 hover:-translate-y-1"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl border-2 border-black flex items-center justify-center text-2xl">
                    {prompt.emoji}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-black leading-tight">{prompt.title}</h3>
                    <p className="text-sm text-gray-600">{formatDate(prompt.createdAt)}</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
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
                  <Heart className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

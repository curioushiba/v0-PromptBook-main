"use client"

import { useState } from "react"
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

export default function Dashboard() {
  const [myPromptsIndex, setMyPromptsIndex] = useState(0)
  const [favoritePromptsIndex, setFavoritePromptsIndex] = useState(0)
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false)
  const [selectedPromptForFolder, setSelectedPromptForFolder] = useState<number | null>(null)

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
                  disabled={myPromptsIndex === 0}
                  className="rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-bold">
                  {myPromptsIndex + 1}/{myPrompts.length + 1}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setMyPromptsIndex(Math.min(myPrompts.length, myPromptsIndex + 1))}
                  disabled={myPromptsIndex === myPrompts.length}
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
                  {myPrompts.map((prompt, index) => (
                    <div key={index} className="w-full flex-shrink-0 px-2">
                      <div
                        className={`bg-gradient-to-br ${prompt.gradient} border-4 border-black rounded-xl p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-white`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-2xl">{prompt.emoji}</span>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 p-1">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 p-1">
                              <Heart className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-white hover:bg-white/20 p-1"
                              onClick={() => handleAddToFolder(index)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <h3 className="font-black text-lg mb-2">{prompt.title}</h3>
                        <p className="text-sm opacity-90 line-clamp-2">{prompt.description}</p>
                        <div className="mt-3 text-xs opacity-75">{prompt.time}</div>
                      </div>
                    </div>
                  ))}
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
              {myPrompts.map((prompt, index) => (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${prompt.gradient} border-4 border-black rounded-xl p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-white`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{prompt.emoji}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 p-1">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 p-1">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-white hover:bg-white/20 p-1"
                        onClick={() => handleAddToFolder(index)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-black text-lg mb-2">{prompt.title}</h3>
                  <p className="text-sm opacity-90 line-clamp-2">{prompt.description}</p>
                  <div className="mt-3 text-xs opacity-75">{prompt.time}</div>
                </div>
              ))}

              <Button className="h-full min-h-[120px] border-4 border-dashed border-black rounded-xl flex flex-col items-center justify-center gap-2 bg-white/50 hover:bg-white/70">
                <Plus className="h-8 w-8" />
                <span className="font-bold">Create New Prompt</span>
              </Button>
            </div>
          </div>

          <div className="mb-10">
            <h2 className="text-xl sm:text-2xl font-black mb-6">CREATE PROMPT</h2>
            <div className="bg-white/50 border-4 border-black rounded-xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="space-y-6">
                {/* ROLE Field */}
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-lg font-black uppercase tracking-wide">
                    ROLE
                  </Label>
                  <Input
                    id="role"
                    placeholder="e.g., Expert copywriter, Creative director, Marketing strategist..."
                    className="border-2 border-black rounded-lg font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white"
                  />
                </div>

                {/* PERSONALITY Field */}
                <div className="space-y-2">
                  <Label htmlFor="personality" className="text-lg font-black uppercase tracking-wide">
                    PERSONALITY
                  </Label>
                  <Input
                    id="personality"
                    placeholder="e.g., Enthusiastic and motivational, Professional and analytical, Friendly and conversational..."
                    className="border-2 border-black rounded-lg font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white"
                  />
                </div>

                {/* INSTRUCTION Field */}
                <div className="space-y-2">
                  <Label htmlFor="instruction" className="text-lg font-black uppercase tracking-wide">
                    INSTRUCTION
                  </Label>
                  <Textarea
                    id="instruction"
                    placeholder="Describe what you want the AI to do..."
                    rows={3}
                    className="border-2 border-black rounded-lg font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white resize-none"
                  />
                </div>

                {/* CONTEXT Field */}
                <div className="space-y-2">
                  <Label htmlFor="context" className="text-lg font-black uppercase tracking-wide">
                    CONTEXT
                  </Label>
                  <Textarea
                    id="context"
                    placeholder="Provide background information, history, or relevant details..."
                    rows={4}
                    className="border-2 border-black rounded-lg font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white resize-none"
                  />
                </div>

                {/* EXAMPLE Field */}
                <div className="space-y-2">
                  <Label htmlFor="example" className="text-lg font-black uppercase tracking-wide">
                    EXAMPLE
                  </Label>
                  <Textarea
                    id="example"
                    placeholder="Show the desired output format or provide sample results..."
                    rows={4}
                    className="border-2 border-black rounded-lg font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white resize-none"
                  />
                </div>

                {/* CREATE META PROMPT Button */}
                <div className="pt-4">
                  <Button className="w-full bg-black hover:bg-black/80 text-white rounded-xl border-2 border-black font-black text-lg py-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] uppercase tracking-wide">
                    CREATE META PROMPT
                  </Button>
                </div>
              </div>
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
                  disabled={favoritePromptsIndex === 0}
                  className="rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-bold">
                  {favoritePromptsIndex + 1}/{favoritePrompts.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setFavoritePromptsIndex(Math.min(favoritePrompts.length - 1, favoritePromptsIndex + 1))
                  }
                  disabled={favoritePromptsIndex === favoritePrompts.length - 1}
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
                  {favoritePrompts.map((prompt, index) => (
                    <div key={index} className="w-full flex-shrink-0 px-2">
                      <div
                        className={`bg-gradient-to-br ${prompt.gradient} border-4 border-black rounded-xl p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-white`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-2xl">{prompt.emoji}</span>
                          <div className="flex gap-2">
                            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 p-1">
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 p-1">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <h3 className="font-black text-lg mb-2">{prompt.title}</h3>
                        <p className="text-sm opacity-90 line-clamp-2">{prompt.description}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="text-xs opacity-75">Favorited</div>
                          <Heart className="h-4 w-4 fill-current" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Desktop grid view for FAVORITE PROMPTS */}
            <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoritePrompts.map((prompt, index) => (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${prompt.gradient} border-4 border-black rounded-xl p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-white`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{prompt.emoji}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 p-1">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 p-1">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <h3 className="font-black text-lg mb-2">{prompt.title}</h3>
                  <p className="text-sm opacity-90 line-clamp-2">{prompt.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="text-xs opacity-75">Favorited</div>
                    <Heart className="h-4 w-4 fill-current" />
                  </div>
                </div>
              ))}
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

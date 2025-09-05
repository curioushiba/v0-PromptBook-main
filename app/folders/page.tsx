"use client"

import { useState } from "react"
import { Copy, Heart, MoreVertical, Folder, Plus, Menu, X } from "lucide-react"
import MobileNavigation from "@/components/mobile-navigation"
import SearchBar from "@/components/search-bar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function PromptFoldersPage() {
  const [isAddPromptModalOpen, setIsAddPromptModalOpen] = useState(false)
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false)
  const [folderName, setFolderName] = useState("")
  const [folderColor, setFolderColor] = useState("from-blue-400 to-purple-500")
  const [promptName, setPromptName] = useState("")
  const [promptBody, setPromptBody] = useState("")
  const [selectedFolder, setSelectedFolder] = useState("")

  const [folders] = useState([
    {
      id: 1,
      name: "Marketing Campaigns",
      color: "from-blue-400 to-purple-500",
      promptCount: 8,
      prompts: [
        {
          id: 1,
          title: "Social Media Copy",
          description: "Generate engaging social media posts for campaigns",
          emoji: "📱",
          isFavorited: true,
        },
        {
          id: 2,
          title: "Email Marketing",
          description: "Create compelling email marketing content",
          emoji: "📧",
          isFavorited: true,
        },
      ],
    },
    {
      id: 2,
      name: "Development Tools",
      color: "from-green-400 to-blue-500",
      promptCount: 5,
      prompts: [
        {
          id: 3,
          title: "Code Review Assistant",
          description: "Help review and improve code quality",
          emoji: "💻",
          isFavorited: true,
        },
        {
          id: 4,
          title: "Bug Finder",
          description: "Identify and suggest fixes for code issues",
          emoji: "🐛",
          isFavorited: true,
        },
      ],
    },
    {
      id: 3,
      name: "Creative Writing",
      color: "from-pink-400 to-red-500",
      promptCount: 12,
      prompts: [
        {
          id: 5,
          title: "Story Generator",
          description: "Create engaging short stories and narratives",
          emoji: "📚",
          isFavorited: true,
        },
        {
          id: 6,
          title: "Character Creator",
          description: "Develop detailed character profiles",
          emoji: "🎭",
          isFavorited: true,
        },
      ],
    },
  ])

  const colorOptions = [
    { name: "Blue to Purple", value: "from-blue-400 to-purple-500" },
    { name: "Green to Blue", value: "from-green-400 to-blue-500" },
    { name: "Pink to Red", value: "from-pink-400 to-red-500" },
    { name: "Orange to Yellow", value: "from-orange-400 to-yellow-500" },
    { name: "Purple to Pink", value: "from-purple-400 to-pink-500" },
    { name: "Teal to Green", value: "from-teal-400 to-green-500" },
  ]

  const handleSearch = (query: string) => {
    console.log("Searching folders and prompts for:", query)
    // TODO: Implement search logic for folders and prompts
  }

  const handleAddPrompt = () => {
    console.log("Adding new prompt:", { promptName, promptBody, selectedFolder })
    // TODO: Implement add prompt logic
    setIsAddPromptModalOpen(false)
    setPromptName("")
    setPromptBody("")
    setSelectedFolder("")
  }

  const handleCreateFolder = () => {
    console.log("Creating new folder:", { folderName, folderColor })
    // TODO: Implement create folder logic
    setIsCreateFolderModalOpen(false)
    setFolderName("")
    setFolderColor("from-blue-400 to-purple-500")
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header with Hamburger Menu */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black text-black mb-2">PROMPT FOLDERS</h1>
            <p className="text-gray-600 text-lg">Organize your favorite prompts into custom folders</p>
          </div>

          <div className="flex items-center gap-3">
            <SearchBar placeholder="Search folders and prompts..." onSearch={handleSearch} />

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

        <div className="mb-8 flex flex-wrap gap-4">
          <button
            onClick={() => setIsCreateFolderModalOpen(true)}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            CREATE NEW FOLDER
          </button>

          <button
            onClick={() => setIsAddPromptModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            ADD NEW PROMPT
          </button>
        </div>

        {/* Folders Grid */}
        <div className="space-y-8">
          {folders.map((folder) => (
            <div
              key={folder.id}
              className="bg-gray-50 border-4 border-black rounded-2xl p-6 shadow-[8px_8px_0px_0px_#000]"
            >
              {/* Folder Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-16 h-16 bg-gradient-to-br ${folder.color} rounded-xl border-2 border-black flex items-center justify-center`}
                  >
                    <Folder className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-black">{folder.name}</h2>
                    <p className="text-gray-600">{folder.promptCount} prompts</p>
                  </div>
                </div>
                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {/* Prompts in Folder */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {folder.prompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className="bg-white border-4 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_#000] hover:shadow-[6px_6px_0px_0px_#000] transition-all duration-200 hover:-translate-x-0.5 hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 bg-gradient-to-r ${folder.color} rounded-lg border-2 border-black flex items-center justify-center text-lg`}
                        >
                          {prompt.emoji}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-black leading-tight">{prompt.title}</h3>
                          {prompt.isFavorited && (
                            <div className="flex items-center gap-1 mt-1">
                              <Heart className="w-3 h-3 text-red-500 fill-current" />
                              <span className="text-xs text-red-500 font-bold">FAVORITED</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 mb-3 text-xs leading-relaxed">{prompt.description}</p>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-1.5 px-3 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 flex items-center justify-center gap-1 text-xs">
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {isAddPromptModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white border-4 border-black rounded-2xl p-6 w-full max-w-md shadow-[8px_8px_0px_0px_#000]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-black">ADD NEW PROMPT</h2>
                <button
                  onClick={() => setIsAddPromptModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="prompt-name" className="text-sm font-bold text-black uppercase tracking-wide">
                    Name of Prompt
                  </Label>
                  <Input
                    id="prompt-name"
                    value={promptName}
                    onChange={(e) => setPromptName(e.target.value)}
                    placeholder="Enter prompt name..."
                    className="mt-2 border-2 border-black rounded-lg font-medium shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white"
                  />
                </div>

                <div>
                  <Label htmlFor="prompt-body" className="text-sm font-bold text-black uppercase tracking-wide">
                    Body of Prompt
                  </Label>
                  <Textarea
                    id="prompt-body"
                    value={promptBody}
                    onChange={(e) => setPromptBody(e.target.value)}
                    placeholder="Enter the full prompt content..."
                    rows={4}
                    className="mt-2 border-2 border-black rounded-lg font-medium shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white resize-none"
                  />
                </div>

                <div>
                  <Label htmlFor="folder-select" className="text-sm font-bold text-black uppercase tracking-wide">
                    Choose Folder
                  </Label>
                  <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                    <SelectTrigger className="mt-2 border-2 border-black rounded-lg font-medium shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white">
                      <SelectValue placeholder="Select a folder..." />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-black rounded-lg">
                      {folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.id.toString()}>
                          {folder.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsAddPromptModalOpen(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-black font-bold py-3 px-4 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:shadow-[3px_3px_0px_0px_#000] transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddPrompt}
                    disabled={!promptName || !promptBody || !selectedFolder}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:shadow-[3px_3px_0px_0px_#000] transition-all duration-200 disabled:cursor-not-allowed"
                  >
                    Add Prompt
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isCreateFolderModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white border-4 border-black rounded-2xl p-6 w-full max-w-md shadow-[8px_8px_0px_0px_#000]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-black">CREATE NEW FOLDER</h2>
                <button
                  onClick={() => setIsCreateFolderModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="folder-name" className="text-sm font-bold text-black uppercase tracking-wide">
                    Folder Name
                  </Label>
                  <Input
                    id="folder-name"
                    value={folderName}
                    onChange={(e) => setFolderName(e.target.value)}
                    placeholder="Enter folder name..."
                    className="mt-2 border-2 border-black rounded-lg font-medium shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white"
                  />
                </div>

                <div>
                  <Label htmlFor="folder-color" className="text-sm font-bold text-black uppercase tracking-wide">
                    Folder Color
                  </Label>
                  <Select value={folderColor} onValueChange={setFolderColor}>
                    <SelectTrigger className="mt-2 border-2 border-black rounded-lg font-medium shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white">
                      <SelectValue placeholder="Select a color..." />
                    </SelectTrigger>
                    <SelectContent className="border-2 border-black rounded-lg">
                      {colorOptions.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 bg-gradient-to-r ${color.value} rounded border border-black`} />
                            {color.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setIsCreateFolderModalOpen(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-black font-bold py-3 px-4 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:shadow-[3px_3px_0px_0px_#000] transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateFolder}
                    disabled={!folderName}
                    className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-3 px-4 rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_#000] hover:shadow-[3px_3px_0px_0px_#000] transition-all duration-200 disabled:cursor-not-allowed"
                  >
                    Create Folder
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

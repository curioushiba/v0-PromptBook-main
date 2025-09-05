"use client"

import { Button } from "@/components/ui/button"
import { Copy, Heart, Plus } from "lucide-react"
import type { Prompt, PromptUIDisplay } from "@/types"

interface PromptCardProps {
  prompt: Prompt;
  formattedPrompt: PromptUIDisplay;
  onCopy: (prompt: Prompt) => void;
  onToggleFavorite: (prompt: Prompt) => void;
  onAddToFolder: () => void;
  showFolderButton?: boolean;
}

export function PromptCard({
  prompt,
  formattedPrompt,
  onCopy,
  onToggleFavorite,
  onAddToFolder,
  showFolderButton = true
}: PromptCardProps) {
  return (
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
            onClick={() => onCopy(prompt)}
            title="Copy to clipboard"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-white hover:bg-white/20 p-1"
            onClick={() => onToggleFavorite(prompt)}
            title={formattedPrompt.isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={`h-4 w-4 ${formattedPrompt.isFavorite ? 'fill-current' : ''}`} />
          </Button>
          {showFolderButton && (
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/20 p-1"
              onClick={onAddToFolder}
              title="Add to folder"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <h3 className="font-black text-lg mb-2">{formattedPrompt.title}</h3>
      <p className="text-sm opacity-90 line-clamp-2">{formattedPrompt.description}</p>
      <div className="mt-3 text-xs opacity-75">{formattedPrompt.time}</div>
    </div>
  );
}
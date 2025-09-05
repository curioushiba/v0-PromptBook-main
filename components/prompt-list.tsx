"use client"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { PromptCard } from "./prompt-card"
import type { Prompt, PromptUIDisplay } from "@/types"

interface PromptListProps {
  prompts: Prompt[];
  formatPromptForUI: (prompt: Prompt) => PromptUIDisplay;
  onCopyPrompt: (prompt: Prompt) => void;
  onToggleFavorite: (prompt: Prompt) => void;
  onShowFolderDialog: (index: number) => void;
  isLoading: boolean;
  showFolderButton?: boolean;
  emptyStateMessage?: string;
  emptyStateEmoji?: string;
}

export function PromptList({
  prompts,
  formatPromptForUI,
  onCopyPrompt,
  onToggleFavorite,
  onShowFolderDialog,
  isLoading,
  showFolderButton = true,
  emptyStateMessage = "No Prompts Yet",
  emptyStateEmoji = "📝"
}: PromptListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
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
        ))}
      </div>
    );
  }

  if (prompts.length === 0) {
    return (
      <div className="col-span-full bg-white/50 border-4 border-dashed border-black rounded-xl p-8 text-center">
        <div className="text-6xl mb-4">{emptyStateEmoji}</div>
        <h3 className="font-black text-lg mb-2">{emptyStateMessage}</h3>
        <p className="text-sm text-gray-600">Create your first prompt to get started!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {prompts.map((prompt, index) => {
        const formattedPrompt = formatPromptForUI(prompt);
        return (
          <PromptCard
            key={formattedPrompt.id}
            prompt={prompt}
            formattedPrompt={formattedPrompt}
            onCopy={onCopyPrompt}
            onToggleFavorite={onToggleFavorite}
            onAddToFolder={() => onShowFolderDialog(index)}
            showFolderButton={showFolderButton}
          />
        );
      })}
      
      {!isLoading && showFolderButton && (
        <Button className="h-full min-h-[120px] border-4 border-dashed border-black rounded-xl flex flex-col items-center justify-center gap-2 bg-white/50 hover:bg-white/70">
          <Plus className="h-8 w-8" />
          <span className="font-bold">Create New Prompt</span>
        </Button>
      )}
    </div>
  );
}
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { PromptCard } from "./prompt-card"
import type { Prompt, PromptUIDisplay } from "@/types"

interface PromptCarouselProps {
  prompts: Prompt[];
  formatPromptForUI: (prompt: Prompt) => PromptUIDisplay;
  onCopyPrompt: (prompt: Prompt) => void;
  onToggleFavorite: (prompt: Prompt) => void;
  onShowFolderDialog: (index: number) => void;
  isLoading: boolean;
  title: string;
  showCreateButton?: boolean;
}

export function PromptCarousel({
  prompts,
  formatPromptForUI,
  onCopyPrompt,
  onToggleFavorite,
  onShowFolderDialog,
  isLoading,
  title,
  showCreateButton = true
}: PromptCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const totalItems = showCreateButton ? prompts.length + 1 : prompts.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl sm:text-2xl font-black">{title}</h2>
        <div className="flex md:hidden items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0 || isLoading}
            className="rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-bold">
            {isLoading ? "-/-" : `${currentIndex + 1}/${totalItems}`}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentIndex(Math.min(totalItems - 1, currentIndex + 1))}
            disabled={currentIndex >= totalItems - 1 || isLoading}
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
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {isLoading ? (
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
              <>
                {prompts.map((prompt, index) => {
                  const formattedPrompt = formatPromptForUI(prompt);
                  return (
                    <div key={formattedPrompt.id} className="w-full flex-shrink-0 px-2">
                      <PromptCard
                        prompt={prompt}
                        formattedPrompt={formattedPrompt}
                        onCopy={onCopyPrompt}
                        onToggleFavorite={onToggleFavorite}
                        onAddToFolder={() => onShowFolderDialog(index)}
                      />
                    </div>
                  );
                })}
                {showCreateButton && (
                  <div className="w-full flex-shrink-0 px-2">
                    <Button className="h-full min-h-[140px] w-full border-4 border-dashed border-black rounded-xl flex flex-col items-center justify-center gap-2 bg-white/50 hover:bg-white/70">
                      <Plus className="h-8 w-8" />
                      <span className="font-bold">Create New Prompt</span>
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full flex-shrink-0 px-2">
                <div className="bg-white/50 border-4 border-dashed border-black rounded-xl p-8 text-center">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="font-black text-lg mb-2">No Prompts Yet</h3>
                  <p className="text-sm text-gray-600">Create your first prompt below!</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { 
  Sparkles, 
  Save, 
  Copy, 
  RefreshCw,
  Info,
  Loader2
} from "lucide-react"

import { 
  promptFormSchema, 
  type PromptFormData,
  validatePromptSize,
  estimateTokenCount 
} from "@/lib/validations/prompt"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface PromptEditorProps {
  onGenerate: (data: PromptFormData) => Promise<string>
  onSave?: (prompt: PromptFormData & { metaPrompt: string }) => Promise<void>
  initialData?: Partial<PromptFormData>
  isGenerating?: boolean
}

export function PromptEditor({
  onGenerate,
  onSave,
  initialData,
  isGenerating = false
}: PromptEditorProps) {
  const [generatedPrompt, setGeneratedPrompt] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [tokenCount, setTokenCount] = useState(0)

  const form = useForm<PromptFormData>({
    resolver: zodResolver(promptFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      role: initialData?.role || "",
      personality: initialData?.personality || "",
      instruction: initialData?.instruction || "",
      context: initialData?.context || "",
      example: initialData?.example || "",
    },
  })

  const formValues = form.watch()

  // Update token count when form values change
  useEffect(() => {
    const totalText = [
      formValues.role,
      formValues.personality || "",
      formValues.instruction,
      formValues.context || "",
      formValues.example || ""
    ].join(" ")
    
    setTokenCount(estimateTokenCount(totalText))
  }, [formValues])

  async function handleGenerate(data: PromptFormData) {
    // Validate prompt size
    const sizeValidation = validatePromptSize(data)
    if (!sizeValidation.isValid) {
      toast.error("Prompt too long", {
        description: sizeValidation.message
      })
      return
    }

    setIsProcessing(true)
    try {
      const metaPrompt = await onGenerate(data)
      setGeneratedPrompt(metaPrompt)
      
      toast.success("Meta prompt generated!", {
        description: "Your enhanced prompt is ready to use."
      })
    } catch (error) {
      toast.error("Generation failed", {
        description: error instanceof Error ? error.message : "An error occurred"
      })
    } finally {
      setIsProcessing(false)
    }
  }

  async function handleSave() {
    if (!generatedPrompt) {
      toast.error("No prompt to save", {
        description: "Generate a meta prompt first"
      })
      return
    }

    const formData = form.getValues()
    
    if (onSave) {
      setIsProcessing(true)
      try {
        await onSave({
          ...formData,
          metaPrompt: generatedPrompt
        })
        
        toast.success("Prompt saved!", {
          description: "Your prompt has been saved to your library."
        })
      } catch (error) {
        toast.error("Save failed", {
          description: error instanceof Error ? error.message : "An error occurred"
        })
      } finally {
        setIsProcessing(false)
      }
    }
  }

  function handleCopy() {
    if (!generatedPrompt) {
      toast.error("No prompt to copy", {
        description: "Generate a meta prompt first"
      })
      return
    }

    navigator.clipboard.writeText(generatedPrompt)
    toast.success("Copied to clipboard!", {
      description: "The meta prompt has been copied."
    })
  }

  function handleReset() {
    form.reset()
    setGeneratedPrompt("")
    setTokenCount(0)
    toast.success("Form reset", {
      description: "All fields have been cleared."
    })
  }

  const tokenPercentage = Math.min((tokenCount / 4000) * 100, 100)
  const getTokenColor = () => {
    if (tokenPercentage > 90) return "text-red-600"
    if (tokenPercentage > 70) return "text-yellow-600"
    return "text-green-600"
  }

  return (
    <div className="space-y-6">
      <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <CardHeader className="bg-gradient-to-r from-purple-400 to-pink-400 text-white border-b-4 border-black">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              <CardTitle className="text-2xl font-black uppercase">
                Prompt Editor
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/20 text-white border-2 border-white">
                <span className={`font-bold ${getTokenColor()}`}>
                  ~{tokenCount} tokens
                </span>
              </Badge>
            </div>
          </div>
          <CardDescription className="text-white/90 font-medium">
            Structure your prompt using the five key components for optimal AI performance
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleGenerate)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prompt Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="E.g., 'Product Description Writer' or 'Code Review Assistant'"
                        disabled={isProcessing}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      A memorable name for this prompt template
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Role</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-medium">
                              Define who or what the AI should act as. This sets the expertise and perspective.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="You are an expert software engineer with 10 years of experience in React and TypeScript..."
                        className="min-h-[100px] resize-y"
                        disabled={isProcessing}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="personality"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Personality (Optional)</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-medium">
                              Describe the tone, style, and personality traits for the AI's responses.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="Be professional yet friendly, explain complex concepts simply, use analogies when helpful..."
                        className="min-h-[80px] resize-y"
                        disabled={isProcessing}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="instruction"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Instructions</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-medium">
                              Clear, specific instructions for what the AI should do with the input.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="Review the provided code for potential bugs, security issues, and performance problems. Provide specific suggestions..."
                        className="min-h-[120px] resize-y"
                        disabled={isProcessing}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="context"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Context (Optional)</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-medium">
                              Additional background information, constraints, or requirements.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="The codebase follows SOLID principles, uses ESLint with strict rules, and targets Node.js 18+..."
                        className="min-h-[100px] resize-y"
                        disabled={isProcessing}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="example"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <FormLabel>Examples (Optional)</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-medium">
                              Provide examples of desired input/output or formatting to guide the AI.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <FormControl>
                      <Textarea
                        placeholder="Example input: 'const x = 5;' Example output: 'Consider using more descriptive variable names...'"
                        className="min-h-[100px] resize-y"
                        disabled={isProcessing}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between pt-4">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={isProcessing}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-pink-600"
                  disabled={isProcessing || isGenerating}
                >
                  {isProcessing || isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      CREATE META PROMPT
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {generatedPrompt && (
        <Card className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <CardHeader className="bg-gradient-to-r from-green-400 to-blue-400 text-white border-b-4 border-black">
            <CardTitle className="text-xl font-black uppercase">
              Generated Meta Prompt
            </CardTitle>
            <CardDescription className="text-white/90 font-medium">
              Your enhanced prompt is ready to use with any AI model
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="relative">
                <Textarea
                  value={generatedPrompt}
                  readOnly
                  className="min-h-[200px] font-mono text-sm"
                />
                <Badge 
                  variant="success" 
                  className="absolute top-2 right-2"
                >
                  Ready to use
                </Badge>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCopy}
                  variant="outline"
                  className="flex-1"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy to Clipboard
                </Button>
                
                {onSave && (
                  <Button
                    onClick={handleSave}
                    className="flex-1"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save to Library
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
import { render, screen, fireEvent } from '@testing-library/react'
import { PromptCard } from '@/components/prompt-card'
import type { Prompt, PromptUIDisplay } from '@/types'

describe('PromptCard', () => {
  const mockPrompt: Prompt = {
    id: '1',
    user_id: 'user-1',
    title: 'Test Prompt',
    role_field: 'Test Role',
    personality_field: 'Test Personality',
    instruction_field: 'Test Instruction',
    context_field: 'Test Context',
    example_field: 'Test Example',
    meta_prompt: 'Test Meta Prompt',
    is_favorite: false,
    usage_count: 0,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  }

  const mockFormattedPrompt: PromptUIDisplay = {
    id: '1',
    emoji: '📝',
    title: 'Test Prompt',
    description: 'Test description',
    time: 'Created 1 day ago',
    gradient: 'from-blue-500 to-purple-500',
    isFavorite: false,
    usageCount: 0,
  }

  const mockHandlers = {
    onCopy: jest.fn(),
    onToggleFavorite: jest.fn(),
    onAddToFolder: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders prompt card with correct content', () => {
    render(
      <PromptCard
        prompt={mockPrompt}
        formattedPrompt={mockFormattedPrompt}
        {...mockHandlers}
      />
    )

    expect(screen.getByText('Test Prompt')).toBeInTheDocument()
    expect(screen.getByText('Test description')).toBeInTheDocument()
    expect(screen.getByText('Created 1 day ago')).toBeInTheDocument()
    expect(screen.getByText('📝')).toBeInTheDocument()
  })

  it('calls onCopy when copy button is clicked', () => {
    render(
      <PromptCard
        prompt={mockPrompt}
        formattedPrompt={mockFormattedPrompt}
        {...mockHandlers}
      />
    )

    const copyButton = screen.getByTitle('Copy to clipboard')
    fireEvent.click(copyButton)

    expect(mockHandlers.onCopy).toHaveBeenCalledWith(mockPrompt)
  })

  it('calls onToggleFavorite when heart button is clicked', () => {
    render(
      <PromptCard
        prompt={mockPrompt}
        formattedPrompt={mockFormattedPrompt}
        {...mockHandlers}
      />
    )

    const favoriteButton = screen.getByTitle('Add to favorites')
    fireEvent.click(favoriteButton)

    expect(mockHandlers.onToggleFavorite).toHaveBeenCalledWith(mockPrompt)
  })

  it('shows filled heart when prompt is favorite', () => {
    const favoritePrompt = {
      ...mockFormattedPrompt,
      isFavorite: true,
    }

    render(
      <PromptCard
        prompt={mockPrompt}
        formattedPrompt={favoritePrompt}
        {...mockHandlers}
      />
    )

    const favoriteButton = screen.getByTitle('Remove from favorites')
    expect(favoriteButton).toBeInTheDocument()
  })

  it('hides folder button when showFolderButton is false', () => {
    render(
      <PromptCard
        prompt={mockPrompt}
        formattedPrompt={mockFormattedPrompt}
        {...mockHandlers}
        showFolderButton={false}
      />
    )

    expect(screen.queryByTitle('Add to folder')).not.toBeInTheDocument()
  })
})
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

interface ThemeToggleProps {
  compact?: boolean
  className?: string
  showLabel?: boolean
}

export function ThemeToggle({ compact = false, className = '', showLabel = false }: ThemeToggleProps) {
  const { isLight, toggleTheme } = useTheme()
  const nextLabel = isLight ? 'Ativar modo escuro' : 'Ativar modo claro'
  const text = isLight ? 'Escuro' : 'Claro'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle${compact ? ' theme-toggle--compact' : ''}${className ? ` ${className}` : ''}`}
      aria-label={nextLabel}
      aria-pressed={isLight}
      title={nextLabel}
    >
      {isLight ? <Moon size={16} aria-hidden="true" /> : <Sun size={16} aria-hidden="true" />}
      {showLabel && <span>{text}</span>}
    </button>
  )
}

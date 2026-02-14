import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/hooks/use-theme'

export function TopBar() {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b bg-card/90 px-4 backdrop-blur-sm">
      <h1 className="text-lg font-semibold tracking-tight text-foreground">
        DCR Builder
      </h1>
      <Button variant="ghost" size="icon" onClick={toggleTheme}>
        {theme === 'dark' ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
        <span className="sr-only">Toggle theme</span>
      </Button>
    </header>
  )
}

'use client';

import { useTheme } from 'next-themes';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/ui/primitives/dropdown-menu';

import { Moon, Sun } from 'lucide-react';

const ThemeToggle = () => {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild className="flex items-center justify-center">
        <button
          aria-label="toggle theme"
          className="cursor-pointer relative flex items-center justify-center h-9 w-9 rounded-xl border border-transparent hover:border-border/60 hover:bg-accent/70 transition-all duration-200 text-muted-foreground hover:text-foreground"
        >
          <Sun
            size={18}
            strokeWidth={1.75}
            className="rotate-0 scale-100 transition-all duration-300 dark:-rotate-90 dark:scale-0"
          />
          <Moon
            size={18}
            strokeWidth={1.75}
            className="absolute rotate-90 scale-0 transition-all duration-300 dark:rotate-0 dark:scale-100"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle;

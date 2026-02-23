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
          className="cursor-pointer flex items-center justify-center h-10 w-10 rounded-md hover:bg-muted transition-colors"
        >
          <Sun
            size={20}
            strokeWidth={1.5}
            className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:absolute dark:scale-0"
          />
          <Moon
            size={20}
            strokeWidth={1.5}
            className="rotate-90 scale-0 transition-all absolute dark:relative dark:rotate-0 dark:scale-100"
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>Light</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>Dark</DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>System</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeToggle;

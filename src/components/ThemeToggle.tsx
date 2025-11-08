import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from './theme-provider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function ThemeToggle() {
  // ThemeToggle intentionally made a no-op to remove theme switching UI.
  // Keep the exported component so imports don't break; render nothing.
  return null;
}


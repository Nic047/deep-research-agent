'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Only show the theme toggle after the component has mounted on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="w-full justify-start">
        <div className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = theme === 'dark';
  const ToggleIcon = isDark ? Sun : Moon;

  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-full justify-start gap-2"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      <ToggleIcon className="h-4 w-4" />
      <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
    </Button>
  );
}

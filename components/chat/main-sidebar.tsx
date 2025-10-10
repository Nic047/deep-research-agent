"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

function MainSidebar() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="w-[270px] h-full bg-gray-100 dark:bg-gray-900 p-4 flex flex-col gap-4">
      <Button
        variant="outline"
        size="icon"
        aria-label="Toggle dark mode"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {theme === "dark" ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </Button>
      {/* ...rest of sidebar... */}
    </div>
  );
}

export default MainSidebar;

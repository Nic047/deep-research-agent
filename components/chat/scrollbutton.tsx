import { ArrowDown } from "lucide-react";
import React from "react";

interface ScrollButtonProps {
  onClick?: () => void;
}

function ScrollButton({ onClick }: ScrollButtonProps) {
  return (
    <div
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 w-10 flex h-10 justify-center items-center rounded-full relative hover:cursor-pointer shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
      onClick={onClick}
    >
      <ArrowDown size={20} className="text-gray-600 dark:text-gray-300" />
    </div>
  );
}

export default ScrollButton;

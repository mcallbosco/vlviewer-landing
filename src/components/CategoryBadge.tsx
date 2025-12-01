import React from 'react';

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

const categoryColors: Record<string, string> = {
  "Deadlock": "text-amber-400 bg-amber-400/10 border-amber-400/20",
  "Overwatch": "text-orange-400 bg-orange-400/10 border-orange-400/20",
  "Apex Legends": "text-red-400 bg-red-400/10 border-red-400/20",
  "Website Update": "text-blue-400 bg-blue-400/10 border-blue-400/20",
};

const defaultColor = "text-gray-400 bg-gray-400/10 border-gray-400/20";

export default function CategoryBadge({ category, className = '' }: CategoryBadgeProps) {
  const colorClass = categoryColors[category] || defaultColor;
  
  return (
    <span className={`font-medium px-2 py-0.5 rounded border ${colorClass} ${className}`}>
      {category}
    </span>
  );
}

import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ChevronUp, ChevronDown, Minus } from "lucide-react";

export type BadgeDeltaProps = {
  deltaType: "increase" | "decrease" | "unchanged";
  children?: React.ReactNode;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
};

export function BadgeDelta({ 
  deltaType, 
  children, 
  className,
  size = "md"
}: BadgeDeltaProps) {
  const sizes = {
    xs: "text-xs py-0 px-1",
    sm: "text-xs py-0.5 px-2",
    md: "text-sm py-1 px-2",
    lg: "text-base py-1 px-3",
  };

  const colorByDeltaType = {
    increase: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900/50",
    decrease: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900/50",
    unchanged: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-900/50",
  };

  const iconByDeltaType = {
    increase: <ChevronUp className="h-4 w-4" />,
    decrease: <ChevronDown className="h-4 w-4" />,
    unchanged: <Minus className="h-4 w-4" />,
  };

  return (
    <Badge
      className={cn(
        "gap-1 border font-normal",
        sizes[size],
        colorByDeltaType[deltaType],
        className
      )}
      variant="outline"
    >
      {iconByDeltaType[deltaType]}
      {children}
    </Badge>
  );
}
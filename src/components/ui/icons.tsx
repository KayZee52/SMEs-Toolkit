
import * as React from "react";
import { cn } from "@/lib/utils";

export const MaDIcon = React.forwardRef<
  SVGSVGElement,
  React.SVGProps<SVGSVGElement>
>(({ className, ...props }, ref) => (
  <svg
    ref={ref}
    className={cn("w-6 h-6", className)}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* 
      ===========================================================
      === PASTE THE CONTENTS OF YOUR SVG FILE INSIDE THIS TAG ===
      === (You can remove these comment blocks when you are done)
      === Example: <path d="..." />, <circle ... />, etc.
      ===========================================================
    */}
    <path d="M12 8V6M10 12H9M15 12H14M16 16.5C16 17.3284 15.3284 18 14.5 18C13.6716 18 13 17.3284 13 16.5C13 15.6716 13.6716 15 14.5 15C15.3284 15 16 15.6716 16 16.5ZM9.5 18C10.3284 18 11 17.3284 11 16.5C11 15.6716 10.3284 15 9.5 15C8.67157 15 8 15.6716 8 16.5C8 17.3284 8.67157 18 9.5 18Z" />
    <path d="M17 12H18C19.6569 12 21 10.6569 21 9V8C21 6.34315 19.6569 5 18 5H6C4.34315 5 3 6.34315 3 8V9C3 10.6569 4.34315 12 6 12H7" />
    <path d="M7 12C7 10 7.5 9 8.5 9H15.5C16.5 9 17 10 17 12V13C17 14 16.5 15 15.5 15H8.5C7.5 15 7 14 7 13V12Z" />
    {/*
      ===========================================================
      ===                   END OF SVG AREA                   ===
      ===========================================================
    */}
  </svg>
));
MaDIcon.displayName = "MaDIcon";


import * as React from "react";
import { cn } from "@/lib/utils";
import Image from "next/image";

// This component now references a standard image file from the /public directory.
// Please ensure you have placed your logo at /public/mad-logo.png

export const MaDIcon = React.forwardRef<
  HTMLImageElement,
  React.HTMLAttributes<HTMLImageElement>
>(({ className, ...props }, ref) => (
  <Image
    src="/mad-logo.png"
    alt="Ma-D Icon"
    width={40}
    height={40}
    className={cn(className)}
    {...props}
    unoptimized
  />
));
MaDIcon.displayName = "MaDIcon";


"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export default function Header() {
  return (
    <header className="sticky top-2 z-10 mx-2 mt-2 flex h-14 items-center gap-4 rounded-xl border-none bg-transparent px-4 shadow-none sm:px-6 glass-panel non-printable">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1">
        {/* Can add breadcrumbs or page title here */}
      </div>
      <ThemeToggle />
    </header>
  );
}

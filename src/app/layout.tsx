import type { Metadata } from "next";
import { AppProvider } from "@/contexts/app-context";
import { Toaster } from "@/components/ui/toaster";
import { Sidebar, SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import SidebarNav from "@/components/layout/sidebar-nav";
import Header from "@/components/layout/header";
import { AIAssistant } from "@/components/ai/ai-assistant-sheet";
import "./globals.css";

export const metadata: Metadata = {
  title: "SMEs Toolkit",
  description: "Smart tools for your business.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;700&family=Belleza&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased bg-gradient-to-br from-dark-start to-dark-end text-foreground">
        <AppProvider>
          <SidebarProvider>
            <Sidebar>
              <SidebarNav />
            </Sidebar>
            <SidebarInset className="flex flex-col">
              <Header />
              <main className="flex-1 p-4 md:p-6">{children}</main>
            </SidebarInset>
          </SidebarProvider>
          <AIAssistant />
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}

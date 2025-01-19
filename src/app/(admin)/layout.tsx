"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SearchProvider } from "@/context/search-context";
import React from "react";

const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <SidebarProvider>
      <SearchProvider>
        <div className="flex h-screen w-screen overflow-hidden">
          {/* Sidebar */}
          <AppSidebar />
          {/* Main content area */}
          <SidebarInset className="flex-1 overflow-auto">
            {children}
          </SidebarInset>
        </div>
      </SearchProvider>
    </SidebarProvider>
  );
};

export default layout;

"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { SearchProvider } from "@/context/search-context";
import React from "react";

const layoutUsers = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <SidebarProvider>
      <SearchProvider>
        <AppSidebar />
        <SidebarInset>{children}</SidebarInset>
      </SearchProvider>
    </SidebarProvider>
  );
};

export default layoutUsers;

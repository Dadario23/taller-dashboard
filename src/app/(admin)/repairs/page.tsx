"use client";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { repairsColumns } from "@/components/repairs/repairs-columns";
import { RepairsDataTable } from "@/components/repairs/repairs-data-table";
import RepairsProvider from "@/context/repairs-context";
import React, { useState } from "react";
import { TasksPrimaryButtons } from "@/components/repairs/tasks-primary-buttons";
import { RepairsDialogs } from "@/components/repairs/repairs-dialogs";

export default function Repairs() {
  const [repairs, setRepairs] = useState([]);

  React.useEffect(() => {
    fetch("/api/repairs")
      .then((res) => res.json())
      .then((data) => setRepairs(data));
  }, []);

  return (
    <RepairsProvider>
      <Header>
        <Search />
        <div className="ml-auto flex items-center gap-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="mb-2 flex items-center justify-between space-y-2 flex-wrap gap-x-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Repairs</h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of your repairs for this month!
            </p>
          </div>
          <TasksPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          <RepairsDataTable data={repairs} columns={repairsColumns} />
        </div>
      </Main>

      {/* Aquí se incluyen los diálogos */}
      <RepairsDialogs />
    </RepairsProvider>
  );
}

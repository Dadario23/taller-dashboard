"use client";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { columns } from "@/components/tasks/columns";
import { DataTable } from "@/components/tasks/data-table";
import { TasksDialogs } from "@/components/tasks/tasks-dialogs";
import { TasksPrimaryButtons } from "@/components/tasks/tasks-primary-buttons";
import TasksProvider from "@/context/tasks-context";
import { tasks } from "@/components/tasks/data/tasks";

export default function Tasks() {
  return (
    <TasksProvider>
      <Header fixed>
        <Search />
        <div className="ml-auto flex items-center gap-4">
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main>
        <div className="mb-2 flex items-center justify-between space-y-2 flex-wrap gap-x-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
            <p className="text-muted-foreground">
              Here&apos;s a list of your tasks for this month!
            </p>
          </div>
          <TasksPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          <DataTable data={tasks} columns={columns} />
        </div>
      </Main>

      <TasksDialogs />
    </TasksProvider>
  );
}

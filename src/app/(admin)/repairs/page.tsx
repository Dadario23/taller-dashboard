"use client";
import { Header } from "@/components/layout/header";
import { Main } from "@/components/layout/main";
import { ProfileDropdown } from "@/components/profile-dropdown";
import { Search } from "@/components/search";
import { ThemeSwitch } from "@/components/theme-switch";
import { repairsColumns } from "@/components/repairs/repairs-columns";
import { RepairsDataTable } from "@/components/repairs/repairs-data-table";
import React, { useEffect } from "react";
import { TasksPrimaryButtons } from "@/components/repairs/tasks-primary-buttons";
import { RepairsDialogs } from "@/components/repairs/repairs-dialogs";
import { Loader } from "lucide-react";
import { useRepairStore } from "@/stores/repairs-store"; // Importar el store de Zustand

export default function Repairs() {
  // Usar el store de Zustand
  const { repairs, isLoading, fetchRepairs } = useRepairStore();

  // Obtener las reparaciones al montar el componente
  useEffect(() => {
    fetchRepairs();
  }, [fetchRepairs]);

  return (
    <>
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
            <p className="text-muted-foreground">Here is a list of repairs.</p>
          </div>
          <TasksPrimaryButtons />
        </div>
        <div className="-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0">
          {isLoading ? (
            <div className="flex flex-col justify-center items-center min-h-[300px] w-full">
              <Loader className="w-10 h-10 animate-spin" />
            </div>
          ) : (
            <RepairsDataTable data={repairs} columns={repairsColumns} />
          )}
        </div>
      </Main>

      {/* Aquí se incluyen los diálogos */}
      <RepairsDialogs />
    </>
  );
}

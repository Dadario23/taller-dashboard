import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RepairType } from "@/components/repairs/data/schema";
import { DataTableColumnHeader } from "./repairs-data-table-column-header";
import Link from "next/link";
import { DataTableRowActions } from "./repairs-data-table-row-actions";

export const repairsColumns: ColumnDef<RepairType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "repairCode",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Repair Code" />
    ),
    cell: ({ row }) => (
      <Link
        href={`/repairs/${row.getValue("repairCode")}`}
        className="text-blue-500 hover:underline"
      >
        {row.getValue("repairCode")}
      </Link>
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue("title")}</span>
    ),
    enableSorting: true,
    enableHiding: false,
  },
  {
    accessorKey: "device",
    header: "Device Info",
    cell: ({ row }) => {
      const device = row.original.device;
      return (
        <div>
          <p className="text-sm font-medium">
            {device.type} - {device.brand}
          </p>
          <p className="text-xs text-muted-foreground">
            {device.model} (SN: {device.serialNumber || "N/A"})
          </p>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string; // Aserción de tipo
      return <Badge variant="outline">{status}</Badge>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "priority",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Priority" />
    ),
    cell: ({ row }) => {
      const priority = row.getValue("priority") as string; // Aserción de tipo
      return (
        <Badge variant={priority === "High" ? "destructive" : "outline"}>
          {priority}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];

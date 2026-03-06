"use client";

import type { Table } from "@tanstack/react-table";
import { Filter, SlidersVertical } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DataTableFilterToggleProps<TData> {
  table: Table<TData>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DataTableFilterToggle<TData>({
  table,
  open,
  onOpenChange,
}: DataTableFilterToggleProps<TData>) {
  const activeFiltersCount = React.useMemo(() => {
    return table.getState().columnFilters.filter(
      (filter) => filter.value !== undefined && filter.value !== "",
    ).length;
  }, [table.getState().columnFilters]);

  return (
    <Button
      variant={open ? "default" : "outline"}
      size="sm"
      onClick={() => onOpenChange(!open)}
      className={cn(
        "h-8 rounded-md border",
        open && "bg-primary text-primary-foreground",
      )}
    >
      <SlidersVertical size={20} className="h-5 w-5" />
      {activeFiltersCount > 0 && (
        <div
          className="ml-2 flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium"
          style={{
            backgroundColor: open ? "#8973FA" : "#8973FA4D",
            color: open ? "#1D2537" : "#C0B4FF",
          }}
        >
          {activeFiltersCount}
        </div>
      )}
    </Button>
  );
}


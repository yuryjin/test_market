"use client";

import type { Table } from "@tanstack/react-table";
import { SettingsIcon, X } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DataTableViewOptionsProps<TData> {
  table: Table<TData>;
  disabled?: boolean;
}

export function DataTableViewOptions<TData>({
  table,
  disabled,
}: DataTableViewOptionsProps<TData>) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const columns = React.useMemo(
    () =>
      table
        .getAllColumns()
        .filter(
          (column) =>
            typeof column.accessorFn !== "undefined" && column.getCanHide(),
        ),
    [table],
  );

  const filteredColumns = React.useMemo(
    () =>
      columns.filter((column) => {
        const label =
          column.columnDef.meta?.label ?? column.id;
        return label
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      }),
    [columns, searchQuery],
  );

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="right">
      <DrawerTrigger asChild>
        <Button
          aria-label="Настройки колонок"
          variant="outline"
          size="sm"
          className="ml-auto hidden h-8 font-normal lg:flex bg-transparent border-none"
          disabled={disabled}
          style={{ background: "transparent" }}
        >
          <SettingsIcon className="text-muted-foreground" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full w-full sm:max-w-md flex flex-col">
        <DrawerHeader className="border-b shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DrawerTitle>Настройки колонок</DrawerTitle>
              <DrawerDescription>
                Выберите колонки для отображения в таблице
              </DrawerDescription>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>
        <div className="flex flex-col gap-4 p-4 flex-1 min-h-0">
          <Input
            placeholder="Поиск колонок..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full shrink-0"
          />
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="flex flex-col gap-2">
              {filteredColumns.length > 0 ? (
                filteredColumns.map((column) => {
                  const label =
                    column.columnDef.meta?.label ?? column.id;
                  const isVisible = column.getIsVisible();

                  return (
                    <div
                      key={column.id}
                      className="flex items-center gap-3 rounded-md border p-3 hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={column.id}
                        checked={isVisible}
                        onCheckedChange={(checked) =>
                          column.toggleVisibility(!!checked)
                        }
                      />
                      <label
                        htmlFor={column.id}
                        className="flex-1 cursor-pointer text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {label}
                      </label>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Колонки не найдены.
                </div>
              )}
            </div>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

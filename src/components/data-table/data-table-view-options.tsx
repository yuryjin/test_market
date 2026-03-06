"use client";

import type { Table } from "@tanstack/react-table";
import { GripVertical, SettingsIcon, X } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableItemHandle,
} from "@/components/ui/sortable";
import { Switch } from "@/components/ui/switch";
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
  const [updateInterval, setUpdateInterval] = React.useState("5");

  const columns = React.useMemo(
    () =>
      table
        .getAllColumns()
        .filter((column) => column.getCanHide()),
    [table],
  );

  const currentColumnOrder = table.getState().columnOrder.length > 0
    ? table.getState().columnOrder
    : columns.map((col) => col.id);

  const sortedColumns = React.useMemo(() => {
    const orderMap = new Map(currentColumnOrder.map((id, index) => [id, index]));
    return [...columns].sort((a, b) => {
      const aIndex = orderMap.get(a.id) ?? Infinity;
      const bIndex = orderMap.get(b.id) ?? Infinity;
      return aIndex - bIndex;
    });
  }, [columns, currentColumnOrder]);

  const columnOrder = React.useMemo(
    () => sortedColumns.map((col) => col.id),
    [sortedColumns],
  );

  const onColumnOrderChange = React.useCallback(
    (newOrder: string[]) => {
      // Обновляем порядок колонок через columnOrder
      table.setColumnOrder(newOrder);
    },
    [table],
  );

  const onEnableAllColumns = React.useCallback(() => {
    columns.forEach((column) => {
      if (!column.getIsVisible()) {
        column.toggleVisibility(true);
      }
    });
  }, [columns]);

  const onResetToDefault = React.useCallback(() => {
    // Сбрасываем видимость колонок к значениям по умолчанию
    columns.forEach((column) => {
      const defaultVisible = column.columnDef.enableHiding !== false;
      column.toggleVisibility(defaultVisible);
    });
  }, [columns]);

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="right">
      <DrawerTrigger asChild>
        <Button
          aria-label="Настройка таблицы"
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
            <DrawerTitle>Настройка таблицы</DrawerTitle>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>
        <div className="flex flex-col gap-6 p-4 flex-1 min-h-0 overflow-y-auto">
          {/* Секция обновления */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="update-interval">Обновление</Label>
            <Select value={updateInterval} onValueChange={setUpdateInterval}>
              <SelectTrigger id="update-interval" className="w-full">
                <SelectValue placeholder="Выберите интервал" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">Каждые 5 секунд</SelectItem>
                <SelectItem value="10">Каждые 10 секунд</SelectItem>
                <SelectItem value="30">Каждые 30 секунд</SelectItem>
                <SelectItem value="60">Каждую минуту</SelectItem>
                <SelectItem value="0">Отключено</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Секция набора и порядка столбцов */}
          <div className="flex flex-col gap-3">
            <Label>Набор и порядок столбцов</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onResetToDefault}
                className="flex-1"
              >
                Набор по умолчанию
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={onEnableAllColumns}
                className="flex-1"
              >
                Включить все столбцы
              </Button>
            </div>
            <Sortable
              value={columnOrder}
              onValueChange={onColumnOrderChange}
              getItemValue={(id) => id}
              orientation="vertical"
            >
              <SortableContent className="flex flex-col">
                {sortedColumns.map((column, index) => {
                  const label =
                    column.columnDef.meta?.label ?? column.id;
                  const isVisible = column.getIsVisible();

                  return (
                    <SortableItem
                      key={column.id}
                      value={column.id}
                      className={cn(
                        "flex items-center gap-3 border-b last:border-b-0 py-3",
                        "hover:bg-muted/50 transition-colors"
                      )}
                    >
                      <SortableItemHandle asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 cursor-grab active:cursor-grabbing shrink-0"
                        >
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </SortableItemHandle>
                      <span className="flex-1 text-sm font-medium">
                        {label}
                      </span>
                      <Switch
                        checked={isVisible}
                        onCheckedChange={(checked: boolean) =>
                          column.toggleVisibility(checked)
                        }
                      />
                    </SortableItem>
                  );
                })}
              </SortableContent>
            </Sortable>
          </div>
        </div>
        <div className="border-t p-4 shrink-0">
          <Button
            onClick={() => setOpen(false)}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Применить
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

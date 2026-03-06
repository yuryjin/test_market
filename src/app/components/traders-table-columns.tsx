"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CalendarIcon, CircleDashed } from "lucide-react";
import * as React from "react";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { Trader } from "@/types/trader";
import { formatCurrency, formatDateTime } from "@/lib/format";

interface GetTradersTableColumnsProps {
  statusCounts: Record<Trader["status"], number>;
  setRowAction?: React.Dispatch<
    React.SetStateAction<{ row: { original: Trader } } | null>
  >;
}

export function getTradersTableColumns({
  statusCounts,
}: GetTradersTableColumnsProps): ColumnDef<Trader>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          aria-label="Выбрать все"
          className="translate-y-0.5"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label="Выбрать строку"
          className="translate-y-0.5"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      enableHiding: false,
      enableSorting: false,
      size: 40,
    },
    {
      id: "trader",
      accessorFn: (row) => `${row.name}/${row.id}`,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Трейдер/ID/Создан" />
      ),
      cell: ({ row }) => {
        const trader = row.original;
        return (
          <div className="flex flex-col gap-1">
            <div className="font-medium">
              {trader.name}/*{trader.id}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatDateTime(trader.created)}
            </div>
          </div>
        );
      },
      meta: {
        label: "Трейдер",
        placeholder: "Поиск трейдеров...",
        variant: "text",
      },
      enableColumnFilter: true,
    },
    {
      id: "team",
      accessorKey: "team",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Команда /Группа" />
      ),
      cell: ({ row }) => {
        const trader = row.original;
        return (
          <div className="flex flex-col gap-1">
            <div className="font-medium">{trader.team}</div>
            <div className="text-sm text-muted-foreground">{trader.group}</div>
          </div>
        );
      },
      meta: {
        label: "Команда",
        variant: "text",
      },
      enableColumnFilter: true,
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Статус/Посл. акт." />
      ),
      cell: ({ row }) => {
        const trader = row.original;
        const statusColors: Record<Trader["status"], string> = {
          Активен: "bg-green-500/10 text-green-500 border-green-500/20",
          Оффлайн: "bg-gray-500/10 text-gray-500 border-gray-500/20",
          Заблокирован: "bg-red-500/10 text-red-500 border-red-500/20",
        };
        return (
          <div className="flex flex-col gap-1">
            <Badge
              variant="outline"
              className={`${statusColors[trader.status]} py-1`}
            >
              {trader.status}
            </Badge>
            <div className="text-sm text-muted-foreground">
              {formatDateTime(trader.lastActive)}
            </div>
          </div>
        );
      },
      meta: {
        label: "Статус",
        variant: "multiSelect",
        options: (["Активен", "Оффлайн", "Заблокирован"] as const).map(
          (status) => ({
            label: status,
            value: status,
            count: statusCounts[status],
          }),
        ),
        icon: CircleDashed,
      },
      enableColumnFilter: true,
    },
    {
      id: "requisites",
      header: "Реквизиты",
      cell: ({ row }) => {
        const trader = row.original;
        // Вычисляем реквизиты на основе данных
        // Акт. (Активные) - можно использовать cycles.current
        // Авт. (Авторизованные) - можно использовать deals.successful
        // Всего - сумма
        const active = trader.cycles.current;
        const authorized = trader.deals.successful;
        const total = active + authorized;
        return (
          <div className="flex gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Акт.</span>
              <span className="font-medium">{active}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Авт.</span>
              <span className="font-medium">{authorized}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Всего</span>
              <span className="font-bold">{total}</span>
            </div>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      id: "deals",
      header: "Сделки",
      cell: ({ row }) => {
        const trader = row.original;
        return (
          <div className="flex gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Усп.</span>
              <span className="font-medium">{trader.deals.successful}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Авт.</span>
              <span className="font-medium">{trader.deals.profitable}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Спор.</span>
              <span className="font-medium">{trader.deals.failed}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Всего</span>
              <span className="font-bold">{trader.deals.total}</span>
            </div>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      id: "deposit",
      header: "Депозит",
      cell: ({ row }) => {
        const trader = row.original;
        return (
          <div className="flex gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Холд.</span>
              <span className="font-medium">
                {formatCurrency(trader.deposit.hold)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Раб.</span>
              <span className="font-bold">
                {formatCurrency(trader.deposit.working)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Страх.</span>
              <span className="font-medium">
                {formatCurrency(trader.deposit.insurance)}
              </span>
            </div>
          </div>
        );
      },
      enableSorting: false,
    },
    {
      id: "turnover",
      header: "Оборот",
      cell: ({ row }) => {
        const trader = row.original;
        return (
          <div className="flex gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Всего</span>
              <span className="font-medium">
                {formatCurrency(trader.turnover.average)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Су</span>
              <span className="font-medium">
                {formatCurrency(trader.turnover.daily)}
              </span>
            </div>
          </div>
        );
      },
      enableSorting: false,
    },
  ];
}


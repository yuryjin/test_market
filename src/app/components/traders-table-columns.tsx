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
        label: "Трейдер/ID / Создан",
        placeholder: "Поиск трейдеров...",
        variant: "text",
      },
      enableColumnFilter: true,
    },
    {
      id: "team",
      accessorKey: "team",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Команда / Группа" />
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
        label: "Команда / Группа",
        variant: "text",
      },
      enableColumnFilter: true,
    },
    {
      id: "status",
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Статус / Активность" />
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
        label: "Статус / Активность",
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
      id: "requisites-deals",
      header: "Реквизиты / Сделки",
      cell: ({ row }) => {
        const trader = row.original;
        const active = trader.cycles.current;
        const authorized = trader.deals.successful;
        const totalRequisites = active + authorized;
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
              <span className="font-bold">{totalRequisites}</span>
            </div>
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
      meta: {
        label: "Реквизиты / Сделки",
      },
      enableSorting: false,
    },
    {
      id: "deposit-turnover",
      header: "Депозит / Оборот",
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
      meta: {
        label: "Депозит / Оборот",
      },
      enableSorting: false,
    },
    {
      id: "percentage",
      accessorKey: "percentage",
      header: "Процент / Доход",
      cell: ({ row }) => {
        const trader = row.original;
        return (
          <div className="flex gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Процент</span>
              <span className="font-medium">{trader.percentage}%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Доход</span>
              <span className="font-medium">
                {formatCurrency(trader.income)}
              </span>
            </div>
          </div>
        );
      },
      meta: {
        label: "Процент / Доход",
      },
      enableSorting: false,
    },
    {
      id: "speed",
      header: "Скор. транзакций / Рабочие циклы",
      cell: ({ row }) => {
        const trader = row.original;
        return (
          <div className="flex gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Текущая</span>
              <span className="font-medium">{trader.speed.current}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Средняя</span>
              <span className="font-medium">{trader.speed.average}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Циклы</span>
              <span className="font-medium">{trader.cycles.current}</span>
            </div>
          </div>
        );
      },
      meta: {
        label: "Скор. транзакций / Рабочие циклы",
      },
      enableSorting: false,
    },
    {
      id: "limits",
      header: "Лимит на сделку / Лимит авто",
      cell: () => {
        // Заглушка - данных нет в JSON
        return (
          <div className="flex gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">На сделку</span>
              <span className="font-medium">-</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Авто</span>
              <span className="font-medium">-</span>
            </div>
          </div>
        );
      },
      meta: {
        label: "Лимит на сделку / Лимит авто",
      },
      enableSorting: false,
    },
    {
      id: "conversion",
      header: "Конверсия / Конверсия авто",
      cell: () => {
        // Заглушка - данных нет в JSON
        return (
          <div className="flex gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Конверсия</span>
              <span className="font-medium">-</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Авто</span>
              <span className="font-medium">-</span>
            </div>
          </div>
        );
      },
      meta: {
        label: "Конверсия / Конверсия авто",
      },
      enableSorting: false,
    },
    {
      id: "merchant",
      header: "Мерчант / График работы",
      cell: () => {
        // Заглушка - данных нет в JSON
        return (
          <div className="flex gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Мерчант</span>
              <span className="font-medium">-</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">График</span>
              <span className="font-medium">-</span>
            </div>
          </div>
        );
      },
      meta: {
        label: "Мерчант / График работы",
      },
      enableSorting: false,
      // По умолчанию скрыта
      enableHiding: true,
    },
  ];
}


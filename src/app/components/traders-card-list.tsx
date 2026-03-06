"use client";

import * as React from "react";
import type { Table } from "@tanstack/react-table";
import { TraderCard } from "./trader-card";
import type { Trader } from "@/types/trader";
import { cn } from "@/lib/utils";

interface TradersCardListProps<TData> {
  table: Table<TData>;
}

export function TradersCardList<TData>({ table }: TradersCardListProps<TData>) {
  const rows = table.getRowModel().rows;

  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 text-center text-muted-foreground">
        Нет результатов.
      </div>
    );
  }

  return (
    <div className="space-y-3 pb-4">
      {rows.map((row) => {
        const trader = row.original as Trader;
        return (
          <TraderCard
            key={row.id}
            trader={trader}
            isSelected={row.getIsSelected()}
            onSelect={(selected) => row.toggleSelected(selected)}
          />
        );
      })}
    </div>
  );
}


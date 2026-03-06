"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TopTrader } from "../lib/traders-stats";

interface TopTradersCardProps {
  traders: TopTrader[];
  type: "deals" | "turnover";
  period: "30d" | "all";
  onTypeChange: (type: "deals" | "turnover") => void;
  onPeriodChange: (period: "30d" | "all") => void;
}

export function TopTradersCard({
  traders,
  type,
  period,
  onTypeChange,
  onPeriodChange,
}: TopTradersCardProps) {
  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl font-bold">Топ-3</div>
        <div className="flex gap-2">
          <Button
            variant={type === "deals" ? "default" : "outline"}
            size="sm"
            onClick={() => onTypeChange("deals")}
            className="h-7 text-xs"
          >
            Сделки
          </Button>
          <Button
            variant={type === "turnover" ? "default" : "outline"}
            size="sm"
            onClick={() => onTypeChange("turnover")}
            className="h-7 text-xs"
          >
            Оборот
          </Button>
          <Button
            variant={period === "30d" ? "default" : "outline"}
            size="sm"
            onClick={() => onPeriodChange("30d")}
            className="h-7 text-xs"
          >
            30дн
          </Button>
          <Button
            variant={period === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => onPeriodChange("all")}
            className="h-7 text-xs"
          >
            Все
          </Button>
        </div>
      </div>
      <div className="flex flex-col">
        {traders.map((trader, index) => (
          <div
            key={trader.name}
            className={cn(
              "flex items-center justify-between py-3",
              index < traders.length - 1 && "border-b",
            )}
          >
            <span className="text-sm font-medium">{trader.name}</span>
            <span className="text-sm font-medium">
              {type === "turnover" ? formatCurrency(trader.value) : trader.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}


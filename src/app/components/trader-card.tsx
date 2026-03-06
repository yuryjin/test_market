"use client";

import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Trader } from "@/types/trader";
import {
  ArrowUp,
  CheckCircle2,
  HelpCircle,
  Coins,
  ChevronRight,
  RotateCcw,
  Clock,
} from "lucide-react";

interface TraderCardProps {
  trader: Trader;
  isSelected: boolean;
  onSelect: (selected: boolean) => void;
}

export function TraderCard({ trader, isSelected, onSelect }: TraderCardProps) {
  const statusColors: Record<Trader["status"], string> = {
    Активен: "bg-green-500/10 text-green-500 border-green-500/20",
    Оффлайн: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    Заблокирован: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <div
      className={cn(
        "rounded-lg border bg-[#BEBDC81F] p-4 space-y-3",
        isSelected && "ring-2 ring-primary",
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={onSelect}
            className="translate-y-0.5"
          />
          <div>
            <div className="font-medium text-sm">
              {trader.name}/*{trader.id}
            </div>
            <div className="text-xs text-muted-foreground">
              {formatDateTime(trader.created)}
            </div>
          </div>
        </div>
        <Badge
          variant="outline"
          className={cn("py-1 text-xs", statusColors[trader.status])}
        >
          {trader.status}
        </Badge>
      </div>

      {/* Metrics */}
      <div className="space-y-2 text-sm">
        {/* Реквизиты */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground min-w-[80px]">Реквизиты:</span>
          <div className="flex items-center gap-1">
            <span>{trader.deals.total}</span>
            <span className="text-muted-foreground">·</span>
            <ArrowUp className="h-3 w-3 text-green-500" />
            <span className="text-green-500">
              {trader.deals.successful} ({trader.deals.profitable})
            </span>
          </div>
        </div>

        {/* Сделки */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground min-w-[80px]">Сделки:</span>
          <div className="flex items-center gap-1">
            <span>{trader.deals.total}</span>
            <span className="text-muted-foreground">·</span>
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            <span className="text-green-500">
              {trader.deals.successful} ({trader.deals.profitable})
            </span>
            <span className="text-muted-foreground">·</span>
            <HelpCircle className="h-3 w-3 text-red-500" />
            <span className="text-red-500">{trader.deals.failed}</span>
          </div>
        </div>

        {/* Депозит */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground min-w-[80px]">Депозит:</span>
          <div className="flex items-center gap-1 flex-wrap">
            <Coins className="h-3 w-3 text-orange-500" />
            <span>{formatCurrency(trader.deposit.hold)}</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            <span>{formatCurrency(trader.deposit.working)}</span>
            <RotateCcw className="h-3 w-3 text-green-500" />
            <span className="text-green-500">
              {formatCurrency(trader.deposit.insurance)}
            </span>
          </div>
        </div>

        {/* Оборот */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground min-w-[80px]">Оборот:</span>
          <div className="flex items-center gap-1 flex-wrap">
            <span>{formatCurrency(trader.turnover.average)}</span>
            <RotateCcw className="h-3 w-3 text-green-500" />
            <span className="text-green-500">
              {formatCurrency(trader.turnover.daily)}
            </span>
            <RotateCcw className="h-3 w-3 text-green-500" />
            <span className="text-green-500">
              {formatCurrency(trader.turnover.perCycle)}
            </span>
          </div>
        </div>

        {/* Процент */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground min-w-[80px]">Процент:</span>
          <span>{trader.percentage}%</span>
        </div>

        {/* Доход */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground min-w-[80px]">Доход:</span>
          <div className="flex items-center gap-1">
            <span>{formatCurrency(trader.income)}</span>
            <Coins className="h-3 w-3 text-orange-500" />
            <span className="text-orange-500">
              {formatCurrency(Math.round(trader.income * 0.1))}
            </span>
          </div>
        </div>

        {/* Скорость транзакций */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground min-w-[80px]">
            Скорость транзакций:
          </span>
          <div className="flex items-center gap-1">
            <span>{trader.speed.current}</span>
            <span className="text-muted-foreground">·</span>
            <Clock className="h-3 w-3 text-red-500" />
            <span className="text-red-500">{trader.speed.average}</span>
          </div>
        </div>

        {/* Рабочие циклы */}
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground min-w-[80px]">
            Рабочие циклы:
          </span>
          <div className="flex items-center gap-1">
            <span>{trader.cycles.total.toLocaleString()}</span>
            <span className="text-muted-foreground">·</span>
            <Clock className="h-3 w-3 text-red-500" />
            <span className="text-red-500">{trader.cycles.current}</span>
          </div>
        </div>
      </div>
    </div>
  );
}


"use client";

import * as React from "react";
import { StatsCardWithChart } from "./stats-card-with-chart";
import { TopTradersCard } from "./top-traders-card";
import { TradersStatsCard } from "./traders-stats-card";
import type {
  AverageStats,
  TopTrader,
  TraderStats,
} from "../lib/traders-stats";
import type { Trader } from "@/types/trader";
import { formatCurrency } from "@/lib/format";

interface TradersStatsProps {
  stats: TraderStats;
  averages: AverageStats;
  topTraders: TopTrader[];
  traders: Trader[];
}

function calculateTopTraders(
  traders: Trader[],
  type: "deals" | "turnover",
  period: "30d" | "all",
): TopTrader[] {
  const topTraders = traders
    .map((trader) => {
      let value = 0;
      if (type === "deals") {
        value = period === "30d" 
          ? Math.round(trader.deals.total * (30 / 365))
          : trader.deals.total;
      } else {
        value = period === "30d"
          ? trader.turnover.daily * 30
          : trader.turnover.average;
      }
      return {
        name: trader.name,
        value: Math.round(value),
      };
    })
    .sort((a, b) => b.value - a.value)
    .slice(0, 3);

  return topTraders;
}

export function TradersStats({
  stats,
  averages,
  topTraders: initialTopTraders,
  traders,
}: TradersStatsProps) {
  const [type, setType] = React.useState<"deals" | "turnover">("deals");
  const [period, setPeriod] = React.useState<"30d" | "all">("30d");
  const [topTraders, setTopTraders] =
    React.useState<TopTrader[]>(initialTopTraders);

  React.useEffect(() => {
    const calculated = calculateTopTraders(traders, type, period);
    setTopTraders(calculated);
  }, [type, period, traders]);

  return (
    // <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
    <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:flex gap-2.5 overflow-y-hidden sm:overflow-x-hidden overflow-x-scroll">
      <TradersStatsCard stats={stats} />
      <StatsCardWithChart
        title={formatCurrency(averages.turnover)}
        value={formatCurrency(averages.turnover)}
        subtitle="30 дн средний оборот"
        color="green"
      />
      <StatsCardWithChart
        title={formatCurrency(averages.check)}
        value={formatCurrency(averages.check)}
        subtitle="30 дн средний чек"
        color="purple"
      />
      <StatsCardWithChart
        title={`${averages.conversion}%`}
        value={`${averages.conversion}%`}
        subtitle="30 дн конверсия"
        color="orange"
      />
      <TopTradersCard
        traders={topTraders}
        type={type}
        period={period}
        onTypeChange={setType}
        onPeriodChange={setPeriod}
      />
    </div>
  );
}


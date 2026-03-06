"use cache";

import "server-only";

import { cacheLife } from "next/cache";
import type { Trader } from "@/types/trader";
import tradersData from "@/data/traders.json";

export interface TraderStats {
  total: number;
  active: number;
  offline: number;
  blocked: number;
}

export interface AverageStats {
  turnover: number;
  check: number;
  conversion: number;
}

export interface TopTrader {
  name: string;
  value: number;
}

export async function getTraderStats(): Promise<TraderStats> {
  cacheLife({ revalidate: 1, stale: 1, expire: 60 });

  try {
    const traders = tradersData as Trader[];
    return {
      total: traders.length,
      active: traders.filter((t) => t.status === "Активен").length,
      offline: traders.filter((t) => t.status === "Оффлайн").length,
      blocked: traders.filter((t) => t.status === "Заблокирован").length,
    };
  } catch {
    return {
      total: 0,
      active: 0,
      offline: 0,
      blocked: 0,
    };
  }
}

export async function getAverageStats(): Promise<AverageStats> {
  cacheLife({ revalidate: 1, stale: 1, expire: 60 });

  try {
    const traders = tradersData as Trader[];
    
    // Средний оборот за 30 дней
    const totalTurnover = traders.reduce(
      (sum, trader) => sum + trader.turnover.daily * 30,
      0,
    );
    const avgTurnover = traders.length > 0 ? totalTurnover / traders.length : 0;

    // Средний чек (оборот / количество сделок)
    const totalCheck = traders.reduce((sum, trader) => {
      const check = trader.deals.total > 0 
        ? trader.turnover.average / trader.deals.total 
        : 0;
      return sum + check;
    }, 0);
    const avgCheck = traders.length > 0 ? totalCheck / traders.length : 0;

    // Конверсия (успешные сделки / всего сделок)
    const totalConversion = traders.reduce((sum, trader) => {
      const conversion = trader.deals.total > 0
        ? (trader.deals.successful / trader.deals.total) * 100
        : 0;
      return sum + conversion;
    }, 0);
    const avgConversion = traders.length > 0 ? totalConversion / traders.length : 0;

    return {
      turnover: Math.round(avgTurnover),
      check: Math.round(avgCheck),
      conversion: Math.round(avgConversion * 10) / 10,
    };
  } catch {
    return {
      turnover: 0,
      check: 0,
      conversion: 0,
    };
  }
}

export async function getTopTraders(
  type: "deals" | "turnover" = "deals",
  period: "30d" | "all" = "30d",
): Promise<TopTrader[]> {
  cacheLife({ revalidate: 1, stale: 1, expire: 60 });

  try {
    const traders = tradersData as Trader[];
    
    const topTraders = traders
      .map((trader) => {
        let value = 0;
        if (type === "deals") {
          value = period === "30d" 
            ? Math.round(trader.deals.total * (30 / 365)) // Примерная оценка за 30 дней
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
  } catch {
    return [];
  }
}


"use cache";

import "server-only";

import { cacheLife } from "next/cache";
import type { Trader } from "@/types/trader";
import tradersData from "@/data/traders.json";

export async function getTraders(): Promise<{
  data: Trader[];
  pageCount: number;
}> {
  cacheLife({ revalidate: 1, stale: 1, expire: 60 });

  try {
    const data = tradersData as Trader[];
    // Возвращаем все данные для клиентской пагинации
    // pageCount = -1 означает клиентскую пагинацию
    return { data, pageCount: -1 };
  } catch {
    return { data: [], pageCount: 0 };
  }
}

export async function getTraderStatusCounts(): Promise<
  Record<Trader["status"], number>
> {
  cacheLife("hours");

  try {
    const traders = tradersData as Trader[];
    return traders.reduce(
      (acc, trader) => {
        acc[trader.status] = (acc[trader.status] || 0) + 1;
        return acc;
      },
      {
        Активен: 0,
        Оффлайн: 0,
        Заблокирован: 0,
      } as Record<Trader["status"], number>,
    );
  } catch {
    return {
      Активен: 0,
      Оффлайн: 0,
      Заблокирован: 0,
    };
  }
}

export async function getTeamCounts(): Promise<Record<string, number>> {
  cacheLife("hours");

  try {
    const traders = tradersData as Trader[];
    return traders.reduce(
      (acc, trader) => {
        acc[trader.team] = (acc[trader.team] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
  } catch {
    return {};
  }
}


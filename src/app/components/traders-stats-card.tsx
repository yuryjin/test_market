"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { TraderStats } from "../lib/traders-stats";

interface TradersStatsCardProps {
  stats: TraderStats;
}

export function TradersStatsCard({ stats }: TradersStatsCardProps) {
  const total = stats.total;
  const activePercent = total > 0 ? (stats.active / total) * 100 : 0;
  const offlinePercent = total > 0 ? (stats.offline / total) * 100 : 0;
  const blockedPercent = total > 0 ? (stats.blocked / total) * 100 : 0;

  // Расчет углов для донат-чарта
  const activeAngle = (activePercent / 100) * 360;
  const offlineAngle = (offlinePercent / 100) * 360;
  const blockedAngle = (blockedPercent / 100) * 360;

  const activeStartAngle = 0;
  const activeEndAngle = activeAngle;
  const offlineStartAngle = activeEndAngle;
  const offlineEndAngle = offlineStartAngle + offlineAngle;
  const blockedStartAngle = offlineEndAngle;
  const blockedEndAngle = blockedStartAngle + blockedAngle;

  const radius = 40;
  const centerX = 50;
  const centerY = 50;
  const innerRadius = 30;

  function getArcPath(
    startAngle: number,
    endAngle: number,
    outerRadius: number,
    innerRadius: number,
  ) {
    const start = polarToCartesian(centerX, centerY, outerRadius, endAngle);
    const end = polarToCartesian(centerX, centerY, outerRadius, startAngle);
    const innerStart = polarToCartesian(
      centerX,
      centerY,
      innerRadius,
      endAngle,
    );
    const innerEnd = polarToCartesian(
      centerX,
      centerY,
      innerRadius,
      startAngle,
    );

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M",
      start.x,
      start.y,
      "A",
      outerRadius,
      outerRadius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
      "L",
      innerEnd.x,
      innerEnd.y,
      "A",
      innerRadius,
      innerRadius,
      0,
      largeArcFlag,
      1,
      innerStart.x,
      innerStart.y,
      "Z",
    ].join(" ");
  }

  function polarToCartesian(
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number,
  ) {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  }

  return (
    <div className="rounded-lg bg-[#BEBDC81F] p-6 w-[220px] sm:w-full xl:w-[220px] h-[210px] min-w-[220px] min-h-[210px] max-h-[210px] col-span-1">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <div className="text-3xl font-bold">{total}</div>
          <div className="text-sm text-muted-foreground">Трейдеров</div>
        </div>
        <div className="relative h-20 w-20">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            {activeAngle > 0 && (
              <path
                d={getArcPath(activeStartAngle, activeEndAngle, radius, innerRadius)}
                fill="#22c55e"
                className="opacity-80"
              />
            )}
            {offlineAngle > 0 && (
              <path
                d={getArcPath(
                  offlineStartAngle,
                  offlineEndAngle,
                  radius,
                  innerRadius,
                )}
                fill="#6b7280"
                className="opacity-80"
              />
            )}
            {blockedAngle > 0 && (
              <path
                d={getArcPath(
                  blockedStartAngle,
                  blockedEndAngle,
                  radius,
                  innerRadius,
                )}
                fill="#f97316"
                className="opacity-80"
              />
            )}
          </svg>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500" />
          <span className="text-sm text-muted-foreground">Активные</span>
          <span className="ml-auto text-sm font-medium">{stats.active}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-gray-500" />
          <span className="text-sm text-muted-foreground">Оффлайн</span>
          <span className="ml-auto text-sm font-medium">{stats.offline}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-orange-500" />
          <span className="text-sm text-muted-foreground">Блокировка</span>
          <span className="ml-auto text-sm font-medium">{stats.blocked}</span>
        </div>
      </div>
    </div>
  );
}


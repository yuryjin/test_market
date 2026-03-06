"use client";

import * as React from "react";
import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

interface StatsCardWithChartProps {
  title: string;
  value: string | number;
  subtitle: string;
  color?: "green" | "purple" | "orange";
  data?: number[];
}

export function StatsCardWithChart({
  title,
  value,
  subtitle,
  color = "green",
  data,
}: StatsCardWithChartProps) {
  // Генерируем случайные данные для графика, если не переданы
  const chartData = React.useMemo(() => {
    if (data && data.length > 0) return data;
    return Array.from({ length: 30 }, () => Math.random() * 100);
  }, [data]);

  const maxValue = Math.max(...chartData);
  const minValue = Math.min(...chartData);
  const range = maxValue - minValue || 1;

  const normalizedData = chartData.map((val) => (val - minValue) / range);

  const colorClasses = {
    green: {
      line: "stroke-green-500",
      fill: "fill-green-500/20",
    },
    purple: {
      line: "stroke-purple-500",
      fill: "fill-purple-500/20",
    },
    orange: {
      line: "stroke-orange-500",
      fill: "fill-orange-500/20",
    },
  };

  const colors = colorClasses[color];

  const points = normalizedData
    .map((val, i) => {
      const x = (i / (normalizedData.length - 1)) * 100;
      const y = 100 - val * 80 - 10; // Оставляем отступы сверху и снизу
      return `${x},${y}`;
    })
    .join(" ");

  const pathData = `M ${points}`;

  return (
    <div className="rounded-lg border bg-card p-6">
      <div className="flex flex-col gap-1 mb-4">
        <div className="text-3xl font-bold">{value}</div>
        <div className="text-sm text-muted-foreground">{subtitle}</div>
      </div>
      <div className="h-20 w-full">
        <svg viewBox="0 0 100 100" className="h-full w-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="currentColor" stopOpacity="0.3" />
              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={colors.line}
          />
          <polygon
            points={`0,100 ${points} 100,100`}
            fill={`url(#gradient-${color})`}
            className={colors.fill}
          />
        </svg>
      </div>
    </div>
  );
}


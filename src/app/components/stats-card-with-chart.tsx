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
  // Генерируем данные только на клиенте после монтирования, чтобы избежать hydration mismatch
  const [chartData, setChartData] = React.useState<number[]>([]);
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
    if (data && data.length > 0) {
      setChartData(data);
    } else {
      // Генерируем стабильные данные на основе цвета для консистентности
      const seed = color === "green" ? 0.5 : color === "purple" ? 0.3 : 0.7;
      const generated = Array.from({ length: 30 }, (_, i) => {
        // Используем синусоидальную функцию с небольшим случайным элементом для более реалистичного вида
        const base = Math.sin((i / 30) * Math.PI * 2) * 30 + 50;
        const variation = (Math.random() - 0.5) * 20;
        return Math.max(0, Math.min(100, base + variation));
      });
      setChartData(generated);
    }
  }, [data, color]);

  const maxValue = chartData.length > 0 ? Math.max(...chartData) : 100;
  const minValue = chartData.length > 0 ? Math.min(...chartData) : 0;
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

  const points = normalizedData.length > 0
    ? normalizedData
        .map((val, i) => {
          const x = (i / (normalizedData.length - 1)) * 100;
          const y = 100 - val * 80 - 10; // Оставляем отступы сверху и снизу
          return `${x},${y}`;
        })
        .join(" ")
    : "0,90 100,90"; // Fallback для пустого состояния

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


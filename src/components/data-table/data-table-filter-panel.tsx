"use client";

import type { Table } from "@tanstack/react-table";
import { Calendar, ChevronDown, X } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { Trader } from "@/types/trader";

interface DataTableFilterPanelProps<TData> {
  table: Table<TData>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DataTableFilterPanel<TData>({
  table,
  open,
  onOpenChange,
}: DataTableFilterPanelProps<TData>) {
  const [selectedView, setSelectedView] = React.useState<"all" | "selected">("all");
  const [expandedSections, setExpandedSections] = React.useState<Set<string>>(
    new Set(),
  );

  const toggleSection = React.useCallback((section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  }, []);

  const columnFilters = table.getState().columnFilters;
  const statusColumn = table.getColumn("status");
  const statusFilter = statusColumn?.getFilterValue() as string[] | undefined;

  const onStatusChange = React.useCallback(
    (status: string) => {
      if (!statusColumn) return;
      if (status === "Любой") {
        statusColumn.setFilterValue(undefined);
      } else {
        const statusMap: Record<string, Trader["status"]> = {
          Активен: "Активен",
          Оффлайн: "Оффлайн",
          Блок: "Заблокирован",
        };
        statusColumn.setFilterValue([statusMap[status] ?? status]);
      }
    },
    [statusColumn],
  );

  return (
    <div
      className={cn(
        "absolute top-0 left-0 w-80 bg-[#BEBDC81F] rounded-[26px] border-r z-50 flex flex-col shadow-lg transition-all duration-300 ease-in-out h-full",
        open
          ? "opacity-100 translate-x-0 pointer-events-auto"
          : "opacity-0 -translate-x-full pointer-events-none",
      )}
    >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Фильтры</h2>
          <div className="flex gap-2">
            <Button
              variant={selectedView === "all" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedView("all")}
              className="h-7 text-xs"
            >
              Все
            </Button>
            <Button
              variant={selectedView === "selected" ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedView("selected")}
              className="h-7 text-xs"
            >
              Выбранн
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Трейдер Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Трейдер</h3>
            <div className="space-y-2">
              <div className="flex gap-2 flex-wrap">
                <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-sm">
                  <span>TraderName</span>
                  <button className="hover:opacity-70">
                    <X className="h-3 w-3" />
                  </button>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-sm min-w-[40px]">
                  <span className="text-muted-foreground">...</span>
                </div>
                <div
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-sm"
                  style={{
                    backgroundColor: "#8973FA4D",
                  }}
                >
                  <span style={{ color: "#C0B4FF" }}>3</span>
                  <button className="hover:opacity-70">
                    <X className="h-3 w-3" style={{ color: "#C0B4FF" }} />
                  </button>
                  <ChevronDown className="h-3 w-3" style={{ color: "#C0B4FF" }} />
                </div>
              </div>
              <FilterSection
                title="Создан"
                icon={<Calendar className="h-4 w-4" />}
                expanded={expandedSections.has("created")}
                onToggle={() => toggleSection("created")}
              >
                <div className="p-2">
                  <Input placeholder="Выберите дату" className="h-8" />
                </div>
              </FilterSection>
              <FilterSection
                title="Команды"
                expanded={expandedSections.has("teams")}
                onToggle={() => toggleSection("teams")}
              >
                <div className="p-2">
                  <Input placeholder="Выберите команды" className="h-8" />
                </div>
              </FilterSection>
              <FilterSection
                title="Группы"
                expanded={expandedSections.has("groups")}
                onToggle={() => toggleSection("groups")}
              >
                <div className="p-2">
                  <Input placeholder="Выберите группы" className="h-8" />
                </div>
              </FilterSection>
            </div>
          </div>

          <Separator />

          {/* Статус Section */}
          <div className="space-y-3">
            <h3 className="text-sm">Статус</h3>
            <div className="flex gap-2 flex-wrap border rounded-md p-1">
              {["Любой", "Активен", "Оффлайн", "Блок"].map((status) => {
                const isSelected =
                  status === "Любой"
                    ? !statusFilter || statusFilter.length === 0
                    : statusFilter?.includes(
                        status === "Блок" ? "Заблокирован" : status,
                      );
                return (
                  <Button
                    key={status}
                    variant={isSelected ? "active" : "ghost"}
                    size="sm"
                    onClick={() => onStatusChange(status)}
                    className="h-7 text-xs flex-1"
                  >
                    {status}
                  </Button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Проценты Section */}
          <div className="space-y-3">
            <h3 className="text-sm">Проценты</h3>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">
                  От
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="5"
                    className="h-8 pr-8"
                    defaultValue="5"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 hover:opacity-70">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted-foreground mb-1 block">
                  До
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="7"
                    className="h-8 pr-8"
                    defaultValue="7"
                  />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 hover:opacity-70">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Сделки и финансы Section */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Сделки и финансы</h3>
            <div className="space-y-3">
              <div>
                <h4 className="text-xs text-muted-foreground mb-2">Реквизиты</h4>
                <div className="flex gap-2">
                  {["Все", "Авто", "Актуальные"].map((option) => (
                    <Button
                      key={option}
                      variant={option === "Все" ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-xs flex-1"
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">
                    От
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="20"
                      className="h-8 pr-8"
                      defaultValue="20"
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 hover:opacity-70">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">
                    До
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="40"
                      className="h-8 pr-8"
                      defaultValue="40"
                    />
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 hover:opacity-70">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}

interface FilterSectionProps {
  title: string;
  icon?: React.ReactNode;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

function FilterSection({
  title,
  icon,
  expanded,
  onToggle,
  children,
}: FilterSectionProps) {
  return (
    <div className="border rounded-md">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-2 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm">{title}</span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            expanded && "rotate-180",
          )}
        />
      </button>
      {expanded && <div className="border-t">{children}</div>}
    </div>
  );
}


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

  // Синхронизация начальных значений фильтров с таблицей
  React.useEffect(() => {
    const traderCol = table.getColumn("trader");
    const teamCol = table.getColumn("team");
    const percentageCol = table.getColumn("percentage");
    const dealsCol = table.getColumn("requisites-deals");
    
    const traderValue = traderCol?.getFilterValue() as string | undefined;
    const teamValue = teamCol?.getFilterValue() as string | undefined;
    const percentageValue = percentageCol?.getFilterValue() as { from?: number; to?: number } | undefined;
    const dealsValue = dealsCol?.getFilterValue() as { from?: number; to?: number } | undefined;
    
    if (traderValue) setTraderSearch(traderValue);
    if (teamValue) setTeamFilter(teamValue);
    if (percentageValue) {
      if (percentageValue.from !== undefined) setPercentageFrom(String(percentageValue.from));
      if (percentageValue.to !== undefined) setPercentageTo(String(percentageValue.to));
    }
    if (dealsValue) {
      if (dealsValue.from !== undefined) setDealsFrom(String(dealsValue.from));
      if (dealsValue.to !== undefined) setDealsTo(String(dealsValue.to));
    }
  }, [table]);

  // Состояния для фильтров
  const [traderSearch, setTraderSearch] = React.useState("");
  const [createdDate, setCreatedDate] = React.useState("");
  const createdColumn = table.getColumn("created");
  const [teamFilter, setTeamFilter] = React.useState("");
  const [groupFilter, setGroupFilter] = React.useState("");
  const [percentageFrom, setPercentageFrom] = React.useState("");
  const [percentageTo, setPercentageTo] = React.useState("");
  const [dealsFrom, setDealsFrom] = React.useState("");
  const [dealsTo, setDealsTo] = React.useState("");
  const [requisitesFilter, setRequisitesFilter] = React.useState<"Все" | "Авто" | "Актуальные">("Все");

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
  const traderColumn = table.getColumn("trader");
  const teamColumn = table.getColumn("team");
  const percentageColumn = table.getColumn("percentage");
  const dealsColumn = table.getColumn("requisites-deals");
  
  const statusFilter = statusColumn?.getFilterValue() as string[] | undefined;
  const traderFilter = traderColumn?.getFilterValue() as string | undefined;
  const teamFilterValue = teamColumn?.getFilterValue() as string | undefined;
  const percentageFilter = percentageColumn?.getFilterValue() as { from?: number; to?: number } | undefined;
  const dealsFilter = dealsColumn?.getFilterValue() as { from?: number; to?: number } | undefined;

  // Получаем уникальные значения для выпадающих списков
  const allTraders = React.useMemo(() => {
    const rows = table.getCoreRowModel().rows;
    const traders = new Set<string>();
    rows.forEach((row) => {
      const trader = row.original as Trader;
      traders.add(`${trader.name}/*${trader.id}`);
    });
    return Array.from(traders).sort();
  }, [table]);

  const allTeams = React.useMemo(() => {
    const rows = table.getCoreRowModel().rows;
    const teams = new Set<string>();
    rows.forEach((row) => {
      const trader = row.original as Trader;
      teams.add(trader.team);
    });
    return Array.from(teams).sort();
  }, [table]);

  const allGroups = React.useMemo(() => {
    const rows = table.getCoreRowModel().rows;
    const groups = new Set<string>();
    rows.forEach((row) => {
      const trader = row.original as Trader;
      groups.add(trader.group);
    });
    return Array.from(groups).sort();
  }, [table]);

  // Подсчет активных фильтров
  const activeFiltersCount = React.useMemo(() => {
    let count = 0;
    if (statusFilter && statusFilter.length > 0) count++;
    if (traderFilter) count++;
    if (teamFilterValue) count++;
    if (percentageFilter?.from !== undefined || percentageFilter?.to !== undefined) count++;
    if (dealsFilter?.from !== undefined || dealsFilter?.to !== undefined) count++;
    return count;
  }, [statusFilter, traderFilter, teamFilterValue, percentageFilter, dealsFilter]);

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

  // Обработчики фильтров
  const onTraderSearchChange = React.useCallback(
    (value: string) => {
      setTraderSearch(value);
      if (traderColumn) {
        traderColumn.setFilterValue(value || undefined);
      }
    },
    [traderColumn],
  );

  const onTeamFilterChange = React.useCallback(
    (value: string) => {
      setTeamFilter(value);
      if (teamColumn) {
        teamColumn.setFilterValue(value || undefined);
      }
    },
    [teamColumn],
  );

  const onGroupFilterChange = React.useCallback(
    (value: string) => {
      setGroupFilter(value);
      // Фильтруем по группе через колонку team, так как там есть фильтр по team и group
      if (teamColumn) {
        teamColumn.setFilterValue(value || undefined);
      }
    },
    [teamColumn],
  );

  const onPercentageFilterChange = React.useCallback(
    (from: string, to: string) => {
      setPercentageFrom(from);
      setPercentageTo(to);
      if (percentageColumn) {
        const fromNum = from ? parseFloat(from) : undefined;
        const toNum = to ? parseFloat(to) : undefined;
        if (fromNum !== undefined || toNum !== undefined) {
          // Создаем кастомный фильтр для диапазона
          percentageColumn.setFilterValue({ from: fromNum, to: toNum });
        } else {
          percentageColumn.setFilterValue(undefined);
        }
      }
    },
    [percentageColumn],
  );

  const onDealsFilterChange = React.useCallback(
    (from: string, to: string) => {
      setDealsFrom(from);
      setDealsTo(to);
      if (dealsColumn) {
        const fromNum = from ? parseInt(from, 10) : undefined;
        const toNum = to ? parseInt(to, 10) : undefined;
        if (fromNum !== undefined || toNum !== undefined) {
          dealsColumn.setFilterValue({ from: fromNum, to: toNum });
        } else {
          dealsColumn.setFilterValue(undefined);
        }
      }
    },
    [dealsColumn],
  );

  // Получаем отфильтрованных трейдеров для тегов
  const filteredTraders = React.useMemo(() => {
    if (!traderFilter) return [];
    const rows = table.getCoreRowModel().rows;
    return rows
      .filter((row) => {
        const trader = row.original as Trader;
        const searchStr = `${trader.name}/*${trader.id}`.toLowerCase();
        return searchStr.includes(traderFilter.toLowerCase());
      })
      .slice(0, 3)
      .map((row) => {
        const trader = row.original as Trader;
        return `${trader.name}/*${trader.id}`;
      });
  }, [traderFilter, table]);

  // Удаление фильтров
  const removeTraderFilter = React.useCallback(() => {
    setTraderSearch("");
    if (traderColumn) {
      traderColumn.setFilterValue(undefined);
    }
  }, [traderColumn]);

  const removeTeamFilter = React.useCallback(() => {
    setTeamFilter("");
    if (teamColumn) {
      teamColumn.setFilterValue(undefined);
    }
  }, [teamColumn]);

  const removeGroupFilter = React.useCallback(() => {
    setGroupFilter("");
    if (teamColumn) {
      teamColumn.setFilterValue(undefined);
    }
  }, [teamColumn]);

  const removePercentageFilter = React.useCallback(() => {
    setPercentageFrom("");
    setPercentageTo("");
    if (percentageColumn) {
      percentageColumn.setFilterValue(undefined);
    }
  }, [percentageColumn]);

  const removeDealsFilter = React.useCallback(() => {
    setDealsFrom("");
    setDealsTo("");
    const dealsCol = table.getColumn("requisites-deals");
    if (dealsCol) {
      dealsCol.setFilterValue(undefined);
    }
  }, [table]);

  const removeStatusFilter = React.useCallback(() => {
    if (statusColumn) {
      statusColumn.setFilterValue(undefined);
    }
  }, [statusColumn]);

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
        <div className="flex items-center justify-between p-4 pb-0">
          <h2 className="text-[24px] leading-[27px] tracking-normal font-medium">Фильтры</h2>
          <div className="flex bg-[#BEBDC814] rounded-[12px]">
            <Button
              variant={selectedView === "all" ? "inverted" : "ghost"}
              size="sm"
              onClick={() => setSelectedView("all")}
              className="h-7 text-xs"
            >
              Все
            </Button>
            <Button
              variant={selectedView === "selected" ? "inverted" : "ghost"}
              size="sm"
              onClick={() => setSelectedView("selected")}
              className="h-7 text-xs"
            >
              Выбранные
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 pt-6">
          {selectedView === "selected" ? (
            /* Режим "Выбранные" - показываем только активные фильтры */
            <div className="space-y-3">
              <h3 className="font-semibold text-sm mb-3">Активные фильтры</h3>
              <div className="flex flex-col gap-2">
                {statusFilter && statusFilter.length > 0 && (
                  <div className="flex items-center gap-2 px-2 py-1 bg-muted rounded-md text-sm">
                    <span>Статус: {statusFilter.join(", ")}</span>
                    <button onClick={removeStatusFilter} className="hover:opacity-70 ml-auto">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {traderFilter && (
                  <div className="flex items-center gap-2 px-2 py-1 bg-muted rounded-md text-sm">
                    <span>Трейдер: {traderFilter}</span>
                    <button onClick={removeTraderFilter} className="hover:opacity-70 ml-auto">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {teamFilterValue && (
                  <div className="flex items-center gap-2 px-2 py-1 bg-muted rounded-md text-sm">
                    <span>Команда: {teamFilterValue}</span>
                    <button onClick={removeTeamFilter} className="hover:opacity-70 ml-auto">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {(percentageFilter?.from !== undefined || percentageFilter?.to !== undefined) && (
                  <div className="flex items-center gap-2 px-2 py-1 bg-muted rounded-md text-sm">
                    <span>
                      Проценты: {percentageFilter.from ?? "0"} - {percentageFilter.to ?? "∞"}
                    </span>
                    <button onClick={removePercentageFilter} className="hover:opacity-70 ml-auto">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {(dealsFilter?.from !== undefined || dealsFilter?.to !== undefined) && (
                  <div className="flex items-center gap-2 px-2 py-1 bg-muted rounded-md text-sm">
                    <span>
                      Сделки: {dealsFilter.from ?? "0"} - {dealsFilter.to ?? "∞"}
                    </span>
                    <button onClick={removeDealsFilter} className="hover:opacity-70 ml-auto">
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
                {activeFiltersCount === 0 && (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    Нет активных фильтров
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Режим "Все" - показываем все фильтры */
            <>
              {/* Трейдер Section */}
              <div className="space-y-3">
                <h3 className="font-semibold text-[18px] leading-[22px] tracking-normal">Трейдер</h3>
                <div className="space-y-3">
                  <Input
                    placeholder="Поиск трейдера..."
                    className="h-8"
                    value={traderSearch}
                    onChange={(e) => onTraderSearchChange(e.target.value)}
                  />
                  <div className="flex gap-2 flex-wrap">
                {filteredTraders.slice(0, 2).map((traderName) => (
                  <div
                    key={traderName}
                    className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-sm"
                  >
                    <span>{traderName}</span>
                    <button
                      onClick={removeTraderFilter}
                      className="hover:opacity-70"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {filteredTraders.length > 2 && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-muted rounded-md text-sm min-w-[40px]">
                    <span className="text-muted-foreground">...</span>
                  </div>
                )}
                {activeFiltersCount > 0 && (
                  <div
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-sm"
                    style={{
                      backgroundColor: "#8973FA4D",
                    }}
                  >
                    <span style={{ color: "#C0B4FF" }}>{activeFiltersCount}</span>
                    <button
                      onClick={() => {
                        removeTraderFilter();
                        removeTeamFilter();
                        removeGroupFilter();
                        removePercentageFilter();
                        removeDealsFilter();
                        removeStatusFilter();
                      }}
                      className="hover:opacity-70"
                    >
                      <X className="h-3 w-3" style={{ color: "#C0B4FF" }} />
                    </button>
                    <ChevronDown className="h-3 w-3" style={{ color: "#C0B4FF" }} />
                  </div>
                )}
              </div>
              <FilterSection
                title="Создан"
                icon={<Calendar className="h-4 w-4" />}
                expanded={expandedSections.has("created")}
                onToggle={() => toggleSection("created")}
              >
                <div className="p-2">
                  <Input
                    type="date"
                    placeholder="Выберите дату"
                    className="h-8"
                    value={createdDate}
                    onChange={(e) => {
                      setCreatedDate(e.target.value);
                      if (createdColumn) {
                        createdColumn.setFilterValue(e.target.value || undefined);
                      }
                    }}
                  />
                </div>
              </FilterSection>
              <FilterSection
                title="Команды"
                expanded={expandedSections.has("teams")}
                onToggle={() => toggleSection("teams")}
              >
                <div className="p-2 space-y-2">
                  <Input
                    placeholder="Поиск команды"
                    className="h-8"
                    value={teamFilter}
                    onChange={(e) => onTeamFilterChange(e.target.value)}
                  />
                  {allTeams
                    .filter((team) =>
                      team.toLowerCase().includes(String(teamFilter || "").toLowerCase()),
                    )
                    .slice(0, 5)
                    .map((team) => (
                      <button
                        key={team}
                        onClick={() => onTeamFilterChange(team)}
                        className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded"
                      >
                        {team}
                      </button>
                    ))}
                </div>
              </FilterSection>
              <FilterSection
                title="Группы"
                expanded={expandedSections.has("groups")}
                onToggle={() => toggleSection("groups")}
              >
                <div className="p-2 space-y-2">
                  <Input
                    placeholder="Поиск группы"
                    className="h-8"
                    value={groupFilter}
                    onChange={(e) => onGroupFilterChange(e.target.value)}
                  />
                  {allGroups
                    .filter((group) =>
                      group.toLowerCase().includes(String(groupFilter || "").toLowerCase()),
                    )
                    .slice(0, 5)
                    .map((group) => (
                      <button
                        key={group}
                        onClick={() => onGroupFilterChange(group)}
                        className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded"
                      >
                        {group}
                      </button>
                    ))}
                </div>
              </FilterSection>
              </div>
            </div>

            {/* <Separator /> */}

            {/* Статус Section */}
            <div className="space-y-3">
              <h3 className="text-sm mb-2">Статус</h3>
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

            {/* <Separator /> */}

            {/* Проценты Section */}
            <div className="space-y-3 mb-10">
              <h3 className="text-sm mb-1.75">Проценты</h3>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">
                    От
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="От"
                      className="h-8 pr-8"
                      value={percentageFrom}
                      onChange={(e) =>
                        onPercentageFilterChange(e.target.value, percentageTo)
                      }
                    />
                    {percentageFrom && (
                      <button
                        onClick={() => onPercentageFilterChange("", percentageTo)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 hover:opacity-70"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground mb-1 block">
                    До
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      placeholder="До"
                      className="h-8 pr-8"
                      value={percentageTo}
                      onChange={(e) =>
                        onPercentageFilterChange(percentageFrom, e.target.value)
                      }
                    />
                    {percentageTo && (
                      <button
                        onClick={() => onPercentageFilterChange(percentageFrom, "")}
                        className="absolute right-2 top-1/2 -translate-y-1/2 hover:opacity-70"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* <Separator /> */}

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
                        placeholder="От"
                        className="h-8 pr-8"
                        value={dealsFrom}
                        onChange={(e) => onDealsFilterChange(e.target.value, dealsTo)}
                      />
                      {dealsFrom && (
                        <button
                          onClick={() => onDealsFilterChange("", dealsTo)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 hover:opacity-70"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground mb-1 block">
                      До
                    </label>
                    <div className="relative">
                      <Input
                        type="number"
                        placeholder="До"
                        className="h-8 pr-8"
                        value={dealsTo}
                        onChange={(e) => onDealsFilterChange(dealsFrom, e.target.value)}
                      />
                      {dealsTo && (
                        <button
                          onClick={() => onDealsFilterChange(dealsFrom, "")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 hover:opacity-70"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </>
          )}
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
        className="w-full flex items-center justify-between p-2 bg-[#BEBDC814] hover:bg-muted/50 transition-colors"
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


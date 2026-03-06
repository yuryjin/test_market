"use client";

import type { Table } from "@tanstack/react-table";
import { Calendar, ChevronDown, X } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import type { Trader } from "@/types/trader";
import { MultiselectCombobox } from "./multiselect-combobox";
import { useMediaQuery } from "@/hooks/use-media-query";

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
  const isMobile = useMediaQuery("(max-width: 639px)");
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
    
    const traderValue = traderCol?.getFilterValue() as string[] | string | undefined;
    const teamValue = teamCol?.getFilterValue() as string[] | string | undefined;
    const percentageValue = percentageCol?.getFilterValue() as { from?: number; to?: number } | undefined;
    const dealsValue = dealsCol?.getFilterValue() as { from?: number; to?: number } | undefined;
    
    if (traderValue) {
      if (Array.isArray(traderValue)) {
        setSelectedTraders(traderValue);
        setTraderSearch(""); // Очищаем текстовый поиск при использовании multiselect
      } else {
        setTraderSearch(traderValue);
        setSelectedTraders([]); // Очищаем multiselect при использовании текстового поиска
      }
    } else {
      setTraderSearch("");
      setSelectedTraders([]);
    }
    
    if (teamValue) {
      if (Array.isArray(teamValue)) {
        setSelectedTeams(teamValue);
      } else {
        setSelectedTeams([]);
      }
    } else {
      setSelectedTeams([]);
    }
    
    if (percentageValue) {
      if (percentageValue.from !== undefined) setPercentageFrom(String(percentageValue.from));
      if (percentageValue.to !== undefined) setPercentageTo(String(percentageValue.to));
    } else {
      setPercentageFrom("");
      setPercentageTo("");
    }
    
    if (dealsValue) {
      if (dealsValue.from !== undefined) setDealsFrom(String(dealsValue.from));
      if (dealsValue.to !== undefined) setDealsTo(String(dealsValue.to));
    } else {
      setDealsFrom("");
      setDealsTo("");
    }
  }, [table]);

  // Состояния для фильтров
  const [traderSearch, setTraderSearch] = React.useState("");
  const [createdDate, setCreatedDate] = React.useState("");
  const createdColumn = table.getColumn("created");
  const [selectedTraders, setSelectedTraders] = React.useState<string[]>([]);
  const [selectedTeams, setSelectedTeams] = React.useState<string[]>([]);
  const [selectedGroups, setSelectedGroups] = React.useState<string[]>([]);
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
  const traderFilter = traderColumn?.getFilterValue() as string[] | string | undefined;
  const teamFilterValue = teamColumn?.getFilterValue() as string[] | string | undefined;
  const groupFilterValue = teamColumn?.getFilterValue() as string[] | string | undefined;
  const percentageFilter = percentageColumn?.getFilterValue() as { from?: number; to?: number } | undefined;
  const dealsFilter = dealsColumn?.getFilterValue() as { from?: number; to?: number } | undefined;

  // Получаем уникальные значения для выпадающих списков
  const allTraders = React.useMemo(() => {
    const rows = table.getCoreRowModel().rows;
    const traders = new Set<string>();
    rows.forEach((row) => {
      const trader = row.original as Trader;
      // Используем тот же формат, что и в accessorFn колонки trader
      traders.add(`${trader.name}/${trader.id}`);
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
    if (traderFilter && (Array.isArray(traderFilter) ? traderFilter.length > 0 : traderFilter)) count++;
    if (teamFilterValue && (Array.isArray(teamFilterValue) ? teamFilterValue.length > 0 : teamFilterValue)) count++;
    if (groupFilterValue && (Array.isArray(groupFilterValue) ? groupFilterValue.length > 0 : groupFilterValue)) count++;
    if (percentageFilter?.from !== undefined || percentageFilter?.to !== undefined) count++;
    if (dealsFilter?.from !== undefined || dealsFilter?.to !== undefined) count++;
    return count;
  }, [statusFilter, traderFilter, teamFilterValue, groupFilterValue, percentageFilter, dealsFilter]);

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

  const onTradersSelectionChange = React.useCallback(
    (values: string[]) => {
      setSelectedTraders(values);
      if (traderColumn) {
        traderColumn.setFilterValue(values.length > 0 ? values : undefined);
      }
    },
    [traderColumn],
  );

  const onTeamsSelectionChange = React.useCallback(
    (values: string[]) => {
      setSelectedTeams(values);
      if (teamColumn) {
        teamColumn.setFilterValue(values.length > 0 ? values : undefined);
      }
    },
    [teamColumn],
  );

  const onGroupsSelectionChange = React.useCallback(
    (values: string[]) => {
      setSelectedGroups(values);
      // Фильтруем по группе через колонку team, так как там есть фильтр по team и group
      if (teamColumn) {
        teamColumn.setFilterValue(values.length > 0 ? values : undefined);
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

  // Получаем отфильтрованных трейдеров для тегов (используется только для старого текстового поиска)
  const filteredTraders = React.useMemo(() => {
    if (!traderFilter || Array.isArray(traderFilter)) return [];
    const rows = table.getCoreRowModel().rows;
    return rows
      .filter((row) => {
        const trader = row.original as Trader;
        const searchStr = `${trader.name}/*${trader.id}`.toLowerCase();
        return searchStr.includes(String(traderFilter).toLowerCase());
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
    setSelectedTraders([]);
    if (traderColumn) {
      traderColumn.setFilterValue(undefined);
    }
  }, [traderColumn]);

  const removeTeamFilter = React.useCallback(() => {
    setSelectedTeams([]);
    if (teamColumn) {
      teamColumn.setFilterValue(undefined);
    }
  }, [teamColumn]);

  const removeGroupFilter = React.useCallback(() => {
    setSelectedGroups([]);
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

  const FilterPanelContent = ({ showCloseButton = false, showApplyButton = false }: { showCloseButton?: boolean; showApplyButton?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-0 shrink-0">
        <h2 className="text-[24px] leading-[27px] tracking-normal font-medium">Фильтры</h2>
        <div className="flex items-center gap-2">
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
          {/* Кнопка закрытия для мобильных */}
          {showCloseButton && (
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            </DrawerClose>
          )}
        </div>
      </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 pt-6 min-h-0">
          {selectedView === "selected" ? (
            /* Режим "Выбранные" - показываем только активные фильтры */
            <div className="space-y-3">
              <h3 className="font-semibold text-sm mb-3">Активные фильтры</h3>
              {activeFiltersCount === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Нет активных фильтров
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {/* Кнопка "Очистить всё" */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      removeTraderFilter();
                      removeTeamFilter();
                      removeGroupFilter();
                      removePercentageFilter();
                      removeDealsFilter();
                      removeStatusFilter();
                    }}
                    className="h-7 text-xs"
                    style={{
                      backgroundColor: "#BEBDC81F",
                      color: "#F8F8FF",
                      borderColor: "transparent",
                    }}
                  >
                    Очистить всё
                  </Button>
                  
                  {/* Фильтр по статусу */}
                  {statusFilter && statusFilter.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={removeStatusFilter}
                      className="h-7 text-xs flex items-center gap-1"
                      style={{
                        backgroundColor: "#8973FA4D",
                        color: "#F8F8FF",
                        borderColor: "transparent",
                      }}
                    >
                      <span>Статус: {statusFilter.join(", ")}</span>
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                  
                  {/* Фильтр по трейдерам */}
                  {traderFilter && (
                    Array.isArray(traderFilter) ? (
                      traderFilter.map((trader) => (
                        <Button
                          key={trader}
                          variant="outline"
                          size="sm"
                          onClick={removeTraderFilter}
                          className="h-7 text-xs flex items-center gap-1"
                          style={{
                            backgroundColor: "#8973FA4D",
                            color: "#F8F8FF",
                            borderColor: "transparent",
                          }}
                        >
                          <span>{trader}</span>
                          <X className="h-3 w-3" />
                        </Button>
                      ))
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={removeTraderFilter}
                        className="h-7 text-xs flex items-center gap-1"
                        style={{
                          backgroundColor: "#8973FA4D",
                          color: "#F8F8FF",
                          borderColor: "transparent",
                        }}
                      >
                        <span>{traderFilter}</span>
                        <X className="h-3 w-3" />
                      </Button>
                    )
                  )}
                  
                  {/* Фильтр по командам */}
                  {teamFilterValue && (
                    Array.isArray(teamFilterValue) ? (
                      teamFilterValue.map((team) => (
                        <Button
                          key={team}
                          variant="outline"
                          size="sm"
                          onClick={removeTeamFilter}
                          className="h-7 text-xs flex items-center gap-1"
                          style={{
                            backgroundColor: "#8973FA4D",
                            color: "#F8F8FF",
                            borderColor: "transparent",
                          }}
                        >
                          <span>Команда: {team}</span>
                          <X className="h-3 w-3" />
                        </Button>
                      ))
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={removeTeamFilter}
                        className="h-7 text-xs flex items-center gap-1"
                        style={{
                          backgroundColor: "#8973FA4D",
                          color: "#F8F8FF",
                          borderColor: "transparent",
                        }}
                      >
                        <span>Команда: {teamFilterValue}</span>
                        <X className="h-3 w-3" />
                      </Button>
                    )
                  )}
                  
                  {/* Фильтр по группам */}
                  {groupFilterValue && (
                    Array.isArray(groupFilterValue) ? (
                      groupFilterValue.map((group) => (
                        <Button
                          key={group}
                          variant="outline"
                          size="sm"
                          onClick={removeGroupFilter}
                          className="h-7 text-xs flex items-center gap-1"
                          style={{
                            backgroundColor: "#8973FA4D",
                            color: "#F8F8FF",
                            borderColor: "transparent",
                          }}
                        >
                          <span>Группа: {group}</span>
                          <X className="h-3 w-3" />
                        </Button>
                      ))
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={removeGroupFilter}
                        className="h-7 text-xs flex items-center gap-1"
                        style={{
                          backgroundColor: "#8973FA4D",
                          color: "#F8F8FF",
                          borderColor: "transparent",
                        }}
                      >
                        <span>Группа: {groupFilterValue}</span>
                        <X className="h-3 w-3" />
                      </Button>
                    )
                  )}
                  
                  {/* Фильтр по процентам */}
                  {(percentageFilter?.from !== undefined || percentageFilter?.to !== undefined) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={removePercentageFilter}
                      className="h-7 text-xs flex items-center gap-1"
                      style={{
                        backgroundColor: "#8973FA4D",
                        color: "#F8F8FF",
                        borderColor: "transparent",
                      }}
                    >
                      <span>
                        Процент: от {percentageFilter.from ?? "0"} до {percentageFilter.to ?? "∞"}
                      </span>
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                  
                  {/* Фильтр по сделкам */}
                  {(dealsFilter?.from !== undefined || dealsFilter?.to !== undefined) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={removeDealsFilter}
                      className="h-7 text-xs flex items-center gap-1"
                      style={{
                        backgroundColor: "#8973FA4D",
                        color: "#F8F8FF",
                        borderColor: "transparent",
                      }}
                    >
                      <span>
                        Реквизиты все: от {dealsFilter.from ?? "0"} до {dealsFilter.to ?? "∞"}
                      </span>
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Режим "Все" - показываем все фильтры */
            <>
              {/* Трейдер Section */}
              <div className="space-y-3">
                <h3 className="font-semibold text-[18px] leading-[22px] tracking-normal">Трейдер</h3>
                <div className="space-y-3">
                  <MultiselectCombobox
                    options={allTraders}
                    selectedValues={selectedTraders}
                    onSelectionChange={onTradersSelectionChange}
                    placeholder="Выберите трейдеров..."
                    searchPlaceholder="Поиск трейдера..."
                    emptyText="Трейдеры не найдены"
                    className="h-8"
                  />
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
                <div className="p-2">
                  <MultiselectCombobox
                    options={allTeams}
                    selectedValues={selectedTeams}
                    onSelectionChange={onTeamsSelectionChange}
                    placeholder="Выберите команды..."
                    searchPlaceholder="Поиск команды..."
                    emptyText="Команды не найдены"
                    className="h-8"
                  />
                </div>
              </FilterSection>
              <FilterSection
                title="Группы"
                expanded={expandedSections.has("groups")}
                onToggle={() => toggleSection("groups")}
              >
                <div className="p-2">
                  <MultiselectCombobox
                    options={allGroups}
                    selectedValues={selectedGroups}
                    onSelectionChange={onGroupsSelectionChange}
                    placeholder="Выберите группы..."
                    searchPlaceholder="Поиск группы..."
                    emptyText="Группы не найдены"
                    className="h-8"
                  />
                </div>
              </FilterSection>
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
                    min="0"
                    max="100"
                    value={percentageFrom}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numValue = value ? parseFloat(value) : undefined;
                      if (numValue !== undefined && (numValue < 0 || numValue > 100)) {
                        return;
                      }
                      onPercentageFilterChange(value, percentageTo);
                    }}
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
                    min="0"
                    max="100"
                    value={percentageTo}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numValue = value ? parseFloat(value) : undefined;
                      if (numValue !== undefined && (numValue < 0 || numValue > 100)) {
                        return;
                      }
                      onPercentageFilterChange(percentageFrom, value);
                    }}
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
                        min="0"
                        value={dealsFrom}
                        onChange={(e) => {
                          const value = e.target.value;
                          const numValue = value ? parseInt(value, 10) : undefined;
                          if (numValue !== undefined && numValue < 0) {
                            return;
                          }
                          onDealsFilterChange(value, dealsTo);
                        }}
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
                        min="0"
                        value={dealsTo}
                        onChange={(e) => {
                          const value = e.target.value;
                          const numValue = value ? parseInt(value, 10) : undefined;
                          if (numValue !== undefined && numValue < 0) {
                            return;
                          }
                          onDealsFilterChange(dealsFrom, value);
                        }}
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
        
        {/* Кнопка "Применить" для мобильной версии */}
        {showApplyButton && (
          <div className="p-4 border-t shrink-0">
            <DrawerClose asChild>
              <Button
                className="w-full h-10 rounded-lg font-medium"
                style={{
                  backgroundColor: "#8973FA",
                  color: "#FFFFFF",
                }}
              >
                Применить
              </Button>
            </DrawerClose>
          </div>
        )}
    </div>
  );

  return (
    <>
      {/* Мобильная версия - Drawer (ТОЛЬКО на мобильных, т.е. < 640px) */}
      {isMobile && (
        <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
          <DrawerContent 
            className="h-[80vh] max-h-[80vh] w-full rounded-t-[26px] rounded-b-none border-t flex flex-col p-0 mt-0 inset-x-0 bottom-0" 
            // style={{ opacity: 1, backgroundColor: '#BEBDC81F' }}
          >
            <FilterPanelContent showCloseButton={true} showApplyButton={true} />
          </DrawerContent>
        </Drawer>
      )}

      {/* Десктопная версия - Sidebar (sm и выше, т.е. >= 640px) */}
      {!isMobile && (
        <div
          className={cn(
            "absolute top-0 left-0 w-80 bg-[#BEBDC81F] rounded-[26px] border-r z-50 flex flex-col shadow-lg transition-all duration-300 ease-in-out h-full",
            open
              ? "opacity-100 translate-x-0 pointer-events-auto"
              : "opacity-0 -translate-x-full pointer-events-none",
          )}
        >
          <FilterPanelContent showCloseButton={false} />
        </div>
      )}
    </>
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


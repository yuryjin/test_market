"use client";

import * as React from "react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableAdvancedToolbar } from "@/components/data-table/data-table-advanced-toolbar";
import { DataTableFilterList } from "@/components/data-table/data-table-filter-list";
import { DataTableFilterMenu } from "@/components/data-table/data-table-filter-menu";
import { DataTableFilterPanel } from "@/components/data-table/data-table-filter-panel";
import { DataTableFilterToggle } from "@/components/data-table/data-table-filter-toggle";
import { DataTableSortList } from "@/components/data-table/data-table-sort-list";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import type { Trader } from "@/types/trader";
import { useDataTable } from "@/hooks/use-data-table";
import type { QueryKeys } from "@/types/data-table";
import type {
  getTraders,
  getTraderStatusCounts,
} from "../lib/traders-queries";
import { useFeatureFlags } from "./feature-flags-provider";
import { getTradersTableColumns } from "./traders-table-columns";
import { cn } from "@/lib/utils";

interface TradersTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getTraders>>,
      Awaited<ReturnType<typeof getTraderStatusCounts>>,
    ]
  >;
  queryKeys?: Partial<QueryKeys>;
}

export function TradersTable({ promises, queryKeys }: TradersTableProps) {
  const { enableAdvancedFilter, filterFlag } = useFeatureFlags();
  const [filterPanelOpen, setFilterPanelOpen] = React.useState(false);

  const [{ data, pageCount }, statusCounts] = React.use(promises);

  const columns = React.useMemo(
    () =>
      getTradersTableColumns({
        statusCounts,
      }),
    [statusCounts],
  );

  const { table, shallow, debounceMs, throttleMs } = useDataTable({
    data,
    columns,
    pageCount: -1, // Клиентская пагинация для статических данных
    enableAdvancedFilter,
    initialState: {
      sorting: [{ id: "trader", desc: false }],
      pagination: {
        pageSize: 10,
      },
      columnVisibility: {
        merchant: false, // По умолчанию скрыта
      },
    },
    queryKeys,
    getRowId: (originalRow) => String(originalRow.id),
    shallow: false,
    clearOnDefault: true,
  });

  const filterToggle = (
    <DataTableFilterToggle
      table={table}
      open={filterPanelOpen}
      onOpenChange={setFilterPanelOpen}
    />
  );

  return (
    <div className="relative">
      <DataTableFilterPanel
        table={table}
        open={filterPanelOpen}
        onOpenChange={setFilterPanelOpen}
      />
      <div
        className={cn(
          "transition-all duration-300",
          filterPanelOpen && "ml-[330px]", // 320px (w-80) панель + 10px отступ между панелью и таблицей
        )}
      >
        <DataTable table={table}>
          {enableAdvancedFilter ? (
            <DataTableAdvancedToolbar table={table} filterToggle={filterToggle}>
              <DataTableSortList table={table} align="start" />
              {filterFlag === "advancedFilters" ? (
                <DataTableFilterList
                  table={table}
                  shallow={shallow}
                  debounceMs={debounceMs}
                  throttleMs={throttleMs}
                  align="start"
                />
              ) : (
                <DataTableFilterMenu
                  table={table}
                  shallow={shallow}
                  debounceMs={debounceMs}
                  throttleMs={throttleMs}
                />
              )}
            </DataTableAdvancedToolbar>
          ) : (
            <DataTableToolbar table={table} filterToggle={filterToggle}>
              <DataTableSortList table={table} align="end" />
            </DataTableToolbar>
          )}
        </DataTable>
      </div>
    </div>
  );
}


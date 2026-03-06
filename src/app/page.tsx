import { Suspense } from "react";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import { Shell } from "@/components/shell";
import { getValidFilters } from "@/lib/data-table";
import type { SearchParams } from "@/types";
import { FeatureFlagsProvider } from "./components/feature-flags-provider";
import { TradersTable } from "./components/traders-table";
import { getTraders, getTraderStatusCounts } from "./lib/traders-queries";
import { searchParamsCache } from "./lib/validations";

interface IndexPageProps {
  searchParams: Promise<SearchParams>;
}

export default function IndexPage(props: IndexPageProps) {
  return (
    <Shell>
      <Suspense
        fallback={
          <DataTableSkeleton
            columnCount={8}
            filterCount={2}
            cellWidths={[
              "3rem",
              "15rem",
              "12rem",
              "12rem",
              "10rem",
              "12rem",
              "12rem",
              "10rem",
            ]}
            shrinkZero
          />
        }
      >
        <FeatureFlagsProvider>
          <TradersTableWrapper {...props} />
        </FeatureFlagsProvider>
      </Suspense>
    </Shell>
  );
}

async function TradersTableWrapper(props: IndexPageProps) {
  const searchParams = await props.searchParams;
  const search = searchParamsCache.parse(searchParams);

  const validFilters = getValidFilters(search.filters);

  const promises = Promise.all([
    getTraders(),
    getTraderStatusCounts(),
  ]);

  return <TradersTable promises={promises} />;
}

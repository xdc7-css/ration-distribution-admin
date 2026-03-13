import { getActiveItems } from "@/lib/db";
import { getCurrentMonthYear } from "@/lib/utils";
import { DistributionClient } from "@/components/distribution-client";

export default async function DistributionPage() {
  let items: any[] = [];

  try {
    items = await getActiveItems();
  } catch (error) {
    console.error("Failed to load items:", error);
  }

  const { month, year } = getCurrentMonthYear();

  return (
    <DistributionClient
      items={items}
      initialMonth={month}
      initialYear={year}
    />
  );
}
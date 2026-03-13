import { getCurrentMonthYear, monthOptions, formatNumber } from "@/lib/utils";
import { getMonthlyReport } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ReportExportButtons } from "@/components/report-export-buttons";
import { ExportFamilyReportButton } from "@/components/export-family-report-button";
export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ month?: string; year?: string }> }) {
  const current = getCurrentMonthYear();
  const params = await searchParams;
  const month = Number(params.month ?? current.month);
  const year = Number(params.year ?? current.year);
  const report = await getMonthlyReport(month, year);

  const totals = new Map<string, { unit: string; total: number }>();
  for (const record of report as any[]) {
    for (const item of record.monthly_distribution_items) {
      const existing = totals.get(item.item_name_snapshot) ?? { unit: item.unit_snapshot, total: 0 };
      existing.total += Number(item.delivered_quantity);
      totals.set(item.item_name_snapshot, existing);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>التقارير</CardTitle>
          <CardDescription>{monthOptions[month - 1]} {year}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <ReportExportButtons month={month} year={year} />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[...totals.entries()].map(([name, value]) => (
              <div key={name} className="rounded-2xl border bg-white/70 p-4">
                <p className="font-medium">{name}</p>
                <p className="mt-2 text-2xl font-bold">{formatNumber(value.total)}</p>
                <p className="text-xs text-muted-foreground">{value.unit}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {report.map((row: any) => (
              <div key={row.id} className="rounded-2xl border bg-white/60 p-4">
               <div className="mb-3 flex items-center justify-between gap-4">
          <div>
    <p className="font-semibold">{row.families.family_name}</p>

    <p className="text-xs text-muted-foreground">
      {row.families.family_code} • أفراد وقت التسليم: {row.members_count_at_delivery}
    </p>
  </div>

  <div className="flex items-center gap-3">

    <p className="text-xs text-muted-foreground">
      {row.families.area ?? "-"}
    </p>

    <ExportFamilyReportButton familyId={row.family_id} />

  </div>
</div>
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {row.monthly_distribution_items.map((item: any) => (
                    <div key={item.id} className="rounded-2xl bg-white p-3 text-sm">
                      <p className="font-medium">{item.item_name_snapshot}</p>
                      <p className="text-muted-foreground">{formatNumber(item.delivered_quantity)} {item.unit_snapshot}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

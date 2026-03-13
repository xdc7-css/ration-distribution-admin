import { ClipboardCheck, Hourglass, Package2, Users } from "lucide-react";
import { getDashboardStats } from "@/lib/db";
import { formatNumber, monthOptions } from "@/lib/utils";
import { StatCard } from "@/components/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="إجمالي العوائل" value={formatNumber(stats.totalFamilies)} description="عدد العوائل الفعالة" icon={<Users className="size-6" />} />
        <StatCard title="إجمالي الأفراد" value={formatNumber(stats.totalMembers)} description="مجموع الأفراد الحالي" icon={<Users className="size-6" />} />
        <StatCard title="العوائل المستلمة" value={formatNumber(stats.deliveredFamilies)} description={`خلال ${monthOptions[stats.month - 1]} ${stats.year}`} icon={<ClipboardCheck className="size-6" />} />
        <StatCard title="العوائل المعلّقة" value={formatNumber(stats.pendingFamilies)} description="لم تستلم بعد هذا الشهر" icon={<Hourglass className="size-6" />} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>إجمالي المواد الموزعة لهذا الشهر</CardTitle>
          <CardDescription>{monthOptions[stats.month - 1]} {stats.year}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {stats.totalsByItem.map((item: any) => (
              <div key={item.item_name_snapshot} className="rounded-2xl border bg-white/60 p-4">
                <div className="mb-3 flex items-center gap-2 text-primary"><Package2 className="size-4" /><span className="font-medium">{item.item_name_snapshot}</span></div>
                <p className="text-2xl font-bold">{formatNumber(item.delivered_total)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

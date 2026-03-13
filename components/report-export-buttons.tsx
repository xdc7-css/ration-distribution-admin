import Link from "next/link";
import { Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function ReportExportButtons({ month, year }: { month: number; year: number }) {
  return (
    <div className="flex flex-wrap gap-3">
      <Link href={`/api/export/monthly?month=${month}&year=${year}`} className={buttonVariants({ variant: "outline", className: "inline-flex gap-2" })}><Download className="ml-2 size-4" />تصدير تقرير الشهر</Link>
      <Link href="/api/export/all" className={buttonVariants({ variant: "outline", className: "inline-flex gap-2" })}><Download className="ml-2 size-4" />تصدير كل البيانات</Link>
    </div>
  );
}

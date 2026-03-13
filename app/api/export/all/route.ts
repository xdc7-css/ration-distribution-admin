import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { buildWorkbook, workbookToBuffer } from "@/lib/excel";

export async function GET() {
  const userClient = await createClient();
  const { data: userData } = await userClient.auth.getUser();
  if (!userData.user) return new NextResponse("Unauthorized", { status: 401 });
  const supabase = createAdminClient();
  const [families, items, distributions, distributionItems] = await Promise.all([
    supabase.from("families").select("*").order("created_at", { ascending: false }),
    supabase.from("items").select("*").order("name"),
    supabase.from("monthly_distributions").select("*").order("created_at", { ascending: false }),
    supabase.from("monthly_distribution_items").select("*").order("created_at", { ascending: false }),
  ]);

  const workbook = buildWorkbook({
    families: families.data ?? [],
    items: items.data ?? [],
    monthly_distributions: distributions.data ?? [],
    monthly_distribution_items: distributionItems.data ?? [],
  });

  const buffer = workbookToBuffer(workbook);
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="ration-backup-all.xlsx"`,
    },
  });
}

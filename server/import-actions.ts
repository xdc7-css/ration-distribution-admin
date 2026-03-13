"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

type ImportState = {
  error: string;
  success: string;
};

type ImportRow = {
  family_code: string;
  family_name: string;
  members_count: number;
  phone?: string;
  area?: string;
  notes?: string;
  is_active?: boolean;
};

export async function importFamiliesAction(
  prevState: ImportState,
  formData: FormData
): Promise<ImportState> {
  try {
    const rawRows = formData.get("rows");

    if (!rawRows || typeof rawRows !== "string") {
      return { error: "لم يتم استلام بيانات الاستيراد", success: "" };
    }

    const rows = JSON.parse(rawRows) as ImportRow[];

    if (!Array.isArray(rows) || rows.length === 0) {
      return { error: "ملف الاستيراد فارغ أو غير صالح", success: "" };
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const payload = rows.map((row) => ({
      family_code: String(row.family_code).trim(),
      family_name: String(row.family_name).trim(),
      members_count: Number(row.members_count) || 1,
      phone: String(row.phone ?? "").trim() || null,
      area: String(row.area ?? "").trim() || null,
      notes: String(row.notes ?? "").trim() || null,
      is_active: row.is_active ?? true,
    }));

    const { error } = await supabase
      .from("families")
      .upsert(payload, { onConflict: "family_code" });

    if (error) {
      return { error: `فشل الاستيراد: ${error.message}`, success: "" };
    }

    revalidatePath("/dashboard/families");
    revalidatePath("/dashboard/import");

    return {
      error: "",
      success: `تم استيراد / تحديث ${payload.length} عائلة بنجاح`,
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "حدث خطأ غير متوقع أثناء الاستيراد",
      success: "",
    };
  }
}
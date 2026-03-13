"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { familySchema } from "@/lib/validations";

export async function upsertFamilyAction(_: { error: string; success: string }, formData: FormData) {
  try {
    const raw = {
      id: formData.get("id") || undefined,
      family_code: formData.get("family_code"),
      family_name: formData.get("family_name"),
      members_count: formData.get("members_count"),
      phone: formData.get("phone") || null,
      area: formData.get("area") || null,
      notes: formData.get("notes") || null,
      is_active: formData.get("is_active") === "on",
    };

    const values = familySchema.parse(raw);
    const supabase = await createClient();

    const { error } = await supabase.from("families").upsert(values, { onConflict: "id" });
    if (error) throw error;

    revalidatePath("/dashboard/families");
    if (values.id) revalidatePath(`/dashboard/families/${values.id}`);
    revalidatePath("/dashboard");

    return { error: "", success: "تم حفظ بيانات العائلة بنجاح" };
  } catch (error: any) {
    return { error: error?.message ?? "حدث خطأ أثناء حفظ العائلة", success: "" };
  }
}

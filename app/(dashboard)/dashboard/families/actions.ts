"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleFamilyStatusAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const nextStatus = String(formData.get("next_status") ?? "") === "true";

  if (!id) return;

  const supabase = await createClient();

  const { error } = await supabase
    .from("families")
    .update({ is_active: nextStatus })
    .eq("id", id);

  if (error) {
    console.error("toggleFamilyStatusAction error:", error.message);
    return;
  }

  revalidatePath("/dashboard/families");
  revalidatePath("/dashboard");
}

export async function deleteFamilyAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");

  if (!id) return;

  const supabase = await createClient();

  const { error } = await supabase
    .from("families")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("deleteFamilyAction error:", error.message);
    return;
  }

  revalidatePath("/dashboard/families");
  revalidatePath("/dashboard");
}
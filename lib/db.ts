import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentMonthYear } from "@/lib/utils";

export const getDashboardStats = cache(async () => {
  const supabase = await createClient();
  const { month, year } = getCurrentMonthYear();

  const [familiesRes, membersRes, deliveredRes, totalsRes] = await Promise.all([
    supabase.from("families").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("families").select("members_count").eq("is_active", true),
    supabase.from("monthly_distributions").select("id", { count: "exact", head: true }).eq("month", month).eq("year", year),
    supabase.from("monthly_distribution_items_view").select("item_name_snapshot, delivered_total").eq("month", month).eq("year", year),
  ]);

  const totalFamilies = familiesRes.count ?? 0;
  const totalMembers = (membersRes.data ?? []).reduce((sum, row) => sum + Number(row.members_count ?? 0), 0);
  const deliveredFamilies = deliveredRes.count ?? 0;
  const pendingFamilies = Math.max(totalFamilies - deliveredFamilies, 0);

  return {
    totalFamilies,
    totalMembers,
    deliveredFamilies,
    pendingFamilies,
    totalsByItem: totalsRes.data ?? [],
    month,
    year,
  };
});

export async function getFamilies(search = "", page = 1, pageSize = 12) {
  const supabase = await createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let query = supabase
    .from("families")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search.trim()) {
    query = query.or(`family_code.ilike.%${search}%,family_name.ilike.%${search}%`);
  }

  const { data, count, error } = await query;
  if (error) throw error;
  return { data: data ?? [], count: count ?? 0 };
}

export async function getItems() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("items").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}

export async function getActiveItems() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("items").select("*").eq("is_active", true).order("name");
  if (error) throw error;
  return data ?? [];
}

export async function searchFamilies(query: string) {
  const supabase = await createClient();
  let builder = supabase
    .from("families")
    .select("id,family_code,family_name,members_count,phone,area,is_active")
    .eq("is_active", true)
    .order("family_name")
    .limit(10);

  if (query.trim()) {
    builder = builder.or(`family_code.ilike.%${query}%,family_name.ilike.%${query}%`);
  }

  const { data, error } = await builder;
  if (error) throw error;
  return data ?? [];
}

export async function getFamilyById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("families").select("*").eq("id", id).single();
  if (error) throw error;
  return data;
}

export async function getFamilyHistory(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("monthly_distributions")
    .select(`
      *,
      monthly_distribution_items (*)
    `)
    .eq("family_id", id)
    .order("year", { ascending: false })
    .order("month", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getDistributionByFamilyMonthYear(familyId: string, month: number, year: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("monthly_distributions")
    .select(`
      *,
      monthly_distribution_items (*)
    `)
    .eq("family_id", familyId)
    .eq("month", month)
    .eq("year", year)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function getMonthlyReport(month: number, year: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("monthly_distributions")
    .select(`
      id,
      family_id,
      month,
      year,
      members_count_at_delivery,
      notes,
      delivered_at,
      created_at,
      families (family_code, family_name, area),
      monthly_distribution_items (*)
    `)
    .eq("month", month)
    .eq("year", year)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
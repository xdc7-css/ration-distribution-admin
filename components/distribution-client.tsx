"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Search, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { searchFamiliesApi, saveDistributionAction } from "@/server/distribution-actions";
import { formatNumber, monthOptions } from "@/lib/utils";
import { Select } from "@/components/ui/select";
import type { Item } from "@/lib/types";

type FamilyLite = {
  id: string;
  family_code: string;
  family_name: string;
  members_count: number;
  area: string | null;
};

type SaveMessage = {
  type: "success" | "error";
  text: string;
};

export function DistributionClient({
  items,
  initialMonth,
  initialYear,
}: {
  items: Item[];
  initialMonth: number;
  initialYear: number;
}) {
  const [query, setQuery] = useState("");
  const [families, setFamilies] = useState<FamilyLite[]>([]);
  const [selectedFamily, setSelectedFamily] = useState<FamilyLite | null>(null);
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);
  const [notes, setNotes] = useState("");
  const [membersCount, setMembersCount] = useState(1);
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [message, setMessage] = useState<SaveMessage | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const timeout = setTimeout(async () => {
      try {
        const result = await searchFamiliesApi(query);
        setFamilies(result ?? []);
      } catch (error) {
        console.error("Family search failed:", error);
        setFamilies([]);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [query]);

  const calculatedItems = useMemo(() => {
    return items.map((item) => {
      const calculated =
        item.calculation_type === "per_person"
          ? Number(item.default_quantity) * membersCount
          : Number(item.default_quantity);

      return {
        ...item,
        calculated,
        delivered: overrides[item.id] ?? calculated,
      };
    });
  }, [items, membersCount, overrides]);

  const onFamilySelect = (family: FamilyLite) => {
    setSelectedFamily(family);
    setMembersCount(family.members_count);
    setOverrides({});
    setNotes("");
    setMessage(null);
  };

  const onSubmit = () => {
    if (!selectedFamily) return;

    setMessage(null);

    startTransition(async () => {
      try {
        const result = await saveDistributionAction({
          family_id: selectedFamily.id,
          month,
          year,
          members_count_at_delivery: membersCount,
          notes,
          items: calculatedItems.map((item) => ({
            item_id: item.id,
            calculated_quantity: item.calculated,
            delivered_quantity: Number(item.delivered),
          })),
        });

        if (result?.error) {
          setMessage({
            type: "error",
            text: result.error,
          });
          return;
        }

        setMessage({
          type: "success",
          text: result?.success ?? "تم حفظ سجل التوزيع بنجاح",
        });
      } catch (error) {
        console.error("Save distribution failed:", error);
        setMessage({
          type: "error",
          text: error instanceof Error ? error.message : "حدث خطأ أثناء حفظ سجل التوزيع",
        });
      }
    });
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>اختيار العائلة</CardTitle>
          <CardDescription>ابحث برمز العائلة أو الاسم</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute right-3 top-3 size-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pr-10"
              placeholder="ابحث بسرعة..."
            />
          </div>

          <div className="max-h-[380px] space-y-2 overflow-y-auto">
            {families.map((family) => (
              <button
                key={family.id}
                onClick={() => onFamilySelect(family)}
                className={`w-full rounded-2xl border p-4 text-right transition ${
                  selectedFamily?.id === family.id
                    ? "border-primary bg-primary/5"
                    : "bg-white/60 hover:bg-white"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{family.family_name}</p>
                    <p className="text-xs text-muted-foreground">{family.family_code}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {family.members_count} أفراد
                  </div>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  {family.area ?? "بدون منطقة"}
                </p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>التوزيع الشهري</CardTitle>
          <CardDescription>
            الحساب تلقائي مع إمكانية تعديل الكمية المسلّمة قبل الحفظ
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium">الشهر</label>
              <Select value={String(month)} onChange={(e) => setMonth(Number(e.target.value))}>
                {monthOptions.map((label, index) => (
                  <option key={label} value={index + 1}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">السنة</label>
              <Input
                type="number"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">عدد الأفراد وقت التسليم</label>
              <Input
                type="number"
                min={1}
                value={membersCount}
                onChange={(e) => setMembersCount(Number(e.target.value))}
                disabled={!selectedFamily}
              />
            </div>

            <div className="rounded-2xl bg-accent p-4 text-sm">
              <p className="text-muted-foreground">العائلة المختارة</p>
              <p className="font-semibold">
                {selectedFamily?.family_name ?? "لم يتم الاختيار"}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border bg-white/50">
            <table className="w-full text-sm">
              <thead className="bg-white/70 text-muted-foreground">
                <tr>
                  <th className="p-3 text-right">المادة</th>
                  <th className="p-3 text-right">الوحدة</th>
                  <th className="p-3 text-right">نوع الحساب</th>
                  <th className="p-3 text-right">الكمية المحسوبة</th>
                  <th className="p-3 text-right">الكمية المسلّمة</th>
                </tr>
              </thead>

              <tbody>
                {calculatedItems.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="p-3 font-medium">{item.name}</td>
                    <td className="p-3">{item.unit}</td>
                    <td className="p-3">
                      {item.calculation_type === "per_person" ? "لكل فرد" : "لكل عائلة"}
                    </td>
                    <td className="p-3">{formatNumber(item.calculated)}</td>
                    <td className="p-3">
                      <Input
                        type="number"
                        step="0.01"
                        min={0}
                        value={item.delivered}
                        onChange={(e) =>
                          setOverrides((prev) => ({
                            ...prev,
                            [item.id]: Number(e.target.value),
                          }))
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">ملاحظات</label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          {message ? (
            <div
              className={`rounded-2xl border p-3 text-sm ${
                message.type === "error"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {message.text}
            </div>
          ) : null}

          <Button
            onClick={onSubmit}
            disabled={!selectedFamily || isPending}
            className="gap-2"
          >
            <Save className="size-4" />
            {isPending ? "جارٍ الحفظ..." : "حفظ سجل التوزيع"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
"use client";

import { useMemo, useState, useTransition } from "react";
import * as XLSX from "xlsx";
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { importFamiliesAction } from "@/server/import-actions";

type ParsedFamilyRow = {
  family_code: string;
  family_name: string;
  members_count: number;
  phone: string;
  area: string;
  notes: string;
  is_active: boolean;
};

function normalizeBoolean(value: unknown) {
  if (typeof value === "boolean") return value;

  const text = String(value ?? "").trim().toLowerCase();

  if (["true", "1", "yes", "y", "فعال", "فعالة", "نشط"].includes(text)) return true;
  if (["false", "0", "no", "n", "غير فعال", "معطل"].includes(text)) return false;

  return true;
}

function normalizeNumber(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 1;
}

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

export function ImportFamiliesClient() {
  const [rows, setRows] = useState<ParsedFamilyRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<{ error?: string; success?: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const validRows = useMemo(() => {
    return rows.filter((row) => row.family_code && row.family_name && row.members_count > 0);
  }, [rows]);

  async function handleFileChange(file: File | null) {
    setResult(null);
    setErrors([]);
    setRows([]);

    if (!file) return;

    setFileName(file.name);

    const buffer = await file.arrayBuffer();
    const workbook = XLSX.read(buffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
    });

    const parsed: ParsedFamilyRow[] = [];
    const localErrors: string[] = [];

    json.forEach((item, index) => {
      const rowNumber = index + 2;

      const row: ParsedFamilyRow = {
        family_code: normalizeText(item.family_code ?? item["رمز العائلة"]),
        family_name: normalizeText(item.family_name ?? item["اسم العائلة"]),
        members_count: normalizeNumber(item.members_count ?? item["عدد الأفراد"]),
        phone: normalizeText(item.phone ?? item["رقم الهاتف"]),
        area: normalizeText(item.area ?? item["المنطقة"]),
        notes: normalizeText(item.notes ?? item["ملاحظات"]),
        is_active: normalizeBoolean(item.is_active ?? item["فعالة"]),
      };

      if (!row.family_code) {
        localErrors.push(`الصف ${rowNumber}: رمز العائلة مفقود`);
      }

      if (!row.family_name) {
        localErrors.push(`الصف ${rowNumber}: اسم العائلة مفقود`);
      }

      parsed.push(row);
    });

    setRows(parsed);
    setErrors(localErrors);
  }

  function handleImport() {
    setResult(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("rows", JSON.stringify(validRows));

      const response = await importFamiliesAction({ error: "", success: "" }, formData);
      setResult(response);
    });
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-dashed border-primary/30 bg-primary/5 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="flex items-center gap-2 text-base font-semibold">
              <FileSpreadsheet className="size-5 text-primary" />
              رفع ملف Excel
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              الأعمدة المدعومة: family_code, family_name, members_count, phone, area, notes, is_active
            </p>
          </div>

          <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90">
            <Upload className="size-4" />
            اختيار ملف
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>

        {fileName ? (
          <p className="mt-4 text-sm text-foreground">
            الملف المحدد: <span className="font-medium">{fileName}</span>
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border bg-white/70 p-4">
          <p className="text-sm text-muted-foreground">إجمالي الصفوف</p>
          <p className="mt-2 text-2xl font-bold">{rows.length}</p>
        </div>

        <div className="rounded-3xl border bg-white/70 p-4">
          <p className="text-sm text-muted-foreground">الصفوف الصالحة</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{validRows.length}</p>
        </div>

        <div className="rounded-3xl border bg-white/70 p-4">
          <p className="text-sm text-muted-foreground">المشكلات المكتشفة</p>
          <p className="mt-2 text-2xl font-bold text-amber-600">{errors.length}</p>
        </div>
      </div>

      {errors.length > 0 ? (
        <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4">
          <div className="mb-3 flex items-center gap-2 text-amber-700">
            <AlertTriangle className="size-4" />
            <p className="font-medium">ملاحظات قبل الاستيراد</p>
          </div>
          <div className="space-y-1 text-sm text-amber-800">
            {errors.slice(0, 10).map((error, index) => (
              <p key={index}>{error}</p>
            ))}
          </div>
        </div>
      ) : null}

      {rows.length > 0 ? (
        <div className="rounded-3xl border bg-white/70 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold">معاينة البيانات</h3>
            <Button onClick={handleImport} disabled={isPending || validRows.length === 0}>
              {isPending ? "جارٍ الاستيراد..." : "تنفيذ الاستيراد"}
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b text-right text-muted-foreground">
                  <th className="px-3 py-3">رمز العائلة</th>
                  <th className="px-3 py-3">اسم العائلة</th>
                  <th className="px-3 py-3">عدد الأفراد</th>
                  <th className="px-3 py-3">الهاتف</th>
                  <th className="px-3 py-3">المنطقة</th>
                  <th className="px-3 py-3">ملاحظات</th>
                  <th className="px-3 py-3">فعالة</th>
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 20).map((row, index) => (
                  <tr key={`${row.family_code}-${index}`} className="border-b last:border-0">
                    <td className="px-3 py-3 font-medium">{row.family_code}</td>
                    <td className="px-3 py-3">{row.family_name}</td>
                    <td className="px-3 py-3">{row.members_count}</td>
                    <td className="px-3 py-3">{row.phone || "-"}</td>
                    <td className="px-3 py-3">{row.area || "-"}</td>
                    <td className="px-3 py-3">{row.notes || "-"}</td>
                    <td className="px-3 py-3">{row.is_active ? "نعم" : "لا"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {result?.error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {result.error}
        </div>
      ) : null}

      {result?.success ? (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="size-4" />
            <span>{result.success}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
}
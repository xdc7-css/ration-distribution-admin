// lib/excel-reports.ts

import ExcelJS from "exceljs";

type FamilyInfo = {
  family_code: string;
  family_name: string;
  area?: string | null;
  phone?: string | null;
  members_count?: number | null;
};

type FamilyMonthlyRow = {
  month: number;
  year: number;
  delivered_at?: string | Date | null;
  members_count_at_delivery?: number | null;
  notes?: string | null;
  items: Array<{
    item_name: string;
    unit: string;
    delivered_quantity: number;
  }>;
};

type BuildFamilyReportInput = {
  family: FamilyInfo;
  rows: FamilyMonthlyRow[];
  reportTitle?: string;
};

type MaterialColumn = {
  key: string;
  header: string;
  item_name: string;
  unit: string;
};

function monthLabel(month: number) {
  const months = [
    "كانون الثاني",
    "شباط",
    "آذار",
    "نيسان",
    "أيار",
    "حزيران",
    "تموز",
    "آب",
    "أيلول",
    "تشرين الأول",
    "تشرين الثاني",
    "كانون الأول",
  ];

  return months[month - 1] ?? String(month);
}

function formatDate(value?: string | Date | null) {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("ar-IQ");
}

function formatTime(value?: string | Date | null) {
  if (!value) return "";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("ar-IQ", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function materialKey(name: string, unit: string) {
  return `${name}__${unit}`;
}

function getMaterialColumns(rows: FamilyMonthlyRow[]): MaterialColumn[] {
  const map = new Map<string, MaterialColumn>();

  for (const row of rows) {
    for (const item of row.items ?? []) {
      const key = materialKey(item.item_name, item.unit);

      if (!map.has(key)) {
        map.set(key, {
          key,
          header: `${item.item_name} (${item.unit})`,
          item_name: item.item_name,
          unit: item.unit,
        });
      }
    }
  }

  return Array.from(map.values()).sort((a, b) =>
    a.item_name.localeCompare(b.item_name, "ar")
  );
}

function setCellBorder(cell: ExcelJS.Cell) {
  cell.border = {
    top: { style: "thin", color: { argb: "FF666666" } },
    left: { style: "thin", color: { argb: "FF666666" } },
    bottom: { style: "thin", color: { argb: "FF666666" } },
    right: { style: "thin", color: { argb: "FF666666" } },
  };
}

function styleHeaderCell(cell: ExcelJS.Cell, fill = "FFF2CC") {
  cell.font = { bold: true, name: "Calibri", size: 12 };
  cell.alignment = { horizontal: "center", vertical: "middle" };
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: fill },
  };
  setCellBorder(cell);
}

function styleInfoLabelCell(cell: ExcelJS.Cell) {
  cell.font = { bold: true, name: "Calibri", size: 12 };
  cell.alignment = { horizontal: "center", vertical: "middle" };
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFFF00" },
  };
  setCellBorder(cell);
}

function styleInfoValueCell(cell: ExcelJS.Cell) {
  cell.font = { bold: false, name: "Calibri", size: 12 };
  cell.alignment = { horizontal: "center", vertical: "middle" };
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD9D9D9" },
  };
  setCellBorder(cell);
}

function styleBodyCell(cell: ExcelJS.Cell) {
  cell.font = { name: "Calibri", size: 11 };
  cell.alignment = { horizontal: "center", vertical: "middle" };
  setCellBorder(cell);
}

function autoFitColumns(worksheet: ExcelJS.Worksheet, min = 12, max = 28) {
  worksheet.columns.forEach((column) => {
    let length = min;

    column.eachCell?.({ includeEmpty: true }, (cell) => {
      const value = cell.value == null ? "" : String(cell.value);
      length = Math.max(length, value.length + 2);
    });

    column.width = Math.min(Math.max(length, min), max);
  });
}

export async function buildFamilyReportWorkbook(
  input: BuildFamilyReportInput
): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Ration Distribution App";
  workbook.lastModifiedBy = "Ration Distribution App";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet("تقرير العائلة", {
    views: [{ rightToLeft: true, state: "frozen", ySplit: 5 }],
    properties: { defaultRowHeight: 22 },
  });

  const title = input.reportTitle ?? "تقرير العائلة التراكمي";
  const materialColumns = getMaterialColumns(input.rows);

  const baseColumns = [
    "الشهر",
    "السنة",
    "تاريخ الاستلام",
    "وقت الاستلام",
    "عدد الأفراد وقت التسليم",
  ];

  const allHeaders = [
    ...baseColumns,
    ...materialColumns.map((m) => m.header),
    "ملاحظات",
  ];

  // عنوان التقرير
  worksheet.mergeCells("A1:M1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = title;
  titleCell.font = { bold: true, size: 16, name: "Calibri" };
  titleCell.alignment = { horizontal: "center", vertical: "middle" };
  titleCell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFEDE7F6" },
  };

  // معلومات العائلة
  const infoLabels = ["اسم العائلة", "المنطقة", "عدد الأفراد"];
  const infoValues = [
    input.family.family_name ?? "",
    input.family.area ?? "",
    input.family.members_count ?? "",
  ];

  for (let i = 0; i < infoLabels.length; i++) {
    const labelCell = worksheet.getCell(2, i + 1);
    const valueCell = worksheet.getCell(3, i + 1);

    labelCell.value = infoLabels[i];
    valueCell.value = infoValues[i];

    styleInfoLabelCell(labelCell);
    styleInfoValueCell(valueCell);
  }

  // معلومة إضافية: رمز العائلة والهاتف
  worksheet.getCell("E2").value = "رمز العائلة";
  worksheet.getCell("F2").value = "الهاتف";
  worksheet.getCell("E3").value = input.family.family_code ?? "";
  worksheet.getCell("F3").value = input.family.phone ?? "";

  styleInfoLabelCell(worksheet.getCell("E2"));
  styleInfoLabelCell(worksheet.getCell("F2"));
  styleInfoValueCell(worksheet.getCell("E3"));
  styleInfoValueCell(worksheet.getCell("F3"));

  // رأس الجدول
  const headerRowNumber = 5;
  const headerRow = worksheet.getRow(headerRowNumber);

  allHeaders.forEach((header, index) => {
    const cell = headerRow.getCell(index + 1);
    cell.value = header;
    styleHeaderCell(cell, index < baseColumns.length ? "FFD9EAD3" : "FFF2CC");
  });

  headerRow.height = 24;

  // البيانات
  const sortedRows = [...input.rows].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });

  sortedRows.forEach((row, rowIndex) => {
    const excelRow = worksheet.getRow(headerRowNumber + 1 + rowIndex);

    const byMaterial = new Map<string, number>();
    for (const item of row.items ?? []) {
      byMaterial.set(
        materialKey(item.item_name, item.unit),
        Number(item.delivered_quantity ?? 0)
      );
    }

    const values: Array<string | number> = [
      monthLabel(row.month),
      row.year,
      formatDate(row.delivered_at),
      formatTime(row.delivered_at),
      Number(row.members_count_at_delivery ?? ""),
      ...materialColumns.map((m) => byMaterial.get(m.key) ?? ""),
      row.notes ?? "",
    ];

    values.forEach((value, index) => {
      const cell = excelRow.getCell(index + 1);
      cell.value = value;
      styleBodyCell(cell);

      if (index >= baseColumns.length && index < baseColumns.length + materialColumns.length) {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: rowIndex % 2 === 0 ? "FFF9F9F9" : "FFFFFFFF" },
        };
      }
    });

    excelRow.height = 22;
  });

  // فلتر
  worksheet.autoFilter = {
    from: { row: headerRowNumber, column: 1 },
    to: { row: headerRowNumber, column: allHeaders.length },
  };

  autoFitColumns(worksheet, 14, 26);

  // تحسينات خاصة لبعض الأعمدة
  worksheet.getColumn(1).width = 16; // الشهر
  worksheet.getColumn(2).width = 10; // السنة
  worksheet.getColumn(3).width = 18; // التاريخ
  worksheet.getColumn(4).width = 14; // الوقت
  worksheet.getColumn(5).width = 20; // عدد الأفراد

  return workbook;
}

export async function workbookToBuffer(
  workbook: ExcelJS.Workbook
): Promise<Buffer> {
  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
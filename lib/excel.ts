import * as XLSX from "xlsx";

export function buildWorkbook(sheets: Record<string, unknown[]>) {

  const workbook = XLSX.utils.book_new();

  for (const [sheetName, rows] of Object.entries(sheets)) {

    const worksheet = XLSX.utils.json_to_sheet(rows);

    /* عرض الأعمدة */
    const headers = Object.keys(rows[0] ?? {});
    worksheet["!cols"] = headers.map(() => ({ wch: 18 }));

    /* تجميد الصف الأول */
    worksheet["!freeze"] = { xSplit: 0, ySplit: 1 };

    /* تنسيق header */
    headers.forEach((_, i) => {
      const cell = XLSX.utils.encode_cell({ r: 0, c: i });

      if (!worksheet[cell]) return;

      worksheet[cell].s = {
        font: { bold: true },
        alignment: { horizontal: "center" },
        fill: { fgColor: { rgb: "FFF2CC" } }
      };
    });

    /* حدود للخلايا */
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "");

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {

        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });

        if (!worksheet[cellAddress]) continue;

        worksheet[cellAddress].s = {
          ...worksheet[cellAddress].s,
          border: {
            top: { style: "thin" },
            bottom: { style: "thin" },
            left: { style: "thin" },
            right: { style: "thin" }
          }
        };
      }
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));
  }

  return workbook;
}

export function workbookToBuffer(workbook: XLSX.WorkBook) {
  return XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
    cellStyles: true
  });
}

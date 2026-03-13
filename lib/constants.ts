export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "نظام توزيع المواد الغذائية";

export const DEFAULT_ITEMS = [
  { name: "طحين", unit: "كغم", default_quantity: 9, calculation_type: "per_person" },
  { name: "سكر", unit: "كغم", default_quantity: 3, calculation_type: "per_person" },
  { name: "عدس", unit: "كغم", default_quantity: 0.5, calculation_type: "per_person" },
  { name: "حمص", unit: "كغم", default_quantity: 0.5, calculation_type: "per_person" },
  { name: "رز", unit: "كغم", default_quantity: 6, calculation_type: "per_person" },
  { name: "زيت", unit: "قنينة", default_quantity: 1, calculation_type: "per_person" },
  { name: "معجون طماطم", unit: "علبة", default_quantity: 1, calculation_type: "per_person" },
  { name: "فاصوليا", unit: "كغم", default_quantity: 0.5, calculation_type: "per_family" },
] as const;

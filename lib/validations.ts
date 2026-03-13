import { z } from "zod";

export const familySchema = z.object({
  id: z.string().uuid().optional(),
  family_code: z.string().min(1, "رمز العائلة مطلوب").max(50),
  family_name: z.string().min(2, "اسم العائلة مطلوب").max(120),
  members_count: z.coerce.number().int().min(1, "عدد الأفراد يجب أن يكون 1 أو أكثر"),
  phone: z.string().max(30).optional().nullable(),
  area: z.string().max(120).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  is_active: z.boolean().default(true),
});

export const itemSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "اسم المادة مطلوب").max(120),
  unit: z.string().min(1, "الوحدة مطلوبة").max(50),
  default_quantity: z.coerce.number().min(0, "الكمية يجب ألا تكون سالبة"),
  calculation_type: z.enum(["per_person", "per_family"]),
  is_active: z.boolean().default(true),
});

export const monthlyDistributionSchema = z.object({
  family_id: z.string().uuid(),
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2020).max(2100),
  members_count_at_delivery: z.coerce.number().int().min(1),
  notes: z.string().max(1000).optional().nullable(),
  items: z.array(
    z.object({
      item_id: z.string().uuid(),
      calculated_quantity: z.coerce.number().min(0),
      delivered_quantity: z.coerce.number().min(0),
    })
  ).min(1),
});

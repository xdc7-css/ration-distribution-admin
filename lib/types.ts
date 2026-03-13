export type CalculationType = "per_person" | "per_family";

export type Family = {
  id: string;
  family_code: string;
  family_name: string;
  members_count: number;
  phone: string | null;
  area: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Item = {
  id: string;
  name: string;
  unit: string;
  default_quantity: number;
  calculation_type: CalculationType;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type MonthlyDistribution = {
  id: string;
  family_id: string;
  month: number;
  year: number;
  members_count_at_delivery: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type MonthlyDistributionItem = {
  id: string;
  distribution_id: string;
  item_id: string;
  item_name_snapshot: string;
  unit_snapshot: string;
  calculation_type_snapshot: CalculationType;
  default_quantity_snapshot: number;
  calculated_quantity: number;
  delivered_quantity: number;
  created_at: string;
};

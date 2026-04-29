/**
 * IntegratedProduct interface
 * Matches the `public.integrated_products` table
 */
export interface IntegratedProduct {
  id?: number;
  brand: string;
  system_kw: number; // numeric(5,2)
  phase: string; // e.g., 'Single' | 'Three'
  price: number;
  inverter_capacity_kw: number;
  module_watt: number; // integer
  module_type?: string;
  no_of_modules: number;
  acdb_nos?: number;
  dcdb_nos?: number;
  earthing_rod_nos?: number;
  earthing_chemical_nos?: number;
  ac_wire_brand?: string;
  ac_wire_length_mtr?: number;
  dc_wire_brand?: string;
  dc_wire_length_mtr?: number;
  earthing_wire_brand?: string;
  earthing_wire_length_mtr?: number;
  lighting_arrestor_qty?: number;
  created_at?: string; // ISO timestamp
}

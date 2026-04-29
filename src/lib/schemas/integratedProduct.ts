import { z } from 'zod';

export const integratedProductSchema = z.object({
  brand: z.string().max(50),
  system_kw: z.number().positive().max(999.99),
  phase: z.string().max(10),
  price: z.number().nonnegative(),
  inverter_capacity_kw: z.number().positive(),
  module_watt: z.number().int().positive(),
  module_type: z.string().max(50).optional(),
  no_of_modules: z.number().int().positive(),
  acdb_nos: z.number().int().positive().default(1),
  dcdb_nos: z.number().int().positive().default(1),
  earthing_rod_nos: z.number().int().nonnegative().default(3),
  earthing_chemical_nos: z.number().int().nonnegative().default(3),
  ac_wire_brand: z.string().max(50).optional(),
  ac_wire_length_mtr: z.number().int().nonnegative().default(10),
  dc_wire_brand: z.string().max(50).optional(),
  dc_wire_length_mtr: z.number().int().nonnegative().default(20),
  earthing_wire_brand: z.string().max(50).optional(),
  earthing_wire_length_mtr: z.number().int().nonnegative().default(90),
  lighting_arrestor_qty: z.number().int().nonnegative().default(1),
  created_at: z.string().optional(),
});

export type IntegratedProductInput = z.infer<typeof integratedProductSchema>;
export type IntegratedProduct = IntegratedProductInput & { id?: number };

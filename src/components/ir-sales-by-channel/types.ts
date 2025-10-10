// src/components/ir-sales-by-channel/types.ts
import { z } from 'zod';

/* ---------- Report (input) ---------- */
export const CurrencySchema = z.object({
  code: z.string(),
  id: z.number(),
  symbol: z.string(),
});

const ChannelReportBaseSchema = z.object({
  NIGHTS: z.number(),
  PCT: z.number(),
  REVENUE: z.number(),
  SOURCE: z.string(),
  PROPERTY_ID: z.number(),
  PROPERTY_NAME: z.string(),
  currency: z.string(),
});
export type SalesByChannelMode = 'property' | 'mpo';
/**
 * Transforms UPPER_SNAKE_CASE keys to lowercase at parse time.
 * Output type is exactly the lowercased version of the base schema.
 */
const ExtendedChanelReportBaseSchema = ChannelReportBaseSchema.extend({
  last_year: ChannelReportBaseSchema.optional(),
});
export const ChannelReportSchema = ExtendedChanelReportBaseSchema;

export type ChannelReport = z.infer<typeof ExtendedChanelReportBaseSchema>;

export const ChannelReportResultSchema = z.array(ExtendedChanelReportBaseSchema).nullable();
export type ChannelReportResult = z.infer<typeof ChannelReportResultSchema>;

/* ---------- Params ---------- */

export const ChannelSalesParamsSchema = z.object({
  AC_ID: z.string().optional(),
  BOOK_CASE: z.string().min(1),
  FROM_DATE: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
  TO_DATE: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
  WINDOW: z.coerce.number().int().nonnegative(),
  // Accepts true/false, "true"/"false", 1/0; defaults to false
  is_export_to_excel: z.coerce.boolean().optional().default(false),
  LIST_AC_ID: z.array(z.number()).nullable(),
});
// .strict()
// .refine(v => new Date(v.FROM_DATE) <= new Date(v.TO_DATE), { message: 'FROM_DATE must be on or before TO_DATE', path: ['TO_DATE'] });

export type ChannelSalesParams = z.infer<typeof ChannelSalesParamsSchema>;

/* ---------- Filters ---------- */

export const ChannelSalesFilterSchema = ChannelSalesParamsSchema.extend({
  include_previous_year: z.boolean(),
});

export type ChannelSaleFilter = z.infer<typeof ChannelSalesFilterSchema>;

/* ---------- Helpers (optional but handy) ---------- */

export const parseChannelReport = (data: unknown) => ChannelReportSchema.parse(data);
export const safeParseChannelReport = (data: unknown) => ChannelReportSchema.safeParse(data);

export const parseChannelReportResult = (data: unknown) => ChannelReportResultSchema.parse(data);
export const safeParseChannelReportResult = (data: unknown) => ChannelReportResultSchema.safeParse(data);

export const parseChannelSalesParams = (data: unknown) => ChannelSalesParamsSchema.parse(data);
export const safeParseChannelSalesParams = (data: unknown) => ChannelSalesParamsSchema.safeParse(data);

/* ---------- Consolidated exports ---------- */

export { ChannelReportSchema as ReportSchema, ChannelReportResultSchema as ReportResultSchema, ChannelSalesParamsSchema as SalesParamsSchema };

export type { ChannelReport as Report, ChannelReportResult as ReportResult, ChannelSalesParams as SalesParams };

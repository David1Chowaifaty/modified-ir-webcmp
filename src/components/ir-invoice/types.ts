import * as z from 'zod';

export const CurrencySchema = z.object({
  code: z.string(),
  id: z.number(),
  symbol: z.string(),
});
export type Currency = z.infer<typeof CurrencySchema>;

/**
 * `"BSA"` = Accommodation
 * `"BSP"` = Pickup
 * `"BSE"` = Extra service
 */
export type InvoicableItemType = 'BSA' | 'BSP' | 'BSE';

export const InvoicableItemSchema = z.object({
  amount: z.number(),
  booking_nbr: z.string(),
  currency: CurrencySchema,
  invoice_nbr: z.null(),
  is_invoiceable: z.boolean(),
  key: z.null(),
  status: z.null(),
  system_id: z.null(),
  type: z.enum(['BSA', 'BSP', 'BSE']) as z.ZodType<InvoicableItemType>,
});
export type InvoicableItem = z.infer<typeof InvoicableItemSchema>;

export const BookingInvoiceInfoSchema = z.object({
  invoicable_items: z.array(InvoicableItemSchema),
  invoices: z.array(z.any()),
});
export type BookingInvoiceInfo = z.infer<typeof BookingInvoiceInfoSchema>;

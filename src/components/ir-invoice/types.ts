import * as z from 'zod';

export const CurrencySchema = z.object({
  code: z.string(),
  id: z.number(),
  symbol: z.string(),
});
export type Currency = z.infer<typeof CurrencySchema>;

export const InvoicableItemSchema = z.object({
  amount: z.number(),
  booking_nbr: z.string(),
  currency: CurrencySchema,
  invoice_nbr: z.null(),
  is_invoiceable: z.boolean(),
  key: z.null(),
  status: z.null(),
  system_id: z.null(),
  type: z.string(),
});
export type InvoicableItem = z.infer<typeof InvoicableItemSchema>;

export const BookingInvoiceInfoSchema = z.object({
  invoicable_items: z.array(InvoicableItemSchema),
  invoices: z.array(z.any()),
});
export type BookingInvoiceInfo = z.infer<typeof BookingInvoiceInfoSchema>;

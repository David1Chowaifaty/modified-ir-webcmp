import * as z from 'zod';

export const CurrencySchema = z.object({
  code: z.string(),
  id: z.number(),
  symbol: z.string(),
});
export type Currency = z.infer<typeof CurrencySchema>;

export const StatusSchema = z.object({
  code: z.string(),
  description: z.any(),
});
export type Status = z.infer<typeof StatusSchema>;

export const ItemSchema = z.object({
  amount: z.number(),
  booking_nbr: z.string(),
  currency: CurrencySchema,
  description: z.any(),
  invoice_nbr: z.string(),
  is_invoiceable: z.boolean(),
  key: z.number(),
  status: StatusSchema,
  system_id: z.number(),
  type: z.string(),
});
export type Item = z.infer<typeof ItemSchema>;
export const CreditNoteSchema = z.object({
  date: z.string(),
  nbr: z.string(),
  reason: z.string(),
  system_id: z.string().nullable(),
});
export const InvoiceSchema = z.object({
  billed_to_name: z.any(),
  billed_to_tax: z.any(),
  booking_nbr: z.string(),
  credit_note: CreditNoteSchema.nullable(),
  currency: CurrencySchema,
  date: z.string(),
  items: z.array(ItemSchema),
  nbr: z.string(),
  pdf_url: z.any(),
  remark: z.string(),
  status: StatusSchema,
  system_id: z.number(),
  target: z.any(),
  total_amount: z.any(),
});
export type Invoice = z.infer<typeof InvoiceSchema>;

/**
 * `"BSA"` = Accommodation
 * `"BSP"` = Pickup
 * `"BSE"` = Extra service
 * `"PAYMENT"` = Cancellation payment
 */
export type InvoiceableItemType = 'BSA' | 'BSP' | 'BSE' | 'PAYMENT';
/**
 * `"001"` = Already invoiced
 * `"002"` = Not Checked-Out yet
 * `"003"` = Due to pickup cancellation policy
 */
export type InvoiceableItemReasonCode = '001' | '002' | '003';

export const InvoiceableItemReasonSchema = z.object({
  code: z.enum(['001', '002', '003']) as z.ZodType<InvoiceableItemReasonCode>,
  description: z.string().nullable(),
});
export const InvoiceableItemSchema = z.object({
  amount: z.number(),
  booking_nbr: z.string(),
  currency: CurrencySchema,
  invoice_nbr: z.string().nullable(),
  is_invoiceable: z.boolean(),
  key: z.number(),
  status: z.any(),
  system_id: z.any(),
  reason: InvoiceableItemReasonSchema.nullable(),
  type: z.enum(['BSA', 'BSP', 'BSE', 'PAYMENT']) as z.ZodType<InvoiceableItemType>,
});
export type InvoiceableItem = z.infer<typeof InvoiceableItemSchema>;

export const BookingInvoiceInfoSchema = z.object({
  invoiceable_items: z.array(InvoiceableItemSchema),
  invoices: z.array(InvoiceSchema).nullable(),
});
export type BookingInvoiceInfo = z.infer<typeof BookingInvoiceInfoSchema>;
export type ViewMode = 'invoice' | 'proforma';

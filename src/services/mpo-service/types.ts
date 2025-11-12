import * as z from 'zod';

export const MyParamsGetExposedMpoSchema = z.object({
  id: z.number(),
});
export type MyParamsGetExposedMpo = z.infer<typeof MyParamsGetExposedMpoSchema>;

export const AffiliateSchema = z.object({
  address: z.string(),
  afname: z.null(),
  allowed_payment_methods: z.array(z.any()),
  body_tag: z.null(),
  call_to_action_btn_color: z.null(),
  city: z.null(),
  contact_name: z.string(),
  conversion_tag: z.null(),
  country: z.null(),
  currency: z.null(),
  custom_css: z.null(),
  email: z.null(),
  footer_tag: z.null(),
  header_tag: z.null(),
  id: z.number(),
  logo: z.string(),
  name: z.string(),
  phone: z.string(),
  sites: z.null(),
  url: z.null(),
});
export type Affiliate = z.infer<typeof AffiliateSchema>;

export const BilingCurrencySchema = z.object({
  code: z.string(),
  id: z.number(),
  symbol: z.null(),
});
export type BilingCurrency = z.infer<typeof BilingCurrencySchema>;

export const CountrySchema = z.object({
  cities: z.null(),
  code: z.string(),
  currency: z.null(),
  flag: z.null(),
  gmt_offset: z.number(),
  id: z.number(),
  market_places: z.null(),
  name: z.string(),
  phone_prefix: z.null(),
});
export type Country = z.infer<typeof CountrySchema>;

export const MarketPlaceSchema = z.object({
  country_id: z.number(),
  id: z.number(),
  name: z.string(),
});
export type MarketPlace = z.infer<typeof MarketPlaceSchema>;

export const SmtpInfoSchema = z.object({
  host: z.null(),
  is_active: z.boolean(),
  no_reply_email: z.null(),
  password: z.null(),
  port: z.number(),
  username: z.null(),
});
export type SmtpInfo = z.infer<typeof SmtpInfoSchema>;

export const UserSchema = z.object({
  created_on: z.string(),
  email: z.string(),
  id: z.number(),
  is_active: z.boolean(),
  is_email_verified: z.boolean(),
  mobile: z.null(),
  password: z.null(),
  sign_ins: z.null(),
  type: z.number(),
  username: z.string(),
});
export type User = z.infer<typeof UserSchema>;

export const ExposedMPOSchema = z.object({
  address: z.string(),
  affiliates: z.array(AffiliateSchema),
  bg_img_url: z.string(),
  biling_currency: BilingCurrencySchema,
  booking_name: z.string(),
  booking_notify_email: z.string(),
  booking_notify_mobile: z.string(),
  city: z.string(),
  company_name: z.null(),
  country: CountrySchema,
  fav_icon: z.string(),
  fax: z.string(),
  footer_confirmation_text: z.null(),
  id: z.number(),
  is_email_notification: z.boolean(),
  logo_url: z.string(),
  market_places: z.array(MarketPlaceSchema),
  name: z.string(),
  notes: z.string(),
  phone: z.string(),
  smtp_info: SmtpInfoSchema,
  state: z.string(),
  user: UserSchema,
  vat_nbr: z.string(),
  vat_pct: z.number(),
  website: z.null(),
  wl_url: z.null(),
});
export type ExposedMPO = z.infer<typeof ExposedMPOSchema>;

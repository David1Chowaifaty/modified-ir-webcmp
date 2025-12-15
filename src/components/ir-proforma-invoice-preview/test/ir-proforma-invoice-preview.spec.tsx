import { h } from '@stencil/core';
import { newSpecPage } from '@stencil/core/testing';
import { Booking } from '@/models/booking.dto';
import { BookingInvoiceInfo } from '@/components/ir-invoice/types';
import { IssueInvoiceProps } from '@/services/booking-service/types';
import { IrProformaInvoicePreview } from '../ir-proforma-invoice-preview';

type InvoicePayload = IssueInvoiceProps['invoice'];

const buildBookingFixture = (): Booking => {
  const property = {
    name: 'Demo Hotel',
    address: 'Ice Venue 11, Jounieh, Lebanon',
    phone: '+961 - 9986454545',
    registered_name: 'Demo Hotel LTD',
    city: { name: 'Jounieh', id: 1, gmt_offset: 0 },
    country: { name: 'Lebanon', id: 1, phone_prefix: '+961', gmt_offset: 0, cities: null, code: null, currency: null, flag: null },
    company: {
      name: 'Demo Hotel LTD',
      address: 'Ice Venue 11',
      city: 'Jounieh',
      country: { name: 'Lebanon', id: 1, phone_prefix: '+961', gmt_offset: 0, cities: null, code: null, currency: null, flag: null },
      phone: '+961 - 9986454545',
      postal: '0000',
      tax_nbr: '601-90023',
      invoice_footer_notes: 'Thank you for choosing Demo Hotel.',
      credit_note_prefix: 'CR',
      credit_note_start_nbr: 1,
      invoice_prefix: 'IN',
      invoice_start_nbr: 1,
    },
    taxes: [
      { name: 'V.A.T', pct: 11, is_exlusive: true },
      { name: 'City Tax', pct: 5, is_exlusive: false },
    ],
  } as any;

  return {
    booking_nbr: 'BDC-9983980939',
    booked_on: { date: '2025-11-10', hour: 17, minute: 10 },
    currency: { code: 'USD', id: 1, symbol: 'US$' },
    guest: {
      first_name: 'John',
      last_name: 'Doe2',
      email: 'estest.test@gmail.com',
      mobile: '+501-12345678',
      address: 'Belize',
      city: 'Belize',
      company_name: null,
      company_tax_nbr: null,
      country_id: 1,
      dob: null,
      alternative_email: null,
      id: 1,
      country_phone_prefix: '+501',
      subscribe_to_news_letter: null,
      cci: null,
      nbr_confirmed_bookings: 1,
      notes: '',
      mobile_without_prefix: '',
    },
    property,
    rooms: [
      {
        system_id: 11,
        roomtype: { name: 'Premium Suites' },
        rateplan: { short_name: 'Half board', name: 'Half board' },
        from_date: '2025-12-10',
        to_date: '2025-12-14',
        guest: { first_name: 'John', last_name: 'Doe2' },
        occupancy: { adult_nbr: 2, children_nbr: 0, infant_nbr: 0 },
        unit: '103',
        guarantee: 25,
        days: [
          { date: '2025-12-10', amount: 140, cost: null },
          { date: '2025-12-11', amount: 140, cost: null },
          { date: '2025-12-12', amount: 140, cost: null },
          { date: '2025-12-13', amount: 140, cost: null },
        ],
        gross_total: 560,
        total: 560,
      },
    ],
    occupancy: { adult_nbr: 2, children_nbr: 0, infant_nbr: 0 },
    from_date: '2025-12-10',
    to_date: '2025-12-14',
    extra_services: [
      {
        description: 'Croissant buffet',
        start_date: '2025-12-10',
        end_date: null,
        price: 88,
      },
    ],
    arrival: { code: '001', description: 'Not sure yet' },
    pickup_info: null,
    financial: {
      payments: [
        {
          id: 1,
          amount: 709.6,
          currency: { code: 'USD', id: 1, symbol: '$' },
          designation: 'Payment: Cash',
          reference: '-',
          date: '2025-12-13',
          payment_method: { code: 'cash', description: 'Cash', operation: 'credit' },
          payment_type: { code: 'cash', description: 'Cash', operation: 'credit' },
          receipt_nbr: 'RC-100',
          time_stamp: { date: '2025-12-13', hour: 10, minute: 30, second: 0, user: 'Agent' },
        },
      ],
      collected: 709.6,
      due_amount: 155.4,
      gross_total: 560,
      gross_total_with_extras: 648,
      cancelation_penality_as_if_today: 0,
      total_amount: 648,
      gross_cost: 0,
      refunds: 0,
      invoice_nbr: 'IRINV-2455',
      due_dates: [],
    },
    status: { code: 'CONF', description: 'Confirmed' },
  } as unknown as Booking;
};

const buildInvoicePayload = (): InvoicePayload =>
  ({
    booking_nbr: 'BDC-9983980939',
    currency: { id: 1 },
    Date: '2025-12-09',
    target: { code: '001', description: 'Guest' },
    billed_to_name: 'John Doe2',
    items: [
      {
        amount: 560,
        description: 'Premium Suites',
        key: 11,
        // system_id: 11,
      },
      {
        amount: 88,
        description: 'Croissant buffet',
        key: 12,
        system_id: 12,
      },
    ],
  } as InvoicePayload);

const buildInvoiceInfo = (): BookingInvoiceInfo =>
  ({
    invoiceable_items: [],
    invoices: [
      {
        nbr: 'IRINV-2455',
        booking_nbr: 'BDC-9983980939',
        billed_to_name: 'John Doe2',
        billed_to_tax: '',
        credit_note: { nbr: 'IRCN-807', date: '2025-12-08', reason: '', system_id: null, user: 'Agent' },
        currency: { code: 'USD', id: 1, symbol: '$' },
        date: '2025-12-09',
        items: [],
        pdf_url: null,
        remark: '',
        status: { code: 'VALID', description: 'Valid' },
        system_id: 1,
        target: null,
        total_amount: 648,
        user: 'Agent',
      },
    ],
  } as BookingInvoiceInfo);

describe('ir-proforma-invoice-preview', () => {
  it('renders hotel header, accommodation, and totals', async () => {
    const page = await newSpecPage({
      components: [IrProformaInvoicePreview],
      template: () => <ir-proforma-invoice-preview booking={buildBookingFixture()} invoice={buildInvoicePayload()} invoiceInfo={buildInvoiceInfo()}></ir-proforma-invoice-preview>,
    });

    const bookingRef = page.root.shadowRoot.querySelector('.proforma__booking-ref');
    expect(bookingRef.textContent).toContain('Booking#BDC-9983980939');

    const grandTotal = page.root.shadowRoot.querySelector('.proforma__totals-grand span:last-child');
    expect(grandTotal.textContent).toContain('648');

    const extrasTitle = page.root.shadowRoot.querySelector('.proforma__extras-title');
    expect(extrasTitle.textContent).toContain('Croissant buffet');

    const folioRows = page.root.shadowRoot.querySelectorAll('.proforma__folio tbody tr');
    expect(folioRows.length).toBe(1);
  });

  it('shows empty state when booking data is missing', async () => {
    const page = await newSpecPage({
      components: [IrProformaInvoicePreview],
      html: `<ir-proforma-invoice-preview></ir-proforma-invoice-preview>`,
    });

    expect(page.root.shadowRoot.textContent).toContain('Select a booking');
  });

  it('omits extras and folio when booking lacks those sections', async () => {
    const booking = buildBookingFixture();
    booking.extra_services = [];
    booking.financial.payments = [];

    const page = await newSpecPage({
      components: [IrProformaInvoicePreview],
      template: () => <ir-proforma-invoice-preview booking={booking}></ir-proforma-invoice-preview>,
    });

    expect(page.root.shadowRoot.querySelector('.proforma__extras')).toBeNull();
    expect(page.root.shadowRoot.querySelector('.proforma__folio')).toBeNull();
  });
});

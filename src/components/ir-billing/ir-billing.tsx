import { Booking } from '@/models/booking.dto';
import { Component, Event, EventEmitter, Fragment, Listen, Prop, State, h } from '@stencil/core';
import { BookingInvoiceInfo, Invoice } from '../ir-invoice/types';
import { BookingService } from '@/services/booking-service/booking.service';
import { downloadFile, formatAmount } from '@/utils/utils';
import moment from 'moment';
import { isRequestPending } from '@/stores/ir-interceptor.store';

@Component({
  tag: 'ir-billing',
  styleUrls: ['ir-billing.css', '../../common/table.css'],
  scoped: true,
})
export class IrBilling {
  @Prop() booking: Booking;

  @State() isOpen: 'invoice' = null;
  @State() isLoading: 'page' | 'void' = 'page';
  @State() invoiceInfo: BookingInvoiceInfo;
  @State() selectedInvoice: string = null;

  @Event() billingClose: EventEmitter<void>;

  private bookingService = new BookingService();

  componentWillLoad() {
    this.init();
  }
  @Listen('invoiceCreated')
  async handleInvoiceCreation(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.invoiceInfo = { ...e.detail };
  }
  private async init() {
    try {
      this.isLoading = 'page';
      this.invoiceInfo = await this.bookingService.getBookingInvoiceInfo({ booking_nbr: this.booking.booking_nbr });
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = null;
    }
  }
  private async voidInvoice(e: CustomEvent) {
    this.isLoading = 'void';
    e.stopImmediatePropagation();
    e.stopPropagation();
    await this.bookingService.voidInvoice({
      invoice_nbr: this.selectedInvoice,
      reason: '',
    });
    this.invoiceInfo = await this.bookingService.getBookingInvoiceInfo({ booking_nbr: this.booking.booking_nbr });
    this.isLoading = null;
    this.selectedInvoice = null;
  }

  private get invoices() {
    const _invoices: Invoice[] = [];
    for (const invoice of this.invoiceInfo.invoices) {
      if (invoice.status.code === 'VALID') {
        _invoices.push(invoice);
      } else {
        _invoices.push({ ...invoice, status: { code: 'VALID', description: '' } });
        _invoices.push({ ...invoice, date: invoice.credit_note.date });
      }
    }
    return _invoices.sort((a, b) => {
      const aDate = moment(a.date ?? a.credit_note?.date, 'YYYY-MM-DD');
      const bDate = moment(b.date ?? b.credit_note?.date, 'YYYY-MM-DD');
      return aDate.diff(bDate); // ASC order
    });
  }

  private async printInvoice(invoice: Invoice, autoDownload = false) {
    try {
      const { My_Result } = await this.bookingService.printInvoice({
        invoice_nbr: invoice.nbr,
        mode: invoice.credit_note ? 'creditnote' : 'invoice',
      });
      if (!My_Result) {
        return;
      }
      if (autoDownload) {
        downloadFile(My_Result);
        return;
      }
      window.open(My_Result);
    } catch (error) {
      console.error(error);
    }
  }

  render() {
    if (this.isLoading === 'page') {
      return (
        <div class="drawer__loader-container">
          <ir-spinner></ir-spinner>
        </div>
      );
    }
    return (
      <Fragment>
        <div class="billing__container">
          <section>
            <div class="billing__section-title-row">
              <h4 class="billing__section-title">Issued documents</h4>
              <ir-custom-button
                variant="brand"
                onClickHandler={e => {
                  e.stopImmediatePropagation();
                  e.stopPropagation();
                  this.isOpen = 'invoice';
                }}
              >
                Issue invoice
              </ir-custom-button>
            </div>
            <div class="table-container">
              <table class="table">
                <thead>
                  <tr>
                    {/* <th>Type</th> */}
                    <th>Date</th>
                    <th>Number</th>
                    <th class="billing__price-col">Amount</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {this.invoices?.map(invoice => {
                    const isValid = invoice.status.code === 'VALID';
                    return (
                      <tr class="ir-table-row">
                        {/* <td>{isValid ? 'Invoice' : 'Credit note'}</td> */}
                        <td>
                          {invoice.status.code === 'VALID'
                            ? moment(invoice.date, 'YYYY-MM-DD').format('MMM DD, YYYY')
                            : moment(invoice.credit_note.date, 'YYYY-MM-DD').format('MMM DD, YYYY')}
                        </td>
                        <td>
                          <p class="billing__invoice-nbr">
                            <b>{isValid ? 'Invoice' : 'Credit note'}:</b> {isValid ? invoice.nbr : invoice.credit_note.nbr}
                          </p>
                          {!isValid && <p class="billing__invoice-nbr --secondary">{invoice.nbr}</p>}
                        </td>
                        <td class="billing__price-col">
                          <span class="ir-price" style={{ fontWeight: '400' }}>
                            {formatAmount(invoice.currency.symbol, invoice.total_amount)}
                          </span>
                        </td>
                        <td>
                          <div class="billing__actions-row">
                            <wa-dropdown
                              onwa-hide={e => {
                                e.stopImmediatePropagation();
                                e.stopPropagation();
                              }}
                              onwa-select={async e => {
                                switch ((e.detail as any).item.value) {
                                  case 'print':
                                    this.printInvoice(invoice, true);
                                    break;
                                  case 'view-print':
                                    this.printInvoice(invoice);
                                    break;
                                  case 'void':
                                    this.selectedInvoice = invoice.nbr;
                                    break;
                                }
                              }}
                            >
                              <h3>Issued by: {invoice.credit_note ? invoice.credit_note.user : invoice.user}</h3>
                              <wa-divider></wa-divider>
                              {/* <h3>Actions</h3> */}
                              <wa-dropdown-item value="view-print">
                                Open pdf
                                {isRequestPending('/Print_Invoice') && <wa-spinner slot="details"></wa-spinner>}
                              </wa-dropdown-item>
                              {isValid && !invoice.credit_note && (
                                <wa-dropdown-item variant="danger" value="void">
                                  Void with credit note
                                </wa-dropdown-item>
                              )}
                              {/* <wa-tooltip for={`pdf-${invoice.system_id}`}>Download pdf</wa-tooltip> */}
                              <ir-custom-button slot="trigger" id={`pdf-${invoice.system_id}`} variant="neutral" appearance="plain">
                                <wa-icon name="ellipsis-vertical" style={{ fontSize: '1rem' }}></wa-icon>
                              </ir-custom-button>
                            </wa-dropdown>
                          </div>
                        </td>
                        {/* <p>
                    {this.booking.guest.first_name} {this.booking.guest.last_name}
                  </p> */}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div class="billing__cards">
              {this.invoices?.map(invoice => {
                const isValid = invoice.status.code === 'VALID';

                return (
                  <wa-card key={invoice.nbr} class="billing__card">
                    <div class="billing__card-header">
                      <div class="billing__card-header-info">
                        <p class="billing__card-number">
                          {isValid ? 'Invoice' : 'Credit note'}:{isValid ? invoice.nbr : invoice.credit_note.nbr}
                        </p>
                        <p class="billing__card-type">{isValid ? '' : invoice.nbr}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                        <wa-tooltip for={`mobile-download-pdf-${invoice.system_id}`}>Open pdf</wa-tooltip>
                        <ir-custom-button
                          onClickHandler={() => this.printInvoice(invoice)}
                          loading={isRequestPending('/Print_Invoice')}
                          id={`mobile-download-pdf-${invoice.system_id}`}
                          variant="neutral"
                          appearance="plain"
                          class="billing__card-download-btn"
                        >
                          <wa-icon name="file-pdf" style={{ fontSize: '1rem' }}></wa-icon>
                        </ir-custom-button>
                      </div>
                    </div>

                    <div class="billing__card-details">
                      <div class="billing__card-detail">
                        <p class="billing__card-detail-label">Date</p>
                        <p class="billing__card-detail-value">
                          {' '}
                          {isValid ? moment(invoice.date, 'YYYY-MM-DD').format('MMM DD, YYYY') : moment(invoice.credit_note.date, 'YYYY-MM-DD').format('MMM DD, YYYY')}
                        </p>
                      </div>

                      <div class="billing__card-detail">
                        <p class="billing__card-detail-label --amount">Amount</p>
                        <p class="billing__card-detail-value">{formatAmount(invoice.currency.symbol, invoice.total_amount ?? 0)}</p>
                      </div>
                    </div>

                    {isValid && !invoice.credit_note && (
                      <div slot="footer" class="billing__card-footer">
                        <ir-custom-button
                          onClickHandler={() => {
                            this.selectedInvoice = invoice.nbr;
                          }}
                          variant="danger"
                          appearance="outlined"
                          class="billing__card-void-btn"
                        >
                          Void with credit note
                        </ir-custom-button>
                      </div>
                    )}
                  </wa-card>
                );
              })}
            </div>
            {this.invoiceInfo.invoices?.length === 0 && <ir-empty-state style={{ width: '100%', height: '40vh' }}></ir-empty-state>}
          </section>
        </div>
        <ir-invoice
          invoiceInfo={this.invoiceInfo}
          onInvoiceClose={e => {
            e.stopImmediatePropagation();
            e.stopPropagation();
            this.isOpen = null;
          }}
          open={this.isOpen === 'invoice'}
          booking={this.booking}
        ></ir-invoice>
        <ir-dialog
          label="Alert"
          open={this.selectedInvoice !== null}
          lightDismiss={false}
          onIrDialogHide={e => {
            e.stopImmediatePropagation();
            e.stopPropagation();
          }}
          onIrDialogAfterHide={e => {
            e.stopImmediatePropagation();
            e.stopPropagation();
            this.selectedInvoice = null;
          }}
        >
          <p>Void invoice {this.selectedInvoice} by generating a credit note?</p>
          <div slot="footer" class="ir-dialog__footer">
            <ir-custom-button data-dialog="close" size="medium" appearance="filled" variant="neutral">
              Cancel
            </ir-custom-button>
            <ir-custom-button loading={this.isLoading === 'void'} onClickHandler={this.voidInvoice.bind(this)} size="medium" variant="danger">
              Confirm
            </ir-custom-button>
          </div>
        </ir-dialog>
      </Fragment>
    );
  }
}

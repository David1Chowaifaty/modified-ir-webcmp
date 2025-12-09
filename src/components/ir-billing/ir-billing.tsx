import { Booking } from '@/models/booking.dto';
import { Component, Event, EventEmitter, Fragment, Listen, Prop, State, h } from '@stencil/core';
import { BookingInvoiceInfo } from '../ir-invoice/types';
import { BookingService } from '@/services/booking-service/booking.service';
import { formatAmount } from '@/utils/utils';
import moment from 'moment';

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
    this.invoiceInfo = await this.bookingService.getBookingInvoiceInfo({ booking_nbr: this.booking.booking_nbr });
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
              <h4 class="billing__section-title">Physical documents</h4>
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
                    <th>Type</th>
                    <th>Number</th>
                    <th>Date</th>
                    <th class="billing__price-col">Amount</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {this.invoiceInfo?.invoices?.map(invoice => (
                    <tr class="ir-table-row">
                      <td>{invoice.status.code === 'VALID' ? 'Invoice' : 'Credit note'}</td>
                      <td>{invoice.status.code === 'VALID' ? invoice.nbr : invoice.credit_note.nbr}</td>
                      <td>
                        {invoice.status.code === 'VALID'
                          ? moment(invoice.date, 'YYYY-MM-DD').format('MMM DD, YYYY')
                          : moment(invoice.credit_note.date, 'YYYY-MM-DD').format('MMM DD, YYYY')}
                      </td>
                      <td class="billing__price-col">
                        <span class="ir-price">{formatAmount(invoice.currency.symbol, invoice.total_amount ?? 0)}</span>
                      </td>
                      <td>
                        <div class="billing__actions-row">
                          <wa-tooltip for={`pdf-${invoice.system_id}`}>Download pdf</wa-tooltip>
                          <ir-custom-button id={`pdf-${invoice.system_id}`} variant="neutral" appearance="plain">
                            <wa-icon name="file-pdf" style={{ fontSize: '1rem' }}></wa-icon>
                          </ir-custom-button>
                          {invoice.status.code === 'VALID' && (
                            <ir-custom-button
                              onClickHandler={() => {
                                this.selectedInvoice = invoice.nbr;
                              }}
                              variant="danger"
                              appearance="plain"
                            >
                              Void with credit note
                            </ir-custom-button>
                          )}
                        </div>
                      </td>
                      {/* <p>
                    {this.booking.guest.first_name} {this.booking.guest.last_name}
                  </p> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div class="billing__cards">
              {this.invoiceInfo.invoices?.map(invoice => (
                <wa-card key={invoice.nbr} class="billing__card">
                  <div class="billing__card-header">
                    <div class="billing__card-header-info">
                      <p class="billing__card-number">{invoice.status.code === 'VALID' ? invoice.nbr : invoice.credit_note.nbr}</p>
                      <p class="billing__card-type">{invoice.status.code === 'VALID' ? 'Invoice' : 'Credit note'}</p>
                    </div>

                    <wa-tooltip for={`mobile-pdf-${invoice.system_id}`}>Download pdf</wa-tooltip>
                    <ir-custom-button id={`mobile-pdf-${invoice.system_id}`} variant="neutral" appearance="plain" class="billing__card-download-btn">
                      <wa-icon name="file-pdf" style={{ fontSize: '1rem' }}></wa-icon>
                    </ir-custom-button>
                  </div>

                  <div class="billing__card-details">
                    <div class="billing__card-detail">
                      <p class="billing__card-detail-label">Date</p>
                      <p class="billing__card-detail-value">
                        {' '}
                        {invoice.status.code === 'VALID'
                          ? moment(invoice.date, 'YYYY-MM-DD').format('MMM DD, YYYY')
                          : moment(invoice.credit_note.date, 'YYYY-MM-DD').format('MMM DD, YYYY')}
                      </p>
                    </div>

                    <div class="billing__card-detail">
                      <p class="billing__card-detail-label --amount">Amount</p>
                      <p class="billing__card-detail-value">{formatAmount(invoice.currency.symbol, invoice.total_amount ?? 0)}</p>
                    </div>
                  </div>

                  {invoice.status.code === 'VALID' && (
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
              ))}
            </div>
            {this.invoiceInfo.invoices?.length === 0 && <div>No invoices created</div>}
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
          <p>Confirm that you want to void this invoice and generate a corresponding credit note.</p>
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

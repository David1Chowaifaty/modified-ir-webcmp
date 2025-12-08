import { Booking } from '@/models/booking.dto';
import { Component, Event, EventEmitter, Fragment, Prop, State, h } from '@stencil/core';
import { BookingInvoiceInfo } from '../ir-invoice/types';
import { BookingService } from '@/services/booking-service/booking.service';

@Component({
  tag: 'ir-billing',
  styleUrl: 'ir-billing.css',
  scoped: true,
})
export class IrBilling {
  @Prop() booking: Booking;

  @State() isOpen: 'invoice' | 'credit-note' = null;
  @State() isLoading: boolean;
  @State() invoiceInfo: BookingInvoiceInfo;

  @Event() billingClose: EventEmitter<void>;

  private bookingService = new BookingService();

  componentWillLoad() {
    this.init();
  }

  private async init() {
    try {
      this.isLoading = true;
      this.invoiceInfo = await this.bookingService.getBookingInvoiceInfo({ booking_nbr: this.booking.booking_nbr });
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  render() {
    if (this.isLoading) {
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
              <h4 class="billing__section-title">Invoice history</h4>
              <wa-tooltip for="billing--create-invoice-btn">Create invoice</wa-tooltip>
              <ir-custom-button
                id="billing--create-invoice-btn"
                appearance="plain"
                variant="neutral"
                onClickHandler={e => {
                  e.stopImmediatePropagation();
                  e.stopPropagation();
                  this.isOpen = 'invoice';
                }}
              >
                <wa-icon name="plus"></wa-icon>
              </ir-custom-button>
            </div>
            <div>
              {this.invoiceInfo?.invoices?.length === 0 && <div>No invoices created</div>}
              {this.invoiceInfo.invoices?.map(invoice => (
                <div>
                  <p>{invoice.nbr}</p>
                </div>
              ))}
            </div>
          </section>
          <section>
            <div class="billing__section-title-row">
              <h4 class="billing__section-title">Credit-note history</h4>
              <wa-tooltip for="billing--create-invoice-btn">Create credit note</wa-tooltip>
              <ir-custom-button
                disabled={this.invoiceInfo?.invoices.length === 0}
                id="billing--create-invoice-btn"
                appearance="plain"
                variant="neutral"
                onClickHandler={e => {
                  e.stopImmediatePropagation();
                  e.stopPropagation();
                  this.isOpen = 'invoice';
                }}
              >
                <wa-icon name="plus"></wa-icon>
              </ir-custom-button>
            </div>
            <div>
              {this.invoiceInfo?.invoices?.length === 0 && <div>No invoices created</div>}
              {this.invoiceInfo.invoices?.map(invoice => (
                <div>
                  <p>{invoice.nbr}</p>
                </div>
              ))}
            </div>
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
      </Fragment>
    );
  }
}

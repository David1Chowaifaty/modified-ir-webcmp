import { Booking } from '@/models/booking.dto';
import { BookingService } from '@/services/booking-service/booking.service';
import locales from '@/stores/locales.store';
import { Component, Event, EventEmitter, Fragment, Prop, State, Watch, h } from '@stencil/core';
import { BookingInvoiceInfo } from '../ir-invoice/types';

export type CheckoutDialogCloseEvent = { reason: 'cancel' | 'checkout' | 'openInvoice' };

@Component({
  tag: 'ir-checkout-dialog',
  styleUrl: 'ir-checkout-dialog.css',
  shadow: true,
})
export class IrCheckoutDialog {
  @Prop({ reflect: true }) open: boolean;
  /**
   * Booking data for the current room checkout action.
   */
  @Prop() booking: Booking;

  /**
   * Unique identifier of the room being checked out.
   */
  @Prop() identifier: string;

  @State() isLoading: 'checkout' | 'skipCheckout' | 'checkout&invoice' | 'page' = 'page';
  @State() buttons: Set<'checkout' | 'checkout_without_invoice' | 'invoice_checkout'> = new Set();
  @State() invoiceInfo: BookingInvoiceInfo;

  @Event({ composed: true, bubbles: true }) checkoutDialogClosed: EventEmitter<CheckoutDialogCloseEvent>;

  private bookingService = new BookingService();

  private async checkoutRoom({ e, source }: { e: CustomEvent; source: 'checkout' | 'skipCheckout' | 'checkout&invoice' }) {
    try {
      e.stopImmediatePropagation();
      e.stopPropagation();
      this.isLoading = source;
      await this.bookingService.handleExposedRoomInOut({
        booking_nbr: this.booking.booking_nbr,
        room_identifier: this.identifier,
        status: '002',
      });
      this.isLoading = null;
      this.checkoutDialogClosed.emit({ reason: source === 'checkout&invoice' ? 'openInvoice' : 'checkout' });
    } catch (error) {
      console.error(error);
    }
  }

  @Watch('open')
  handleOpenChange(newValue: boolean, oldValue: boolean) {
    if (newValue !== oldValue) {
      this.init();
    }
  }

  private async init() {
    if (!this.open) {
      return;
    }
    try {
      this.isLoading = 'page';
      this.invoiceInfo = await this.bookingService.getBookingInvoiceInfo({ booking_nbr: this.booking.booking_nbr });
      this.setupButtons();
    } catch (error) {
    } finally {
      this.isLoading = null;
    }
  }

  private setupButtons() {
    const toBeInvoicedRooms = this.invoiceInfo.invoiceable_items.filter(item => item.type === 'BSA' && item.reason?.code !== '001');
    //check if all rooms are invoiced
    const allRoomInvoiced = toBeInvoicedRooms.length === 0;
    if (allRoomInvoiced) {
      this.buttons.add('checkout');
      return;
    }
    //invoice and checkout : if some rooms are not invoiced
    this.buttons.add('invoice_checkout');
    //checkout without invoice :available except for last room in a booking
    if (toBeInvoicedRooms.length > 1) {
      this.buttons.add('checkout_without_invoice');
    }
  }

  render() {
    return (
      <ir-dialog
        open={this.open}
        label="Alert"
        style={{ '--ir-dialog-width': 'fit-content' }}
        onIrDialogHide={e => {
          e.stopImmediatePropagation();
          e.stopPropagation();
          this.checkoutDialogClosed.emit({ reason: 'cancel' });
        }}
      >
        {this.isLoading === 'page' ? (
          <div class="dialog__loader-container">
            <ir-spinner></ir-spinner>
          </div>
        ) : (
          <p style={{ width: 'calc(31rem - var(--spacing))' }}>Are you sure you want to Check Out this unit?</p>
        )}
        <div slot="footer" class="ir-dialog__footer">
          {/* {!this.isLoading && ( */}
          <Fragment>
            <ir-custom-button size="medium" data-dialog="close" appearance="filled" variant="neutral">
              {locales?.entries?.Lcz_Cancel ?? 'Cancel'}
            </ir-custom-button>
            {this.buttons.has('checkout') && (
              <ir-custom-button
                size="medium"
                // loading={this.isLoading}
                onClickHandler={e => this.checkoutRoom({ e, source: 'checkout' })}
                variant={'brand'}
                loading={this.isLoading === 'checkout'}
              >
                Checkout
              </ir-custom-button>
            )}
            {this.buttons.has('checkout_without_invoice') && (
              <ir-custom-button
                loading={this.isLoading === 'skipCheckout'}
                size="medium"
                // loading={this.isLoading}
                onClickHandler={e => this.checkoutRoom({ e, source: 'skipCheckout' })}
                variant={'brand'}
                appearance={this.buttons.has('invoice_checkout') ? 'outlined' : 'accent'}
              >
                Checkout without invoice
              </ir-custom-button>
            )}
            {this.buttons.has('invoice_checkout') && (
              <ir-custom-button
                size="medium"
                loading={this.isLoading === 'checkout&invoice'}
                onClickHandler={e => {
                  this.checkoutRoom({ e, source: 'checkout&invoice' });
                }}
                variant={'brand'}
                appearance={'accent'}
              >
                Checkout & invoice
              </ir-custom-button>
            )}
          </Fragment>
          {/* )} */}
        </div>
      </ir-dialog>
    );
  }
}

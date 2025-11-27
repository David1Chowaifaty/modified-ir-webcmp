import { Booking } from '@/models/booking.dto';
import { formatAmount } from '@/utils/utils';
import { Component, Event, EventEmitter, Host, Method, Prop, State, Watch, h } from '@stencil/core';

@Component({
  tag: 'ir-invoice',
  styleUrls: ['ir-invoice.css', '../../global/app.css'],
  scoped: true,
})
export class IrInvoice {
  /**
   * Whether the invoice drawer is open.
   *
   * This prop is mutable and reflected to the host element,
   * allowing parent components to control visibility via markup
   * or via the public `openDrawer()` / `closeDrawer()` methods.
   */
  @Prop({ mutable: true, reflect: true }) open: boolean;

  /**
   * The booking object for which the invoice is being generated.
   * Should contain room, guest, and pricing information.
   */
  @Prop() booking: Booking;

  /**
   * Determines what should happen after creating the invoice.
   * - `"create"`: create an invoice normally
   * - `"check_in-create"`: create an invoice as part of the check-in flow
   */
  @Prop() mode: 'create' | 'check_in-create' = 'create';

  /**
   * Specifies what the invoice is for.
   * - `"room"`: invoice for a specific room
   * - `"booking"`: invoice for the entire booking
   */
  @Prop() for: 'room' | 'booking' = 'booking';

  /**
   * The identifier of the room for which the invoice is being generated.
   * Used when invoicing at room level instead of booking level.
   */
  @Prop() roomIdentifier: string;

  /**
   * When `true`, automatically triggers `window.print()` after an invoice is created.
   * Useful for setups where the invoice should immediately be sent to a printer.
   */
  @Prop() autoPrint: boolean = false;

  @State() selectedRecipient: string;

  /**
   * Emitted when the invoice drawer is opened.
   *
   * Fired when `openDrawer()` is called and the component
   * transitions into the open state.
   */
  @Event() invoiceOpen: EventEmitter<void>;

  /**
   * Emitted when the invoice drawer is closed.
   *
   * Fired when `closeDrawer()` is called, including when the
   * underlying drawer emits `onDrawerHide`.
   */
  @Event() invoiceClose: EventEmitter<void>;

  /**
   * Emitted when an invoice is created/confirmed.
   *
   * The event `detail` contains:
   * - `booking`: the booking associated with the invoice
   * - `recipientId`: the selected billing recipient
   * - `for`: whether the invoice is for `"room"` or `"booking"`
   * - `roomIdentifier`: the room identifier when invoicing a specific room
   * - `mode`: the current invoice mode
   */
  @Event() invoiceCreated: EventEmitter<{
    booking: Booking;
    recipientId: string;
    for: 'room' | 'booking';
    roomIdentifier?: string;
    mode: 'create' | 'check_in-create';
  }>;
  invoiceFormRef: HTMLFormElement;

  componentWillLoad() {
    if (this.booking) {
      this.selectedRecipient = this.booking.guest.id.toString();
    }
  }

  @Watch('booking')
  handleBookingChange() {
    if (this.booking) {
      this.selectedRecipient = this.booking.guest.id.toString();
    }
  }

  /**
   * Opens the invoice drawer.
   *
   * This method sets the `open` property to `true`, making the drawer visible.
   * It can be called programmatically by parent components.
   *
   * Also emits the `invoiceOpen` event.
   *
   * @returns {Promise<void>} Resolves once the drawer state is updated.
   */
  @Method()
  async openDrawer(): Promise<void> {
    this.open = true;
    this.invoiceOpen.emit();
  }

  /**
   * Closes the invoice drawer.
   *
   * This method sets the `open` property to `false`, hiding the drawer.
   * Parent components can call this to close the drawer programmatically,
   * and it is also used internally when the drawer emits `onDrawerHide`.
   *
   * Also emits the `invoiceClose` event.
   *
   * @returns {Promise<void>} Resolves once the drawer state is updated.
   */
  @Method()
  async closeDrawer(): Promise<void> {
    this.open = false;
    this.invoiceFormRef.reset();
    this.selectedRecipient = this.booking?.guest?.id?.toString();
    this.invoiceClose.emit();
  }

  /**
   * Handles confirming/creating the invoice.
   *
   * Emits the `invoiceCreated` event with invoice context, and if
   * `autoPrint` is `true`, triggers `window.print()` afterwards.
   */
  private handleConfirmInvoice(isProforma: boolean = false) {
    if (!isProforma)
      this.invoiceCreated.emit({
        booking: this.booking,
        recipientId: this.selectedRecipient,
        for: this.for,
        roomIdentifier: this.roomIdentifier,
        mode: this.mode,
      });

    if (this.autoPrint) {
      try {
        // window.print();
      } catch (error) {
        // Fail silently but log for debugging
        console.error('Auto print failed:', error);
      }
    }
  }

  render() {
    return (
      <Host>
        <ir-drawer
          label="Invoice"
          open={this.open}
          onDrawerHide={e => {
            e.stopImmediatePropagation();
            e.stopPropagation();
            this.closeDrawer();
          }}
        >
          <form ref={el => (this.invoiceFormRef = el)} class="ir-invoice__container">
            <ir-custom-date-picker></ir-custom-date-picker>
            <ir-booking-billing-recipient onRecipientChange={e => (this.selectedRecipient = e.detail)} booking={this.booking}></ir-booking-billing-recipient>
            <div class={'ir-invoice__services'}>
              <p class="ir-invoice__form-control-label">Choose what to invoice</p>
              <div class="ir-invoice__services-container">
                {this.booking?.rooms?.map(r => {
                  return (
                    <div class="ir-invoice__service" key={r.identifier}>
                      <wa-checkbox class="ir-invoice__checkbox" checked>
                        <div class={'ir-invoice__room-checkbox-container'}>
                          <b>{r.roomtype.name}</b>
                          <span>{r.rateplan.short_name}</span>
                          <span class="ir-invoice__checkbox-price">{formatAmount('$US', r.gross_total)}</span>
                        </div>
                      </wa-checkbox>
                    </div>
                  );
                })}
                {this.booking.pickup_info && (
                  <div class="ir-invoice__service">
                    <wa-checkbox class="ir-invoice__checkbox">
                      <div>Pickup</div>
                    </wa-checkbox>
                  </div>
                )}
                {this.booking.extra_services?.map(extra_service => (
                  <div key={extra_service.system_id} class="ir-invoice__service">
                    <wa-checkbox class="ir-invoice__checkbox">
                      <div></div>
                    </wa-checkbox>
                  </div>
                ))}
              </div>
            </div>
          </form>
          <div slot="footer" class="ir__drawer-footer">
            <ir-custom-button
              size="medium"
              appearance="filled"
              variant="neutral"
              onClickHandler={() => {
                this.closeDrawer();
              }}
            >
              Cancel
            </ir-custom-button>
            <ir-custom-button
              onClickHandler={() => {
                this.handleConfirmInvoice(true);
              }}
              size="medium"
              appearance="outlined"
              variant="brand"
            >
              Pro-forma Invoice
            </ir-custom-button>
            <ir-custom-button
              onClickHandler={() => {
                this.handleConfirmInvoice();
              }}
              size="medium"
              variant="brand"
            >
              Confirm Invoice
            </ir-custom-button>
          </div>
        </ir-drawer>
      </Host>
    );
  }
}

import { Booking } from '@/models/booking.dto';
import { Component, Event, EventEmitter, Host, Method, Prop, State, h } from '@stencil/core';
import { v4 } from 'uuid';
import { BookingInvoiceInfo, ViewMode } from './types';
import { IssueInvoiceProps } from '@/components';

@Component({
  tag: 'ir-invoice',
  styleUrls: ['ir-invoice.css'],
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
  /**
   * Additional invoice-related metadata used when creating
   * or rendering the invoice.
   *
   * This object can include payment details, discounts,
   * tax information, or any context needed by the invoice form.
   *
   * @type {BookingInvoiceInfo}
   */
  @Prop() invoiceInfo: BookingInvoiceInfo;

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
  @State() invoice: IssueInvoiceProps['invoice'] = null;

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
    this.invoiceClose.emit();
  }

  @State() viewMode: ViewMode = 'invoice';
  @State() isLoading: boolean;
  private _id = `invoice-form__${v4()}`;

  render() {
    return (
      <Host>
        <ir-drawer
          style={{
            '--ir-drawer-width': '40rem',
            '--ir-drawer-background-color': 'var(--wa-color-surface-default)',
            '--ir-drawer-padding-left': 'var(--spacing)',
            '--ir-drawer-padding-right': 'var(--spacing)',
            '--ir-drawer-padding-top': 'var(--spacing)',
            '--ir-drawer-padding-bottom': 'var(--spacing)',
          }}
          label="Issue Invoice"
          open={this.open}
          onDrawerHide={e => {
            e.stopImmediatePropagation();
            e.stopPropagation();
            this.closeDrawer();
          }}
        >
          <div class="d-flex align-items-center" slot="header-actions">
            <wa-switch
              onchange={e => {
                if ((e.target as any).checked) {
                  this.viewMode = 'proforma';
                } else {
                  this.viewMode = 'invoice';
                }
              }}
            >
              Pro-forma
            </wa-switch>
          </div>

          {this.open && (
            <ir-invoice-form
              viewMode={this.viewMode}
              for={this.for}
              roomIdentifier={this.roomIdentifier}
              booking={this.booking}
              autoPrint={this.autoPrint}
              formId={this._id}
              onPreviewProformaInvoice={e => (this.invoice = e.detail.invoice)}
              invoiceInfo={this.invoiceInfo}
              onLoadingChange={e => (this.isLoading = e.detail)}
            ></ir-invoice-form>
          )}
          <div slot="footer" class="ir__drawer-footer">
            <ir-custom-button
              size="medium"
              appearance="filled"
              class="w-100 flex-fill"
              variant="neutral"
              onClickHandler={() => {
                this.closeDrawer();
              }}
            >
              Cancel
            </ir-custom-button>
            {/* <ir-custom-button value="pro-forma" type="submit" size="medium" class="w-100 flex-fill" appearance="outlined" variant="neutral" form={this._id}>
              Pro-forma invoice
            </ir-custom-button> */}
            <ir-custom-button loading={this.isLoading} value="invoice" type="submit" form={this._id} class="w-100 flex-fill" size="medium" variant="brand">
              Confirm
            </ir-custom-button>
          </div>
          <ir-preview-screen-dialog open={this.invoice !== null}>
            <ir-proforma-invoice-preview invoice={this.invoice} booking={this.booking}></ir-proforma-invoice-preview>
          </ir-preview-screen-dialog>
        </ir-drawer>
      </Host>
    );
  }
}

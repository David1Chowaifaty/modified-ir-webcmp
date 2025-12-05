import { Component, Event, EventEmitter, Method, Prop, State, h } from '@stencil/core';
import moment from 'moment';
import { FolioEntryMode, Payment, PaymentEntries } from '../../types';
import { v4 } from 'uuid';

const DATE_FORMAT = 'YYYY-MM-DD';

@Component({
  tag: 'ir-payment-folio',
  styleUrls: ['ir-payment-folio.css'],
  scoped: true,
})
export class IrPaymentFolio {
  /**
   * The list of existing payment or folio entries associated with the booking.
   * Used by the folio form to determine validation rules, available actions,
   * and how the new or edited entry should be inserted or updated.
   */
  @Prop() paymentEntries: PaymentEntries;

  /**
   * The booking reference number associated with this folio operation.
   * Passed down to the folio form so the payment entry is linked to the
   * correct reservation when saving.
   */
  @Prop() bookingNumber: string;

  /**
   * The payment or folio entry being created or edited.
   * Defaults to a new empty payment object when the component
   * is used for creating a new entry.
   */
  @Prop() payment: Payment = {
    date: moment().format(DATE_FORMAT),
    amount: 0,
    designation: undefined,
    currency: null,
    reference: null,
    id: -1,
  };

  /**
   * Determines how the folio entry should behave or be displayed.
   * Typical modes include creating a new entry, editing an existing one,
   * or other folio-specific workflows.
   */
  @Prop() mode: FolioEntryMode;

  @State() isLoading: 'save' | 'save-print' = null;
  @State() isOpen: boolean;

  /**
   * Emitted when the folio drawer should be closed.
   * Fired whenever the user cancels, the form requests closing,
   * or the drawer itself is hidden. Consumers listen for this event
   * to know when the folio UI has been dismissed.
   */
  @Event() closeModal: EventEmitter<null>;

  /**
   * Opens the folio drawer.
   * This method can be called externally on the component instance
   * to programmatically display the folio form.
   */
  @Method()
  async openFolio() {
    this.isOpen = true;
  }

  /**
   * Closes the folio drawer and emits the `closeModal` event.
   * Used internally when the user cancels or the form indicates
   * that it has completed its action.
   */
  @Method()
  async closeFolio() {
    this.isOpen = false;
    this.closeModal.emit(null);
  }

  private _id = `ir__folio-form-${v4()}`;

  render() {
    // const isNewPayment = this.folioData?.payment_type?.code === '001' && this.folioData.id === -1;
    return (
      <ir-drawer
        placement="start"
        style={{
          '--ir-drawer-width': '40rem',
          '--ir-drawer-background-color': 'var(--wa-color-surface-default)',
          '--ir-drawer-padding-left': 'var(--spacing)',
          '--ir-drawer-padding-right': 'var(--spacing)',
          '--ir-drawer-padding-top': 'var(--spacing)',
          '--ir-drawer-padding-bottom': 'var(--spacing)',
        }}
        label={this.payment?.id !== -1 ? 'Edit Folio Entry' : 'New Folio Entry'}
        open={this.isOpen}
        onDrawerHide={event => {
          event.stopImmediatePropagation();
          event.stopPropagation();
          this.closeFolio();
        }}
      >
        {this.isOpen && (
          <ir-payment-folio-form
            formId={this._id}
            onLoadingChanged={e => (this.isLoading = e.detail)}
            onCloseModal={e => {
              e.stopImmediatePropagation();
              e.stopPropagation();
              this.closeFolio();
            }}
            paymentEntries={this.paymentEntries}
            bookingNumber={this.bookingNumber}
            payment={this.payment}
            mode={this.mode}
          ></ir-payment-folio-form>
        )}
        <div slot="footer" class="w-100 d-flex align-items-center" style={{ gap: 'var(--wa-space-xs)' }}>
          <ir-custom-button class="flex-fill" size="medium" data-drawer="close" appearance="filled" variant="neutral" onClickHandler={() => this.closeFolio()}>
            Cancel
          </ir-custom-button>
          <ir-custom-button
            form={this._id}
            loading={this.isLoading === 'save'}
            class="flex-fill"
            size="medium"
            type="submit"
            value="save"
            // appearance={isNewPayment ? 'outlined' : 'accent'}
            appearance={'accent'}
            variant="brand"
          >
            Save
          </ir-custom-button>
          {/* {isNewPayment && ( 
          <ir-custom-button
            value="saveAndPrint"
            type="submit"
            form={this._id}
            // onClickHandler={() => this.savePayment(true)}
            loading={this.isLoading === 'save-print'}
            class="flex-fill"
            size="medium"
            appearance="accent"
            variant="brand"
          >
            Save & Print
          </ir-custom-button>
           )} */}
        </div>
      </ir-drawer>
    );
  }
}

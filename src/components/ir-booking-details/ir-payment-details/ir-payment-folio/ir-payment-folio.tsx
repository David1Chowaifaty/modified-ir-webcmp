import { Component, Event, EventEmitter, Method, Prop, State, h } from '@stencil/core';
import moment from 'moment';
import { FolioEntryMode, Payment, PaymentEntries } from '../../types';

const DATE_FORMAT = 'YYYY-MM-DD';

@Component({
  tag: 'ir-payment-folio',
  styleUrls: ['ir-payment-folio.css'],
  scoped: true,
})
export class IrPaymentFolio {
  @Prop() paymentEntries: PaymentEntries;
  @Prop() bookingNumber: string;
  @Prop() payment: Payment = {
    date: moment().format(DATE_FORMAT),
    amount: 0,
    designation: undefined,
    currency: null,
    reference: null,
    id: -1,
  };

  @Prop() mode: FolioEntryMode;

  @State() isLoading: 'save' | 'save-print' = null;
  @State() isOpen: boolean;

  @Event() closeModal: EventEmitter<null>;

  @Method()
  async openFolio() {
    this.isOpen = true;
  }
  @Method()
  async closeFolio() {
    this.isOpen = false;
    this.closeModal.emit(null);
  }

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
            form={`ir__folio-form-${this.bookingNumber}`}
            loading={this.isLoading === 'save'}
            class="flex-fill"
            size="medium"
            type="submit"
            // appearance={isNewPayment ? 'filled' : 'accent'}
            appearance={'accent'}
            variant="brand"
          >
            Save
          </ir-custom-button>
          {/* {isNewPayment && (
            <ir-custom-button
              onClickHandler={() => this.savePayment(true)}
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

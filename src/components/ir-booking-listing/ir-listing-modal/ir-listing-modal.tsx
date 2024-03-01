import booking_listing from '@/stores/booking_listing.store';
import { Component, EventEmitter, Listen, Method, Prop, State, h, Event } from '@stencil/core';
import { Booking } from '@/models/booking.dto';
import locales from '@/stores/locales.store';
import { BookingListingService } from '@/services/booking_listing.service';
import { PaymentService } from '@/services/payment.service';
import moment from 'moment';

@Component({
  tag: 'ir-listing-modal',
  styleUrl: 'ir-listing-modal.css',
  scoped: true,
})
export class IrListingModal {
  @Prop() modalTitle: string = 'Modal Title';
  @Prop() editBooking: { booking: Booking; cause: 'edit' | 'payment' | 'delete' };

  @State() isOpen: boolean = false;
  @State() deletionStage = 1;
  @State() selectedDesignation: string;
  @State() loadingBtn: 'confirm' | 'just_delete' | 'recover_and_delete' | null = null;

  private bookingListingsService = new BookingListingService();
  private paymentService = new PaymentService();

  componentWillLoad() {
    this.bookingListingsService.setToken(booking_listing.token);
    this.paymentService.setToken(booking_listing.token);
    this.selectedDesignation = booking_listing.settlement_methods[0].name;
  }

  @Event() modalClosed: EventEmitter<null>;
  @Event() resetData: EventEmitter<string>;
  @Method()
  async closeModal() {
    this.isOpen = false;
    this.deletionStage = 1;
    this.selectedDesignation = booking_listing.settlement_methods[0].name;
    this.modalClosed.emit(null);
  }
  @Method()
  async openModal() {
    this.isOpen = true;
  }
  filterBookings() {
    booking_listing.bookings = booking_listing.bookings.filter(booking => booking.booking_nbr !== this.editBooking.booking.booking_nbr);
  }

  @Listen('clickHanlder')
  async btnClickHandler(event: CustomEvent) {
    let target = event.target as HTMLInputElement;
    let name = target.name;
    try {
      if (name === 'confirm') {
        if (this.editBooking.cause === 'payment') {
          await this.paymentService.AddPayment(
            {
              amount: this.editBooking.booking.financial.due_amount,
              currency: this.editBooking.booking.currency,
              date: moment().format('YYYY-MM-DD'),
              designation: this.selectedDesignation,
              id: -1,
              reference: '',
            },
            this.editBooking.booking.booking_nbr,
          );
          this.resetData.emit(this.editBooking.booking.booking_nbr);
          this.closeModal();
        } else {
          if (this.deletionStage === 2) {
            this.loadingBtn = 'recover_and_delete';
            await this.bookingListingsService.removeExposedBooking(this.editBooking.booking.booking_nbr, true);
            this.filterBookings();
          }
          if (this.deletionStage === 1) {
            this.deletionStage = 2;
          }
        }
      }
      if (name === 'cancel') {
        if (this.deletionStage === 2) {
          this.loadingBtn = 'just_delete';
          await this.bookingListingsService.removeExposedBooking(this.editBooking.booking.booking_nbr, false);
          this.filterBookings();
        } else {
          this.closeModal();
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (this.loadingBtn) {
        this.loadingBtn = null;
        this.closeModal();
      }
    }
  }

  renderTitle() {
    if (this.editBooking.cause === 'payment') {
      return locales.entries?.Lcz_MarkBookingAsPaid.replace('%1', this.editBooking.booking.booking_nbr);
    } else {
      if (this.deletionStage === 1) {
        return locales.entries.Lcz_SureYouWantToDeleteBookingNbr + this.editBooking?.booking.booking_nbr;
      }
      return locales.entries.Lcz_WantToRecoverAllotment;
    }
  }
  renderConfirmationTitle() {
    if (this.editBooking.cause === 'payment') {
      return locales.entries.Lcz_Confirm;
    } else {
      if (this.deletionStage === 1) {
        return locales.entries.Lcz_OK;
      }
      return locales.entries.Lcz_RecoverAndDelete;
    }
  }
  renderCancelationTitle() {
    if (this.deletionStage === 2) {
      return locales.entries.Lcz_JustDelete;
    }
    return locales.entries.Lcz_Cancel;
  }
  render() {
    if (!this.editBooking) {
      return null;
    }
    return [
      <div
        class={`backdropModal ${this.isOpen ? 'active' : ''}`}
        onClick={() => {
          if (this.editBooking.cause === 'delete') {
            return;
          }
          this.closeModal();
        }}
      ></div>,
      <div data-state={this.isOpen ? 'opened' : 'closed'} class={`ir-modal`} tabindex="-1">
        {this.isOpen && (
          <div class={`ir-alert-content p-2`}>
            <div class={`ir-alert-header align-items-center border-0 py-0 m-0 `}>
              <p class="font-weight-bold p-0 my-0 mb-1">{this.renderTitle()}</p>
              <ir-icon
                class="exit-icon"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  this.closeModal();
                }}
              >
                <svg slot="icon" xmlns="http://www.w3.org/2000/svg" height="14" width="10.5" viewBox="0 0 384 512">
                  <path
                    fill="currentColor"
                    d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
                  />
                </svg>
              </ir-icon>
            </div>
            <div class="modal-body text-left p-0 mb-2">
              {this.editBooking.cause === 'payment' ? (
                <ir-select
                  selectedValue={this.selectedDesignation}
                  onSelectChange={e => (this.selectedDesignation = e.detail)}
                  showFirstOption={false}
                  LabelAvailable={false}
                  data={booking_listing.settlement_methods.map(m => ({
                    value: m.name,
                    text: m.name,
                  }))}
                ></ir-select>
              ) : null}
            </div>

            <div class={`ir-alert-footer border-0 d-flex justify-content-end`}>
              <ir-button isLoading={this.loadingBtn === 'just_delete'} icon={''} btn_color={'secondary'} btn_block text={this.renderCancelationTitle()} name={'cancel'}></ir-button>
              <ir-button
                isLoading={this.loadingBtn === 'recover_and_delete'}
                icon={''}
                btn_color={'primary'}
                btn_block
                text={this.renderConfirmationTitle()}
                name={'confirm'}
              ></ir-button>
            </div>
          </div>
        )}
      </div>,
    ];
  }
}

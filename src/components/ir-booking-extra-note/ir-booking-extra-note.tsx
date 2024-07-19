import locales from '@/stores/locales.store';
import { Component, Event, EventEmitter, Host, Prop, State, h } from '@stencil/core';
import { Booking } from '@/models/booking.dto';
import { BookingService } from '@/services/booking.service';
import calendar_data from '@/stores/calendar-data';
@Component({
  tag: 'ir-booking-extra-note',
  styleUrl: 'ir-booking-extra-note.css',
  scoped: true,
})
export class IrBookingExtraNote {
  @Prop() private_note: string;
  @Prop() booking: Booking;

  @State() isLoading = false;
  @State() note = '';

  @Event() closeModal: EventEmitter<null>;

  private bookingService = new BookingService();
  componentWillLoad() {
    this.bookingService.setToken(calendar_data.token);
    if (this.private_note) {
      this.setNote(this.private_note);
    }
  }

  private setNote(value: string) {
    this.note = value;
  }
  private async savePrivateNote() {
    try {
      this.isLoading = true;
      await this.bookingService.doReservation({
        ...this.booking,
        Is_Non_Technical_Change: false,
        extras: [{}],
      });
    } catch (error) {
      console.log(error);
    } finally {
      this.isLoading = false;
    }
  }
  render() {
    return (
      <Host class={'px-0'}>
        <ir-title class="px-1" onCloseSideBar={() => this.closeModal.emit(null)} label={'Private note'} displayContext="sidebar"></ir-title>
        <form
          class={'px-1'}
          onSubmit={e => {
            e.preventDefault();
            this.savePrivateNote();
          }}
        >
          <ir-textarea placeholder="" label="" value={this.note} maxLength={150} onTextChange={e => this.setNote(e.detail)}></ir-textarea>
          <div class={'d-flex flex-column flex-sm-row mt-3'}>
            <ir-button
              onClickHanlder={() => this.closeModal.emit(null)}
              btn_styles="justify-content-center"
              class={`mb-1 mb-sm-0 flex-fill  mr-sm-1'}`}
              icon=""
              text={locales.entries.Lcz_Cancel}
              btn_color="secondary"
            ></ir-button>

            <ir-button
              btn_styles="justify-content-center align-items-center"
              class={'m-0 flex-fill text-center ml-sm-1'}
              icon=""
              isLoading={this.isLoading}
              text={locales.entries.Lcz_Save}
              btn_color="primary"
              btn_type="submit"
            ></ir-button>
          </div>
        </form>
      </Host>
    );
  }
}

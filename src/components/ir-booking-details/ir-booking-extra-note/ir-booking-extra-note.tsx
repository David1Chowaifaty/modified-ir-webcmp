import locales from '@/stores/locales.store';
import { Component, Event, EventEmitter, Method, Prop, State, h } from '@stencil/core';
import { Booking } from '@/models/booking.dto';
import { BookingService } from '@/services/booking.service';
import { getPrivateNote } from '@/utils/booking';
@Component({
  tag: 'ir-booking-extra-note',
  styleUrls: ['ir-booking-extra-note.css'],
  scoped: true,
})
export class IrBookingExtraNote {
  @Prop({ mutable: true, reflect: true }) open: boolean;
  @Prop() booking: Booking;

  @State() isLoading = false;
  @State() note = '';

  @Event() closeModal: EventEmitter<null>;
  @Event() resetBookingEvt: EventEmitter<Booking | null>;

  private bookingService = new BookingService();
  componentWillLoad() {
    if (this.booking.extras) {
      this.setNote(getPrivateNote(this.booking.extras));
    }
  }

  private setNote(value: string) {
    this.note = value;
  }
  private async savePrivateNote() {
    try {
      this.isLoading = true;
      let prevExtras = this.booking.extras || [];
      const newExtraObj = { key: 'private_note', value: this.note };
      if (prevExtras.length === 0) {
        prevExtras.push(newExtraObj);
      } else {
        const oldPrivateNoteIndex = prevExtras.findIndex(e => e.key === 'private_note');
        if (oldPrivateNoteIndex === -1) {
          prevExtras.push(newExtraObj);
        } else {
          prevExtras[oldPrivateNoteIndex] = newExtraObj;
        }
      }
      const res = await this.bookingService.doReservation({
        assign_units: true,
        is_pms: true,
        is_direct: true,
        is_in_loyalty_mode: false,
        promo_key: null,
        booking: this.booking,
        Is_Non_Technical_Change: true,
        extras: prevExtras,
      });
      this.resetBookingEvt.emit(res);
      this.closeDialog();
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }
  @Method()
  async openDialog() {
    this.open = true;
  }
  @Method()
  async closeDialog() {
    this.open = false;
  }
  render() {
    return (
      <ir-dialog
        label="Private note"
        open={this.open}
        onIrDialogHide={() => {
          this.open = false;
        }}
      >
        <wa-textarea
          placeholder={locales.entries.Lcz_PrivateNote_MaxChar}
          defaultValue={this.note}
          onchange={e => this.setNote((e.target as any).value)}
          value={this.note}
        ></wa-textarea>
        <div slot="footer" class="ir-dialog__footer">
          <ir-custom-button
            data-dialog="close"
            size="medium"
            variant="neutral"
            appearance="filled"
            onClickHandler={() => this.closeModal.emit(null)}
            class={`mb-1 mb-sm-0 flex-fill  mr-sm-1'}`}
          >
            {locales.entries.Lcz_Cancel}
          </ir-custom-button>

          <ir-custom-button size="medium" onClickHandler={() => this.savePrivateNote()} variant="brand" loading={this.isLoading}>
            {locales.entries.Lcz_Save}
          </ir-custom-button>
        </div>
      </ir-dialog>
    );
  }
}

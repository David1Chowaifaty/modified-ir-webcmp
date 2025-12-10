import { Component, Event, EventEmitter, h, Method, Prop, State } from '@stencil/core';
import { Booking } from '@/models/booking.dto';
import { v4 } from 'uuid';
import { isRequestPending } from '@/stores/ir-interceptor.store';
@Component({
  tag: 'ir-booking-company-dialog',
  styleUrl: 'ir-booking-company-dialog.css',
  scoped: true,
})
export class IrBookingCompanyDialog {
  @Prop() booking: Booking;

  @State() open: boolean;

  @Event() companyFormClosed: EventEmitter<void>;
  @Event({ composed: true, bubbles: true }) resetBookingEvt: EventEmitter<Booking>;

  @Method()
  async openCompanyForm() {
    this.open = true;
  }

  render() {
    const formId = `${this.booking.booking_nbr}-${v4()}`;
    return (
      <ir-dialog
        open={this.open}
        onIrDialogHide={e => {
          e.stopPropagation();
          e.stopImmediatePropagation();
          this.open = false;
          this.companyFormClosed.emit();
        }}
        label="Company"
        id="dialog-overview"
      >
        {this.open && (
          <ir-booking-company-form
            onResetBookingEvt={e => {
              e.stopImmediatePropagation();
              e.stopPropagation();
              this.resetBookingEvt.emit(e.detail);
            }}
            formId={formId}
            booking={this.booking}
          ></ir-booking-company-form>
        )}
        <div slot="footer" class="ir-dialog__footer">
          <ir-custom-button size="medium" appearance="filled" variant="neutral" data-dialog="close">
            Cancel
          </ir-custom-button>
          <ir-custom-button type="submit" form={formId} loading={isRequestPending('/Do_Reservation')} size="medium" variant="brand">
            Save
          </ir-custom-button>
        </div>
      </ir-dialog>
    );
  }
}

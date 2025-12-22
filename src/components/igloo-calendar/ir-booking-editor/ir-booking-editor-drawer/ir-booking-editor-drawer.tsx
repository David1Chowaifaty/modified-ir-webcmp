import { Component, Fragment, h, Prop, State, Watch } from '@stencil/core';
import { BookingEditorMode, BookingStep } from '../types';
import { Booking } from '@/models/booking.dto';
import Token from '@/models/Token';
import booking_store, { hasAtLeastOneRoomSelected } from '@/stores/booking.store';
import moment from 'moment';

@Component({
  tag: 'ir-booking-editor-drawer',
  styleUrl: 'ir-booking-editor-drawer.css',
  scoped: true,
})
export class IrBookingEditorDrawer {
  @Prop({ reflect: true }) open: boolean;
  @Prop() ticket: string;
  @Prop() propertyid: string;
  @Prop() language: string = 'en';
  @Prop() booking: Booking;
  @Prop() mode: BookingEditorMode = 'PLUS_BOOKING';
  @Prop() checkIn: string;
  @Prop() checkOut: string;

  @State() step: BookingStep = 'details';

  private token = new Token();

  componentWillLoad() {
    if (this.token) {
      this.token.setToken(this.ticket);
    }
  }

  @Watch('ticket')
  handleTicketChange() {
    if (this.token) {
      this.token.setToken(this.ticket);
    }
  }

  private get label() {
    switch (this.mode) {
      case 'SPLIT_BOOKING':
      case 'BAR_BOOKING':
      case 'ADD_ROOM':
      case 'EDIT_BOOKING':
      case 'PLUS_BOOKING':
        return 'New Booking';
    }
  }

  private goToConfirm = (e?: CustomEvent) => {
    e?.stopPropagation();
    this.step = 'confirm';
  };

  private goToDetails = () => {
    this.step = 'details';
  };

  private renderFooter() {
    switch (this.step) {
      case 'details':
        return this.renderDetailsActions();
      case 'confirm':
        return this.renderConfirmActions();
      default:
        return null;
    }
  }

  private renderConfirmActions() {
    const { checkIn } = booking_store?.bookingDraft?.dates;
    const hasCheckIn = checkIn ? checkIn?.isSame(moment(), 'date') : false;
    return (
      <Fragment>
        <ir-custom-button onClickHandler={this.goToDetails} size="medium" appearance="filled" variant="neutral">
          Back
        </ir-custom-button>

        <ir-custom-button value="book" form="new_booking_form" disabled={false} type="submit" size="medium" appearance={hasCheckIn ? 'outlined' : 'accent'} variant="brand">
          Book
        </ir-custom-button>
        {hasCheckIn && (
          <ir-custom-button value="book-checkin" form="new_booking_form" type="submit" size="medium" appearance="accent" variant="brand">
            Book and check-in
          </ir-custom-button>
        )}
      </Fragment>
    );
  }

  private renderDetailsActions() {
    const haveRoomSelected = hasAtLeastOneRoomSelected();
    return (
      <Fragment>
        <ir-custom-button data-drawer="close" size="medium" appearance="filled" variant="neutral">
          Cancel
        </ir-custom-button>
        {!haveRoomSelected && <wa-tooltip for="booking_editor__next-button">Please select at least one unit to continue.</wa-tooltip>}
        <ir-custom-button id="booking_editor__next-button" disabled={!haveRoomSelected} onClickHandler={this.goToConfirm} size="medium" appearance="accent" variant="brand">
          Next
        </ir-custom-button>
      </Fragment>
    );
  }
  render() {
    return (
      <ir-drawer
        lightDismiss={false}
        style={{
          '--ir-drawer-width': '70rem',
        }}
        class="booking-editor__drawer"
        label={this.label}
        open={this.open}
      >
        {this.open && this.ticket && (
          <ir-booking-editor
            propertyId={this.propertyid}
            step={this.step}
            language={this.language}
            booking={this.booking}
            mode={this.mode}
            checkIn={this.checkIn}
            checkOut={this.checkOut}
          ></ir-booking-editor>
        )}
        <div slot="footer" class="ir__drawer-footer">
          {this.renderFooter()}
        </div>
      </ir-drawer>
    );
  }
}

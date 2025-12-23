import { Component, Event, EventEmitter, Fragment, h, Listen, Prop, State, Watch } from '@stencil/core';
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
  @Prop() label: string;
  @Prop() checkIn: string;
  @Prop() checkOut: string;
  @Prop() unitId: string;
  @Prop() blockedUnit;
  @Prop() roomTypeIds: (string | number)[] = [];
  @Prop() roomIdentifier: string;

  @State() step: BookingStep = 'details';
  @State() isLoading: string;

  @Event() bookingEditorClosed: EventEmitter<void>;

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

  @Listen('bookingStepChange')
  handleBookingStepChange(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const { direction } = e.detail;
    switch (direction) {
      case 'next':
        this.step = 'confirm';
        break;
      case 'prev':
        this.step = 'details';
        break;
      default:
        console.warn('Direction not supported');
    }
  }

  private get drawerLabel() {
    if (this.label) {
      return this.label;
    }
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
        <ir-custom-button
          loading={this.isLoading === 'book'}
          value="book"
          form="new_booking_form"
          disabled={false}
          type="submit"
          size="medium"
          appearance={hasCheckIn ? 'outlined' : 'accent'}
          variant="brand"
        >
          Book
        </ir-custom-button>
        {hasCheckIn && (
          <ir-custom-button
            loading={this.isLoading === 'book-checkin'}
            value="book-checkin"
            form="new_booking_form"
            type="submit"
            size="medium"
            appearance="accent"
            variant="brand"
          >
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
        {['EDIT_BOOKING', 'PLUS_BOOKING', 'ADD_ROOM'].includes(this.mode) && (
          <Fragment>
            {!haveRoomSelected && <wa-tooltip for="booking_editor__next-button">Please select at least one unit to continue.</wa-tooltip>}
            <ir-custom-button id="booking_editor__next-button" disabled={!haveRoomSelected} onClickHandler={this.goToConfirm} size="medium" appearance="accent" variant="brand">
              Next
            </ir-custom-button>
          </Fragment>
        )}
      </Fragment>
    );
  }
  private closeDrawer() {
    this.bookingEditorClosed.emit();
    this.step = 'details';
  }
  render() {
    return (
      <ir-drawer
        onDrawerHide={event => {
          event.stopImmediatePropagation();
          event.stopPropagation();
          this.closeDrawer();
        }}
        style={{
          '--ir-drawer-width': '70rem',
        }}
        class="booking-editor__drawer"
        label={this.drawerLabel}
        open={this.open}
      >
        {this.open && this.ticket && (
          <ir-booking-editor
            onLoadingChanged={e => {
              e.stopImmediatePropagation();
              e.stopPropagation();
              this.isLoading = e.detail.cause;
            }}
            unitId={this.unitId}
            propertyId={this.propertyid}
            roomTypeIds={this.roomTypeIds}
            onResetBookingEvt={() => this.closeDrawer()}
            step={this.step}
            language={this.language}
            booking={this.booking}
            mode={this.mode}
            checkIn={this.checkIn}
            checkOut={this.checkOut}
            identifier={this.roomIdentifier}
          ></ir-booking-editor>
        )}
        <div slot="footer" class="ir__drawer-footer">
          {this.renderFooter()}
        </div>
      </ir-drawer>
    );
  }
}

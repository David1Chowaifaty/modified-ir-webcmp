import { Component, Event, EventEmitter, Fragment, h, Listen, Prop, State, Watch } from '@stencil/core';
import { BlockedDatePayload, BookingEditorMode, BookingStep } from '../types';
import { Booking } from '@/models/booking.dto';
import { IBlockUnit } from '@/models/IBooking';
import Token from '@/models/Token';
import booking_store, { hasAtLeastOneRoomSelected, resetReserved } from '@/stores/booking.store';
import calendar_data from '@/stores/calendar-data';
import moment from 'moment';
import { getReleaseHoursString } from '@/utils/utils';
import { BookingService } from '@/services/booking-service/booking.service';
import { IRBookingEditorService } from '../ir-booking-editor.service';

@Component({
  tag: 'ir-booking-editor-drawer',
  styleUrl: 'ir-booking-editor-drawer.css',
  scoped: true,
})
export class IrBookingEditorDrawer {
  /** Controls drawer visibility (reflected to DOM). */
  @Prop({ reflect: true }) open: boolean;

  /** Auth token used for API requests. */
  @Prop() ticket: string;

  /** Property identifier. */
  @Prop() propertyid: string;

  /** UI language code (default: `en`). */
  @Prop() language: string = 'en';

  /** Booking being created or edited. */
  @Prop() booking: Booking;

  /** Current booking editor mode. */
  @Prop() mode: BookingEditorMode = 'PLUS_BOOKING';

  /** Optional drawer title override. */
  @Prop() label: string;

  /** Check-in date (ISO string). */
  @Prop() checkIn: string;

  /** Check-out date (ISO string). */
  @Prop() checkOut: string;

  /** Selected unit identifier. */
  @Prop() unitId: string;

  /** Payload for blocked unit dates. */
  @Prop({ mutable: true }) blockedUnit: BlockedDatePayload;

  /** Allowed room type identifiers. */
  @Prop() roomTypeIds: (string | number)[] = [];

  /** Room identifier used by the editor. */
  @Prop() roomIdentifier: string;

  @State() step: BookingStep = 'details';
  @State() isLoading: string;

  /** Emitted when the booking editor drawer is closed. */
  @Event() bookingEditorClosed: EventEmitter<void>;

  private token = new Token();

  private bookingService = new BookingService();
  private bookingEditorService = new IRBookingEditorService();

  private wasBlockedUnit = false;
  private didAdjustBlockedUnit = false;
  private originalBlockPayload?: IBlockUnit;

  componentWillLoad() {
    if (this.token) {
      this.token.setToken(this.ticket);
    }
    this.initializeBlockedUnitState(this.blockedUnit);
  }

  @Watch('ticket')
  handleTicketChange() {
    if (this.token) {
      this.token.setToken(this.ticket);
    }
  }

  @Watch('blockedUnit')
  handleBlockedUnitChange(newValue?: BlockedDatePayload) {
    this.initializeBlockedUnitState(newValue);
  }

  @Watch('checkIn')
  handleCheckInChange() {
    this.initializeBlockedUnitState(this.blockedUnit);
  }

  @Watch('checkOut')
  handleCheckOutChange() {
    this.initializeBlockedUnitState(this.blockedUnit);
  }

  @Watch('unitId')
  handleUnitChange() {
    this.initializeBlockedUnitState(this.blockedUnit);
  }

  private initializeBlockedUnitState(blockedUnit?: BlockedDatePayload) {
    const allowedStatusCodes = ['002', '003', '004'];
    if (!blockedUnit) {
      this.wasBlockedUnit = false;
      this.originalBlockPayload = undefined;
      return;
    }
    const hasBlockMetadata = Boolean(blockedUnit && allowedStatusCodes.includes(blockedUnit.STATUS_CODE));
    if (!hasBlockMetadata || !this.checkIn || !this.checkOut || !this.unitId) {
      this.wasBlockedUnit = false;
      this.originalBlockPayload = undefined;
      this.didAdjustBlockedUnit = false;
      return;
    }

    this.originalBlockPayload = {
      from_date: this.checkIn,
      to_date: this.checkOut,
      NOTES: blockedUnit.OPTIONAL_REASON || '',
      pr_id: this.unitId.toString(),
      STAY_STATUS_CODE: (blockedUnit.STATUS_CODE || (blockedUnit.OUT_OF_SERVICE ? '004' : Number(blockedUnit.RELEASE_AFTER_HOURS) === 0 ? '002' : '003')) as any,
      DESCRIPTION: blockedUnit.RELEASE_AFTER_HOURS || '',
      BLOCKED_TILL_DATE: blockedUnit.ENTRY_DATE || undefined,
      BLOCKED_TILL_HOUR: blockedUnit.ENTRY_HOUR !== undefined && blockedUnit.ENTRY_HOUR !== null ? blockedUnit.ENTRY_HOUR.toString() : undefined,
      BLOCKED_TILL_MINUTE: blockedUnit.ENTRY_MINUTE !== undefined && blockedUnit.ENTRY_MINUTE !== null ? blockedUnit.ENTRY_MINUTE.toString() : undefined,
    };
    this.wasBlockedUnit = true;
    this.didAdjustBlockedUnit = false;
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
    if (this.mode === 'BAR_BOOKING') {
      resetReserved();
    }
    if (this.mode === 'EDIT_BOOKING') {
      resetReserved();
      this.bookingEditorService.updateBooking(this.bookingEditorService.getRoom(this.booking, this.roomIdentifier));
    }
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
  private async closeDrawer() {
    if (this.wasBlockedUnit && !this.didAdjustBlockedUnit) {
      await this.checkAndBlockDate();
    } else if (this.blockedUnit && this.blockedUnit.STATUS_CODE) {
      await this.handleBlockDate();
    }
    this.bookingEditorClosed.emit();
    this.step = 'details';
  }

  private getBlockUnitPayload(): IBlockUnit | undefined {
    if (this.wasBlockedUnit && this.originalBlockPayload) {
      return this.originalBlockPayload;
    }
    if (!this.blockedUnit || !this.checkIn || !this.checkOut || !this.unitId) {
      return undefined;
    }
    const releaseData = getReleaseHoursString(this.blockedUnit.RELEASE_AFTER_HOURS !== null ? Number(this.blockedUnit.RELEASE_AFTER_HOURS) : null);
    return {
      from_date: this.checkIn,
      to_date: this.checkOut,
      NOTES: this.blockedUnit.OPTIONAL_REASON || '',
      pr_id: this.unitId.toString(),
      STAY_STATUS_CODE: this.blockedUnit.OUT_OF_SERVICE ? '004' : Number(this.blockedUnit.RELEASE_AFTER_HOURS) === 0 ? '002' : '003',
      DESCRIPTION: this.blockedUnit.RELEASE_AFTER_HOURS || '',
      ...releaseData,
    };
  }

  private async handleBlockDate(autoReset = true, overridePayload?: IBlockUnit) {
    try {
      const payload = overridePayload ?? this.getBlockUnitPayload();
      if (!payload) {
        return;
      }
      await this.bookingService.blockUnit(payload);
      if (autoReset) {
        this.blockedUnit = undefined;
        this.initializeBlockedUnitState(undefined);
      }
    } catch (error) {}
  }

  private async handleAdjustBlockedUnitEvent(event: CustomEvent<any>) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    try {
      await this.adjustBlockedDatesAfterReservation(event.detail);
      this.didAdjustBlockedUnit = true;
    } catch (error) {
      console.error('Error adjusting blocked unit:', error);
    }
  }

  private async adjustBlockedDatesAfterReservation(serviceParams: any) {
    if (!this.wasBlockedUnit || !this.originalBlockPayload) {
      return;
    }
    const original_from_date = moment(this.originalBlockPayload.from_date, 'YYYY-MM-DD');
    const current_from_date = moment(serviceParams.booking.from_date, 'YYYY-MM-DD');
    const original_to_date = moment(this.originalBlockPayload.to_date, 'YYYY-MM-DD');
    const current_to_date = moment(serviceParams.booking.to_date, 'YYYY-MM-DD');
    if (current_to_date.isBefore(original_to_date, 'days')) {
      const props = { ...this.originalBlockPayload, from_date: current_to_date.format('YYYY-MM-DD') };
      await this.bookingService.blockUnit(props);
    }
    if (current_from_date.isAfter(original_from_date, 'days')) {
      const props = { ...this.originalBlockPayload, to_date: current_from_date.format('YYYY-MM-DD') };
      await this.bookingService.blockUnit(props);
    }
    return;
  }

  private async checkAndBlockDate() {
    try {
      if (!this.originalBlockPayload || !this.roomTypeIds || this.roomTypeIds.length === 0) {
        return;
      }
      const roomTypeIds = this.roomTypeIds.map(id => Number(id)).filter(id => !Number.isNaN(id));
      if (roomTypeIds.length === 0) {
        return;
      }
      await this.bookingService.getBookingAvailability({
        from_date: this.originalBlockPayload.from_date,
        to_date: this.originalBlockPayload.to_date,
        propertyid: calendar_data.property.id,
        adultChildCount: {
          adult: 2,
          child: 0,
        },
        language: this.language,
        room_type_ids: roomTypeIds,
        currency: calendar_data.property?.currency,
      });
      const isAvailable = booking_store.roomTypes.every(rt => {
        if (rt.is_available_to_book) {
          return true;
        }
        return rt.inventory > 0 && rt['not_available_reason'] === 'ALL-RATES-PLAN-NOT-BOOKABLE';
      });
      if (isAvailable) {
        await this.handleBlockDate();
      } else {
        console.warn('Blocked date is unavailable. Continuing...');
      }
    } catch (error) {
      console.error('Error checking and blocking date:', error);
    }
  }
  render() {
    return (
      <ir-drawer
        onDrawerHide={async event => {
          event.stopImmediatePropagation();
          event.stopPropagation();
          await this.closeDrawer();
        }}
        style={{
          '--ir-drawer-width': '70rem',
          '--ir-drawer-background-color': 'var(--wa-color-surface-default)',
          '--ir-drawer-padding-left': 'var(--spacing)',
          '--ir-drawer-padding-right': 'var(--spacing)',
          '--ir-drawer-padding-top': 'var(--spacing)',
          '--ir-drawer-padding-bottom': 'var(--spacing)',
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
            onAdjustBlockedUnit={event => this.handleAdjustBlockedUnitEvent(event)}
            unitId={this.unitId}
            propertyId={this.propertyid}
            roomTypeIds={this.roomTypeIds}
            onResetBookingEvt={async () => {
              this.blockedUnit = undefined;
              this.initializeBlockedUnitState(undefined);
              await this.closeDrawer();
            }}
            step={this.step}
            blockedUnit={this.blockedUnit}
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

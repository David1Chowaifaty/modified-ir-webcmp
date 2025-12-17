import { Component, Host, Prop, h, Event, EventEmitter, State, Fragment } from '@stencil/core';
import { TAdultChildConstraints, TPropertyButtonsTypes } from '../../../../models/igl-book-property';

import moment from 'moment';
import locales from '@/stores/locales.store';
import { isRequestPending } from '@/stores/ir-interceptor.store';
import calendar_data from '@/stores/calendar-data';
import { IToast } from '@/components/ui/ir-toast/toast';
import booking_store, { setBookingDraft } from '@/stores/booking.store';

import { BookingService } from '@/services/booking-service/booking.service';
import { Booking } from '@/models/booking.dto';

@Component({
  tag: 'igl-book-property-header',
  styleUrl: 'igl-book-property-header.css',
  scoped: true,
})
export class IglBookPropertyHeader {
  @Prop() splitBookingId: any = '';
  @Prop() bookingData: any = '';
  @Prop() minDate: string;
  @Prop() message: string;
  @Prop() bookingDataDefaultDateRange: { [key: string]: any };
  @Prop() showSplitBookingOption: boolean = false;
  @Prop() adultChildConstraints: TAdultChildConstraints;
  @Prop() splitBookings: any[];
  @Prop() dateRangeData: any;
  @Prop() bookedByInfoData: any;
  @Prop() defaultDaterange: { from_date: string; to_date: string };
  @Prop() propertyId: number;
  @Prop() wasBlockedUnit: boolean;

  @State() isLoading: boolean;
  @State() bookings: Booking[] = [];

  @Event() splitBookingDropDownChange: EventEmitter<any>;
  @Event() checkClicked: EventEmitter<any>;
  @Event() buttonClicked: EventEmitter<{ key: TPropertyButtonsTypes }>;
  @Event() toast: EventEmitter<IToast>;
  @Event() spiltBookingSelected: EventEmitter<{ key: string; data: unknown }>;
  @Event({ bubbles: true, composed: true }) animateIrSelect: EventEmitter<string>;

  private bookingService = new BookingService();
  adultAnimationContainer: any;

  private async fetchExposedBookings(value: string) {
    this.isLoading = true;
    this.bookings = await this.bookingService.fetchExposedBookings(
      value,
      this.propertyId,
      moment(this.bookingDataDefaultDateRange.fromDate).format('YYYY-MM-DD'),
      moment(this.bookingDataDefaultDateRange.toDate).format('YYYY-MM-DD'),
    );
    this.isLoading = false;
  }

  private getSplitBookingList() {
    return (
      <ir-picker
        mode="select-async"
        class="sourceContainer"
        debounce={300}
        onText-change={e => {
          this.fetchExposedBookings(e.detail);
        }}
        defaultValue={Object.keys(this.bookedByInfoData).length > 1 ? this.bookedByInfoData.bookingNumber?.toString() : ''}
        value={Object.keys(this.bookedByInfoData).length > 1 ? this.bookedByInfoData.bookingNumber?.toString() : ''}
        label={`${locales.entries.Lcz_Tobooking}#`}
        placeholder={locales.entries.Lcz_BookingNumber}
        loading={this.isLoading}
        onCombobox-select={e => {
          const booking = this.bookings?.find(b => b.booking_nbr?.toString() === e.detail.item.value);
          this.spiltBookingSelected.emit({ key: 'select', data: booking });
        }}
      >
        {this.bookings?.map(b => {
          const label = `${b.booking_nbr} ${b.guest.first_name} ${b.guest.last_name}`;
          return (
            <ir-picker-item value={b.booking_nbr?.toString()} label={label}>
              {label}
            </ir-picker-item>
          );
        })}
      </ir-picker>
    );
  }
  private getSourceNode() {
    const { sources } = booking_store.selects;
    return (
      <wa-select
        size="small"
        placeholder={locales.entries.Lcz_Source}
        value={booking_store.bookingDraft.source?.id?.toString()}
        defaultValue={booking_store.bookingDraft.source?.id}
        id="xSmallSelect"
        onwa-hide={e => {
          e.stopImmediatePropagation();
          e.stopPropagation();
        }}
        onchange={evt => {
          setBookingDraft({ source: sources.find(s => s.id === (evt.target as HTMLSelectElement).value) });
        }}
      >
        {sources.map(option => {
          if (option.type === 'LABEL') {
            return <small>{option.description}</small>;
          }
          return <wa-option value={option.id?.toString()}>{option.description}</wa-option>;
        })}
      </wa-select>
    );
  }

  private getAdultChildConstraints() {
    const { adults, children } = booking_store.bookingDraft.occupancy;
    return (
      <Fragment>
        <wa-animation iterations={2} name="bounce" easing="ease-in-out" duration={2000} ref={el => (this.adultAnimationContainer = el)}>
          <wa-select
            class="fd-book-property__adults-select"
            onwa-hide={e => {
              e.stopImmediatePropagation();
              e.stopPropagation();
            }}
            onchange={e => {
              setBookingDraft({
                occupancy: {
                  children,
                  adults: Number((e.target as HTMLSelectElement).value),
                },
              });
            }}
            value={adults?.toString()}
            defaultValue={adults?.toString()}
            placeholder={locales.entries.Lcz_AdultsCaption}
            size="small"
          >
            {Array.from(Array(this.adultChildConstraints.adult_max_nbr), (_, i) => i + 1).map(option => (
              <wa-option value={option?.toString()}>{option}</wa-option>
            ))}
          </wa-select>
        </wa-animation>
        {this.adultChildConstraints.child_max_nbr > 0 && (
          <wa-select
            class="fd-book-property__children-select"
            onwa-hide={e => {
              e.stopImmediatePropagation();
              e.stopPropagation();
            }}
            onchange={e =>
              setBookingDraft({
                occupancy: {
                  adults,
                  children: Number((e.target as HTMLSelectElement).value),
                },
              })
            }
            defaultValue={children?.toString()}
            value={children?.toString()}
            placeholder={this.renderChildCaption()}
            size="small"
          >
            {Array.from(Array(this.adultChildConstraints.child_max_nbr), (_, i) => i + 1).map(option => (
              <wa-option value={option?.toString()}>{option}</wa-option>
            ))}
          </wa-select>
        )}
        <ir-custom-button loading={isRequestPending('/Check_Availability')} variant="brand" onClickHandler={() => this.handleButtonClicked()}>
          {locales.entries.Lcz_Check}
        </ir-custom-button>
      </Fragment>
    );
  }

  private renderChildCaption() {
    const maxAge = this.adultChildConstraints.child_max_age;
    let years = locales.entries.Lcz_Years;

    if (maxAge === 1) {
      years = locales.entries.Lcz_Year;
    }
    return `${locales.entries.Lcz_ChildCaption} 0 - ${this.adultChildConstraints.child_max_age} ${years}`;
  }

  private handleButtonClicked() {
    const { occupancy } = booking_store.bookingDraft;
    if (this.isEventType('SPLIT_BOOKING') && Object.keys(this.bookedByInfoData).length <= 1) {
      this.toast.emit({
        type: 'error',
        title: locales.entries.Lcz_ChooseBookingNumber,
        description: '',
        position: 'top-right',
      });
    } else if (this.isEventType('ADD_ROOM') || this.isEventType('SPLIT_BOOKING')) {
      const initialToDate = moment(new Date(this.bookedByInfoData.to_date || this.defaultDaterange.to_date));
      const initialFromDate = moment(new Date(this.bookedByInfoData.from_date || this.defaultDaterange.from_date));
      const selectedFromDate = moment(new Date(this.dateRangeData.fromDate));
      const selectedToDate = moment(new Date(this.dateRangeData.toDate));
      if (selectedToDate.isBefore(initialFromDate) || selectedFromDate.isAfter(initialToDate)) {
        this.toast.emit({
          type: 'error',
          title: `${locales.entries.Lcz_CheckInDateShouldBeMAx.replace(
            '%1',
            moment(new Date(this.bookedByInfoData.from_date || this.defaultDaterange.from_date)).format('ddd, DD MMM YYYY'),
          ).replace('%2', moment(new Date(this.bookedByInfoData.to_date || this.defaultDaterange.to_date)).format('ddd, DD MMM YYYY'))}  `,
          description: '',
          position: 'top-right',
        });
        return;
      } else if (occupancy.adults === 0) {
        this.toast.emit({ type: 'error', title: locales.entries.Lcz_PlzSelectNumberOfGuests, description: '', position: 'top-right' });

        this.adultAnimationContainer.play = true;
      } else {
        this.buttonClicked.emit({ key: 'check' });
      }
    } else if (this.minDate && new Date(this.dateRangeData.fromDate).getTime() > new Date(this.bookedByInfoData.to_date || this.defaultDaterange.to_date).getTime()) {
      this.toast.emit({
        type: 'error',
        title: `${locales.entries.Lcz_CheckInDateShouldBeMAx.replace(
          '%1',
          moment(new Date(this.bookedByInfoData.from_date || this.defaultDaterange.from_date)).format('ddd, DD MMM YYYY'),
        ).replace('%2', moment(new Date(this.bookedByInfoData.to_date || this.defaultDaterange.to_date)).format('ddd, DD MMM YYYY'))}  `,
        description: '',
        position: 'top-right',
      });
    } else if (occupancy.adults === 0) {
      this.adultAnimationContainer.play = true;
      this.toast.emit({ type: 'error', title: locales.entries.Lcz_PlzSelectNumberOfGuests, description: '', position: 'top-right' });
    } else {
      this.buttonClicked.emit({ key: 'check' });
    }
  }

  private isEventType(key: string) {
    return this.bookingData.event_type === key;
  }
  private getMinDate() {
    if (this.isEventType('PLUS_BOOKING')) {
      return moment().add(-1, 'months').startOf('month').format('YYYY-MM-DD');
    }
    if (this.wasBlockedUnit) {
      return this.bookingData?.block_exposed_unit_props.from_date;
    }
    return this.minDate;
  }
  private getMaxDate() {
    if (!this.bookingData?.block_exposed_unit_props) {
      return undefined;
    }
    return this.bookingData?.block_exposed_unit_props.to_date;
  }

  render() {
    const showSourceNode = this.showSplitBookingOption ? this.getSplitBookingList() : this.isEventType('EDIT_BOOKING') || this.isEventType('ADD_ROOM') ? false : true;
    return (
      <Host>
        {this.isEventType('SPLIT_BOOKING') && this.getSplitBookingList()}
        <div class={`fd-book-property__header-container`}>
          {showSourceNode && this.getSourceNode()}
          <igl-date-range
            data-testid="date_picker"
            variant="booking"
            dateLabel={locales.entries.Lcz_Dates}
            maxDate={this.getMaxDate()}
            minDate={this.getMinDate()}
            disabled={(this.isEventType('BAR_BOOKING') && !this.wasBlockedUnit) || this.isEventType('SPLIT_BOOKING')}
            defaultData={this.bookingDataDefaultDateRange}
          ></igl-date-range>
          {/* <ir-range-picker
            onDateRangeChanged={e => {
              // e.stopImmediatePropagation();
              // e.stopPropagation();
              // const { fromDate, toDate } = e.detail;
              // let to_date = toDate.format('YYYY-MM-DD');
              // if (
              //   toDate.isSame(moment(booking_listing.userSelection.to, 'YYYY-MM-DD'), 'days') ||
              //   toDate.isBefore(moment(booking_listing.userSelection.from, 'YYYY-MM-DD'), 'days')
              // ) {
              //   to_date = booking_listing.userSelection.to;
              // }
              // booking_listing.userSelection = { ...booking_listing.userSelection, to: to_date, from: fromDate.format('YYYY-MM-DD') };
            }}
            allowNullDates={false}
            // fromDate={moment(booking_listing.userSelection.from, 'YYYY-MM-DD')}
            // toDate={moment(booking_listing.userSelection.to, 'YYYY-MM-DD')}
            fromDate={moment()}
            toDate={moment()}
          /> */}
          {!this.isEventType('EDIT_BOOKING') && this.getAdultChildConstraints()}
        </div>
        <p class="text-right message-label">{calendar_data.tax_statement}</p>
      </Host>
    );
  }
}

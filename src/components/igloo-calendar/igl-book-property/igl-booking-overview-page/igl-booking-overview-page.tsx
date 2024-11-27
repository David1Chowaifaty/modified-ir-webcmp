import { Component, Event, EventEmitter, Fragment, Host, Prop, h } from '@stencil/core';
import { TAdultChildConstraints, TSourceOptions } from '../../../../models/igl-book-property';
import { isRequestPending } from '@/stores/ir-interceptor.store';
import moment from 'moment';
import booking_store from '@/stores/booking.store';
@Component({
  tag: 'igl-booking-overview-page',
  styleUrl: 'igl-booking-overview-page.css',
  scoped: true,
})
export class IglBookingOverviewPage {
  @Prop() bookingData: any;
  @Prop() propertyId: number;
  @Prop() message: string;
  @Prop() showSplitBookingOption: boolean;
  @Prop() eventType: string;
  @Prop() currency: any;
  @Prop() adultChildConstraints: TAdultChildConstraints;
  @Prop() ratePricingMode: any;
  @Prop() dateRangeData: any;
  @Prop() defaultDaterange: { from_date: string; to_date: string };
  @Prop() selectedRooms: Map<string, Map<string, any>>;
  @Prop() adultChildCount: { adult: number; child: number };
  @Prop() sourceOptions: TSourceOptions[];
  @Prop() bookedByInfoData: any;
  @Prop() initialRoomIds: any;

  @Event() roomsDataUpdate: EventEmitter;

  getSplitBookings() {
    return (this.bookingData.hasOwnProperty('splitBookingEvents') && this.bookingData.splitBookingEvents) || [];
  }
  isEventType(event: string) {
    return event === this.eventType;
  }
  setMinDate() {
    if (!this.isEventType('EDIT_BOOKING')) {
      return;
    }
    const from_date = moment(this.bookingData.FROM_DATE, 'YYYY-MM-DD');
    const today = moment();
    if (from_date.isAfter(today)) {
      return today.add(-2, 'weeks').format('YYYY-MM-DD');
    }
    return from_date.add(-2, 'weeks').format('YYYY-MM-DD');
  }
  render() {
    return (
      <Host>
        <igl-book-property-header
          bookedByInfoData={this.bookedByInfoData}
          defaultDaterange={this.defaultDaterange}
          dateRangeData={this.dateRangeData}
          minDate={this.setMinDate()}
          // minDate={this.isEventType('ADD_ROOM') || this.isEventType('SPLIT_BOOKING') ? this.bookedByInfoData.from_date || this.bookingData.FROM_DATE : undefined}
          adultChildCount={this.adultChildCount}
          splitBookingId={this.showSplitBookingOption}
          bookingData={this.bookingData}
          sourceOptions={this.sourceOptions}
          message={this.message}
          bookingDataDefaultDateRange={this.bookingData.defaultDateRange}
          showSplitBookingOption={this.showSplitBookingOption}
          adultChildConstraints={this.adultChildConstraints}
          splitBookings={this.getSplitBookings()}
          propertyId={this.propertyId}
        ></igl-book-property-header>
        {/* {this.adultChildCount.adult === 0 && <p class={'col text-left'}>Please select the number of guests</p>} */}
        <div class=" text-left">
          {isRequestPending('/Check_Availability') && this.isEventType('EDIT_BOOKING') ? (
            <div class="loading-container">
              <div class="loader"></div>
            </div>
          ) : (
            <Fragment>
              {booking_store.roomTypes?.map(roomType => (
                <igl-room-type
                  initialRoomIds={this.initialRoomIds}
                  isBookDisabled={Object.keys(this.bookedByInfoData).length <= 1}
                  key={`room-info-${roomType.id}`}
                  currency={this.currency}
                  ratePricingMode={this.ratePricingMode}
                  dateDifference={this.dateRangeData.dateDifference}
                  bookingType={this.bookingData.event_type}
                  roomType={roomType}
                  class="mt-2 mb-1 p-0"
                  roomInfoId={this.selectedRooms.has(`c_${roomType.id}`) ? roomType.id : null}
                  onDataUpdateEvent={evt => this.roomsDataUpdate.emit(evt.detail)}
                ></igl-room-type>
              ))}
            </Fragment>
          )}
        </div>

        <igl-book-property-footer class={'p-0 mb-1 mt-3'} eventType={this.bookingData.event_type}></igl-book-property-footer>
      </Host>
    );
  }
}

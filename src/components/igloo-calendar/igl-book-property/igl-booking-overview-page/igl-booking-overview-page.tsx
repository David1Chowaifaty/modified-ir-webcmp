import { Component, Event, EventEmitter, Fragment, Host, Prop, h } from '@stencil/core';
import { TAdultChildConstraints, TSourceOptions } from '../../../../models/igl-book-property';
import { isRequestPending } from '@/stores/ir-interceptor.store';
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
  render() {
    //console.log(this.bookingData);
    return (
      <Host>
        <igl-book-property-header
          bookedByInfoData={this.bookedByInfoData}
          defaultDaterange={this.defaultDaterange}
          dateRangeData={this.dateRangeData}
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
          {isRequestPending('/Get_Exposed_Booking_Availability') && this.isEventType('EDIT_BOOKING') ? (
            <div class="loading-container">
              <div class="loader"></div>
            </div>
          ) : (
            <Fragment>
              {this.bookingData?.roomsInfo?.map(roomInfo => {
                console.log(this.selectedRooms);
                return (
                  <igl-booking-rooms
                    initialRoomIds={this.initialRoomIds}
                    isBookDisabled={Object.keys(this.bookedByInfoData).length <= 1}
                    key={`room-info-${roomInfo.id}`}
                    currency={this.currency}
                    ratePricingMode={this.ratePricingMode}
                    dateDifference={this.dateRangeData.dateDifference}
                    bookingType={this.bookingData.event_type}
                    roomTypeData={roomInfo}
                    class="mt-2 mb-1 p-0"
                    roomInfoId={this.selectedRooms.has(`c_${roomInfo.id}`) ? roomInfo.id : null}
                    defaultData={this.selectedRooms.get(`c_${roomInfo.id}`)}
                    onDataUpdateEvent={evt => this.roomsDataUpdate.emit(evt.detail)}
                  ></igl-booking-rooms>
                );
              })}
            </Fragment>
          )}
        </div>

        <igl-book-property-footer class={'p-0 mb-1 mt-3'} eventType={this.bookingData.event_type} disabled={this.selectedRooms.size === 0}></igl-book-property-footer>
      </Host>
    );
  }
}

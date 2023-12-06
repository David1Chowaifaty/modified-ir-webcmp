import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';
import { TAdultChildConstraints, TSourceOptions } from '../../../../models/igl-book-property';
@Component({
  tag: 'igl-booking-overview-page',
  styleUrl: 'igl-booking-overview-page.css',
  scoped: true,
})
export class IglBookingOverviewPage {
  @Prop() bookingData: any;
  @Prop() message: string;
  @Prop() showSplitBookingOption: boolean;
  @Prop() eventType: string;
  @Prop() currency: any;
  @Prop() adultChildConstraints: TAdultChildConstraints;
  @Prop() ratePricingMode: any;
  @Prop() dateRangeData: any;
  @Prop() selectedRooms: Map<string, Map<string, any>>;
  @Prop() adultChildCount: { adult: number; child: number };
  @Prop() sourceOptions: TSourceOptions[];
  @Event() roomsDataUpdate: EventEmitter;
  getSplitBookings() {
    return (this.bookingData.hasOwnProperty('splitBookingEvents') && this.bookingData.splitBookingEvents) || [];
  }
  isEventType(event: string) {
    return event === this.eventType;
  }
  render() {
    return (
      <Host>
        <igl-book-property-header
          adultChildCount={this.adultChildCount}
          splitBookingId={this.showSplitBookingOption}
          bookingData={this.bookingData}
          sourceOptions={this.sourceOptions}
          message={this.message}
          bookingDataDefaultDateRange={this.bookingData.defaultDateRange}
          showSplitBookingOption={this.showSplitBookingOption}
          adultChildConstraints={this.adultChildConstraints}
          splitBookings={this.getSplitBookings()}
        ></igl-book-property-header>
        {this.adultChildCount.adult === 0 && <p class={'col text-left'}>Please select the number of guests</p>}
        <div class="col text-left">
          {this.bookingData?.roomsInfo?.map(roomInfo => {
            return (
              <igl-booking-rooms
                key={`room-info-${roomInfo.id}`}
                currency={this.currency}
                ratePricingMode={this.ratePricingMode}
                dateDifference={this.dateRangeData.dateDifference}
                bookingType={this.bookingData.event_type}
                roomTypeData={roomInfo}
                class="mt-2 mb-1"
                defaultData={this.selectedRooms.get(`c_${roomInfo.id}`)}
                onDataUpdateEvent={evt => this.roomsDataUpdate.emit(evt.detail)}
              ></igl-booking-rooms>
            );
          })}
        </div>
        <igl-book-property-footer class={'p-0 mb-1 mt-2'} eventType={this.bookingData.event_type} disabled={this.selectedRooms.size === 0}></igl-book-property-footer>
      </Host>
    );
  }
}

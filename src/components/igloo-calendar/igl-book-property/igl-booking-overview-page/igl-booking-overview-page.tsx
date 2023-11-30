import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';
import { FooterButtonType } from '../../../../models/igl-book-property';

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
  @Prop() ratePricingMode: any;
  @Prop() dateRangeData: any;
  @Prop() selectedRooms: any = {};
  @Event() dateRangeSelect: EventEmitter;
  @Event() roomsDataUpdate: EventEmitter;
  @Event() buttonClicked: EventEmitter<FooterButtonType>;
  getSplitBookings() {
    return (this.bookingData.hasOwnProperty('splitBookingEvents') && this.bookingData.splitBookingEvents) || [];
  }
  isEventType(event: string) {
    return event === this.eventType;
  }
  render() {
    return (
      <Host>
        {/*Header*/}
        <div class="col text-left">
          {this.bookingData.roomsInfo?.map(roomInfo => (
            <igl-booking-rooms
              currency={this.currency}
              ratePricingMode={this.ratePricingMode}
              dateDifference={this.dateRangeData.dateDifference}
              bookingType={this.bookingData.event_type}
              roomTypeData={roomInfo}
              class="mt-2 mb-1"
              defaultData={this.selectedRooms['c_' + roomInfo.id]}
              onDataUpdateEvent={evt => this.roomsDataUpdate.emit(evt.detail)}
            ></igl-booking-rooms>
          ))}
        </div>
        <igl-book-property-footer
          class={'p-0 mb-1 mt-2'}
          onButtonClicked={evt => this.buttonClicked.emit(evt.detail)}
          eventType={this.bookingData.event_type}
          disabled={Object.keys(this.selectedRooms).length === 0}
        ></igl-book-property-footer>
      </Host>
    );
  }
}

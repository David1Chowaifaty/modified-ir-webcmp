import { RoomType } from '@/models/property';
import { getVisibleInventory } from '@/stores/booking.store';
import { Component, Host, h, Prop, Event, EventEmitter, State } from '@stencil/core';

@Component({
  tag: 'igl-room-type',
  styleUrl: 'igl-room-type.css',
  scoped: true,
})
export class IglRoomType {
  @Prop() roomType: RoomType;
  @Prop() bookingType = 'PLUS_BOOKING';
  @Prop() dateDifference: number;
  @Prop() ratePricingMode = [];
  @Prop() roomInfoId: number | null = null;
  @Prop() currency;
  @Prop() initialRoomIds: any;
  @Prop() isBookDisabled: boolean;

  @State() selectedRooms: number[] = [];
  @State() totalRooms: number;
  @State() roomsDistributions: number[] = [];

  @Event() dataUpdateEvent: EventEmitter<{ [key: string]: any }>;

  private validBookingTypes = ['PLUS_BOOKING', 'ADD_ROOM', 'EDIT_BOOKING', 'SPLIT_BOOKING'];

  render() {
    const isValidBookingType = this.validBookingTypes.includes(this.bookingType);

    return (
      <Host>
        {isValidBookingType && this.roomType.rateplans?.length > 0 && <div class="font-weight-bold font-medium-1 margin-bottom-8 ">{this.roomType.name}</div>}
        {this.roomType.rateplans?.map(ratePlan => {
          if (!!ratePlan.variations) {
            let shouldBeDisabled = this.roomInfoId && this.roomInfoId === this.roomType.id;
            // let roomId = -1;
            // if (shouldBeDisabled && this.initialRoomIds) {
            //   roomId = this.initialRoomIds.roomId;
            // }
            const visibleInventory = getVisibleInventory(this.roomType.id, ratePlan.id);
            return (
              <igl-rate-plan
                // is_bed_configuration_enabled={this.roomType.is_bed_configuration_enabled}
                // index={index}
                isBookDisabled={this.isBookDisabled}
                visibleInventory={visibleInventory}
                key={`rate-plan-${ratePlan.id}`}
                ratePricingMode={this.ratePricingMode}
                class={isValidBookingType ? '' : ''}
                currency={this.currency}
                // dateDifference={this.dateDifference}
                ratePlan={ratePlan}
                roomTypeId={this.roomType.id}
                // totalAvailableRooms={this.roomsDistributions[index]}
                bookingType={this.bookingType}
                shouldBeDisabled={shouldBeDisabled}
                // physicalrooms={this.roomType.physicalrooms}
                // defaultRoomId={roomId}
              ></igl-rate-plan>
            );
          }
          return null;
        })}
      </Host>
    );
  }
}

import { RoomType } from '@/models/property';
import { getVisibleInventory } from '@/stores/booking.store';
import { Component, Host, h, Prop } from '@stencil/core';

@Component({
  tag: 'igl-room-type',
  styleUrl: 'igl-room-type.css',
  scoped: true,
})
export class IglRoomType {
  @Prop() roomType: RoomType;
  @Prop() bookingType = 'PLUS_BOOKING';
  @Prop() ratePricingMode = [];
  @Prop() roomInfoId: number | null = null;
  @Prop() currency;
  @Prop() initialRoomIds: any;
  @Prop() isBookDisabled: boolean;

  private validBookingTypes = ['PLUS_BOOKING', 'ADD_ROOM', 'EDIT_BOOKING', 'SPLIT_BOOKING'];

  render() {
    const isValidBookingType = this.validBookingTypes.includes(this.bookingType);

    return (
      <Host>
        {isValidBookingType && this.roomType.rateplans?.length > 0 && <h5 class="roomtype__name">{this.roomType.name}</h5>}
        {this.roomType.rateplans?.map(ratePlan => {
          if (!!ratePlan.variations) {
            let shouldBeDisabled = this.roomInfoId && this.roomInfoId === this.roomType.id;
            const visibleInventory = getVisibleInventory(this.roomType.id, ratePlan.id);
            return (
              <igl-rate-plan
                isBookDisabled={this.isBookDisabled}
                visibleInventory={visibleInventory}
                key={`rate-plan-${ratePlan.id}`}
                ratePricingMode={this.ratePricingMode}
                class={isValidBookingType ? '' : ''}
                currency={this.currency}
                ratePlan={ratePlan}
                roomTypeId={this.roomType.id}
                bookingType={this.bookingType}
                shouldBeDisabled={shouldBeDisabled}
              ></igl-rate-plan>
            );
          }
          return null;
        })}
      </Host>
    );
  }
}

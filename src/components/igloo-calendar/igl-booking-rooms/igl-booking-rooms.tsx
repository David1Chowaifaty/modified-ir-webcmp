import { Component, Host, h, Prop, Event, EventEmitter, State, Watch } from '@stencil/core';

@Component({
  tag: 'igl-booking-rooms',
  styleUrl: 'igl-booking-rooms.css',
  scoped: true,
})
export class IglBookingRooms {
  @Prop() roomTypeData: { [key: string]: any };
  @Prop() defaultData: Map<string, any>;
  @Prop() bookingType = 'PLUS_BOOKING';
  @Prop() dateDifference: number;
  @Prop() ratePricingMode = [];
  @Prop() roomInfoId: number | null = null;
  @Prop() currency;
  @State() selectedRooms: number[] = [];
  @State() totalRooms: number;
  @Prop() isBookDisabled: boolean;
  @Prop() initialRoomIds: any;
  @State() roomsDistributions: number[] = [];
  @Event() dataUpdateEvent: EventEmitter<{ [key: string]: any }>;
  private validBookingTypes = ['PLUS_BOOKING', 'ADD_ROOM', 'EDIT_BOOKING', 'SPLIT_BOOKING'];

  componentWillLoad() {
    this.initializeRoomData();
  }

  private initializeRoomData() {
    const { inventory, rateplans } = this.roomTypeData;
    this.totalRooms = inventory || 0;
    this.selectedRooms = new Array(rateplans.length).fill(0);
    this.roomsDistributions = this.calculateInitialDistributions(rateplans, inventory);
  }
  @Watch('roomTypeData')
  handleRoomTypeData() {
    this.initializeRoomData();
  }

  private calculateInitialDistributions(rateplans, inventory) {
    let distributions = new Array(rateplans.length).fill(inventory);
    if (this.defaultData && this.bookingType !== 'EDIT_BOOKING' && inventory > 0) {
      let selectedIndexes = [];
      let sum = 0;
      this.defaultData.forEach(category => {
        this.selectedRooms[category.index] = category.totalRooms;
        distributions[category.index] = category.totalRooms;
        sum += category.totalRooms;
        selectedIndexes.push(category.index);
      });
      if (selectedIndexes.length < distributions.length) {
        distributions.forEach((_, index) => {
          if (!selectedIndexes.includes(index)) {
            if (sum === this.totalRooms) {
              distributions[index] = 0;
            } else {
              distributions[index] = distributions[index] - sum;
            }
          } else {
            if (sum < this.totalRooms) {
              distributions[index] = this.totalRooms - sum + distributions[index];
            }
          }
        });
      }
    } else {
      distributions.fill(inventory);
    }
    return distributions;
  }

  onRoomDataUpdate(event: CustomEvent<{ [key: string]: any }>, index: number) {
    event.stopImmediatePropagation();
    const {
      detail: { data, changedKey },
    } = event;
    let updatedData = { ...data };

    if (changedKey === 'totalRooms') {
      this.handleTotalRoomsUpdate(index, updatedData.totalRooms);
    }

    updatedData = {
      ...updatedData,
      roomCategoryId: this.roomTypeData.id,
      roomCategoryName: this.roomTypeData.name,
      inventory: this.roomTypeData.inventory,
    };

    this.dataUpdateEvent.emit({ key: data.key, data: updatedData, changedKey });
  }

  private handleTotalRoomsUpdate(index: number, newValue: number) {
    if (this.selectedRooms[index] !== newValue) {
      this.selectedRooms[index] = newValue;
      this.updateRatePlanTotalRooms(index);
    }
  }

  updateRatePlanTotalRooms(ratePlanIndex: number) {
    const calculateTotalSelectedRoomsExcludingIndex = excludedIndex => {
      return this.selectedRooms.reduce((acc, rooms, idx) => (idx !== excludedIndex ? acc + rooms : acc), 0);
    };
    const newRoomsDistributions = this.selectedRooms.map((_, index) => {
      if (index === ratePlanIndex) {
        return this.roomsDistributions[index];
      }
      const totalSelectedRoomsExcludingCurrent = calculateTotalSelectedRoomsExcludingIndex(index);
      const availableRooms = this.totalRooms - totalSelectedRoomsExcludingCurrent;

      return availableRooms > 0 ? availableRooms : 0;
    });

    if (JSON.stringify(this.roomsDistributions) !== JSON.stringify(newRoomsDistributions)) {
      this.roomsDistributions = [...newRoomsDistributions];
    }
  }

  render() {
    const isValidBookingType = this.validBookingTypes.includes(this.bookingType);
    return (
      <Host>
        {isValidBookingType && <div class="font-weight-bold font-medium-1 mb-1">{this.roomTypeData.name}</div>}
        {this.roomTypeData.rateplans.map((ratePlan, index) => {
          if (ratePlan.variations !== null) {
            let shouldBeDisabled = this.roomInfoId && this.roomInfoId === this.roomTypeData.id;
            let roomId = -1;
            if (shouldBeDisabled && this.initialRoomIds) {
              roomId = this.initialRoomIds.roomId;
            }
            return (
              <igl-booking-room-rate-plan
                is_bed_configuration_enabled={this.roomTypeData.is_bed_configuration_enabled}
                index={index}
                isBookDisabled={this.isBookDisabled}
                key={`rate-plan-${ratePlan.id}`}
                ratePricingMode={this.ratePricingMode}
                class={isValidBookingType ? '' : ''}
                currency={this.currency}
                dateDifference={this.dateDifference}
                ratePlanData={ratePlan}
                totalAvailableRooms={this.roomsDistributions[index]}
                bookingType={this.bookingType}
                defaultData={(this.defaultData && this.defaultData.get(`p_${ratePlan.id}`)) || null}
                shouldBeDisabled={shouldBeDisabled}
                onDataUpdateEvent={evt => this.onRoomDataUpdate(evt, index)}
                physicalrooms={this.roomTypeData.physicalrooms}
                defaultRoomId={roomId}
                selectedRoom={this.initialRoomIds}
              ></igl-booking-room-rate-plan>
            );
          } else {
            return null;
          }
        })}
      </Host>
    );
  }
}

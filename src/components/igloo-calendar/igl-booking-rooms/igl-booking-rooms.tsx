import { Component, Host, h, Prop, Event, EventEmitter, State, Watch } from '@stencil/core';

@Component({
  tag: 'igl-booking-rooms',
  styleUrl: 'igl-booking-rooms.css',
  scoped: true,
})
export class IglBookingRooms {
  @Prop({ reflect: true, mutable: true }) roomTypeData: { [key: string]: any };
  @Prop() defaultData: { [key: string]: any };
  @Prop() bookingType: string = 'PLUS_BOOKING';
  @Prop({ reflect: true }) dateDifference: number;
  @Prop() ratePricingMode = [];
  @Prop() currency;
  @Event() dataUpdateEvent: EventEmitter<{ [key: string]: any }>;
  @State() selectedRooms: number[] = [];
  @State() roomsDistributions: number[] = [];
  private validBookingTypes = ['PLUS_BOOKING', 'ADD_ROOM', 'EDIT_BOOKING'];
  private totalRooms: number;

  componentWillLoad() {
    this.totalRooms = this.roomTypeData.inventory || 0;
    if (!this.selectedRooms.length) {
      this.selectedRooms = new Array(this.totalRooms).fill(0);
    }
    if (!this.roomsDistributions.length) {
      this.roomsDistributions = new Array(this.totalRooms).fill(this.totalRooms);
    }
  }

  @Watch('roomTypeData')
  handleRoomTypeDataChange(newValue) {
    console.log(newValue);
    this.totalRooms = newValue.inventory || 0;
    if (!this.selectedRooms.length) {
      this.selectedRooms = new Array(this.totalRooms).fill(0);
    }
    if (!this.roomsDistributions.length) {
      this.roomsDistributions = new Array(this.totalRooms).fill(this.totalRooms);
    }
  }

  onRoomDataUpdate(event: CustomEvent<{ [key: string]: any }>, index: number) {
    event.stopImmediatePropagation();
    const opt: { [key: string]: any } = event.detail;
    let data = { ...opt.data };
    if (opt.changedKey === 'totalRooms') {
      let newValue = data.totalRooms;
      if (this.selectedRooms[index] !== newValue) {
        this.selectedRooms[index] = newValue;
        this.updateRatePlanTotalRooms(index);
      }
    }
    data.roomCategoryId = this.roomTypeData.id;
    data.roomCategoryName = this.roomTypeData.name;
    data.inventory = this.roomTypeData.inventory;
    this.dataUpdateEvent.emit({
      key: opt.key,
      data: data,
      changedKey: opt.changedKey,
    });
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
      this.roomsDistributions = newRoomsDistributions;
    }
  }

  render() {
    const isValidBookingType = this.validBookingTypes.includes(this.bookingType);
    return (
      <Host>
        {isValidBookingType && <div class="font-weight-bold font-medium-1">{this.roomTypeData.name}</div>}
        {this.roomTypeData.rateplans.map((ratePlan, index) => {
          if (ratePlan.variations !== null) {
            return (
              <igl-booking-room-rate-plan
                key={`rate-plan-${ratePlan.id}`}
                ratePricingMode={this.ratePricingMode}
                class={isValidBookingType ? 'ml-1' : ''}
                currency={this.currency}
                dateDifference={this.dateDifference}
                ratePlanData={ratePlan}
                //fullyBlocked={this.roomTypeData.rate === 0}
                totalAvailableRooms={this.roomsDistributions[index]}
                bookingType={this.bookingType}
                defaultData={(this.defaultData && this.defaultData['p_' + ratePlan.id]) || null}
                onDataUpdateEvent={evt => this.onRoomDataUpdate(evt, index)}
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

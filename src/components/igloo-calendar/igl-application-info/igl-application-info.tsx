import { Component, Host, h, Prop, Event, EventEmitter, Watch, State } from '@stencil/core';
import { v4 } from 'uuid';
import { getCurrencySymbol } from '../../../utils/utils';


@Component({
  tag: 'igl-application-info',
  styleUrl: 'igl-application-info.css',
  scoped: true,
})
export class IglApplicationInfo {
  @Prop() guestInfo: { [key: string]: any };
  @Prop() currency;
  @Prop() defaultTexts: any;
  @Prop({ reflect: true, mutable: true }) roomsList: { [key: string]: any }[] = [];
  @Prop() guestRefKey: string;
  @Prop() bedPreferenceType = [];
  @Prop() selectedUnits: number[] = [];
  @Prop() bookingType: string = 'PLUS_BOOKING';
  @Prop() index: number;
  @Event() dataUpdateEvent: EventEmitter<{ [key: string]: any }>;
  @State() filterdRoomList = [];
  private guestData: { [key: string]: any };

  componentWillLoad() {
    this.guestData = this.guestInfo ? { ...this.guestInfo } : {};
    this.updateRoomList();
  }
  
  @Watch('selectedUnits')
  async handleSelctedUnits() {
    this.updateRoomList();
  }
  updateRoomList() {
    const units = [...this.selectedUnits];
    units[this.index] = -1;
    this.filterdRoomList = this.roomsList.filter(e => !units.includes(e.id));
  }
  updateData() {
    this.dataUpdateEvent.emit({
      key: 'roomRatePlanUpdate',
      guestRefKey: this.guestRefKey,
      data: { ...this.guestData },
    });
  }

  handleDataChange(key, value) {
    this.guestData[key] = +value;
    if (value === '') {
      this.guestData['roomName'] = value;
    }
    if (key === 'roomId' && value !== '') {
      this.guestData['roomName'] = this.filterdRoomList.find(room => room.id === +value).name || '';
    }
    this.updateData();
  }

  handleGuestNameChange(event) {
    // console.log("On Guest name Change::", event.target.value);
    this.guestData.guestName = event.target.value;
    this.updateData();
  }

  render() {
    //console.log(this.guestInfo, this.roomsList);
    return (
      <Host>
        <div class="text-left mt-1 ">
          <div class=" mb-1 ">
            {this.bookingType === 'PLUS_BOOKING' || this.bookingType === 'ADD_ROOM' || this.bookingType === 'EDIT_BOOKING' ? (
              <span class="h5 mr-1">{this.guestInfo.roomCategoryName}</span>
            ) : null}
            <span class=" font-weight-bold">
              {this.guestInfo.ratePlanName.replace(this.guestInfo.roomCategoryName + '/', '')}
              <ir-tooltip class=" mr-1" message={this.guestInfo.cancelation + this.guestInfo.guarantee}></ir-tooltip>
            </span>
            <span>{this.guestInfo.adult_child_offering}</span>
          </div>

          <div class="d-flex m-0 p-0 align-items-center aplicationInfoContainer ">
            <div class="mr-1 flex-fill">
              <input
                id={v4()}
                type="email"
                class="form-control"
                placeholder={this.defaultTexts.entries.Lcz_GuestFirstnameAndLastname}
                name="guestName"
                onInput={event => this.handleGuestNameChange(event)}
                required
                value={this.guestData.guestName}
              />
            </div>
            {this.bookingType === 'PLUS_BOOKING' || this.bookingType === 'ADD_ROOM' || this.bookingType === 'EDIT_BOOKING' ? (
              <div class="mr-1 p-0 flex-fill">
                <select class="form-control input-sm pr-0" id={v4()} onChange={event => this.handleDataChange('roomId', (event.target as HTMLInputElement).value)}>
                  <option value="" selected={this.guestData.roomId === ''}>
                    {this.defaultTexts.entries.Lcz_Assignunits}
                  </option>
                  {this.filterdRoomList.map(room => (
                    <option value={room.id} selected={+this.guestData.roomId === room.id}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div class="mr-1 flex-fill">
              <select class="form-control input-sm" id={v4()} onChange={event => this.handleDataChange('preference', (event.target as HTMLInputElement).value)}>
                <option value="" selected={this.guestData.preference === ''}>
                  {this.defaultTexts.entries.Lcz_NoPreference}
                </option>
                {this.bedPreferenceType.map(data => (
                  <option value={data.CODE_NAME} selected={this.guestData.preference === data.CODE_NAME}>
                    {data.CODE_VALUE_EN}
                  </option>
                ))}
              </select>
            </div>
            <div class="">{getCurrencySymbol(this.currency.code) + this.guestInfo.rate}</div>
          </div>
        </div>
      </Host>
    );
  }
}

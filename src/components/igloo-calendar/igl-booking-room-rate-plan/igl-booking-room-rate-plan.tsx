import { Component, Host, Prop, h, State, Event, EventEmitter, Watch, Fragment } from '@stencil/core';
import { v4 } from 'uuid';
import { getCurrencySymbol } from '../../../utils/utils';
import locales from '@/stores/locales.store';
import calendar_data from '@/stores/calendar-data';
@Component({
  tag: 'igl-booking-room-rate-plan',
  styleUrl: 'igl-booking-room-rate-plan.css',
  scoped: true,
})
export class IglBookingRoomRatePlan {
  @Prop() defaultData: { [key: string]: any };
  @Prop() ratePlanData: { [key: string]: any };
  @Prop() totalAvailableRooms: number;
  @Prop() index: number;
  @Prop() ratePricingMode = [];
  @Prop() currency: any;
  @Prop() physicalrooms;
  @Prop() shouldBeDisabled: boolean;
  @Prop() dateDifference: number;
  @Prop() bookingType: string = 'PLUS_BOOKING';
  @Prop() fullyBlocked: boolean;
  @Prop() isBookDisabled: boolean = false;
  @Prop() defaultRoomId;
  @Prop() selectedRoom;
  @Prop() is_bed_configuration_enabled: boolean;
  @State() isInputFocused = false;
  @Event() dataUpdateEvent: EventEmitter<{ [key: string]: any }>;
  @Event() gotoSplitPageTwoEvent: EventEmitter<{ [key: string]: any }>;
  @State() selectedData: { [key: string]: any };
  @State() ratePlanChangedState: boolean = false;
  getAvailableRooms(assignable_units: any[]) {
    let result = [];
    assignable_units.forEach(unit => {
      if (unit.Is_Fully_Available) {
        result.push({ name: unit.name, id: unit.pr_id });
      }
    });
    return result;
  }
  componentWillLoad() {
    // console.log('default data', this.defaultData);
    this.updateSelectedRatePlan(this.ratePlanData);
  }
  disableForm() {
    if (this.bookingType === 'EDIT_BOOKING' && this.shouldBeDisabled) {
      return false;
    } else {
      return this.selectedData.is_closed || this.totalAvailableRooms === 0 || (calendar_data.is_frontdesk_enabled && this.selectedData.physicalRooms.length === 0);
    }
  }

  setAvailableRooms(data) {
    let availableRooms = this.getAvailableRooms(data);
    if (this.bookingType === 'EDIT_BOOKING' && this.shouldBeDisabled) {
      if (this.selectedRoom) {
        availableRooms.push({
          id: this.selectedRoom.roomId,
          name: this.selectedRoom.roomName,
        });
        availableRooms.sort((a, b) => {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });
      }
    }
    return availableRooms;
  }
  getSelectedOffering(value: any) {
    return this.ratePlanData.variations.find(variation => variation.adult_child_offering === value);
  }

  updateSelectedRatePlan(data) {
    this.selectedData = {
      is_bed_configuration_enabled: this.is_bed_configuration_enabled,
      ratePlanId: data.id,
      adult_child_offering: data.variations[data.variations.length - 1].adult_child_offering,
      rateType: 1,
      totalRooms: 0,
      rate: data.variations[data.variations.length - 1].amount ?? 0,
      ratePlanName: data.name,
      adultCount: data.variations[data.variations.length - 1].adult_nbr,
      childrenCount: data.variations[data.variations.length - 1].child_nbr,
      cancelation: data.cancelation,
      guarantee: data.guarantee,
      isRateModified: false,
      defaultSelectedRate: 0,
      index: this.index,
      is_closed: data.is_closed,
      physicalRooms: this.setAvailableRooms(this.ratePlanData.assignable_units),
      dateDifference: this.dateDifference,
    };

    if (this.defaultData) {
      for (const [key, value] of Object.entries(this.defaultData)) {
        this.selectedData[key] = value;
      }
      this.selectedData['rateType'] = 1;
    }
  }
  componentDidLoad() {
    if (this.defaultData) {
      this.dataUpdateEvent.emit({
        key: 'roomRatePlanUpdate',
        changedKey: 'physicalRooms',
        data: this.selectedData,
      });
    }
  }
  @Watch('ratePlanData')
  async ratePlanDataChanged(newData) {
    this.selectedData = {
      ...this.selectedData,
      adult_child_offering: newData.variations[newData.variations.length - 1].adult_child_offering,
      adultCount: newData.variations[newData.variations.length - 1].adult_nbr,
      childrenCount: newData.variations[newData.variations.length - 1].child_nbr,
      rate: this.handleRateDaysUpdate(),
      physicalRooms: this.setAvailableRooms(newData.assignable_units),
    };
    this.dataUpdateEvent.emit({
      key: 'roomRatePlanUpdate',
      changedKey: 'rate',
      data: this.selectedData,
    });
  }

  handleRateDaysUpdate() {
    if (this.selectedData.isRateModified) {
      return this.selectedData.defaultSelectedRate;
    }
    const selectedOffering = this.getSelectedOffering(this.selectedData.adult_child_offering);
    return selectedOffering ? selectedOffering.amount : 0;
  }

  handleInput(event: InputEvent) {
    const inputElement = event.target as HTMLInputElement;
    let inputValue = inputElement.value.replace(/[^0-9.]/g, '');

    const validDecimalNumber = /^\d*\.?\d*$/;
    if (!validDecimalNumber.test(inputValue)) {
      inputValue = inputValue.substring(0, inputValue.length - 1);
    }

    inputElement.value = inputValue;
    if (inputValue) {
      this.selectedData.isRateModified = true;
      this.handleDataChange('rate', event);
    } else {
      this.selectedData = {
        ...this.selectedData,
        rate: -1,
        totalRooms: 0,
      };
      this.dataUpdateEvent.emit({
        key: 'roomRatePlanUpdate',
        changedKey: 'rate',
        data: this.selectedData,
      });
    }
  }

  handleDataChange(key, evt) {
    const value = evt.target.value;
    switch (key) {
      case 'adult_child_offering':
        this.updateOffering(value);
        break;
      case 'rate':
        this.updateRate(value);
        break;
      default:
        this.updateGenericData(key, value);
        break;
    }
    this.dataUpdateEvent.emit({
      key: 'roomRatePlanUpdate',
      changedKey: key,
      data: this.selectedData,
    });
  }

  updateOffering(value) {
    const offering = this.getSelectedOffering(value);
    if (offering) {
      this.selectedData = {
        ...this.selectedData,
        adult_child_offering: value,
        adultCount: offering.adult_nbr,
        childrenCount: offering.child_nbr,
        rate: offering.amount,
        isRateModified: false,
      };
    }
  }

  updateRate(value) {
    const numericValue = value === '' ? 0 : Number(value);
    this.selectedData = {
      ...this.selectedData,
      rate: numericValue,
      totalRooms: value === '' ? 0 : this.selectedData.totalRooms,
      defaultSelectedRate: this.selectedData.rateType === 2 ? numericValue / this.dateDifference : numericValue,
    };
  }

  updateGenericData(key, value) {
    this.selectedData = {
      ...this.selectedData,
      [key]: value === '' ? 0 : parseInt(value),
    };
  }
  bookProperty() {
    this.dataUpdateEvent.emit({ key: 'clearData', data: this.selectedData });
    this.handleDataChange('totalRooms', { target: { value: '1' } });
    this.gotoSplitPageTwoEvent.emit({ key: 'gotoSplitPage', data: '' });
  }

  renderRate(): string | number | string[] {
    if (this.selectedData.isRateModified) {
      console.log('selectedData.rate', this.selectedData.rate);
      return this.selectedData.rate === -1 ? '' : this.selectedData.rate;
    }
    return this.selectedData.rateType === 1 ? Number(this.selectedData.rate).toFixed(2) : Number(this.selectedData.rate / this.dateDifference).toFixed(2);
  }
  render() {
    return (
      <Host>
        <div class="d-flex flex-column m-0 p-0 flex-lg-row align-items-lg-center justify-content-lg-between ">
          <div class="rateplan-name-container">
            {this.bookingType === 'BAR_BOOKING' ? (
              <Fragment>
                <span class="font-weight-bold	">{this.ratePlanData.name.split('/')[0]}</span>
                <span>/{this.ratePlanData.name.split('/')[1]}</span>
              </Fragment>
            ) : (
              <span>{this.ratePlanData.short_name}</span>
            )}
            <ir-tooltip message={this.ratePlanData.cancelation + this.ratePlanData.guarantee}></ir-tooltip>
          </div>

          <div class={'d-md-flex justify-content-md-end  align-items-md-center flex-fill rateplan-container'}>
            <div class="mt-1 mt-md-0 flex-fill max-w-300">
              <fieldset class="position-relative">
                <select disabled={this.disableForm()} class="form-control  input-sm" id={v4()} onChange={evt => this.handleDataChange('adult_child_offering', evt)}>
                  {this.ratePlanData.variations.map(variation => (
                    <option value={variation.adult_child_offering} selected={this.selectedData.adult_child_offering === variation.adult_child_offering}>
                      {variation.adult_child_offering}
                    </option>
                  ))}
                </select>
              </fieldset>
            </div>
            <div class={'m-0 p-0 mt-1 mt-md-0 d-flex justify-content-between align-items-md-center ml-md-1 '}>
              <div class=" d-flex  m-0 p-0 rate-total-night-view  mt-0">
                <fieldset class="position-relative has-icon-left m-0 p-0 rate-input-container  ">
                  <div class="input-group-prepend">
                    <span data-disabled={this.disableForm()} data-state={this.isInputFocused ? 'focus' : ''} class="input-group-text new-currency" id="basic-addon1">
                      {getCurrencySymbol(this.currency.code)}
                    </span>
                  </div>
                  <input
                    onFocus={() => (this.isInputFocused = true)}
                    onBlur={() => (this.isInputFocused = false)}
                    disabled={this.disableForm()}
                    type="text"
                    class="form-control pl-0 input-sm rate-input py-0 m-0 rounded-0 rateInputBorder"
                    value={this.renderRate()}
                    id={v4()}
                    placeholder={locales.entries.Lcz_Rate || 'Rate'}
                    onInput={(event: InputEvent) => this.handleInput(event)}
                  />
                  {/* <span class="currency">{getCurrencySymbol(this.currency.code)}</span> */}
                </fieldset>
                <fieldset class="position-relative m-0 total-nights-container p-0 ">
                  <select
                    disabled={this.disableForm()}
                    class="form-control input-sm m-0 nightBorder rounded-0 m-0  py-0"
                    id={v4()}
                    onChange={evt => this.handleDataChange('rateType', evt)}
                  >
                    {this.ratePricingMode.map(data => (
                      <option value={data.CODE_NAME} selected={this.selectedData.rateType === +data.CODE_NAME}>
                        {data.CODE_VALUE_EN}
                      </option>
                    ))}
                  </select>
                </fieldset>
              </div>

              {this.bookingType === 'PLUS_BOOKING' || this.bookingType === 'ADD_ROOM' ? (
                <div class="flex-fill  mt-lg-0 ml-1 m-0 mt-md-0 p-0">
                  <fieldset class="position-relative">
                    <select
                      disabled={this.selectedData.rate === 0 || this.disableForm()}
                      class="form-control input-sm"
                      id={v4()}
                      onChange={evt => this.handleDataChange('totalRooms', evt)}
                    >
                      {Array.from({ length: this.totalAvailableRooms + 1 }, (_, i) => i).map(i => (
                        <option value={i} selected={this.selectedData.totalRooms === i}>
                          {i}
                        </option>
                      ))}
                    </select>
                  </fieldset>
                </div>
              ) : null}
            </div>

            {this.bookingType === 'EDIT_BOOKING' ? (
              <Fragment>
                <div class=" m-0 p-0  mt-lg-0  ml-md-1 mt-md-1 d-none d-md-block">
                  <fieldset class="position-relative">
                    <input
                      disabled={this.disableForm()}
                      type="radio"
                      name="ratePlanGroup"
                      value="1"
                      onChange={evt => this.handleDataChange('totalRooms', evt)}
                      checked={this.selectedData.totalRooms === 1}
                    />
                  </fieldset>
                </div>
                <button
                  disabled={this.selectedData.rate === -1 || this.disableForm()}
                  type="button"
                  class="btn btn-primary booking-btn mt-lg-0 btn-sm ml-md-1  mt-1 d-md-none "
                  onClick={() => this.bookProperty()}
                >
                  {this.selectedData.totalRooms === 1 ? locales.entries.Lcz_Current : locales.entries.Lcz_Select}
                </button>
              </Fragment>
            ) : null}

            {this.bookingType === 'BAR_BOOKING' || this.bookingType === 'SPLIT_BOOKING' ? (
              <button
                disabled={this.selectedData.rate === -1 || this.disableForm() || (this.bookingType === 'SPLIT_BOOKING' && this.isBookDisabled)}
                type="button"
                class="btn btn-primary booking-btn mt-lg-0 btn-sm ml-md-1  mt-1 "
                onClick={() => this.bookProperty()}
              >
                {locales.entries.Lcz_Book}
              </button>
            ) : null}
          </div>
        </div>
      </Host>
    );
  }
}

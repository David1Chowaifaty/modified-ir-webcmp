import { Component, Host, Prop, h, State, Event, EventEmitter, Watch, Fragment } from '@stencil/core';
import { v4 } from 'uuid';
import { getCurrencySymbol } from '../../../utils/utils';
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
  @Prop() dateDifference: number;
  @Prop() bookingType: string = 'PLUS_BOOKING';
  @Prop() fullyBlocked: boolean;
  @Event() dataUpdateEvent: EventEmitter<{ [key: string]: any }>;
  @Event() gotoSplitPageTwoEvent: EventEmitter<{ [key: string]: any }>;
  @State() selectedData: { [key: string]: any };
  private initialRateValue: number = 0;
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
    this.updateSelectedRatePlan(this.ratePlanData);
  }
  disableForm() {
    return this.selectedData.is_closed || this.totalAvailableRooms === 0;
  }
  getSelectedOffering(value: any) {
    return this.ratePlanData.variations.find(variation => variation.adult_child_offering === value);
  }

  updateSelectedRatePlan(data) {
    this.selectedData = {
      ratePlanId: data.id,
      adult_child_offering: data.variations[data.variations.length - 1].adult_child_offering,
      rateType: 1,
      totalRooms: 0,
      rate: data.variations[data.variations.length - 1].amount,
      ratePlanName: data.name,
      adultCount: data.variations[data.variations.length - 1].adult_nbr,
      childrenCount: data.variations[data.variations.length - 1].child_nbr,
      cancelation: data.cancelation,
      guarantee: data.guarantee,
      isRateModified: false,
      defaultSelectedRate: 0,
      index: this.index,
      is_closed: data.is_closed,
      physicalRooms: this.getAvailableRooms(data.assignable_units),
    };
    if (this.defaultData) {
      for (const [key, value] of Object.entries(this.defaultData)) {
        this.selectedData[key] = value;
      }
      this.dataUpdateEvent.emit({
        key: 'roomRatePlanUpdate',
        changedKey: 'totalRooms',
        data: this.selectedData,
      });
    }
    //
    this.initialRateValue = this.selectedData.rate / this.dateDifference;
  }
  @Watch('ratePlanData')
  async ratePlanDataChanged(newData) {
    this.selectedData = {
      ...this.selectedData,
      adult_child_offering: newData.variations[newData.variations.length - 1].adult_child_offering,
      adultCount: newData.variations[newData.variations.length - 1].adult_nbr,
      childrenCount: newData.variations[newData.variations.length - 1].child_nbr,
      rate: this.handleRateDaysUpdate(),
      physicalRooms: this.getAvailableRooms(newData.assignable_units),
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
    let inputValue = inputElement.value.replace(/[^0-9]/g, '');

    if (inputValue !== inputElement.value) {
      inputElement.value = inputValue;
    }

    if (inputValue) {
      this.selectedData.isRateModified = true;
      this.handleDataChange('rate', event);
    } else {
      this.selectedData = {
        ...this.selectedData,
        rate: 0,
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
    const numericValue = value === '' ? 0 : parseInt(value);
    this.selectedData = {
      ...this.selectedData,
      rate: numericValue,
      totalRooms: value === '' ? 0 : this.selectedData.totalRooms,
      defaultSelectedRate: this.selectedData.rateType === 1 ? numericValue / this.dateDifference : numericValue,
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
      return this.selectedData.rate;
    }
    return this.selectedData.rateType === 1 ? this.selectedData.rate : this.initialRateValue;
  }
  render() {
    return (
      <Host>
        <div class="d-flex flex-column mt-2 m-0 p-0 flex-lg-row align-items-lg-center justify-content-lg-between ">
          <div class=" rateplan-name-container">
            <span>{this.ratePlanData.name}</span>
            <ir-tooltip message={this.ratePlanData.cancelation + this.ratePlanData.guarantee}></ir-tooltip>
          </div>

          <div class={'d-md-flex justify-content-md-end  align-items-md-center  flex-fill rateplan-container'}>
            <div class="mt-1 mt-lg-0 flex-fill max-w-300">
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
            <div class={'m-0 p-0 d-md-flex justify-content-between ml-md-1 '}>
              <div class=" d-flex mt-1  mt-lg-0 m-0 p-0 rate-total-night-view   ">
                <fieldset class="position-relative has-icon-left m-0 p-0 rate-input-container  ">
                  <input
                    disabled={this.disableForm()}
                    type="text"
                    class="form-control input-sm rate-input py-0 m-0 rounded-0 rateInputBorder"
                    value={this.renderRate()}
                    id={v4()}
                    placeholder="Rate"
                    onInput={(event: InputEvent) => this.handleInput(event)}
                  />
                  <span class="currency">{getCurrencySymbol(this.currency.code)}</span>
                </fieldset>
                <fieldset class="position-relative m-0 total-nights-container p-0 ">
                  <select
                    disabled={this.disableForm()}
                    class="form-control input-sm m-0 nightBorder rounded-0  py-0"
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
                <div class="flex-lg-fill  mt-lg-0 ml-md-2 m-0 mt-1 p-0">
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
                  disabled={this.selectedData.rate === 0 || this.disableForm()}
                  type="button"
                  class="btn btn-primary booking-btn mt-lg-0 btn-sm ml-md-1  mt-1 d-md-none "
                  onClick={() => this.bookProperty()}
                >
                  {this.selectedData.totalRooms === 1 ? 'Current' : 'Select'}
                </button>
              </Fragment>
            ) : null}

            {this.bookingType === 'BAR_BOOKING' || this.bookingType === 'SPLIT_BOOKING' ? (
              <button
                disabled={this.selectedData.rate === 0 || this.disableForm()}
                type="button"
                class="btn btn-primary booking-btn mt-lg-0 btn-sm ml-md-1  mt-1 "
                onClick={() => this.bookProperty()}
              >
                Book
              </button>
            ) : null}
          </div>
        </div>
      </Host>
    );
  }
}

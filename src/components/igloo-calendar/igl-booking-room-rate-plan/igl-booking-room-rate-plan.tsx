import { Component, Host, Prop, h, State, Event, EventEmitter, Watch } from '@stencil/core';
import { v4 } from 'uuid';
import { getCurrencySymbol } from '../../../utils/utils';
@Component({
  tag: 'igl-booking-room-rate-plan',
  styleUrl: 'igl-booking-room-rate-plan.css',
  scoped: true,
})
export class IglBookingRoomRatePlan {
  @Prop({ reflect: true, mutable: true }) defaultData: { [key: string]: any };
  @Prop({ mutable: true }) ratePlanData: { [key: string]: any };
  @Prop({ reflect: true, mutable: true }) totalAvailableRooms: number;
  @Prop({ reflect: true, mutable: true }) ratePricingMode = [];
  @Prop({ reflect: true, mutable: true }) currency: any;
  @Prop({ reflect: true }) dateDifference: number;
  @Prop({ reflect: true, mutable: true }) bookingType: string = 'PLUS_BOOKING';
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
    this.selectedData = {
      ratePlanId: this.ratePlanData.id,
      adult_child_offering: this.ratePlanData.variations[0].adult_child_offering,
      rateType: 1,
      totalRooms: 0,
      rate: this.ratePlanData.variations[0].amount,
      ratePlanName: this.ratePlanData.name,
      adultCount: this.ratePlanData.variations[0].adult_nbr,
      childrenCount: this.ratePlanData.variations[0].child_nbr,
      cancelation: this.ratePlanData.cancelation,
      guarantee: this.ratePlanData.guarantee,
      isRateModified: false,
      defaultSelectedRate: 0,
      is_closed: this.ratePlanData.is_closed,
      physicalRooms: this.getAvailableRooms(this.ratePlanData.assignable_units),
    };
    if (this.defaultData) {
      for (const [key, value] of Object.entries(this.defaultData)) {
        this.selectedData[key] = value;
      }
    }
    this.initialRateValue = this.selectedData.rate / this.dateDifference;
  }
  disableForm() {
    return this.selectedData.is_closed || this.totalAvailableRooms === undefined;
  }

  getSelectedOffering(value: any) {
    return this.ratePlanData.variations.find(variation => variation.adult_child_offering === value);
  }
  @Watch('ratePlanData')
  async ratePlanDataChanged() {
    this.selectedData = {
      ...this.selectedData,
      rate: this.handleRateDaysUpdate(),
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
        <div class="row m-0 p-0">
          <div class="col-md-6 col-sm-12 p-0 align-self-center">
            <span>{this.ratePlanData.name}</span>
            <ir-tooltip message={this.ratePlanData.cancelation + this.ratePlanData.guarantee}></ir-tooltip>
          </div>
          <div class="col-md-6 col-sm-12 row pr-0">
            <div class="col-4">
              <fieldset class="position-relative">
                <select disabled={this.disableForm()} class="form-control input-sm" id={v4()} onChange={evt => this.handleDataChange('adult_child_offering', evt)}>
                  {this.ratePlanData.variations.map(variation => (
                    <option value={variation.adult_child_offering} selected={this.selectedData.adult_child_offering === variation.adult_child_offering}>
                      {variation.adult_child_offering}
                    </option>
                  ))}
                </select>
              </fieldset>
            </div>
            <div class="row col-6 m-0 p-0">
              <fieldset class="position-relative has-icon-left col-6 m-0 p-0">
                <input
                  disabled={this.disableForm()}
                  type="text"
                  class="form-control input-sm"
                  value={this.renderRate()}
                  id={v4()}
                  placeholder="Rate"
                  onInput={(event: InputEvent) => this.handleInput(event)}
                />
                <span class="form-control-position">{getCurrencySymbol(this.currency.code)}</span>
              </fieldset>
              <fieldset class="position-relative m-0 p-0">
                <select disabled={this.disableForm()} class="form-control input-sm" id={v4()} onChange={evt => this.handleDataChange('rateType', evt)}>
                  {this.ratePricingMode.map(data => (
                    <option value={data.CODE_NAME} selected={this.selectedData.rateType === +data.CODE_NAME}>
                      {data.CODE_VALUE_EN}
                    </option>
                  ))}
                </select>
              </fieldset>
            </div>

            {this.bookingType === 'PLUS_BOOKING' || this.bookingType === 'ADD_ROOM' ? (
              <div class="col-2 m-0 p-0">
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

            {this.bookingType === 'EDIT_BOOKING' ? (
              <div class="col-2 m-0 p-0 align-self-center">
                <fieldset class="position-relative">
                  <input type="radio" name="ratePlanGroup" value="1" onChange={evt => this.handleDataChange('totalRooms', evt)} checked={this.selectedData.totalRooms === 1} />
                </fieldset>
              </div>
            ) : null}

            {this.bookingType === 'BAR_BOOKING' || this.bookingType === 'SPLIT_BOOKING' ? (
              <button disabled={this.selectedData.rate === 0} type="button" class="btn mb-1 btn-primary btn-sm" onClick={() => this.bookProperty()}>
                Book
              </button>
            ) : null}
          </div>
        </div>
      </Host>
    );
  }
}

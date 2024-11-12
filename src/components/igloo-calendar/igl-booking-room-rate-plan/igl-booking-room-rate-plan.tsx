import { Component, Host, Prop, h, State, Event, EventEmitter, Fragment } from '@stencil/core';
import { v4 } from 'uuid';
import locales from '@/stores/locales.store';
import calendar_data from '@/stores/calendar-data';
import { RatePlan, Variation } from '@/models/property';
import booking_store, { IRatePlanSelection, reserveRooms, updateRoomParams } from '@/stores/booking.store';
@Component({
  tag: 'igl-booking-room-rate-plan',
  styleUrl: 'igl-booking-room-rate-plan.css',
  scoped: true,
})
export class IglBookingRoomRatePlan {
  // @Prop() defaultData: { [key: string]: any };
  @Prop() ratePlan: RatePlan;
  @Prop() roomTypeId: number;
  @Prop() totalAvailableRooms: number;
  @Prop() roomTypeInventory: number;
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
  @Prop() visibleInventory?:
    | IRatePlanSelection
    | {
        reserved: number;
        visibleInventory?: number;
        selected_variation: Variation;
        // view_mode: 'stay' | 'night';
      };
  @Prop() is_bed_configuration_enabled: boolean;

  @State() isInputFocused = false;
  @State() ratePlanChangedState: boolean = false;

  // @Event() dataUpdateEvent: EventEmitter<{ [key: string]: any }>;
  @Event() gotoSplitPageTwoEvent: EventEmitter<{ [key: string]: any }>;

  getAvailableRooms(assignable_units: any[]) {
    let result = [];
    assignable_units?.forEach(unit => {
      if (unit.Is_Fully_Available) {
        result.push({ name: unit.name, id: unit.pr_id });
      }
    });
    return result;
  }

  disableForm() {
    if (this.bookingType === 'EDIT_BOOKING' && this.shouldBeDisabled) {
      return false;
    } else {
      return (
        !this.ratePlan.is_available_to_book ||
        // this.selectedData.is_closed ||
        this.visibleInventory.visibleInventory === 0 ||
        // this.totalAvailableRooms === 0 ||
        !calendar_data.is_frontdesk_enabled
      );
    }
  }

  private generateAdultChildOfferingValue(variation) {
    // return `${variation.adult_nbr}a_${variation.child_nbr}_c`;
    return this.formatVariation(variation);
  }
  private getSelectedOffering(value: any) {
    return this.ratePlan.variations.find(variation => this.generateAdultChildOfferingValue(variation) === value);
  }

  handleRateDaysUpdate() {
    // if (this.selectedData.isRateModified) {
    //   return this.selectedData.defaultSelectedRate;
    // }
    // const selectedOffering = this.getSelectedOffering(this.selectedData.adult_child_offering);
    // return selectedOffering ? selectedOffering.discounted_amount : 0;
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
      // this.selectedData.isRateModified = true;
      // this.handleDataChange('rate', event);
    } else {
      // this.selectedData = {
      //   ...this.selectedData,
      //   rate: -1,
      //   totalRooms: 0,
      // };
      // this.dataUpdateEvent.emit({
      //   key: 'roomRatePlanUpdate',
      //   changedKey: 'rate',
      //   data: this.selectedData,
      // });
    }
  }

  handleDataChange(key, evt) {
    const value = evt.target.value;
    switch (key) {
      case 'adult_child_offering':
        console.log('adult child offering=>', value);
        this.updateOffering(value);
        this.handleVariationChange(value);
        break;
      case 'rate':
        break;
      default:
        reserveRooms(this.roomTypeId, this.ratePlan.id, Number(value));
        break;
    }
    // this.dataUpdateEvent.emit({
    //   key: 'roomRatePlanUpdate',
    //   changedKey: key,
    //   data: this.selectedData,
    // });
  }

  updateOffering(value) {
    const offering = this.getSelectedOffering(value);
    if (offering) {
      // this.selectedData = {
      //   ...this.selectedData,
      //   adult_child_offering: value,
      //   adultCount: offering.adult_nbr,
      //   childrenCount: offering.child_nbr,
      //   rate: offering.amount,
      //   isRateModified: false,
      // };
    }
  }

  bookProperty() {
    // this.dataUpdateEvent.emit({ key: 'clearData', data: this.selectedData });
    this.handleDataChange('totalRooms', { target: { value: '1' } });
    this.gotoSplitPageTwoEvent.emit({ key: 'gotoSplitPage', data: '' });
  }

  renderRate(): string | number | string[] {
    // if (this.selectedData.isRateModified) {
    //   console.log('selectedData.rate', this.selectedData.rate);
    //   return this.selectedData.rate === -1 ? '' : this.selectedData.rate;
    // }
    // return this.selectedData.rateType === 1 ? Number(this.selectedData.rate).toFixed(2) : Number(this.selectedData.rate / this.dateDifference).toFixed(2);
    return this.visibleInventory?.selected_variation?.discounted_amount?.toString();
  }
  private formatVariation(v: Variation): any {
    const adults = `${v?.adult_nbr} ${v?.adult_nbr === 1 ? locales.entries['Lcz_Adult']?.toLowerCase() : locales.entries['Lcz_Adults']?.toLowerCase()}`;
    const children =
      v?.child_nbr > 0 ? `${v?.child_nbr}  ${v?.child_nbr > 1 ? locales.entries['Lcz_Children']?.toLowerCase() : locales.entries['Lcz_Child']?.toLowerCase()}` : null;
    return children ? `${adults} ${children}` : adults;
  }
  private getTooltipMessages() {
    const selectedRatePlan = this.ratePlan?.variations?.find(
      variation => this.visibleInventory.selected_variation?.adult_child_offering === this.generateAdultChildOfferingValue(variation),
    );
    if (!selectedRatePlan) {
      return;
    }
    const cancellationMessage = selectedRatePlan.applicable_policies?.find(p => p.type === 'cancelation')?.combined_statement;
    const guaranteeMessage = selectedRatePlan.applicable_policies?.find(p => p.type === 'guarantee')?.combined_statement;
    if (cancellationMessage && guaranteeMessage) {
      return `<b><u>Cancellation:</u></b> ${cancellationMessage}<br/><b><u>Guarantee:</u></b> ${guaranteeMessage}`;
    }
    if (!cancellationMessage && guaranteeMessage) {
      return guaranteeMessage;
    }
    return cancellationMessage;
  }
  //-------------------------------------------------------------

  private async handleVariationChange(value: string) {
    const variations = this.ratePlan.variations;
    const index = variations.findIndex(v => value === this.formatVariation(v));
    let selectedVariation = variations[index];
    if (!selectedVariation) {
      return;
    }
    selectedVariation = booking_store.roomTypes.find(rt => rt.id === this.roomTypeId).rateplans.find(rp => rp.id === this.ratePlan.id).variations[index];
    updateRoomParams({ params: { selected_variation: selectedVariation }, ratePlanId: this.ratePlan.id, roomTypeId: this.roomTypeId });
  }

  // ---------------------------------------------
  render() {
    return (
      <Host>
        <div
          class={`d-flex m-0 p-0 ${
            this.ratePlan.is_available_to_book ? 'flex-column flex-lg-row align-items-lg-center justify-content-lg-between' : 'align-items-center justify-content-between'
          }`}
        >
          <div class="rateplan-name-container">
            {this.bookingType === 'BAR_BOOKING' ? (
              <Fragment>
                <span class="font-weight-bold	">{this.ratePlan.name.split('/')[0]}</span>
                <span>/{this.ratePlan.name.split('/')[1]}</span>
              </Fragment>
            ) : (
              <span>{this.ratePlan.short_name}</span>
            )}
            {this.ratePlan.is_available_to_book && <ir-tooltip message={this.getTooltipMessages()}></ir-tooltip>}
          </div>

          {this.ratePlan.is_available_to_book ? (
            <div class={'d-md-flex justify-content-md-end  align-items-md-center flex-fill rateplan-container'}>
              <div class="mt-1 mt-md-0 flex-fill max-w-300">
                <fieldset class="position-relative">
                  <select disabled={this.disableForm()} class="form-control  input-sm" id={v4()} onChange={evt => this.handleDataChange('adult_child_offering', evt)}>
                    {this.ratePlan.variations.map(variation => (
                      <option
                        value={this.generateAdultChildOfferingValue(variation)}
                        selected={this.generateAdultChildOfferingValue(this.visibleInventory.selected_variation) === this.generateAdultChildOfferingValue(variation)}
                      >
                        {this.formatVariation(variation)}
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
                        {/* {getCurrencySymbol(this.currency.code)} */}
                        {this.currency.symbol}
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
                  {/* TODO: fix this code */}
                  <fieldset class="position-relative m-0 total-nights-container p-0 ">
                    <select
                      disabled={this.disableForm()}
                      class="form-control input-sm m-0 nightBorder rounded-0 m-0  py-0"
                      id={v4()}
                      onChange={evt => this.handleDataChange('rateType', evt)}
                    >
                      {this.ratePricingMode.map(data => (
                        <option value={data.CODE_NAME} selected={0 === +data.CODE_NAME}>
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
                        // disabled={this.selectedData.rate === 0 || this.disableForm()}
                        class="form-control input-sm"
                        id={v4()}
                        onChange={evt => this.handleDataChange('totalRooms', evt)}
                      >
                        {Array.from({ length: this.visibleInventory?.visibleInventory + 1 }, (_, i) => i).map(i => (
                          <option value={i} selected={this.visibleInventory.reserved === i}>
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
                        // checked={this.selectedData.totalRooms === 1}
                      />
                    </fieldset>
                  </div>
                  <button
                    // disabled={this.selectedData.rate === -1 || this.disableForm()}
                    type="button"
                    class="btn btn-primary booking-btn mt-lg-0 btn-sm ml-md-1  mt-1 d-md-none "
                    onClick={() => this.bookProperty()}
                  >
                    {/* {this.selectedData.totalRooms === 1 ? locales.entries.Lcz_Current : locales.entries.Lcz_Select} */}
                  </button>
                </Fragment>
              ) : null}

              {this.bookingType === 'BAR_BOOKING' || this.bookingType === 'SPLIT_BOOKING' ? (
                <button
                  // disabled={this.selectedData.rate === -1 || this.disableForm() || (this.bookingType === 'SPLIT_BOOKING' && this.isBookDisabled)}
                  type="button"
                  class="btn btn-primary booking-btn mt-lg-0 btn-sm ml-md-1  mt-1 "
                  onClick={() => this.bookProperty()}
                >
                  {locales.entries.Lcz_Book}
                </button>
              ) : null}
            </div>
          ) : (
            <p class={'text-danger m-0 p-0'}>Not available</p>
          )}
        </div>
      </Host>
    );
  }
}

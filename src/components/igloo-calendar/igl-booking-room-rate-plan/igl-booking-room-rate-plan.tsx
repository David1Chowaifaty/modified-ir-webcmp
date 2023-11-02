import {
  Component,
  Host,
  Prop,
  h,
  State,
  Event,
  EventEmitter,
  Watch,
} from "@stencil/core";
import { v4 } from "uuid";
import { getCurrencySymbol } from "../../../utils/utils";
@Component({
  tag: "igl-booking-room-rate-plan",
  styleUrl: "igl-booking-room-rate-plan.css",
  scoped: true,
})
export class IglBookingRoomRatePlan {
  @Prop() defaultData: { [key: string]: any };
  @Prop({ mutable: true }) ratePlanData: { [key: string]: any };
  @Prop() totalAvailableRooms: number;
  @Prop() ratePricingMode = [];
  @Prop() currency: any;
  @Prop({ reflect: true }) dateDifference: number;
  @Prop() bookingType: string = "PLUS_BOOKING";
  @State() sourceOption: number;
  @Event() dataUpdateEvent: EventEmitter<{ [key: string]: any }>;
  @Event() gotoSplitPageTwoEvent: EventEmitter<{ [key: string]: any }>;
  @State() selectedData: { [key: string]: any };
  @State() plan: { [key: string]: any };
  componentWillLoad() {
    this.selectedData = {
      ratePlanId: this.ratePlanData.id,
      adult_child_offering:
        this.ratePlanData.variations[0].adult_child_offering,
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
    };
    if (this.defaultData) {
      for (const [key, value] of Object.entries(this.defaultData)) {
        this.selectedData[key] = value;
      }
    }
  }

  getSelectedOffering(value: any) {
    return this.ratePlanData.variations.find(
      (variation) => variation.adult_child_offering === value
    );
  }
  @Watch("ratePlanData")
  async ratePlanDataChanged() {
    this.selectedData = {
      ...this.selectedData,
      rate: this.handleRateDaysUpdate(),
    };
    this.dataUpdateEvent.emit({
      key: "roomRatePlanUpdate",
      changedKey: "rate",
      data: this.selectedData,
    });
  }

  handleRateDaysUpdate() {
    let rate = this.selectedData.defaultSelectedRate;
    if (this.selectedData.isRateModified) {
      return this.selectedData.rateType === 1
        ? rate * this.dateDifference
        : rate;
    }
    return this.getSelectedOffering(this.selectedData.adult_child_offering)
      .amount;
  }

  handleInput(event: InputEvent) {
    this.selectedData.isRateModified = true;
    const inputElement = event.target as HTMLInputElement;
    let inputValue = inputElement.value;
    const numericRegex = /^[0-9]+$/;
    if (!numericRegex.test(inputValue)) {
      inputValue = inputValue.replace(/[^0-9]/g, "");
      inputElement.value = inputValue;
    }
    if (inputValue === inputElement.value) {
      this.handleDataChange("rate", event);
    }
  }

  handleDataChange(key, evt) {
    if (key === "adult_child_offering") {
      const offering = this.getSelectedOffering(evt.target.value);
      this.selectedData = {
        ...this.selectedData,
        [key]: evt.target.value,
        adultCount: offering.adult_nbr,
        childrenCount: offering.child_nbr,
        rate: offering.amount,
      };
    } else {
      this.selectedData = {
        ...this.selectedData,
        [key]: evt.target.value === "" ? 0 : parseInt(evt.target.value),
      };
    }
    if (key === "rate" && evt.target.value === "") {
      this.selectedData = {
        ...this.selectedData,
        totalRooms: 0,
      };
    }
    if (key === "rate") {
      this.selectedData.defaultSelectedRate =
        this.selectedData.rateType === 1
          ? parseInt(evt.target.value) / this.dateDifference
          : parseInt(evt.target.value);
    }
    this.dataUpdateEvent.emit({
      key: "roomRatePlanUpdate",
      changedKey: key,
      data: this.selectedData,
    });
  }

  bookProperty() {
    this.dataUpdateEvent.emit({ key: "clearData", data: this.selectedData });
    this.handleDataChange("totalRooms", { target: { value: "1" } });
    this.gotoSplitPageTwoEvent.emit({ key: "gotoSplitPage", data: "" });
  }

  render() {
    return (
      <Host>
        <div class="row m-0 p-0">
          <div class="col-md-6 col-sm-12 p-0 align-self-center">
            <span>{this.ratePlanData.name}</span>
            <ir-tooltip
              message={
                this.ratePlanData.cancelation + this.ratePlanData.guarantee
              }
            ></ir-tooltip>
          </div>
          <div class="col-md-6 col-sm-12 row pr-0">
            <div class="col-4">
              <fieldset class="position-relative">
                <select
                  class="form-control input-sm"
                  id={v4()}
                  onChange={(evt) =>
                    this.handleDataChange("adult_child_offering", evt)
                  }
                >
                  {this.ratePlanData.variations.map((variation) => (
                    <option
                      value={variation.adult_child_offering}
                      selected={
                        this.selectedData.adultCount ===
                        variation.adult_child_offering
                      }
                    >
                      {variation.adult_child_offering}
                    </option>
                  ))}
                </select>
              </fieldset>
            </div>
            <div class="row col-6 m-0 p-0">
              <fieldset class="position-relative has-icon-left col-6 m-0 p-0">
                <input
                  type="text"
                  class="form-control input-sm"
                  value={
                    this.selectedData.rateType === 1
                      ? this.selectedData.rate
                      : this.selectedData.rate / this.dateDifference
                  }
                  id={v4()}
                  placeholder="Rate"
                  onInput={(event: InputEvent) => this.handleInput(event)}
                />
                <span class="form-control-position">
                  {getCurrencySymbol(this.currency.code)}
                </span>
              </fieldset>
              <fieldset class="position-relative m-0 p-0">
                <select
                  class="form-control input-sm"
                  id={v4()}
                  onChange={(evt) => this.handleDataChange("rateType", evt)}
                >
                  {this.ratePricingMode.map((data) => (
                    <option
                      value={data.CODE_NAME}
                      selected={this.selectedData.rateType === +data.CODE_NAME}
                    >
                      {data.CODE_VALUE_EN}
                    </option>
                  ))}
                </select>
              </fieldset>
            </div>

            {this.bookingType === "PLUS_BOOKING" ||
            this.bookingType === "ADD_ROOM" ? (
              <div class="col-2 m-0 p-0">
                <fieldset class="position-relative">
                  <select
                    disabled={this.selectedData.rate === 0}
                    class="form-control input-sm"
                    id={v4()}
                    onChange={(evt) => this.handleDataChange("totalRooms", evt)}
                  >
                    {Array.from(
                      { length: this.totalAvailableRooms + 1 },
                      (_, i) => i
                    ).map((i) => (
                      <option
                        value={i}
                        selected={this.selectedData.totalRooms === i}
                      >
                        {i}
                      </option>
                    ))}
                  </select>
                </fieldset>
              </div>
            ) : null}

            {this.bookingType === "EDIT_BOOKING" ? (
              <div class="col-2 m-0 p-0 align-self-center">
                <fieldset class="position-relative">
                  <input
                    type="radio"
                    name="ratePlanGroup"
                    value="1"
                    onChange={(evt) => this.handleDataChange("totalRooms", evt)}
                    checked={this.selectedData.totalRooms === 1}
                  />
                </fieldset>
              </div>
            ) : null}

            {this.bookingType === "BAR_BOOKING" ||
            this.bookingType === "SPLIT_BOOKING" ? (
              <button
                disabled={this.selectedData.rate === 0}
                type="button"
                class="btn mb-1 btn-primary btn-sm"
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

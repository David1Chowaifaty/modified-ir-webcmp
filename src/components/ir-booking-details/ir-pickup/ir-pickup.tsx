import calendar_data from '@/stores/calendar-data';
import locales from '@/stores/locales.store';
import { Component, Element, Event, EventEmitter, Prop, State, h } from '@stencil/core';
import { TPickupData } from './types';
import moment from 'moment';
import { PickupService } from './pickup.service';
import { IBookingPickupInfo } from '@/models/booking.dto';
import { MaskedRange } from 'imask';
import { AllowedOption } from '@/models/property-types';

@Component({
  tag: 'ir-pickup',
  styleUrls: ['ir-pickup.css', '../../../common/sheet.css'],
  scoped: true,
})
export class IrPickup {
  @Element() el: HTMLElement;

  @Prop() defaultPickupData: IBookingPickupInfo | null;
  @Prop() numberOfPersons: number = 0;
  @Prop() bookingNumber: string;
  @Prop() bookingDates: { from: string; to: string };

  @State() isLoading = false;
  @State() allowedOptionsByLocation: AllowedOption[] = [];
  @State() pickupData: TPickupData = {
    location: -1,
    flight_details: '',
    due_upon_booking: '',
    number_of_vehicles: 1,
    vehicle_type_code: '',
    currency: undefined,
    arrival_time: '',
    arrival_date: null,
    selected_option: undefined,
  };
  @State() vehicleCapacity: number[] = [];
  @State() cause: keyof TPickupData | null = null;
  @State() errors: Record<string, boolean>;
  @State() autoValidate = false;

  @Event() closeModal: EventEmitter<null>;
  @Event() resetBookingEvt: EventEmitter<null>;

  private pickupService = new PickupService();
  private pickupSchema;

  private arrival_time_mask = {
    mask: 'HH:mm',
    blocks: {
      HH: {
        mask: MaskedRange,
        from: 0,
        to: 23,
        placeholderChar: 'H',
      },
      mm: {
        mask: MaskedRange,
        from: 0,
        to: 59,
        placeholderChar: 'm',
      },
    },
    lazy: false,
    placeholderChar: '_',
  };

  componentWillLoad() {
    if (this.defaultPickupData) {
      const transformedData = this.pickupService.transformDefaultPickupData(this.defaultPickupData);
      this.vehicleCapacity = this.pickupService.getNumberOfVehicles(transformedData.selected_option.vehicle.capacity, this.numberOfPersons);
      this.allowedOptionsByLocation = calendar_data.property.pickup_service.allowed_options.filter(option => option.location.id === transformedData.location);
      this.pickupData = { ...transformedData };
    }
    this.pickupSchema = this.pickupService.createPickupSchema(this.bookingDates.from, this.bookingDates.to);
  }
  private handleLocationChange(event: CustomEvent) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    const value = event.detail;
    if (value === '') {
      this.updatePickupData('location', -1);
    }
    if (value !== '') {
      this.allowedOptionsByLocation = calendar_data.property.pickup_service.allowed_options.filter(option => option.location.id.toString() === value);
      let locationChoice = this.allowedOptionsByLocation[0];
      if (!locationChoice) {
        return;
      }
      locationChoice.currency;
      this.vehicleCapacity = this.pickupService.getNumberOfVehicles(locationChoice.vehicle.capacity, this.numberOfPersons);
      this.pickupData = {
        ...this.pickupData,
        location: value,
        selected_option: locationChoice,
        number_of_vehicles: this.vehicleCapacity[0],
        due_upon_booking: this.pickupService
          .updateDue({
            amount: locationChoice.amount,
            code: locationChoice.pricing_model.code,
            numberOfPersons: this.numberOfPersons,
            number_of_vehicles: this.vehicleCapacity[0],
          })
          .toFixed(2),
        vehicle_type_code: locationChoice.vehicle.code,
        currency: locationChoice.currency,
        // number_of_vehicles:this.pickupService
      };
    }
  }

  private handleVehicleQuantityChange(e: CustomEvent) {
    if (e.detail === '') {
      return;
    }
    const value = +e.detail;
    this.pickupData = {
      ...this.pickupData,
      number_of_vehicles: value,
      due_upon_booking: this.pickupService
        .updateDue({
          amount: this.pickupData.selected_option.amount,
          code: this.pickupData.selected_option.pricing_model.code,
          numberOfPersons: this.numberOfPersons,
          number_of_vehicles: value,
        })
        .toFixed(2),
    };
  }

  private handleVehicleTypeChange(e: CustomEvent) {
    if (e.detail === '') {
      this.pickupData = {
        ...this.pickupData,
        due_upon_booking: '',
        vehicle_type_code: '',
      };
      return;
    }
    let locationChoice = calendar_data.property.pickup_service.allowed_options.find(option => option.location.id === +this.pickupData.location && option.vehicle.code === e.detail);
    if (!locationChoice) {
      return;
    }
    this.vehicleCapacity = [...this.pickupService.getNumberOfVehicles(locationChoice.vehicle.capacity, this.numberOfPersons)];
    this.pickupData = {
      ...this.pickupData,
      selected_option: locationChoice,
      number_of_vehicles: this.vehicleCapacity[0],
      due_upon_booking: this.pickupService
        .updateDue({
          amount: locationChoice.amount,
          code: locationChoice.pricing_model.code,
          numberOfPersons: this.numberOfPersons,
          number_of_vehicles: this.vehicleCapacity[0],
        })
        .toFixed(2),
      vehicle_type_code: locationChoice.vehicle.code,
    };
  }

  private updatePickupData(key: keyof TPickupData, value: any) {
    this.pickupData = { ...this.pickupData, [key]: value };
  }
  private async savePickup() {
    try {
      this.isLoading = true;
      this.autoValidate = true;
      if (this.errors) {
        this.errors = null;
      }
      this.errors = this.pickupService.validateForm(this.pickupData, this.pickupSchema);
      if (this.errors) {
        return;
      }
      await this.pickupService.savePickup(this.pickupData, this.bookingNumber, this.defaultPickupData !== null && this.pickupData.location === -1);
      this.resetBookingEvt.emit(null);
      this.closeModal.emit(null);
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }
  render() {
    return (
      <form
        class={'sheet-container'}
        onSubmit={async e => {
          e.preventDefault();
          await this.savePickup();
        }}
      >
        <ir-title class="px-1 sheet-header" onCloseSideBar={() => this.closeModal.emit(null)} label={locales.entries.Lcz_Pickup} displayContext="sidebar"></ir-title>
        <section class={'px-1 sheet-body'}>
          <ir-select
            testId="pickup_location"
            selectedValue={this.pickupData.location}
            selectContainerStyle="mb-1"
            onSelectChange={this.handleLocationChange.bind(this)}
            firstOption={locales.entries.Lcz_Pickup_NoThankYou}
            class={'m-0 mb-1'}
            data={this.pickupService.getAvailableLocations(locales.entries.Lcz_Pickup_YesFrom) as any}
          ></ir-select>
          {this.pickupData.location > 0 && (
            <div class="m-0 p-0" data-testid="pickup_body">
              {/*Date and Time Picker container */}
              <div class={'d-flex'}>
                {/*Date Picker */}
                <div class="form-group  mr-1">
                  <div class="input-group row m-0">
                    <div class={`input-group-prepend col-5 p-0 text-dark border-0`}>
                      <label class={`input-group-text  flex-grow-1 text-dark border-theme `}>{locales.entries.Lcz_ArrivalDate}</label>
                    </div>
                    <div class="form-control  form-control-md col-7 d-flex align-items-center px-0 mx-0" style={{ border: '0' }}>
                      <ir-date-picker
                        data-testid="pickup_arrival_date"
                        date={this.pickupData.arrival_date}
                        minDate={this.bookingDates.from}
                        maxDate={this.bookingDates?.to}
                        emitEmptyDate={true}
                        aria-invalid={this.errors?.arrival_date && !this.pickupData.arrival_date ? 'true' : 'false'}
                        onDateChanged={evt => {
                          this.updatePickupData('arrival_date', evt.detail.start?.format('YYYY-MM-DD'));
                        }}
                      >
                        <input
                          type="text"
                          slot="trigger"
                          value={this.pickupData.arrival_date ? moment(this.pickupData.arrival_date).format('MMM DD, YYYY') : null}
                          class={`form-control input-sm ${this.errors?.arrival_date && !this.pickupData.arrival_date ? 'border-danger' : ''} text-center`}
                          style={{ borderTopLeftRadius: '0', borderBottomLeftRadius: '0', width: '100%' }}
                        ></input>
                      </ir-date-picker>
                    </div>
                  </div>
                </div>
                {/*Time Picker */}
                <ir-input-text
                  autoValidate={this.autoValidate}
                  wrapKey="arrival_time"
                  testId="pickup_arrival_time"
                  error={this.errors?.arrival_time}
                  value={this.pickupData.arrival_time}
                  zod={this.pickupSchema.pick({ arrival_time: true })}
                  label={locales.entries.Lcz_Time}
                  inputStyles="col-sm-4"
                  data-state={this.cause === 'arrival_time' ? 'error' : ''}
                  mask={this.arrival_time_mask}
                  onTextChange={e => this.updatePickupData('arrival_time', e.detail)}
                ></ir-input-text>
              </div>
              <ir-input-text
                wrapKey="flight_details"
                zod={this.pickupSchema.pick({ flight_details: true })}
                autoValidate={this.autoValidate}
                testId="pickup_flight_details"
                value={this.pickupData.flight_details}
                label={locales.entries.Lcz_FlightDetails}
                onTextChange={e => this.updatePickupData('flight_details', e.detail)}
                placeholder=""
                error={this.errors?.flight_details}
              ></ir-input-text>
              <ir-select
                testId="pickup_vehicle_type_code"
                selectContainerStyle="mb-1"
                error={this.cause === 'vehicle_type_code'}
                onSelectChange={this.handleVehicleTypeChange.bind(this)}
                firstOption={locales.entries.Lcz_Select}
                selectedValue={this.pickupData.vehicle_type_code}
                class={'m-0'}
                data={
                  this.allowedOptionsByLocation.map(option => ({
                    text: option.vehicle.description,
                    value: option.vehicle.code,
                  })) as any
                }
              ></ir-select>
              <div class={'d-flex flex-column flex-md-row'}>
                <ir-select
                  showFirstOption={false}
                  testId="pickup_number_of_vehicles"
                  labelBorder="theme"
                  selectContainerStyle="mb-1"
                  onSelectChange={this.handleVehicleQuantityChange.bind(this)}
                  selectedValue={this.pickupData.number_of_vehicles}
                  error={this.cause === 'number_of_vehicles'}
                  labelWidth={7}
                  class={'m-0  mb-md-0 mr-md-1 flex-fill'}
                  label={locales.entries.Lcz_NbrOfVehicles}
                  data={
                    this.vehicleCapacity.map(i => ({
                      text: i,
                      value: i,
                    })) as any
                  }
                ></ir-select>
                {/* <ir-input-text
                  labelBorder="theme"
                  readonly
                  value={this.pickupData.due_upon_booking}
                  labelWidth={7}
                  label={`${locales.entries.Lcz_DueUponBooking}  ${this.pickupData.currency.symbol}`}
                  placeholder=""
                  class=""
                ></ir-input-text> */}
                <div class="price-input-container">
                  <ir-price-input readOnly label={`${locales.entries.Lcz_DueUponBooking}`} value={this.pickupData.due_upon_booking} currency={this.pickupData.currency.symbol} />
                </div>
              </div>
            </div>
          )}
        </section>
        <div class={'sheet-footer'}>
          <ir-button
            onClick={() => this.closeModal.emit(null)}
            btn_styles="justify-content-center"
            class={`flex-fill`}
            text={locales.entries.Lcz_Cancel}
            btn_color="secondary"
          ></ir-button>
          {(this.defaultPickupData || this.pickupData.location !== -1) && (
            <ir-button
              btn_styles="justify-content-center align-items-center"
              class={'flex-fill'}
              isLoading={this.isLoading}
              text={locales.entries.Lcz_Save}
              btn_color="primary"
              btn_type="submit"
            ></ir-button>
          )}
        </div>
      </form>
    );
  }
}

import calendar_data from '@/stores/calendar-data';
import locales from '@/stores/locales.store';
import { Component, Element, Event, EventEmitter, Prop, State, Watch, h } from '@stencil/core';
import { IAllowedOptions } from '@/models/calendarData';
import { PickupService } from '../pickup.service';
import { IBookingPickupInfo } from '@/models/booking.dto';
import { TPickupData } from '../types';
@Component({
  tag: 'ir-pickup-form',
  styleUrl: 'ir-pickup-form.css',
  scoped: true,
})
export class IrPickupForm {
  @Element() el: HTMLElement;

  @Prop() formId: string;
  @Prop() defaultPickupData: IBookingPickupInfo | null;
  @Prop() numberOfPersons: number = 0;
  @Prop() bookingNumber: string;
  @Prop() bookingDates: { from: string; to: string };

  @State() isLoading = false;
  @State() allowedOptionsByLocation: IAllowedOptions[] = [];
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
  @State() autoValidate = false;

  @Event() closeModal: EventEmitter<null>;
  @Event() canSubmitPickupChange: EventEmitter<boolean>;
  @Event() loadingChange: EventEmitter<boolean>;

  @Event({ bubbles: true, composed: true }) resetBookingEvt: EventEmitter<null>;

  private pickupService = new PickupService();
  private pickupSchema: ReturnType<PickupService['createPickupSchema']>;

  private get shouldRenderDetails() {
    return this.pickupData.location > 0;
  }

  private get isRemovalRequest() {
    return Boolean(this.defaultPickupData && this.pickupData.location === -1);
  }

  private get canSubmitPickup() {
    return this.defaultPickupData !== null || this.shouldRenderDetails;
  }

  // componentWillLoad() {
  //   if (this.defaultPickupData) {
  //     const transformedData = this.pickupService.transformDefaultPickupData(this.defaultPickupData);
  //     this.vehicleCapacity = this.pickupService.getNumberOfVehicles(transformedData.selected_option.vehicle.capacity, this.numberOfPersons);
  //     this.allowedOptionsByLocation = calendar_data.pickup_service.allowed_options.filter(option => option.location.id === transformedData.location);
  //     this.pickupData = { ...transformedData };
  //   }
  //   this.pickupSchema = this.pickupService.createPickupSchema(this.bookingDates.from, this.bookingDates.to, {
  //     allowRemoval: this.defaultPickupData !== null,
  //   });
  // }
  // Add this private field
  private lastCanSubmit = false;

  @Watch('defaultPickupData')
  @Watch('pickupData')
  handleSubmitPickupChange() {
    const next = this.canSubmitPickup;

    if (next !== this.lastCanSubmit) {
      this.lastCanSubmit = next;
      this.canSubmitPickupChange.emit(next);
    }
  }

  componentWillLoad() {
    if (this.defaultPickupData) {
      const transformedData = this.pickupService.transformDefaultPickupData(this.defaultPickupData);
      this.vehicleCapacity = this.pickupService.getNumberOfVehicles(transformedData.selected_option.vehicle.capacity, this.numberOfPersons);
      this.allowedOptionsByLocation = calendar_data.pickup_service.allowed_options.filter(option => option.location.id === transformedData.location);
      this.pickupData = { ...transformedData };
    }

    this.pickupSchema = this.pickupService.createPickupSchema(this.bookingDates.from, this.bookingDates.to, { allowRemoval: this.defaultPickupData !== null });

    // initialize canSubmit state for listeners
    this.lastCanSubmit = this.canSubmitPickup;
    this.canSubmitPickupChange.emit(this.lastCanSubmit);
  }
  private handleLocationChange(value: string) {
    if (value === '') {
      this.allowedOptionsByLocation = [];
      this.vehicleCapacity = [];
      this.updatePickupData('location', -1);
      return;
    }

    const numericValue = Number(value);
    this.allowedOptionsByLocation = calendar_data.pickup_service.allowed_options.filter(option => option.location.id === numericValue);
    const locationChoice = this.allowedOptionsByLocation[0];
    if (!locationChoice) {
      this.vehicleCapacity = [];
      this.pickupData = {
        ...this.pickupData,
        location: numericValue,
        selected_option: undefined,
        vehicle_type_code: '',
        number_of_vehicles: 1,
        due_upon_booking: '',
        currency: undefined,
      };
      return;
    }

    this.vehicleCapacity = this.pickupService.getNumberOfVehicles(locationChoice.vehicle.capacity, this.numberOfPersons);
    const due = this.computeDueAmount(locationChoice, this.vehicleCapacity[0]);
    this.pickupData = {
      ...this.pickupData,
      location: numericValue,
      selected_option: locationChoice,
      number_of_vehicles: this.vehicleCapacity[0],
      due_upon_booking: due,
      vehicle_type_code: locationChoice.vehicle.code,
      currency: locationChoice.currency,
    };
  }

  private handleVehicleQuantityChange(value: number) {
    if (!value || Number.isNaN(value) || !this.pickupData.selected_option) {
      return;
    }

    const due = this.computeDueAmount(this.pickupData.selected_option, value);
    this.pickupData = {
      ...this.pickupData,
      number_of_vehicles: value,
      due_upon_booking: due,
    };
  }

  private handleVehicleTypeChange(value: string) {
    if (!value || this.pickupData.location <= 0) {
      return;
    }

    const locationChoice = calendar_data.pickup_service.allowed_options.find(option => option.location.id === this.pickupData.location && option.vehicle.code === value);
    if (!locationChoice) {
      return;
    }

    this.vehicleCapacity = this.pickupService.getNumberOfVehicles(locationChoice.vehicle.capacity, this.numberOfPersons);
    const due = this.computeDueAmount(locationChoice, this.vehicleCapacity[0]);
    this.pickupData = {
      ...this.pickupData,
      selected_option: locationChoice,
      number_of_vehicles: this.vehicleCapacity[0],
      due_upon_booking: due,
      vehicle_type_code: locationChoice.vehicle.code,
      currency: locationChoice.currency,
    };
  }

  private computeDueAmount(option: IAllowedOptions, vehicleCount: number) {
    const due = this.pickupService.updateDue({
      amount: option.amount,
      code: option.pricing_model.code,
      numberOfPersons: this.numberOfPersons,
      number_of_vehicles: vehicleCount,
    });

    return (due ?? 0).toFixed(2);
  }

  private updatePickupData(key: keyof TPickupData, value: any) {
    this.pickupData = { ...this.pickupData, [key]: value };
  }

  private async savePickup() {
    if (!this.canSubmitPickup) {
      return;
    }

    try {
      this.isLoading = true;
      this.loadingChange.emit(this.isLoading);
      const isRemoval = this.isRemovalRequest;

      if (!isRemoval) {
        this.autoValidate = true;
        const validationResult = this.pickupService.validateForm(this.pickupData, this.pickupSchema);
        if (!validationResult.success) {
          return;
        }
      }

      await this.pickupService.savePickup(this.pickupData, this.bookingNumber, isRemoval);
      this.resetBookingEvt.emit(null);
      this.closeModal.emit(null);
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
      this.loadingChange.emit(this.isLoading);
    }
  }
  render() {
    return (
      <form
        id={this.formId}
        class="pickup__container"
        onSubmit={async e => {
          e.preventDefault();
          await this.savePickup();
        }}
      >
        <ir-validator
          schema={this.pickupSchema.shape.location}
          autovalidate={this.autoValidate}
          value={this.pickupData.location}
          valueEvent="change wa-change select-change"
          blurEvent="wa-hide blur"
        >
          <wa-select
            size="small"
            onchange={e => this.handleLocationChange((e.target as HTMLSelectElement).value)}
            defaultValue={this.pickupData.location === -1 ? '' : this.pickupData.location?.toString()}
            value={this.pickupData.location === -1 ? '' : this.pickupData.location?.toString()}
          >
            <wa-option value="">{locales.entries.Lcz_Pickup_NoThankYou}</wa-option>
            {this.pickupService.getAvailableLocations(locales.entries.Lcz_Pickup_YesFrom).map(option => (
              <wa-option key={`pickup-location-${option.value}`} value={option.value?.toString()}>
                {option.text}
              </wa-option>
            ))}
          </wa-select>
        </ir-validator>

        {this.shouldRenderDetails && (
          <div class="pickup__container" data-testid="pickup_body">
            <ir-validator
              schema={this.pickupSchema.shape.arrival_date}
              autovalidate={this.autoValidate}
              value={this.pickupData.arrival_date ?? ''}
              valueEvent="dateChanged"
              blurEvent="datePickerBlur blur"
            >
              <ir-custom-date-picker
                date={this.pickupData.arrival_date}
                minDate={this.bookingDates.from}
                maxDate={this.bookingDates?.to}
                emitEmptyDate={true}
                onDateChanged={evt => {
                  this.updatePickupData('arrival_date', evt.detail.start?.format('YYYY-MM-DD') ?? null);
                }}
                label={locales.entries.Lcz_ArrivalDate}
              ></ir-custom-date-picker>
            </ir-validator>
            <ir-validator
              schema={this.pickupSchema.shape.arrival_time}
              autovalidate={this.autoValidate}
              value={this.pickupData.arrival_time}
              valueEvent="text-change input input-change"
              blurEvent="input-blur blur"
            >
              <ir-custom-input
                value={this.pickupData.arrival_time}
                onText-change={e => {
                  this.updatePickupData('arrival_time', e.detail);
                }}
                mask={'time'}
                label={locales.entries.Lcz_Time}
              ></ir-custom-input>
            </ir-validator>
            <ir-validator
              schema={this.pickupSchema.shape.flight_details}
              autovalidate={this.autoValidate}
              value={this.pickupData.flight_details}
              valueEvent="text-change input input-change"
              blurEvent="input-blur blur"
            >
              <ir-custom-input
                onText-change={e => this.updatePickupData('flight_details', e.detail)}
                value={this.pickupData.flight_details}
                label={locales.entries.Lcz_FlightDetails}
              ></ir-custom-input>
            </ir-validator>
            <ir-validator
              schema={this.pickupSchema.shape.vehicle_type_code}
              autovalidate={this.autoValidate}
              value={this.pickupData.vehicle_type_code}
              valueEvent="change wa-change select-change"
              blurEvent="wa-hide blur"
            >
              <wa-select
                size="small"
                onchange={e => this.handleVehicleTypeChange((e.target as HTMLSelectElement).value)}
                value={this.pickupData.vehicle_type_code}
                defaultValue={this.pickupData.vehicle_type_code}
              >
                {this.allowedOptionsByLocation.map(option => (
                  <wa-option value={option.vehicle.code} key={option.vehicle.code}>
                    {option.vehicle.description}
                  </wa-option>
                ))}
              </wa-select>
            </ir-validator>
            <ir-validator
              schema={this.pickupSchema.shape.number_of_vehicles}
              autovalidate={this.autoValidate}
              value={this.pickupData.number_of_vehicles}
              valueEvent="change wa-change select-change"
              blurEvent="wa-hide blur"
            >
              <wa-select
                size="small"
                defaultValue={this.pickupData.number_of_vehicles?.toString()}
                value={this.pickupData.number_of_vehicles?.toString()}
                label={locales.entries.Lcz_NbrOfVehicles}
                onchange={e => {
                  this.handleVehicleQuantityChange(Number((e.target as HTMLSelectElement).value));
                }}
              >
                {this.vehicleCapacity.map(i => (
                  <wa-option key={`capacity_${i}`} value={i.toString()}>
                    {i}
                  </wa-option>
                ))}
              </wa-select>
            </ir-validator>
            <ir-custom-input mask={'price'} readonly label={`${locales.entries.Lcz_DueUponBooking}`} value={this.pickupData.due_upon_booking}>
              <span slot="start">{this.pickupData.currency?.symbol}</span>
            </ir-custom-input>
          </div>
        )}
      </form>
    );
  }
}

import calendar_data from '@/stores/calendar-data';
import locales from '@/stores/locales.store';
import { Component, Element, Event, EventEmitter, Fragment, Host, Prop, State, h } from '@stencil/core';
import { TPickupData } from './types';
import moment from 'moment';
import { IAllowedOptions } from '@/models/calendarData';
import { PickupService } from './pickup.service';
import { IBookingPickupInfo } from '@/models/booking.dto';

@Component({
  tag: 'ir-pickup',
  styleUrl: 'ir-pickup.css',
  scoped: true,
})
export class IrPickup {
  @Element() el: HTMLElement;

  @Prop() defaultPickupData: IBookingPickupInfo | null;
  @Prop() numberOfPersons: number = 0;
  @Prop() bookingNumber: string;

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
    arrival_date: moment().format('YYYY-MM-DD'),
    selected_option: undefined,
  };
  @State() vehicleCapacity: number[] = [];
  @State() cause: keyof TPickupData | null = null;

  @Event() closeModal: EventEmitter<null>;
  @Event() resetBookingData: EventEmitter<null>;

  private pickupService = new PickupService();

  componentWillLoad() {
    if (this.defaultPickupData) {
      const transformedData = this.pickupService.transformDefaultPickupData(this.defaultPickupData);
      this.vehicleCapacity = this.pickupService.getNumberOfVehicles(transformedData.selected_option.vehicle.capacity, this.numberOfPersons);
      this.allowedOptionsByLocation = calendar_data.pickup_service.allowed_options.filter(option => option.location.id === transformedData.location);
      this.pickupData = { ...transformedData };
    }
  }
  handleLocationChange(event: CustomEvent) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    const value = event.detail;
    if (value === '') {
      this.updatePickupData('location', -1);
    }
    if (value !== '') {
      this.allowedOptionsByLocation = calendar_data.pickup_service.allowed_options.filter(option => option.location.id.toString() === value);
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
      const input = this.el.querySelector('#pickup-time');
      if (!input) {
        setTimeout(() => {
          this.initializeInputMask();
        }, 100);
      }
    }
  }
  initializeInputMask() {
    const input = this.el.querySelector('#pickup-time');
    if (input) {
      Inputmask('Hh:mm', {
        placeholder: 'HH:mm',
        definitions: {
          H: {
            validator: '[0-1]',
          },
          h: {
            validator: '[0-9]',
          },
          M: {
            validator: '[0-5]',
          },
          m: {
            validator: '[0-9]',
          },
        },
        insertMode: true,
        showMaskOnHover: false,
        inputmode: 'numeric',
        alias: 'datetime',
        oncomplete: () => {
          this.updatePickupData('arrival_time', (input as any).value);
        },
        oncleared: function () {
          this.updatePickupData('arrival_time', '');
        },
        onincomplete: function () {
          this.updatePickupData('arrival_time', (input as any).value);
        },
      }).mask(input as HTMLElement);
    }
  }
  handleVehicleQuantityChange(e: CustomEvent) {
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
  handleVehicleTypeChange(e: CustomEvent) {
    if (e.detail === '') {
      this.pickupData = {
        ...this.pickupData,
        due_upon_booking: '',
        vehicle_type_code: '',
      };
      return;
    }
    let locationChoice = calendar_data.pickup_service.allowed_options.find(option => option.location.id === +this.pickupData.location && option.vehicle.code === e.detail);
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

  updatePickupData(key: keyof TPickupData, value: any) {
    this.pickupData = { ...this.pickupData, [key]: value };
  }
  async savePickup() {
    try {
      this.isLoading = true;
      const isValid = this.pickupService.validateForm(this.pickupData);
      if (isValid.error) {
        this.cause = isValid.cause;
        return;
      }
      if (this.cause) {
        this.cause = null;
      }
      await this.pickupService.savePickup(this.pickupData, this.bookingNumber, this.defaultPickupData !== null && this.pickupData.location === -1);
      this.resetBookingData.emit(null);
      this.closeModal.emit(null);
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }
  render() {
    return (
      <Host class={'p-0'}>
        <div class="position-sticky mb-0 shadow-none p-0">
          <div class="mt-2 custom-card-container pb-1 mb-3 px-1">
            <h3 class="card-title p-0  m-0 text-left font-medium-2">{locales.entries.Lcz_Pickup}</h3>
            <div>
              <ir-icon
                class={'close m-0 p-0 '}
                onIconClickHandler={() => {
                  this.closeModal.emit(null);
                }}
              >
                <svg slot="icon" xmlns="http://www.w3.org/2000/svg" class="m-0 p-0" viewBox="0 0 384 512" height={20} width={20}>
                  <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
                </svg>
              </ir-icon>
            </div>
          </div>
        </div>

        <section class={'px-1'}>
          <ir-select
            selectedValue={this.pickupData.location}
            selectContainerStyle="mb-1"
            onSelectChange={this.handleLocationChange.bind(this)}
            firstOption={locales.entries.Lcz_Pickup_NoThankYou}
            class={'m-0 mb-1'}
            LabelAvailable={false}
            data={this.pickupService.getAvailableLocations(locales.entries.Lcz_Pickup_YesFrom) as any}
          ></ir-select>
          {this.pickupData.location > 0 && (
            <Fragment>
              {/*Date and Time Picker container */}
              <div class={'d-flex'}>
                {/*Date Picker */}
                <div class="form-group  mr-1">
                  <div class="input-group row m-0">
                    <div class={`input-group-prepend col-5 p-0 text-dark border-0`}>
                      <label class={`input-group-text  flex-grow-1 text-dark border-theme `}>{locales.entries.Lcz_ArrivalDate}</label>
                    </div>
                    <div class="form-control form-control-md col-7 d-flex align-items-center pl-0">
                      <ir-date-picker
                        minDate={moment().format('YYYY-MM-DD')}
                        autoApply
                        format="ddd, DD M YYYY"
                        singleDatePicker
                        onDateChanged={evt => {
                          this.updatePickupData('arrival_date', evt.detail.start.format('YYYY-MM-DD'));
                        }}
                      ></ir-date-picker>
                    </div>
                  </div>
                </div>
                {/*Time Picker */}
                <div class="form-group">
                  <div class="input-group  row m-0">
                    <div class={`input-group-prepend col-4 col-sm-3 p-0 text-dark border-0`}>
                      <label htmlFor="pickup" class={`input-group-text flex-grow-1 text-dark border-theme`}>
                        {locales.entries.Lcz_Time}
                      </label>
                    </div>

                    <input
                      value={this.pickupData.arrival_time}
                      type="text"
                      id="pickup-time"
                      class={`form-control col-8 col-sm-4 ${this.cause === 'arrival_time' && 'border-danger'}`}
                    />
                  </div>
                </div>
              </div>
              <ir-input-text
                value={this.pickupData.flight_details}
                label={locales.entries.Lcz_FlightDetails}
                onTextChange={e => this.updatePickupData('flight_details', e.detail)}
                placeholder=""
                inputStyles={this.cause === 'flight_details' ? 'border-danger' : ''}
              ></ir-input-text>
              <ir-select
                selectContainerStyle="mb-1"
                selectStyles={this.cause === 'vehicle_type_code' ? 'border-danger' : ''}
                onSelectChange={this.handleVehicleTypeChange.bind(this)}
                firstOption={locales.entries.Lcz_Select}
                selectedValue={this.pickupData.vehicle_type_code}
                class={'m-0'}
                LabelAvailable={false}
                data={
                  this.allowedOptionsByLocation.map(option => ({
                    text: option.vehicle.description,
                    value: option.vehicle.code,
                  })) as any
                }
              ></ir-select>
              <div class={'d-flex flex-column flex-md-row'}>
                <ir-select
                  labelBorder="theme"
                  selectContainerStyle="mb-1"
                  onSelectChange={this.handleVehicleQuantityChange.bind(this)}
                  selectStyles={this.cause === 'number_of_vehicles' ? 'border-danger' : ''}
                  selectedValue={this.pickupData.number_of_vehicles}
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
                <ir-input-text
                  labelBorder="theme"
                  readonly
                  value={this.pickupData.due_upon_booking}
                  labelWidth={7}
                  label={`${locales.entries.Lcz_DueUponBooking}  ${this.pickupData.currency.symbol}`}
                  placeholder=""
                  class=""
                ></ir-input-text>
              </div>
            </Fragment>
          )}
          <div class={'d-flex flex-column flex-sm-row mt-3'}>
            <ir-button
              onClick={() => this.closeModal.emit(null)}
              btn_styles="justify-content-center"
              class={`mb-1 mb-sm-0 flex-fill  ${this.defaultPickupData || this.pickupData.location !== -1 ? 'mr-sm-1' : ''}`}
              icon=""
              text={locales.entries.Lcz_Cancel}
              btn_color="secondary"
            ></ir-button>
            {(this.defaultPickupData || this.pickupData.location !== -1) && (
              <ir-button
                btn_styles="justify-content-center align-items-center"
                class={'m-0 flex-fill text-center'}
                icon=""
                isLoading={this.isLoading}
                text={locales.entries.Lcz_Save}
                btn_color="primary"
                onClick={this.savePickup.bind(this)}
              ></ir-button>
            )}
          </div>
        </section>
      </Host>
    );
  }
}

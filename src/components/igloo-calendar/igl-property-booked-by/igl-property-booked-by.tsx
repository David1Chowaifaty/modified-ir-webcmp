import { Component, Host, h, Prop, Event, EventEmitter, State, Fragment } from '@stencil/core';
import { BookingService } from '../../../services/booking.service';
import { IEntries, ICountry } from '../../../models/IBooking';
import { v4 } from 'uuid';

@Component({
  tag: 'igl-property-booked-by',
  styleUrl: 'igl-property-booked-by.css',
  scoped: true,
})
export class IglPropertyBookedBy {
  @Prop() language: string;
  @Prop() showPaymentDetails: boolean = false;
  @Prop() defaultData: { [key: string]: any };
  @Event() dataUpdateEvent: EventEmitter<{ [key: string]: any }>;
  @Prop() countryNodeList: ICountry[] = [];
  @Prop() propertyId: number;
  private bookingService: BookingService = new BookingService();
  private arrivalTimeList: IEntries[] = [];
  private expiryMonths: string[] = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
  private expiryYears: string[] = [];
  private currentMonth: string = '01';
  private country;
  @State() bookedByData: { [key: string]: any } = {
    id: undefined,
    email: '',
    firstName: '',
    lastName: '',
    countryId: '',
    isdCode: '',
    contactNumber: '',
    selectedArrivalTime: {
      code: '',
      description: '',
    },
    emailGuest: true,
    message: '',
    cardNumber: '',
    cardHolderName: '',
    expiryMonth: '',
    expiryYear: '',
  };

  async componentWillLoad() {
    this.assignCountryCode();
    this.initializeExpiryYears();
    this.initializeDateData();
    this.populateBookedByData();
    console.log('default data', this.defaultData);
  }

  private initializeExpiryYears() {
    const currentYear = new Date().getFullYear();
    this.expiryYears = Array.from({ length: 4 }, (_, index) => (currentYear + index).toString());
  }
  private async assignCountryCode() {
    const country = await this.bookingService.getUserDefaultCountry();

    const countryId = country['COUNTRY_ID'];
    this.country = countryId;
    this.bookedByData = { ...this.bookedByData, isdCode: countryId.toString(), countryId };
  }
  private initializeDateData() {
    const dt = new Date();
    const month = dt.getMonth() + 1;
    this.currentMonth = month < 10 ? `0${month}` : month.toString();
  }

  private populateBookedByData() {
    this.bookedByData = this.defaultData ? { ...this.bookedByData, ...this.defaultData } : {};
    this.arrivalTimeList = this.defaultData?.arrivalTime || [];

    if (!this.bookedByData.expiryMonth) {
      this.bookedByData.expiryMonth = this.currentMonth;
    }
    if (!this.bookedByData.expiryYear) {
      this.bookedByData.expiryYear = new Date().getFullYear();
    }
  }

  handleDataChange(key, event) {
    const foundTime = this.arrivalTimeList.find(time => time.CODE_NAME === event.target.value);

    this.bookedByData[key] =
      key === 'emailGuest'
        ? event.target.checked
        : key === 'arrivalTime'
        ? {
            code: event.target.value,
            description: (foundTime && foundTime.CODE_VALUE_EN) || '',
          }
        : event.target.value;
    this.dataUpdateEvent.emit({
      key: 'bookedByInfoUpdated',
      data: { ...this.bookedByData },
    });
    if (key === 'countryId') {
      this.bookedByData = {
        ...this.bookedByData,
        isdCode: event.target.value,
      };
    }
  }

  handleNumberInput(key, event: InputEvent) {
    const inputElement = event.target as HTMLInputElement;
    const inputValue = inputElement.value;

    // Regular expression to match only numeric characters (0-9)
    const numericRegex = /^[0-9]+$/;

    if (!numericRegex.test(inputValue)) {
      // If the input is not numeric, prevent it from being entered
      inputElement.value = inputValue.replace(/[^0-9]/g, '');
    }
    if (inputValue === inputElement.value) {
      this.handleDataChange(key, event);
    }
  }

  async handleEmailInput(key, event: InputEvent) {
    const inputElement = event.target as HTMLInputElement;
    const inputValue = inputElement.value;
    if (this.isValidEmail(inputValue)) {
      this.handleDataChange(key, event);
    }
  }
  async checkUser() {
    try {
      const email = this.bookedByData.email;
      if (this.isValidEmail(email)) {
        const res = await this.bookingService.getUserInfo(email);
        if (res !== null) {
          this.bookedByData = {
            ...this.bookedByData,
            id: res.id,
            firstName: res.first_name,
            lastName: res.last_name,
            contactNumber: res.mobile,
            countryId: res.country_id,
            isdCode: res.country_id.toString(),
          };
        } else {
          this.bookedByData = {
            ...this.bookedByData,
            id: undefined,
            firstName: '',
            lastName: '',
            contactNumber: '',
            countryId: '',
            isdCode: '',
          };
        }
        this.dataUpdateEvent.emit({
          key: 'bookedByInfoUpdated',
          data: { ...this.bookedByData },
        });
      }
    } catch (error) {
      //   toastr.error(error);
    }
  }
  isValidEmail(emailId) {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(emailId);
  }
  handleComboboxChange(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const { key, data } = e.detail;
    console.log(key, data);
    switch (key) {
      case 'blur':
        if (data !== '') {
          this.bookedByData.email = data;
          this.checkUser();
        }
        break;
      case 'select':
        this.bookedByData.email = data.email;
        this.bookedByData = {
          ...this.bookedByData,
          id: data.id,
          firstName: data.first_name,
          lastName: data.last_name,
          contactNumber: data.mobile,
          countryId: data.country_id,
          isdCode: data.country_id.toString(),
        };
        this.dataUpdateEvent.emit({
          key: 'bookedByInfoUpdated',
          data: this.bookedByData,
        });
        break;
      default:
        break;
    }
  }
  clearEvent() {
    this.bookedByData.email = '';
    this.bookedByData = {
      ...this.bookedByData,
      id: '',
      firstName: '',
      lastName: '',
      contactNumber: '',
      isdCode: this.country.toString(),
      countryId: this.country,
    };
    this.dataUpdateEvent.emit({
      key: 'bookedByInfoUpdated',
      data: { ...this.bookedByData },
    });
  }

  render() {
    return (
      <Host>
        <div class="text-left mt-3">
          <div class="form-group d-flex flex-column flex-md-row align-items-md-center text-left ">
            <label class="p-0 m-0 label-control mr-1 font-weight-bold">Booked by</label>
            <div class="bookedByEmailContainer mt-1 mt-md-0">
              {/* <input
                id={v4()}
                type="email"
                class="form-control"
                placeholder="Email address"
                name="bookeyByEmail"
                value={this.bookedByData.email}
                onInput={event => this.handleEmailInput('email', event)}
                required
                onBlur={() => this.checkUser()}
              /> */}
              <ir-autocomplete
                onComboboxValue={this.handleComboboxChange.bind(this)}
                propertyId={this.propertyId}
                type="email"
                value={this.bookedByData.email}
                required
                placeholder="Email address"
                onInputCleared={() => this.clearEvent()}
              ></ir-autocomplete>
            </div>
          </div>
        </div>
        <div class="bookedDetailsForm text-left mt-2 font-small-3 ">
          <div class="d-flex flex-column flex-md-row  justify-content-md-between ">
            <div class="p-0 flex-fill ">
              <div class="form-group d-flex flex-column flex-md-row align-items-md-center p-0 flex-fill ">
                <label class="p-0 m-0 margin3">First name</label>
                <div class="p-0 m-0  controlContainer flex-fill  ">
                  <input
                    class="form-control flex-fill"
                    type="text"
                    placeholder="First name"
                    id={v4()}
                    value={this.bookedByData.firstName}
                    onInput={event => this.handleDataChange('firstName', event)}
                    required
                  />
                </div>
              </div>

              <div class="form-group  p-0 d-flex flex-column flex-md-row align-items-md-center">
                <label class="p-0 m-0 margin3">Last name</label>
                <div class="p-0 m-0  controlContainer flex-fill">
                  <input
                    class="form-control"
                    type="text"
                    placeholder="Last name"
                    id={v4()}
                    value={this.bookedByData.lastName}
                    onInput={event => this.handleDataChange('lastName', event)}
                  />
                </div>
              </div>

              <div class="form-group  p-0 d-flex flex-column flex-md-row align-items-md-center">
                <label class="p-0 m-0 margin3">Country</label>
                <div class="p-0 m-0  controlContainer flex-fill">
                  <select class="form-control input-sm pr-0" id={v4()} onChange={event => this.handleDataChange('countryId', event)}>
                    <option value="" selected={this.bookedByData.countryId === ''}>
                      Select
                    </option>
                    {this.countryNodeList.map(countryNode => (
                      <option value={countryNode.id} selected={this.bookedByData.countryId === countryNode.id}>
                        {countryNode.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div class="form-group  p-0 d-flex flex-column flex-md-row align-items-md-center">
                <label class="p-0 m-0 margin3">Mobile phone</label>
                <div class="p-0 m-0  d-flex  controlContainer flex-fill">
                  <div class=" p-0 m-0">
                    <select class="form-control input-sm pr-0" id={v4()} onChange={event => this.handleDataChange('isdCode', event)}>
                      <option value="" selected={this.bookedByData.isdCode === ''}>
                        ISD
                      </option>
                      {this.countryNodeList.map(country => (
                        <option value={country.id} selected={this.bookedByData.isdCode === country.id.toString()}>
                          {country.phone_prefix}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div class="flex-fill p-0 m-0">
                    <input
                      class="form-control"
                      type="tel"
                      placeholder="Contact Number"
                      id={v4()}
                      value={this.bookedByData.contactNumber}
                      onInput={event => this.handleNumberInput('contactNumber', event)}
                    />
                  </div>
                </div>
              </div>

              <div class="form-group  p-0 d-flex flex-column flex-md-row align-items-md-center">
                <label class="p-0 m-0 margin3">Your arrival time</label>
                <div class="p-0 m-0  controlContainer flex-fill">
                  <select class="form-control input-sm pr-0" id={v4()} onChange={event => this.handleDataChange('selectedArrivalTime', event)}>
                    <option value="" selected={this.bookedByData.selectedArrivalTime === ''}>
                      -
                    </option>
                    {this.arrivalTimeList.map(time => (
                      <option value={time.CODE_NAME} selected={this.bookedByData.selectedArrivalTime === time.CODE_NAME}>
                        {time.CODE_VALUE_EN}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div class="p-0 flex-fill  ml-md-3">
              <div class="  p-0 d-flex flex-column flex-md-row align-items-md-center ">
                <label class="p-0 m-0 margin3">Any message for us?</label>
                <div class="p-0 m-0  controlContainer flex-fill ">
                  <textarea
                    id={v4()}
                    rows={4}
                    class="form-control "
                    name="message"
                    value={this.bookedByData.message}
                    onInput={event => this.handleDataChange('message', event)}
                  ></textarea>
                </div>
              </div>
              {this.showPaymentDetails && (
                <Fragment>
                  <div class="form-group mt-md-1  p-0 d-flex flex-column flex-md-row align-items-md-center">
                    <label class="p-0 m-0 margin3">Card Number</label>
                    <div class="p-0 m-0  controlContainer flex-fill">
                      <input
                        class="form-control"
                        type="text"
                        placeholder=""
                        pattern="0-9 "
                        id={v4()}
                        value={this.bookedByData.cardNumber}
                        onInput={event => this.handleNumberInput('cardNumber', event)}
                      />
                    </div>
                  </div>
                  <div class="form-group  p-0 d-flex flex-column flex-md-row align-items-md-center">
                    <label class="p-0 m-0 margin3">Card holder name</label>
                    <div class="p-0 m-0  controlContainer flex-fill">
                      <input
                        class="form-control"
                        type="text"
                        placeholder=""
                        pattern="0-9 "
                        id={v4()}
                        value={this.bookedByData.cardHolderName}
                        onInput={event => this.handleDataChange('cardHolderName', event)}
                      />
                    </div>
                  </div>
                  <div class="form-group  p-0 d-flex flex-column flex-md-row align-items-md-center">
                    <label class="p-0 m-0 margin3">Expiry Date</label>
                    <div class="p-0 m-0 row  controlContainer flex-fill">
                      <div class="p-0 m-0">
                        <select class="form-control input-sm pr-0" id={v4()} onChange={event => this.handleDataChange('expiryMonth', event)}>
                          {this.expiryMonths.map(month => (
                            <option value={month} selected={month === this.bookedByData.expiryMonth}>
                              {month}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div class="p-0 m-0 ml-1">
                        <select class="form-control input-sm pr-0" id={v4()} onChange={event => this.handleDataChange('expiryYear', event)}>
                          {this.expiryYears.map((year, index) => (
                            <option value={year} selected={index === this.bookedByData.expiryYear}>
                              {year}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </Fragment>
              )}
              <div class="form-group row p-0 d-flex flex-column flex-md-row align-items-md-center">
                <label class="p-0 m-0 margin3">Email the guest</label>
                <div class="p-0 m-0  controlContainer flex-fill checkBoxContainer">
                  <input class="form-control" type="checkbox" checked={this.bookedByData.emailGuest} id={v4()} onChange={event => this.handleDataChange('emailGuest', event)} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Host>
    );
  }
}

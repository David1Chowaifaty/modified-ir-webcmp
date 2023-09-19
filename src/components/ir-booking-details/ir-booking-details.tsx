import { Component, Listen, h, Prop, Watch, State, Event, EventEmitter } from '@stencil/core';
import moment from 'moment';
import { guestInfo, selectOption } from '../../common/models';
import { _formatDate, _formatTime } from './functions';

@Component({
  tag: 'ir-booking-details',
  styleUrl: 'ir-booking-details.css',
})
export class IrBookingDetails {
  // Booking Details
  @Prop({ mutable: true, reflect: true }) bookingDetails: any = null;
  // Setup Data
  @Prop() setupDataCountries: selectOption[] = null;
  @Prop() setupDataCountriesCode: selectOption[] = null;

  @Prop({ mutable: true }) dropdownStatuses: any = [];

  // Statuses and Codes
  @Prop() bookingStatuses: any = [];
  @Prop() foodArrangeCats: any = [];
  @Prop() arrivalTimes: any = [];

  // Booleans Conditions
  @Prop() hasPrint: boolean = false;
  @Prop() hasReceipt: boolean = false;
  @Prop() hasDelete: boolean = false;
  @Prop() hasMenu: boolean = false;

  // Room Booleans
  @Prop() hasRoomEdit: boolean = false;
  @Prop() hasRoomDelete: boolean = false;
  @Prop() hasRoomAdd: boolean = false;
  @Prop() hasCheckIn: boolean = false;
  @Prop() hasCheckOut: boolean = false;

  @State() statusData = [
    { value: '1', text: '' },
    { value: '2', text: '' },
    { value: '3', text: '' },
  ];
  // Temp Status Before Save
  @State() tempStatus: string = null;

  // Guest Data
  @State() guestData: guestInfo = null;

  // Rerender Flag
  @State() rerenderFlag = false;

  // Event Emitters

  // Guest Event
  @Event() sendDataToServer: EventEmitter<guestInfo>;
  @Event() handlePrintClick: EventEmitter;
  @Event() handleReceiptClick: EventEmitter;
  @Event() handleDeleteClick: EventEmitter;
  @Event() handleMenuClick: EventEmitter;
  // Room Event
  @Event() handleRoomAdd: EventEmitter;
  @Event() handleRoomEdit: EventEmitter;
  @Event() handleRoomDelete: EventEmitter;
  // Payment Event
  @Event() handleAddPayment: EventEmitter;

  @Listen('iconClickHandler')
  handleIconClick(e) {
    const target = e.target;

    switch (target.id) {
      case 'print':
        this.handlePrintClick.emit();
        return;
      case 'receipt':
        this.handleReceiptClick.emit();
        return;
      case 'book-delete':
        this.handleDeleteClick.emit();
        return;
      case 'menu':
        this.handleMenuClick.emit();
        return;
      case 'room-add':
        this.handleRoomAdd.emit();
        return;
      case 'add-payment':
        this.handleAddPayment.emit();
        return;
    }

    const targetID: string = target.id;
    if (targetID.includes('roomEdit')) {
      const roomID = target.id.split('-')[1];
      this.handleRoomEdit.emit(roomID);
    } else if (target.id.includes('roomDelete')) {
      const roomID = target.id.split('-')[1];
      this.handleRoomDelete.emit(roomID);
    }
  }

  @Listen('irSidebarToggle')
  handleSidebarToggle() {
    const sidebar: any = document.querySelector('ir-sidebar#editGuestInfo');
    sidebar.open = false;
  }

  @Listen('editSidebar')
  handleEditSidebar() {
    this.openEditSidebar();
  }

  @Listen('submitForm')
  handleFormSubmit(e) {
    const data = e.detail;
    // handle changes in the booking details
    const bookingDetails = this.bookingDetails;
    bookingDetails.My_Guest.FIRST_NAME = data.firstName;
    bookingDetails.My_Guest.LAST_NAME = data.lastName;
    bookingDetails.My_Guest.COUNTRY_ID = data.country;
    bookingDetails.My_Guest.CITY = data.city;
    bookingDetails.My_Guest.ADDRESS = data.address;
    bookingDetails.My_Guest.MOBILE = data.mobile;
    bookingDetails.My_Guest.PHONE_PREFIX = data.prefix;
    bookingDetails.My_Guest.IS_NEWS_LETTER = data.newsletter;
    bookingDetails.My_Guest.My_User.CURRENCY = data.currency;
    bookingDetails.My_Guest.My_User.DISCLOSED_EMAIL = data.altEmail;
    bookingDetails.My_Guest.My_User.PASSWORD = data.password;
    bookingDetails.My_Guest.My_User.EMAIL = data.email;
    this.bookingDetails = bookingDetails;
    console.log('Form submitted with data: ', this.bookingDetails);
    this.rerenderFlag = !this.rerenderFlag;
    // close the sidebar
    const sidebar: any = document.querySelector('ir-sidebar#editGuestInfo');
    sidebar.open = false;
    this.sendDataToServer.emit(this.bookingDetails);
  }

  @Listen('selectChange')
  handleSelectChange(e) {
    const target = e.target;
    const targetID = target.id;
    switch (targetID) {
      case 'update-status':
        this.tempStatus = e.detail;
        break;
    }
  }

  @Listen('clickHanlder')
  handleClick(e) {
    const target = e.target;
    const targetID = target.id;
    switch (targetID) {
      case 'update-status-btn':
        this.updateStatus();
        break;
    }
  }

  @Watch('bookingDetails')
  watchHandler(newValue: any, oldValue: any) {
    console.log('The new value of bookingDetails is: ', newValue);
    console.log('The old value of bookingDetails is: ', oldValue);
    let _data: guestInfo = {
      firstName: newValue.My_Guest.FIRST_NAME,
      lastName: newValue.My_Guest.LAST_NAME,
      email: newValue.My_Guest.My_User.EMAIL,
      altEmail: newValue.My_Guest.My_User.DISCLOSED_EMAIL,
      password: newValue.My_Guest.My_User.PASSWORD,
      country: newValue.My_Guest.COUNTRY_ID,
      city: newValue.My_Guest.CITY,
      address: newValue.My_Guest.ADDRESS,
      mobile: newValue.My_Guest.MOBILE,
      prefix: newValue.My_Guest.PHONE_PREFIX,
      newsletter: newValue.My_Guest.IS_NEWS_LETTER,
      currency: newValue.My_Guest.My_User.CURRENCY,
      language: newValue.My_Guest.My_User.LANGUAGE,
    };
    this.guestData = _data;
  }

  @Watch('dropdownStatuses')
  watchDropdownStatuses(newValue: any, oldValue: any) {
    console.log('The new value of dropdownStatuses is: ', newValue);
    console.log('The old value of dropdownStatuses is: ', oldValue);
    // Make the newValue in way that can be handled by the dropdown
    const _newValue = newValue.map(item => {
      return {
        value: item.CODE_NAME,
        text: this._getBookingStatus(item.CODE_NAME),
      };
    });
    this.statusData = _newValue;
    this.rerenderFlag = !this.rerenderFlag;
  }

  openEditSidebar() {
    const sidebar: any = document.querySelector('ir-sidebar#editGuestInfo');
    sidebar.open = true;
  }

  _calculateNights(fromDate: string, toDate: string) {
    // calculate the difference between the two dates
    const diff = moment(toDate).diff(moment(fromDate), 'days');
    // return the difference
    return diff;
  }

  _getBookingStatus(statusCode: string) {
    // get the status from the bookingStatuses array
    const status = this.bookingStatuses.find((status: any) => status.CODE_NAME === statusCode);
    // return the status
    return status.CODE_VALUE_EN;
  }

  _getArrivalTime(timeCode: string) {
    // get the time from the arrivalTimes array
    const time = this.arrivalTimes.find((time: any) => time.CODE_NAME === timeCode);
    // return the time
    return time.CODE_VALUE_EN;
  }

  updateStatus() {
    const bookingDetails = this.bookingDetails;
    bookingDetails.BOOK_STATUS_CODE = this.tempStatus;
    this.bookingDetails = bookingDetails;
    this.rerenderFlag = !this.rerenderFlag;
    this.sendDataToServer.emit(this.bookingDetails);
  }

  render() {
    if (!this.bookingDetails) {
      return null;
    }

    const guestInfo = document.querySelector('ir-guest-info');
    if (guestInfo) {
      guestInfo.data = this.guestData;
    }

    let confirmationBG: string = '';
    console.log(this.bookingDetails.BOOK_STATUS_CODE);
    switch (this._getBookingStatus(this.bookingDetails.BOOK_STATUS_CODE)) {
      case 'Pending':
        confirmationBG = 'bg-ir-orange';
        break;
      case 'Confirmed':
        confirmationBG = 'bg-ir-green';
        break;
      case 'Cancelled':
        confirmationBG = 'bg-ir-red';
        break;
      case 'No show':
        confirmationBG = 'bg-ir-red';
        break;
    }

    return [
      <div class="fluid-container pt-1 mr-2 ml-2">
        <div class="row">
          <div class="col-lg-7 col-md-12 d-flex justify-content-start align-items-end">
            <div class="font-size-large sm-padding-right">{`Booking#${this.bookingDetails.BOOK_NBR}`}</div>
            <div>
              {/* format date */}@ {_formatDate(this.bookingDetails.BOOK_DATE)} {/* format time */}
              {_formatTime(this.bookingDetails.BOOK_HOUR, +' ' + this.bookingDetails.BOOK_MINUTE)}
            </div>
          </div>
          <div class="col-lg-5 col-md-12 d-flex justify-content-end align-items-center">
            <span class={`confirmed btn-sm mr-2 ${confirmationBG}`}>{this._getBookingStatus(this.bookingDetails.BOOK_STATUS_CODE)}</span>
            <ir-select id="update-status" size="sm" label-available="false" data={this.statusData} textSize="sm" class="sm-padding-right"></ir-select>
            <ir-button icon="" id="update-status-btn" size="sm" text="Update"></ir-button>
            {this.hasReceipt && <ir-icon id="receipt" icon="ft-file-text h1 color-ir-dark-blue-hover ml-1 pointer"></ir-icon>}
            {this.hasPrint && <ir-icon id="print" icon="ft-printer h1 color-ir-dark-blue-hover ml-1 pointer"></ir-icon>}
            {this.hasDelete && <ir-icon id="book-delete" icon="ft-trash-2 h1 danger ml-1 pointer"></ir-icon>}
            {this.hasMenu && <ir-icon id="menu" icon="ft-list h1 color-ir-dark-blue-hover ml-1 pointer"></ir-icon>}
          </div>
        </div>
      </div>,
      <div class="fluid-container m-1">
        <div class="row m-0">
          <div class="col-lg-7 col-md-12 pl-0 pr-lg-1 p-0">
            <div class="card">
              <div class="p-1">
                {this.bookingDetails.My_Ac?.NAME || ''}
                <ir-label label="Source:" value={this.bookingDetails.My_Source.Label} imageSrc={this.bookingDetails.My_Source.Icon}></ir-label>
                <ir-label label="Booked by:" value={`${this.bookingDetails.My_Guest.FIRST_NAME} ${this.bookingDetails.My_Guest.LAST_NAME}`} iconShown={true}></ir-label>
                <ir-label label="Phone:" value={this.bookingDetails.My_Guest.MOBILE}></ir-label>
                <ir-label label="Email:" value={this.bookingDetails.My_Guest.My_User.EMAIL}></ir-label>
                <ir-label label="Alternate Email:" value={this.bookingDetails.My_Guest.My_User.DISCLOSED_EMAIL}></ir-label>
                <ir-label label="Address:" value={this.bookingDetails.My_Guest.ADDRESS}></ir-label>
                <ir-label label="Arrival Time:" value={this._getArrivalTime(this.bookingDetails.ARRIVAL_TIME_CODE)}></ir-label>
                <ir-label label="Notes:" value={this.bookingDetails.GUEST_REMARK}></ir-label>
              </div>
            </div>
            <div class="font-size-large d-flex justify-content-between align-items-center ml-1 mb-1">
              {`${_formatDate(this.bookingDetails.FROM_DATE)} - ${_formatDate(this.bookingDetails.TO_DATE)} (${this._calculateNights(
                this.bookingDetails.FROM_DATE,
                this.bookingDetails.TO_DATE,
              )} nights)`}
              {this.hasRoomAdd && <ir-icon id="room-add" icon="ft-plus h3 color-ir-dark-blue-hover pointer"></ir-icon>}
            </div>
            <div class="card">
              {this.bookingDetails.My_Bsa.map((bsa: any, index: number) => {
                return [
                  <ir-room
                    currency={this.bookingDetails.My_Currency.REF}
                    hasRoomEdit={this.hasRoomEdit}
                    hasRoomDelete={this.hasRoomDelete}
                    hasCheckIn={this.hasCheckIn}
                    hasCheckOut={this.hasCheckOut}
                    mealCode={this.foodArrangeCats}
                    item={bsa}
                  />,
                  // add separator if not last item with marginHorizontal and alignCenter
                  index !== this.bookingDetails.My_Bsa.length - 1 && <hr class="mr-2 ml-2 mt-1 mb-1" />,
                ];
              })}
            </div>
          </div>
          <div class="col-lg-5 col-md-12 pr-0 pl-0 pl-md-1">
            <ir-payment-details item={this.bookingDetails}></ir-payment-details>
          </div>
        </div>
      </div>,
      <ir-sidebar side={'right'} id="editGuestInfo">
        <ir-guest-info setupDataCountries={this.setupDataCountries} setupDataCountriesCode={this.setupDataCountriesCode}></ir-guest-info>
      </ir-sidebar>,
    ];
  }
}

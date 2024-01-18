import { Component, Listen, h, Prop, Watch, State, Event, EventEmitter, Element, Fragment } from '@stencil/core';
import moment from 'moment';
import { guestInfo, selectOption } from '../../common/models';
import { _formatDate, _formatTime } from './functions';
import { Booking, Guest, Room } from '../../models/booking.dto';
import axios from 'axios';
import { BookingService } from '../../services/booking.service';
import { TIglBookPropertyPayload } from '../../models/igl-book-property';
import { RoomService } from '../../services/room.service';

@Component({
  tag: 'ir-booking-details',
  styleUrl: 'ir-booking-details.css',
})
export class IrBookingDetails {
  // Booking Details
  @Element() element: HTMLElement;
  @Prop({ mutable: true, reflect: true }) bookingDetails: any = null;
  @Prop() editBookingItem;
  // Setup Data
  @Prop() setupDataCountries: selectOption[] = null;
  @Prop() setupDataCountriesCode: selectOption[] = null;
  @Prop() languageAbreviation: string = '';
  @Prop() language: string = '';
  @Prop() ticket: string = '';
  @Prop() bookingNumber: string = '';
  @Prop() baseurl: string = '';
  @Prop({ mutable: true }) dropdownStatuses: any = [];
  @Prop() propertyid: number;
  @Prop() paymentDetailsUrl: string = '';
  @Prop() paymentExceptionMessage: string = '';

  // Statuses and Codes
  @Prop() statusCodes: any = [];

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
  @State() bookingItem: TIglBookPropertyPayload | null = null;
  @State() statusData = [];
  // Temp Status Before Save
  @State() tempStatus: string = null;

  @State() showPaymentDetails: any;
  @State() bookingData: Booking;
  @State() countryNodeList: any;
  @State() calendarData: any = {};
  // Guest Data
  @State() guestData: Guest = null;
  @State() defaultTexts;
  // Rerender Flag
  @State() rerenderFlag = false;
  @State() isSidebarOpen = false;

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
  private bookingService = new BookingService();
  private roomService = new RoomService();
  componentDidLoad() {
    if (this.baseurl) {
      axios.defaults.baseURL = this.baseurl;
    }
    if (this.ticket !== '') {
      this.initializeApp();
    }
  }
  @Watch('ticket')
  async ticketChanged() {
    sessionStorage.setItem('token', JSON.stringify(this.ticket));
    this.initializeApp();
  }
  setRoomsData(roomServiceResp) {
    let roomsData: { [key: string]: any }[] = new Array();
    if (roomServiceResp.My_Result?.roomtypes?.length) {
      roomsData = roomServiceResp.My_Result.roomtypes;
      roomServiceResp.My_Result.roomtypes.forEach(roomCategory => {
        roomCategory.expanded = true;
      });
    }
    this.calendarData.roomsInfo = roomsData;
  }
  async initializeApp() {
    try {
      const [roomResponse, languageTexts, countriesList, bookingDetails] = await Promise.all([
        this.roomService.fetchData(this.propertyid, this.language),
        this.roomService.fetchLanguage(this.language),
        this.bookingService.getCountries(this.language),
        this.bookingService.getExposedBooking(this.bookingNumber, this.language),
      ]);

      this.defaultTexts = languageTexts;
      console.log(this.defaultTexts);
      this.countryNodeList = countriesList;

      const { allowed_payment_methods: paymentMethods, currency, allowed_booking_sources, adult_child_constraints, calendar_legends } = roomResponse['My_Result'];
      this.calendarData = { currency, allowed_booking_sources, adult_child_constraints, legendData: calendar_legends };
      this.setRoomsData(roomResponse);
      // console.log(this.calendarData);
      const paymentCodesToShow = ['001', '004'];
      this.showPaymentDetails = paymentMethods.some(method => paymentCodesToShow.includes(method.code));

      this.guestData = bookingDetails.guest;
      this.bookingData = bookingDetails;
      this.rerenderFlag = !this.rerenderFlag;
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }

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
        this.element.querySelector('ir-sidebar').open = true;

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

  @Listen('editSidebar')
  handleEditSidebar() {
    this.isSidebarOpen = true;
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

  @Watch('dropdownStatuses')
  watchDropdownStatuses(newValue: any, oldValue: any) {
    console.log('The new value of dropdownStatuses is: ', newValue);
    console.log('The old value of dropdownStatuses is: ', oldValue);
    // Make the newValue in way that can be handled by the dropdown
    try {
      const _newValue = newValue.map(item => {
        return {
          value: item.CODE_NAME,
          text: this._getBookingStatus(item.CODE_NAME, '_BOOK_STATUS'),
        };
      });

      this.statusData = _newValue;
      console.log('The new value of statusData is: ', this.statusData);
      this.rerenderFlag = !this.rerenderFlag;
    } catch (e) {
      console.log('Error in watchDropdownStatuses: ', e);
    }
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

  _getBookingStatus(statusCode: string, tableName: string) {
    // get the status from the statusCode and tableName and also where the language is CODE_VALUE_${language}
    const status = this.statusCodes.find((status: any) => status.CODE_NAME === statusCode && status.TBL_NAME === tableName);

    const value = status[`CODE_VALUE_${this.languageAbreviation}`];
    // return the status
    return value;
  }

  updateStatus() {
    const bookingDetails = this.bookingDetails;
    bookingDetails.BOOK_STATUS_CODE = this.tempStatus;
    this.bookingDetails = bookingDetails;
    this.rerenderFlag = !this.rerenderFlag;
    this.sendDataToServer.emit(this.bookingDetails);
  }
  @Listen('editInitiated')
  handleEditInitiated(e: CustomEvent<TIglBookPropertyPayload>) {
    //console.log(e.detail);
    this.bookingItem = e.detail;
  }
  handleCloseBookingWindow() {
    this.bookingItem = null;
  }
  handleDeleteFinish(e: CustomEvent) {
    this.bookingData = { ...this.bookingData, rooms: this.bookingData.rooms.filter(room => room.identifier !== e.detail) };
  }
  @Listen('resetBookingData')
  async handleResetBookingData(e: CustomEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    try {
      const booking = await this.bookingService.getExposedBooking(this.bookingNumber, this.language);
      this.bookingData = { ...booking };
    } catch (error) {
      console.log(error);
    }
  }
  render() {
    if (!this.bookingData) {
      return null;
    }

    // let confirmationBG: string = '';
    // switch (this.bookingData.status.code) {
    //   case '001':
    //     confirmationBG = 'bg-ir-orange';
    //     break;
    //   case '002':
    //     confirmationBG = 'bg-ir-green';
    //     break;
    //   case '003':
    //     confirmationBG = 'bg-ir-red';
    //     break;
    //   case '004':
    //     confirmationBG = 'bg-ir-red';
    //     break;
    // }

    return [
      <ir-common></ir-common>,
      <div class="fluid-container pt-1 mr-2 ml-2">
        <div class="row">
          <div class="col-lg-7 col-md-12 d-flex justify-content-start align-items-end">
            <div class="font-size-large sm-padding-right">{`${this.defaultTexts.entries.Lcz_Booking}#${this.bookingNumber}`}</div>
            <div>
              {/* format date */}@ {_formatDate(this.bookingData.booked_on.date)} {/* format time */}
              {_formatTime(this.bookingData.booked_on.hour.toString(), +' ' + this.bookingData.booked_on.minute.toString())}
            </div>
          </div>
          {/* <div class="col-lg-5 col-md-12 d-flex justify-content-end align-items-center">
            <span class={`confirmed btn-sm mr-2 ${confirmationBG}`}>{this.bookingData.status.description}</span>
            <ir-select id="update-status" size="sm" label-available="false" data={this.statusData} textSize="sm" class="sm-padding-right"></ir-select>
            <ir-button  id="update-status-btn" size="sm" text="Update"></ir-button>
            {this.hasReceipt && <ir-icon id="receipt" icon="ft-file-text h1 color-ir-dark-blue-hover ml-1 pointer"></ir-icon>}
            {this.hasPrint && <ir-icon id="print" icon="ft-printer h1 color-ir-dark-blue-hover ml-1 pointer"></ir-icon>}
            {this.hasDelete && <ir-icon id="book-delete" icon="ft-trash-2 h1 danger ml-1 pointer"></ir-icon>}
            {this.hasMenu && <ir-icon id="menu" icon="ft-list h1 color-ir-dark-blue-hover ml-1 pointer"></ir-icon>}
          </div> */}
        </div>
      </div>,
      <div class="fluid-container m-1 text-left">
        <div class="row m-0">
          <div class="col-lg-5 col-md-12 pl-0 pr-lg-1 p-0">
            <div class="card">
              <div class="p-1">
                {this.bookingData.property.name || ''}
                <ir-label label={`${this.defaultTexts.entries.Lcz_Source}:`} value={this.bookingData.origin.Label} imageSrc={this.bookingData.origin.Icon}></ir-label>
                <ir-label
                  label={`${this.defaultTexts.entries.Lcz_BookedBy}:`}
                  value={`${this.bookingData.guest.first_name} ${this.bookingData.guest.last_name}`}
                  iconShown={true}
                ></ir-label>
                <ir-label label={`${this.defaultTexts.entries.Lcz_Phone}:`} value={this.bookingData.guest.mobile}></ir-label>
                <ir-label label={`${this.defaultTexts.entries.Lcz_Email}:`} value={this.bookingData.guest.email}></ir-label>
                {/* <ir-label label="Alternate Email:" value={this.bookingData.guest.email}></ir-label> */}
                <ir-label label={`${this.defaultTexts.entries.Lcz_Address}:`} value={this.bookingData.guest.address}></ir-label>
                <ir-label label={`${this.defaultTexts.entries.Lcz_ArrivalTime}:`} value={this.bookingData.arrival.description}></ir-label>
                <ir-label label={`${this.defaultTexts.entries.Lcz_Note}:`} value={this.bookingData.remark}></ir-label>
              </div>
            </div>
            <div class="font-size-large d-flex justify-content-between align-items-center ml-1 mb-1">
              {`${_formatDate(this.bookingData.from_date)} - ${_formatDate(this.bookingData.to_date)} (${this._calculateNights(
                this.bookingData.from_date,
                this.bookingData.to_date,
              )} ${
                this._calculateNights(this.bookingData.from_date, this.bookingData.to_date) > 1
                  ? ` ${this.defaultTexts.entries.Lcz_Nights}`
                  : ` ${this.defaultTexts.entries.Lcz_Night}`
              })`}
              {this.hasRoomAdd && <ir-icon id="room-add" icon="ft-plus h3 color-ir-dark-blue-hover pointer"></ir-icon>}
            </div>
            <div class="card">
              {this.bookingData.rooms.map((room: Room, index: number) => {
                const mealCodeName = room.rateplan.name;
                const myRoomTypeFoodCat = room.roomtype.name;

                return [
                  <ir-room
                    defaultTexts={this.defaultTexts}
                    legendData={this.calendarData.legendData}
                    roomsInfo={this.calendarData.roomsInfo}
                    myRoomTypeFoodCat={myRoomTypeFoodCat}
                    mealCodeName={mealCodeName}
                    currency={this.bookingData.currency.code}
                    hasRoomEdit={this.hasRoomEdit}
                    hasRoomDelete={this.hasRoomDelete}
                    hasCheckIn={this.hasCheckIn}
                    hasCheckOut={this.hasCheckOut}
                    bookingEvent={this.bookingData}
                    bookingIndex={index}
                    ticket={this.ticket}
                    onDeleteFinished={this.handleDeleteFinish.bind(this)}
                  />,
                  // add separator if not last item with marginHorizontal and alignCenter
                  index !== this.bookingData.rooms.length - 1 && <hr class="mr-2 ml-2 mt-1 mb-1" />,
                ];
              })}
            </div>
          </div>
          <div class="col-lg-7 col-md-12 pr-0 pl-0 pl-md-1">
            <ir-payment-details
              defaultTexts={this.defaultTexts}
              bookingDetails={this.bookingData}
              item={this.bookingDetails}
              paymentExceptionMessage={this.paymentExceptionMessage}
            ></ir-payment-details>
          </div>
        </div>
      </div>,
      <ir-sidebar
        open={this.isSidebarOpen}
        side={'right'}
        id="editGuestInfo"
        onIrSidebarToggle={e => {
          e.stopImmediatePropagation();
          e.stopPropagation();
          this.isSidebarOpen = false;
        }}
      >
        <ir-guest-info
          booking_nbr={this.bookingNumber}
          defaultTexts={this.defaultTexts}
          email={this.bookingData?.guest.email}
          setupDataCountries={this.setupDataCountries}
          setupDataCountriesCode={this.setupDataCountriesCode}
          language={this.language}
          onCloseSideBar={() => (this.isSidebarOpen = false)}
        ></ir-guest-info>
      </ir-sidebar>,
      <Fragment>
        {this.bookingItem && (
          <igl-book-property
            allowedBookingSources={this.calendarData.allowed_booking_sources}
            adultChildConstraints={this.calendarData.adultChildConstraints}
            showPaymentDetails={this.showPaymentDetails}
            countryNodeList={this.countryNodeList}
            currency={this.calendarData.currency}
            language={this.language}
            propertyid={this.propertyid}
            bookingData={this.bookingItem}
            onCloseBookingWindow={() => this.handleCloseBookingWindow()}
          ></igl-book-property>
        )}
      </Fragment>,
    ];
  }
}

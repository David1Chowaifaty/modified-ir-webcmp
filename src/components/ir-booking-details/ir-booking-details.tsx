import { Component, Listen, h, Prop, Watch, State, Event, EventEmitter, Element, Fragment } from '@stencil/core';
import moment from 'moment';
import { guestInfo, selectOption } from '../../common/models';
import { _formatDate, _formatTime } from './functions';
import { Booking, Guest, Room } from '../../models/booking.dto';
import axios from 'axios';
import { BookingService } from '../../services/booking.service';
import { IglBookPropertyPayloadAddRoom, TIglBookPropertyPayload } from '../../models/igl-book-property';
import { RoomService } from '../../services/room.service';
import locales, { ILocale } from '@/stores/locales.store';
import { IToast } from '../ir-toast/toast';

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
  @Prop() show_header: boolean = true;
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
  @State() defaultTexts: ILocale;
  // Rerender Flag
  @State() rerenderFlag = false;
  @State() sidebarState: 'guest' | 'pickup' | null = null;

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
  @Event() toast: EventEmitter<IToast>;
  @State() isUpdateClicked = false;
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
      console.log(languageTexts);
      if (!locales.entries) {
        locales.entries = languageTexts.entries;
        locales.direction = languageTexts.direction;
      }
      this.defaultTexts = languageTexts;
      console.log(this.defaultTexts);
      this.countryNodeList = countriesList;

      const { allowed_payment_methods: paymentMethods, currency, allowed_booking_sources, adult_child_constraints, calendar_legends } = roomResponse['My_Result'];
      this.calendarData = { currency, allowed_booking_sources, adult_child_constraints, legendData: calendar_legends };
      console.log(this.calendarData);
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
      case 'pickup':
        this.sidebarState = 'pickup';
        return;
      case 'print':
        window.open(`https://x.igloorooms.com/manage/AcBookingEdit.aspx?IRID=${this.bookingData.system_id}&&PM=B&TK=${this.ticket}`);
        return;
      case 'receipt':
        window.open(`https://x.igloorooms.com/manage/AcBookingEdit.aspx?IRID=${this.bookingData.system_id}&&PM=I&TK=${this.ticket}`);
        return;
      case 'book-delete':
        this.handleDeleteClick.emit();
        return;
      case 'menu':
        window.location.href = 'https://x.igloorooms.com/manage/acbookinglist.aspx';
        return;
      case 'room-add':
        (this.bookingItem as IglBookPropertyPayloadAddRoom) = {
          ID: '',
          NAME: this.bookingData.guest.last_name,
          EMAIL: this.bookingData.guest.email,
          PHONE: this.bookingData.guest.mobile,
          REFERENCE_TYPE: '',
          FROM_DATE: this.bookingData.from_date,
          ARRIVAL: this.bookingData.arrival,
          TO_DATE: this.bookingData.to_date,
          TITLE: `${locales.entries.Lcz_AddingUnitToBooking}# ${this.bookingData.booking_nbr}`,
          defaultDateRange: {
            fromDate: new Date(this.bookingData.from_date),
            fromDateStr: '',
            toDate: new Date(this.bookingData.to_date),
            toDateStr: '',
            dateDifference: 0,
            message: '',
          },
          event_type: 'ADD_ROOM',
          BOOKING_NUMBER: this.bookingData.booking_nbr,
          ADD_ROOM_TO_BOOKING: this.bookingData.booking_nbr,
          GUEST: this.bookingData.guest,
          message: this.bookingData.remark,
          SOURCE: this.bookingData.source,
          ROOMS: this.bookingData.rooms,
        };
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
    this.sidebarState = 'guest';
  }
  @Listen('selectChange')
  handleSelectChange(e: CustomEvent<any>) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    const target = e.target;
    this.tempStatus = (target as any).selectedValue;
  }

  @Listen('clickHanlder')
  async handleClick(e) {
    const target = e.target;
    const targetID = target.id;
    switch (targetID) {
      case 'update-status-btn':
        await this.updateStatus();
        await this.resetBookingData();
        break;
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

  async updateStatus() {
    if (this.tempStatus !== 'Select' && this.tempStatus !== null) {
      try {
        this.isUpdateClicked = true;
        await axios.post(`/Change_Exposed_Booking_Status?Ticket=${this.ticket}`, {
          book_nbr: this.bookingNumber,
          status: this.tempStatus,
        });
        this.toast.emit({
          type: 'success',
          description: '',
          title: locales.entries.Lcz_StatusUpdatedSuccessfully,
          position: 'top-right',
        });
      } catch (error) {
        console.log(error);
      } finally {
        this.isUpdateClicked = false;
      }
    } else {
      this.toast.emit({
        type: 'error',
        description: '',
        title: locales.entries.Lcz_SelectStatus,
        position: 'top-right',
      });
    }
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
  async resetBookingData() {
    try {
      const booking = await this.bookingService.getExposedBooking(this.bookingNumber, this.language);
      this.bookingData = { ...booking };
    } catch (error) {
      console.log(error);
    }
  }
  @Listen('resetBookingData')
  async handleResetBookingData(e: CustomEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    await this.resetBookingData();
  }
  render() {
    if (!this.bookingData) {
      return null;
    }

    let confirmationBG: string = '';
    switch (this.bookingData.status.code) {
      case '001':
        confirmationBG = 'bg-ir-orange';
        break;
      case '002':
        confirmationBG = 'bg-ir-green';
        break;
      case '003':
        confirmationBG = 'bg-ir-red';
        break;
      case '004':
        confirmationBG = 'bg-ir-red';
        break;
    }

    return [
      <div class="fluid-container pt-1 mr-2 ml-2">
        <div class="row">
          <div class="col-lg-7 col-md-12 d-flex justify-content-start align-items-end">
            <div class="font-size-large sm-padding-right">{`${this.defaultTexts.entries.Lcz_Booking}#${this.bookingNumber}`}</div>
            <div>
              {/* format date */}@ {_formatDate(this.bookingData.booked_on.date)} {/* format time */}
              {_formatTime(this.bookingData.booked_on.hour.toString(), +' ' + this.bookingData.booked_on.minute.toString())}
            </div>
          </div>

          <div class="col-lg-5 col-md-12 d-flex justify-content-end align-items-center">
            <span class={`confirmed btn-sm mr-2 ${confirmationBG}`}>{this.bookingData.status.description}</span>
            {this.bookingData.allowed_actions.length > 0 && (
              <Fragment>
                <ir-select
                  firstOption={locales.entries.Lcz_Select}
                  id="update-status"
                  size="sm"
                  label-available="false"
                  data={this.bookingData.allowed_actions.map(b => ({ text: b.description, value: b.code }))}
                  textSize="sm"
                  class="sm-padding-right"
                ></ir-select>
                <ir-button isLoading={this.isUpdateClicked} btn_disabled={this.isUpdateClicked} id="update-status-btn" size="sm" text="Update"></ir-button>
              </Fragment>
            )}
            {this.hasReceipt && <ir-icon id="receipt" icon="ft-file-text h1 color-ir-dark-blue-hover ml-1 pointer"></ir-icon>}
            {this.hasPrint && <ir-icon id="print" icon="ft-printer h1 color-ir-dark-blue-hover ml-1 pointer"></ir-icon>}
            {this.hasDelete && <ir-icon id="book-delete" icon="ft-trash-2 h1 danger ml-1 pointer"></ir-icon>}
            {this.hasMenu && <ir-icon id="menu" icon="ft-list h1 color-ir-dark-blue-hover ml-1 pointer"></ir-icon>}
          </div>
        </div>
      </div>,
      <div class="fluid-container p-1 text-left mx-0">
        <div class="row m-0">
          <div class="col-12 p-0 mx-0 pr-lg-1 col-lg-6">
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
            <div class="card p-0 mx-0">
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
                  index !== this.bookingData.rooms.length - 1 && <hr class="mr-2 ml-2 my-0 p-0" />,
                ];
              })}
            </div>
            <div class="mb-1">
              <div class={'d-flex w-100  align-items-center justify-content-between'}>
                <h4>{locales.entries.Lcz_Pickup}</h4>
                <ir-icon id="pickup" icon="ft-edit color-ir-dark-blue-hover h4 pointer"></ir-icon>
              </div>
            </div>
          </div>
          <div class="col-12 p-0 m-0 pl-lg-1 col-lg-6">
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
        open={this.sidebarState !== null}
        side={'right'}
        id="editGuestInfo"
        onIrSidebarToggle={e => {
          e.stopImmediatePropagation();
          e.stopPropagation();
          this.sidebarState = null;
        }}
        showCloseButton={this.sidebarState === 'pickup' ? false : true}
      >
        {this.sidebarState === 'guest' && (
          <ir-guest-info
            booking_nbr={this.bookingNumber}
            defaultTexts={this.defaultTexts}
            email={this.bookingData?.guest.email}
            setupDataCountries={this.setupDataCountries}
            setupDataCountriesCode={this.setupDataCountriesCode}
            language={this.language}
            onCloseSideBar={() => (this.sidebarState = null)}
          ></ir-guest-info>
        )}
        {/* {this.sidebarState === 'pickup' && (
          <ir-pickup
            bookingNumber={this.bookingData.booking_nbr}
            numberOfPersons={this.bookingData.occupancy.adult_nbr + this.bookingData.occupancy.children_nbr}
            onCloseModal={() => (this.sidebarState = null)}
          ></ir-pickup>
        )} */}
      </ir-sidebar>,
      <Fragment>
        {this.bookingItem && (
          <igl-book-property
            allowedBookingSources={this.calendarData.allowed_booking_sources}
            adultChildConstraints={this.calendarData.adult_child_constraints}
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

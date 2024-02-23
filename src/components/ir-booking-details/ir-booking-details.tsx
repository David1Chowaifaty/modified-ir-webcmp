import { Component, Listen, h, Prop, Watch, State, Event, EventEmitter, Element, Fragment } from '@stencil/core';
import moment from 'moment';
import { _formatDate, _formatTime } from './functions';
import { Booking, Guest, Room } from '../../models/booking.dto';
import axios from 'axios';
import { BookingService } from '../../services/booking.service';
import { IglBookPropertyPayloadAddRoom, TIglBookPropertyPayload } from '../../models/igl-book-property';
import { RoomService } from '../../services/room.service';
import locales, { ILocale } from '@/stores/locales.store';
import { IToast } from '../ir-toast/toast';
import calendar_data from '@/stores/calendar-data';
import { renderTime } from '@/utils/utils';

@Component({
  tag: 'ir-booking-details',
  styleUrl: 'ir-booking-details.css',
  scoped: true,
})
export class IrBookingDetails {
  @Element() element: HTMLElement;
  // Setup Data
  @Prop() language: string = '';
  @Prop() ticket: string = '';
  @Prop() bookingNumber: string = '';
  @Prop() baseurl: string = '';
  @Prop() propertyid: number;
  @Prop() is_from_front_desk = false;
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
  @State() isUpdateClicked = false;

  // Payment Event
  @Event() toast: EventEmitter<IToast>;
  private bookingService = new BookingService();
  private roomService = new RoomService();
  componentDidLoad() {
    if (this.baseurl) {
      axios.defaults.baseURL = this.baseurl;
    }
    if (this.ticket !== '') {
      calendar_data.token = this.ticket;
      this.bookingService.setToken(this.ticket);
      this.roomService.setToken(this.ticket);
      this.initializeApp();
    }
  }
  @Watch('ticket')
  async ticketChanged() {
    calendar_data.token = this.ticket;
    this.bookingService.setToken(this.ticket);
    this.roomService.setToken(this.ticket);
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
        return;
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

  async updateStatus() {
    if (this.tempStatus !== '' && this.tempStatus !== null) {
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
        await this.resetBookingData();
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
      <Fragment>
        {!this.is_from_front_desk && (
          <Fragment>
            <ir-toast></ir-toast>
            <ir-interceptor></ir-interceptor>
          </Fragment>
        )}
      </Fragment>,
      <div class="fluid-container p-1">
        <div class="d-flex flex-column p-0 mx-0 flex-lg-row align-items-md-center justify-content-between mt-1">
          <div class="m-0 p-0 mb-1 mb-lg-0 mt-md-0  d-flex justify-content-start align-items-center">
            <p class="font-size-large m-0 p-0">{`${this.defaultTexts.entries.Lcz_Booking}#${this.bookingNumber}`}</p>
            <p class="m-0 p-0 ml-1">
              {!this.bookingData.is_direct && (
                <span class="mr-1 m-0">
                  {this.bookingData.channel_booking_nbr} {/* format time */}
                </span>
              )}
              <span class="date-margin">{_formatDate(this.bookingData.booked_on.date)}</span>

              {_formatTime(this.bookingData.booked_on.hour.toString(), +' ' + this.bookingData.booked_on.minute.toString())}
            </p>
          </div>

          <div class="d-flex justify-content-end align-items-center">
            <span class={`confirmed btn-sm m-0 mr-2 ${confirmationBG}`}>{this.bookingData.status.description}</span>
            {this.bookingData.allowed_actions.length > 0 && (
              <Fragment>
                <ir-select
                  selectContainerStyle="h-28"
                  selectStyles="d-flex align-items-center h-28"
                  firstOption={locales.entries.Lcz_Select}
                  id="update-status"
                  size="sm"
                  label-available="false"
                  data={this.bookingData.allowed_actions.map(b => ({ text: b.description, value: b.code }))}
                  textSize="sm"
                  class="sm-padding-right m-0"
                ></ir-select>
                <ir-button
                  onClickHanlder={this.updateStatus.bind(this)}
                  btn_styles="h-28"
                  isLoading={this.isUpdateClicked}
                  btn_disabled={this.isUpdateClicked}
                  id="update-status-btn"
                  size="sm"
                  text="Update"
                ></ir-button>
              </Fragment>
            )}
            {this.hasReceipt && (
              <ir-icon id="receipt" class="mx-1">
                <svg slot="icon" xmlns="http://www.w3.org/2000/svg" stroke="#104064" height="24" width="19" viewBox="0 0 384 512">
                  <path
                    fill="#104064"
                    d="M64 0C28.7 0 0 28.7 0 64V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V160H256c-17.7 0-32-14.3-32-32V0H64zM256 0V128H384L256 0zM80 64h64c8.8 0 16 7.2 16 16s-7.2 16-16 16H80c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64h64c8.8 0 16 7.2 16 16s-7.2 16-16 16H80c-8.8 0-16-7.2-16-16s7.2-16 16-16zm16 96H288c17.7 0 32 14.3 32 32v64c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V256c0-17.7 14.3-32 32-32zm0 32v64H288V256H96zM240 416h64c8.8 0 16 7.2 16 16s-7.2 16-16 16H240c-8.8 0-16-7.2-16-16s7.2-16 16-16z"
                  />
                </svg>
              </ir-icon>
            )}
            {this.hasPrint && (
              <ir-icon id="print" icon="ft-printer h1 color-ir-dark-blue-hover m-0 ml-1  pointer">
                <svg slot="icon" xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 512 512">
                  <path
                    fill="#104064"
                    d="M128 0C92.7 0 64 28.7 64 64v96h64V64H354.7L384 93.3V160h64V93.3c0-17-6.7-33.3-18.7-45.3L400 18.7C388 6.7 371.7 0 354.7 0H128zM384 352v32 64H128V384 368 352H384zm64 32h32c17.7 0 32-14.3 32-32V256c0-35.3-28.7-64-64-64H64c-35.3 0-64 28.7-64 64v96c0 17.7 14.3 32 32 32H64v64c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V384zM432 248a24 24 0 1 1 0 48 24 24 0 1 1 0-48z"
                  />
                </svg>
              </ir-icon>
            )}
            {this.hasDelete && <ir-icon id="book-delete" icon="ft-trash-2 h1 danger m-0 ml-1 pointer"></ir-icon>}
            {this.hasMenu && (
              <ir-icon id="menu" class="m-0 ml-1 pointer">
                <svg slot="icon" height={24} width={24} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                  <path
                    fill="#104064"
                    d="M40 48C26.7 48 16 58.7 16 72v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V72c0-13.3-10.7-24-24-24H40zM192 64c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zm0 160c-17.7 0-32 14.3-32 32s14.3 32 32 32H480c17.7 0 32-14.3 32-32s-14.3-32-32-32H192zM16 232v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V232c0-13.3-10.7-24-24-24H40c-13.3 0-24 10.7-24 24zM40 368c-13.3 0-24 10.7-24 24v48c0 13.3 10.7 24 24 24H88c13.3 0 24-10.7 24-24V392c0-13.3-10.7-24-24-24H40z"
                  />
                </svg>
              </ir-icon>
            )}
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
                {this.bookingData.guest.alternative_email && (
                  <ir-label label={`${this.defaultTexts.entries.Lcz_AlternativeEmail}:`} value={this.bookingData.guest.alternative_email}></ir-label>
                )}
                <ir-label label={`${this.defaultTexts.entries.Lcz_Address}:`} value={this.bookingData.guest.address}></ir-label>
                {this.bookingData.is_direct && <ir-label label={`${this.defaultTexts.entries.Lcz_ArrivalTime}:`} value={this.bookingData.arrival.description}></ir-label>}
                <ir-label label={`${this.defaultTexts.entries.Lcz_Note}:`} value={this.bookingData.remark}></ir-label>
              </div>
            </div>
            <p class="font-size-large d-flex justify-content-between align-items-center mb-1">
              {`${_formatDate(this.bookingData.from_date)} - ${_formatDate(this.bookingData.to_date)} (${this._calculateNights(
                this.bookingData.from_date,
                this.bookingData.to_date,
              )} ${
                this._calculateNights(this.bookingData.from_date, this.bookingData.to_date) > 1
                  ? ` ${this.defaultTexts.entries.Lcz_Nights}`
                  : ` ${this.defaultTexts.entries.Lcz_Night}`
              })`}
              {this.hasRoomAdd && this.bookingData.is_direct && (
                <ir-icon id="room-add">
                  <svg xmlns="http://www.w3.org/2000/svg" height="20" width="17.5" viewBox="0 0 448 512" slot="icon">
                    <path
                      fill="#6b6f82"
                      d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
                    />
                  </svg>
                </ir-icon>
              )}
            </p>
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
                    hasRoomEdit={this.hasRoomEdit && this.bookingData.status.code !== '003' && this.bookingData.is_direct}
                    hasRoomDelete={this.hasRoomDelete && this.bookingData.status.code !== '003' && this.bookingData.is_direct}
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
            {calendar_data.pickup_service.is_enabled && this.bookingData.is_direct && (
              <div class="mb-1">
                <div class={'d-flex w-100 mb-1 align-items-center justify-content-between'}>
                  <p class={'font-size-large p-0 m-0 '}>{locales.entries.Lcz_Pickup}</p>
                  <ir-icon class="pointer " id="pickup">
                    <svg slot="icon" xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 512 512">
                      <path
                        fill="#6b6f82"
                        d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z"
                      />
                    </svg>
                  </ir-icon>
                </div>
                {this.bookingData.pickup_info && (
                  <div class={'card'}>
                    <div class={'p-1'}>
                      <div class={'d-flex align-items-center py-0 my-0 pickup-margin'}>
                        <p class={'font-weight-bold mr-1 py-0 my-0'}>
                          {locales.entries.Lcz_Date}: <span class={'font-weight-normal'}>{moment(this.bookingData.pickup_info.date, 'YYYY-MM-DD').format('ddd, DD MM YYYY')}</span>
                        </p>
                        <p class={'font-weight-bold flex-fill py-0 my-0'}>
                          {locales.entries.Lcz_Time}:
                          <span class={'font-weight-normal'}> {`${renderTime(this.bookingData.pickup_info.hour)}:${renderTime(this.bookingData.pickup_info.minute)}`}</span>
                        </p>
                        <p class={'font-weight-bold py-0 my-0'}>
                          {locales.entries.Lcz_DueUponBooking}:{' '}
                          <span class={'font-weight-normal'}>
                            {this.bookingData.pickup_info.currency.symbol}
                            {this.bookingData.pickup_info.total}
                          </span>
                        </p>
                      </div>
                      <p class={'font-weight-bold py-0 my-0'}>
                        {locales.entries.Lcz_FlightDetails}:<span class={'font-weight-normal'}> {`${this.bookingData.pickup_info.details}`}</span>
                      </p>
                      <p class={'py-0 my-0 pickup-margin'}>{`${this.bookingData.pickup_info.selected_option.vehicle.description}`}</p>
                      <p class={'font-weight-bold py-0 my-0 pickup-margin'}>
                        {locales.entries.Lcz_NbrOfVehicles}:<span class={'font-weight-normal'}> {`${this.bookingData.pickup_info.nbr_of_units}`}</span>
                      </p>
                      <p class={'small py-0 my-0 pickup-margin'}>
                        {calendar_data.pickup_service.pickup_instruction.description}
                        {calendar_data.pickup_service.pickup_cancelation_prepayment.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div class="col-12 p-0 m-0 pl-lg-1 col-lg-6">
            <ir-payment-details defaultTexts={this.defaultTexts} bookingDetails={this.bookingData}></ir-payment-details>
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
        showCloseButton={false}
      >
        {this.sidebarState === 'guest' && (
          <ir-guest-info
            booking_nbr={this.bookingNumber}
            defaultTexts={this.defaultTexts}
            email={this.bookingData?.guest.email}
            language={this.language}
            onCloseSideBar={() => (this.sidebarState = null)}
          ></ir-guest-info>
        )}
        {this.sidebarState === 'pickup' && (
          <ir-pickup
            defaultPickupData={this.bookingData.pickup_info}
            bookingNumber={this.bookingData.booking_nbr}
            numberOfPersons={this.bookingData.occupancy.adult_nbr + this.bookingData.occupancy.children_nbr}
            onCloseModal={() => (this.sidebarState = null)}
          ></ir-pickup>
        )}
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

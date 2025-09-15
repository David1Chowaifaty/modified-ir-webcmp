import { Component, Listen, h, Prop, Watch, State, Event, EventEmitter, Element, Fragment } from '@stencil/core';
import { Booking, ExtraService, Guest, IPmsLog, Room, SharedPerson } from '@/models/booking.dto';
import axios from 'axios';
import { BookingService } from '@/services/booking.service';
import { IglBookPropertyPayloadAddRoom, TIglBookPropertyPayload } from '@/models/igl-book-property';
import { RoomService } from '@/services/room.service';
import locales from '@/stores/locales.store';
import { IToast } from '@components/ui/ir-toast/toast';
import { ICountry, IEntries } from '@/models/IBooking';
import { IPaymentAction, PaymentService } from '@/services/payment.service';
import Token from '@/models/Token';
import { BookingDetailsSidebarEvents, OpenSidebarEvent, PaymentEntries } from './types';
import calendar_data from '@/stores/calendar-data';
import moment from 'moment';
import { IrModalCustomEvent } from '@/components';
import { isRequestPending } from '@/stores/ir-interceptor.store';

@Component({
  tag: 'ir-booking-details',
  styleUrl: 'ir-booking-details.css',
  scoped: true,
})
export class IrBookingDetails {
  @Element() element: HTMLElement;
  // Setup Data
  @Prop() language: string = 'en';
  @Prop() ticket: string = '';
  @Prop() bookingNumber: string = '';
  @Prop() propertyid: number;
  @Prop() is_from_front_desk = false;
  @Prop() p: string;
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
  @Prop() hasCloseButton = false;

  @State() bookingItem: TIglBookPropertyPayload | null = null;
  @State() statusData = [];

  @State() showPaymentDetails: any;
  @State() booking: Booking;
  @State() countries: ICountry[];
  @State() calendarData: any = {};
  // Guest Data
  @State() guestData: Guest = null;
  // Rerender Flag
  @State() rerenderFlag = false;
  @State() sidebarState: BookingDetailsSidebarEvents | null = null;
  @State() sidebarPayload: any;
  @State() isUpdateClicked = false;

  @State() pms_status: IPmsLog;
  @State() isPMSLogLoading: boolean = false;
  @State() paymentActions: IPaymentAction[];
  @State() property_id: number;
  @State() selectedService: ExtraService;
  @State() bedPreference: IEntries[];
  @State() roomGuest: any;
  @State() modalState: { type: 'email' | (string & {}); message: string; loading: boolean } = null;
  @State() departureTime: IEntries[];

  @State() paymentEntries: PaymentEntries;

  // Payment Event
  @Event() toast: EventEmitter<IToast>;
  @Event() bookingChanged: EventEmitter<Booking>;
  @Event() closeSidebar: EventEmitter<null>;

  private bookingService = new BookingService();
  private roomService = new RoomService();
  private paymentService = new PaymentService();
  private token = new Token();

  private printingBaseUrl = 'https://gateway.igloorooms.com/PrintBooking/%1/printing?id=%2';
  private modalRef: HTMLIrModalElement;

  componentWillLoad() {
    if (this.ticket !== '') {
      this.token.setToken(this.ticket);
      this.initializeApp();
    }
  }

  @Watch('ticket')
  ticketChanged(newValue: string, oldValue: string) {
    if (newValue === oldValue) {
      return;
    }
    this.token.setToken(this.ticket);
    this.initializeApp();
  }

  @Listen('openSidebar')
  handleSideBarEvents(e: CustomEvent<OpenSidebarEvent<unknown>>) {
    this.sidebarState = e.detail.type;
    this.sidebarPayload = e.detail.payload;
  }

  @Listen('clickHandler')
  handleIconClick(e: CustomEvent) {
    const target = e.target as HTMLIrButtonElement;
    switch (target.id) {
      case 'pickup':
        this.sidebarState = 'pickup';
        return;
      case 'close':
        this.closeSidebar.emit(null);
        return;
      case 'email':
        this.modalState = {
          type: 'email',
          message: locales.entries.Lcz_EmailBookingto.replace('%1', this.booking.guest.email),
          loading: isRequestPending('/Send_Booking_Confirmation_Email'),
        };
        this.modalRef.openModal();
        return;
      case 'print':
        this.openPrintingScreen();
        return;
      case 'receipt':
        this.openPrintingScreen('invoice');
        return;
      case 'book-delete':
        return;
      case 'menu':
        window.location.href = 'https://x.igloorooms.com/manage/acbookinglist.aspx';
        return;
      case 'room-add':
        (this.bookingItem as IglBookPropertyPayloadAddRoom) = {
          ID: '',
          NAME: this.booking.guest.last_name,
          EMAIL: this.booking.guest.email,
          PHONE: this.booking.guest.mobile,
          REFERENCE_TYPE: '',
          FROM_DATE: this.booking.from_date,
          ARRIVAL: this.booking.arrival,
          TO_DATE: this.booking.to_date,
          TITLE: `${locales.entries.Lcz_AddingUnitToBooking}# ${this.booking.booking_nbr}`,
          defaultDateRange: {
            fromDate: new Date(this.booking.from_date),
            fromDateStr: '',
            toDate: new Date(this.booking.to_date),
            toDateStr: '',
            dateDifference: 0,
            message: '',
          },
          event_type: 'ADD_ROOM',
          booking: this.booking,
          BOOKING_NUMBER: this.booking.booking_nbr,
          ADD_ROOM_TO_BOOKING: this.booking.booking_nbr,
          GUEST: this.booking.guest,
          message: this.booking.remark,
          SOURCE: this.booking.source,
          ROOMS: this.booking.rooms,
        };
        return;
      case 'extra_service_btn':
        this.sidebarState = 'extra_service';
        return;
      case 'add-payment':
        return;
    }
  }

  @Listen('resetExposedCancellationDueAmount')
  async handleResetExposedCancellationDueAmount(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    //TODO: Payment action
    const paymentActions = await this.paymentService.GetExposedCancellationDueAmount({ booking_nbr: this.booking.booking_nbr, currency_id: this.booking.currency.id });
    this.paymentActions = [...paymentActions];
  }
  @Listen('editInitiated')
  handleEditInitiated(e: CustomEvent<TIglBookPropertyPayload>) {
    this.bookingItem = e.detail;
  }
  @Listen('updateRoomGuests')
  handleRoomGuestsUpdate(e: CustomEvent<{ identifier: string; guests: SharedPerson[] }>) {
    const { identifier, guests } = e.detail;
    const rooms = [...this.booking.rooms];
    let currentRoomIndex = rooms.findIndex(r => r.identifier === identifier);
    if (currentRoomIndex === -1) {
      return;
    }
    const currentRoom = rooms[currentRoomIndex];
    const updatedRoom = { ...currentRoom, sharing_persons: guests };
    rooms[currentRoomIndex] = updatedRoom;
    this.booking = { ...this.booking, rooms: [...rooms] };
  }

  @Listen('resetBookingEvt')
  async handleResetBooking(e: CustomEvent<Booking | null>) {
    // e.stopPropagation();
    // e.stopImmediatePropagation();
    if (e.detail) {
      return (this.booking = e.detail);
    }
    await this.resetBooking();
  }
  @Listen('editExtraService')
  handleEditExtraService(e: CustomEvent) {
    this.selectedService = e.detail;
    this.sidebarState = 'extra_service';
  }

  private setRoomsData(roomServiceResp) {
    let roomsData: { [key: string]: any }[] = new Array();
    if (roomServiceResp.My_Result?.roomtypes?.length) {
      roomsData = roomServiceResp.My_Result.roomtypes;
      roomServiceResp.My_Result.roomtypes.forEach(roomCategory => {
        roomCategory.expanded = true;
      });
    }
    this.calendarData.roomsInfo = roomsData;
  }
  // private shouldFetchCancellationPenalty(): boolean {
  //   return this.booking.is_requested_to_cancel || this.booking.status.code === '003';
  // }
  private async initializeApp() {
    try {
      const [roomResponse, languageTexts, countriesList, bookingDetails, setupEntries] = await Promise.all([
        this.roomService.getExposedProperty({ id: this.propertyid || 0, language: this.language, aname: this.p }),
        this.roomService.fetchLanguage(this.language),
        this.bookingService.getCountries(this.language),
        this.bookingService.getExposedBooking(this.bookingNumber, this.language),
        this.bookingService.getSetupEntriesByTableNameMulti(['_BED_PREFERENCE_TYPE', '_DEPARTURE_TIME', '_PAY_TYPE', '_PAY_TYPE_GROUP', '_PAY_METHOD']),
      ]);
      this.property_id = roomResponse?.My_Result?.id;
      const { bed_preference_type, departure_time, pay_type, pay_type_group, pay_method } = this.bookingService.groupEntryTablesResult(setupEntries);
      this.bedPreference = bed_preference_type;
      this.departureTime = departure_time;
      this.paymentEntries = { types: pay_type, groups: pay_type_group, methods: pay_method };
      if (bookingDetails?.booking_nbr && bookingDetails?.currency?.id && bookingDetails.is_direct) {
        this.paymentService
          .GetExposedCancellationDueAmount({
            booking_nbr: bookingDetails.booking_nbr,
            currency_id: bookingDetails.currency.id,
          })
          .then(res => {
            this.paymentActions = res;
          });
      }
      if (!locales?.entries) {
        locales.entries = languageTexts.entries;
        locales.direction = languageTexts.direction;
      }
      this.countries = countriesList;
      const myResult = roomResponse?.My_Result;
      if (myResult) {
        const { allowed_payment_methods: paymentMethods, currency, allowed_booking_sources, adult_child_constraints, calendar_legends, aname } = myResult;
        this.printingBaseUrl = this.printingBaseUrl.replace('%1', aname).replace('%2', this.bookingNumber);
        this.calendarData = {
          currency,
          allowed_booking_sources,
          adult_child_constraints,
          legendData: calendar_legends,
        };
        this.setRoomsData(roomResponse);
        const paymentCodesToShow = ['001', '004'];
        this.showPaymentDetails = paymentMethods?.some(method => paymentCodesToShow.includes(method.code));
      } else {
        console.warn("Room response is missing 'My_Result'.");
      }

      // Set guest and booking data
      this.guestData = bookingDetails.guest;
      this.booking = bookingDetails;
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }

  private async openPrintingScreen(mode: 'invoice' | 'print' = 'print', version: 'old' | 'new' = 'new') {
    if (version === 'old') {
      if (mode === 'invoice') {
        return window.open(`https://x.igloorooms.com/manage/AcBookingEdit.aspx?IRID=${this.booking.system_id}&&PM=I&TK=${this.ticket}`);
      }
      return window.open(`https://x.igloorooms.com/manage/AcBookingEdit.aspx?IRID=${this.booking.system_id}&&PM=B&TK=${this.ticket}`);
    }
    let url = this.printingBaseUrl;
    if (mode === 'invoice') {
      url = url + '&mode=invoice';
    }
    const { data } = await axios.post(`Get_ShortLiving_Token`);
    if (!data.ExceptionMsg) {
      url = url + `&token=${data.My_Result}`;
    }
    window.open(url);
  }

  private handleCloseBookingWindow() {
    this.bookingItem = null;
  }

  private handleDeleteFinish(e: CustomEvent) {
    this.booking = { ...this.booking, rooms: this.booking.rooms.filter(room => room.identifier !== e.detail) };
  }

  private async resetBooking() {
    try {
      const booking = await this.bookingService.getExposedBooking(this.bookingNumber, this.language);
      this.booking = { ...booking };
      this.bookingChanged.emit(this.booking);
    } catch (error) {
      console.log(error);
    }
  }
  private async handleModalConfirm(e: IrModalCustomEvent<any>) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    switch (this.modalState.type) {
      case 'email':
        await this.bookingService.sendBookingConfirmationEmail(this.booking.booking_nbr, this.language);
        break;
    }
    this.modalState = null;
    this.modalRef.closeModal();
  }
  private renderSidebarContent() {
    const handleClose = () => {
      this.sidebarState = null;
    };
    switch (this.sidebarState) {
      case 'guest':
        return (
          <ir-guest-info
            isInSideBar
            headerShown
            slot="sidebar-body"
            booking_nbr={this.bookingNumber}
            email={this.booking?.guest.email}
            language={this.language}
            onCloseSideBar={handleClose}
          ></ir-guest-info>
        );
      case 'pickup':
        return (
          <ir-pickup
            bookingDates={{ from: this.booking.from_date, to: this.booking.to_date }}
            slot="sidebar-body"
            defaultPickupData={this.booking.pickup_info}
            bookingNumber={this.booking.booking_nbr}
            numberOfPersons={this.booking.occupancy.adult_nbr + this.booking.occupancy.children_nbr}
            onCloseModal={handleClose}
          ></ir-pickup>
        );
      case 'extra_note':
        return <ir-booking-extra-note slot="sidebar-body" booking={this.booking} onCloseModal={() => (this.sidebarState = null)}></ir-booking-extra-note>;
      case 'extra_service':
        return (
          <ir-extra-service-config
            service={this.selectedService}
            booking={{ from_date: this.booking.from_date, to_date: this.booking.to_date, booking_nbr: this.booking.booking_nbr, currency: this.booking.currency }}
            slot="sidebar-body"
            onCloseModal={() => {
              handleClose();
              if (this.selectedService) {
                this.selectedService = null;
              }
            }}
          ></ir-extra-service-config>
        );
      case 'room-guest':
        return (
          <ir-room-guests
            countries={this.countries}
            language={this.language}
            identifier={this.sidebarPayload?.identifier}
            bookingNumber={this.booking.booking_nbr}
            roomName={this.sidebarPayload?.roomName}
            totalGuests={this.sidebarPayload?.totalGuests}
            sharedPersons={this.sidebarPayload?.sharing_persons}
            slot="sidebar-body"
            checkIn={this.sidebarPayload?.checkin}
            onCloseModal={handleClose}
          ></ir-room-guests>
        );
      case 'payment-folio':
        return (
          <ir-payment-folio
            bookingNumber={this.booking.booking_nbr}
            paymentEntries={this.paymentEntries}
            slot="sidebar-body"
            payment={this.sidebarPayload.payment}
            mode={this.sidebarPayload.mode}
            onCloseModal={handleClose}
          ></ir-payment-folio>
        );
      default:
        return null;
    }
  }
  render() {
    if (!this.booking) {
      return (
        <div class={'loading-container'}>
          <ir-spinner></ir-spinner>
        </div>
      );
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
      <ir-booking-header
        booking={this.booking}
        hasCloseButton={this.hasCloseButton}
        hasDelete={this.hasDelete}
        hasMenu={this.hasMenu}
        hasPrint={this.hasPrint}
        hasReceipt={this.hasReceipt}
        hasEmail={['001', '002'].includes(this.booking?.status?.code)}
      ></ir-booking-header>,
      <div class="fluid-container p-1 text-left mx-0">
        <div class="row m-0">
          <div class="col-12 p-0 mx-0 pr-lg-1 col-lg-6">
            <ir-reservation-information countries={this.countries} booking={this.booking}></ir-reservation-information>
            <div class="font-size-large d-flex justify-content-between align-items-center mb-1">
              <ir-date-view from_date={this.booking.from_date} to_date={this.booking.to_date}></ir-date-view>
              {
                // this.hasRoomAdd && this.booking.is_direct && this.booking.is_editable && (
                this.hasRoomAdd && this.booking.is_editable && <ir-button id="room-add" icon_name="square_plus" variant="icon" style={{ '--icon-size': '1.5rem' }}></ir-button>
              }
            </div>
            <div class="card p-0 mx-0">
              {this.booking.rooms.map((room: Room, index: number) => {
                const showCheckin = this.handleRoomCheckin(room);
                const showCheckout = this.handleRoomCheckout(room);
                return [
                  <ir-room
                    room={room}
                    property_id={this.property_id}
                    language={this.language}
                    departureTime={this.departureTime}
                    bedPreferences={this.bedPreference}
                    isEditable={this.booking.is_editable}
                    legendData={this.calendarData.legendData}
                    roomsInfo={this.calendarData.roomsInfo}
                    myRoomTypeFoodCat={room.roomtype.name}
                    mealCodeName={room.rateplan.short_name}
                    currency={this.booking.currency.symbol}
                    hasRoomEdit={this.hasRoomEdit && this.booking.status.code !== '003' && this.booking.is_direct}
                    hasRoomDelete={this.hasRoomDelete && this.booking.status.code !== '003' && this.booking.is_direct}
                    hasCheckIn={showCheckin}
                    hasCheckOut={showCheckout}
                    booking={this.booking}
                    bookingIndex={index}
                    onDeleteFinished={this.handleDeleteFinish.bind(this)}
                  />,
                  index !== this.booking.rooms.length - 1 && <hr class="mr-2 ml-2 my-0 p-0" />,
                ];
              })}
            </div>
            {/* <ir-ota-services services={this.booking.ota_services}></ir-ota-services> */}
            <ir-pickup-view booking={this.booking}></ir-pickup-view>
            <section>
              <div class="font-size-large d-flex justify-content-between align-items-center mb-1">
                <p class={'font-size-large p-0 m-0 '}>{locales.entries.Lcz_ExtraServices}</p>
                <ir-button id="extra_service_btn" icon_name="square_plus" variant="icon" style={{ '--icon-size': '1.5rem' }}></ir-button>
              </div>
              <ir-extra-services
                booking={{ booking_nbr: this.booking.booking_nbr, currency: this.booking.currency, extra_services: this.booking.extra_services }}
              ></ir-extra-services>
            </section>
          </div>
          <div class="col-12 p-0 m-0 pl-lg-1 col-lg-6">
            <ir-payment-details paymentEntries={this.paymentEntries} paymentActions={this.paymentActions} booking={this.booking}></ir-payment-details>
          </div>
        </div>
      </div>,
      <ir-modal
        modalBody={this.modalState?.message}
        leftBtnText={locales.entries.Lcz_Cancel}
        rightBtnText={locales.entries.Lcz_Confirm}
        autoClose={false}
        isLoading={isRequestPending('/Send_Booking_Confirmation_Email')}
        ref={el => (this.modalRef = el)}
        onConfirmModal={e => {
          this.handleModalConfirm(e);
        }}
        onCancelModal={() => {
          this.modalRef.closeModal();
        }}
      ></ir-modal>,
      <ir-sidebar
        open={this.sidebarState !== null}
        side={'right'}
        id="editGuestInfo"
        style={{ '--sidebar-width': this.sidebarState === 'room-guest' ? '60rem' : undefined }}
        onIrSidebarToggle={e => {
          e.stopImmediatePropagation();
          e.stopPropagation();
          this.sidebarState = null;
        }}
        showCloseButton={false}
      >
        {this.renderSidebarContent()}
      </ir-sidebar>,
      <Fragment>
        {this.bookingItem && (
          <igl-book-property
            allowedBookingSources={this.calendarData.allowed_booking_sources}
            adultChildConstraints={this.calendarData.adult_child_constraints}
            showPaymentDetails={this.showPaymentDetails}
            countries={this.countries}
            currency={this.calendarData.currency}
            language={this.language}
            propertyid={this.property_id}
            bookingData={this.bookingItem}
            onCloseBookingWindow={() => this.handleCloseBookingWindow()}
          ></igl-book-property>
        )}
      </Fragment>,
    ];
  }
  private handleRoomCheckout(room: Room): boolean {
    if (!calendar_data.checkin_enabled || calendar_data.is_automatic_check_in_out) {
      return false;
    }
    return room.in_out.code === '001';
  }
  private handleRoomCheckin(room: Room): boolean {
    if (!calendar_data.checkin_enabled || calendar_data.is_automatic_check_in_out) {
      return false;
    }
    if (!room.unit) {
      return false;
    }
    if (room.in_out && room.in_out.code !== '000') {
      return false;
    }
    if (moment().isSameOrAfter(moment(room.from_date, 'YYYY-MM-DD'), 'days') && moment().isBefore(moment(room.to_date, 'YYYY-MM-DD'), 'days')) {
      return true;
    }
    return false;
  }
}

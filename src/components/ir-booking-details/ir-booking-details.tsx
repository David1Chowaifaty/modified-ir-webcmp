import { Component, Listen, h, Prop, Watch, State, Event, EventEmitter, Element, Fragment } from '@stencil/core';
import { _formatDate, _formatTime } from './functions';
import { Booking, ExtraService, Guest, IPmsLog, Room } from '@/models/booking.dto';
import axios from 'axios';
import { BookingService } from '@/services/booking.service';
import { IglBookPropertyPayloadAddRoom, TIglBookPropertyPayload } from '@/models/igl-book-property';
import { RoomService } from '@/services/room.service';
import locales, { ILocale } from '@/stores/locales.store';
import { IToast } from '../ir-toast/toast';
import calendar_data from '@/stores/calendar-data';
import { ICountry } from '@/models/IBooking';
import { colorVariants } from '../ui/ir-icons/icons';
import { IPaymentAction, PaymentService } from '@/services/payment.service';
import Token from '@/models/Token';
export type BookingDetailsSidebarEvents = 'guest' | 'pickup' | 'extra_note' | 'extra_service';
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
  // Temp Status Before Save
  @State() tempStatus: string = null;

  @State() showPaymentDetails: any;
  @State() bookingData: Booking;
  @State() countryNodeList: ICountry[];
  @State() calendarData: any = {};
  // Guest Data
  @State() guestData: Guest = null;
  @State() defaultTexts: ILocale;
  // Rerender Flag
  @State() rerenderFlag = false;
  @State() sidebarState: BookingDetailsSidebarEvents | null = null;
  @State() isUpdateClicked = false;

  @State() pms_status: IPmsLog;
  @State() isPMSLogLoading: boolean = false;
  @State() userCountry: ICountry | null = null;
  @State() paymentActions: IPaymentAction[];
  @State() property_id: number;
  @State() selectedService: ExtraService;
  // Payment Event
  @Event() toast: EventEmitter<IToast>;
  @Event() bookingChanged: EventEmitter<Booking>;
  @Event() closeSidebar: EventEmitter<null>;

  private bookingService = new BookingService();
  private roomService = new RoomService();
  private paymentService = new PaymentService();
  private token = new Token();

  private dialogRef: HTMLIrDialogElement;
  private printingBaseUrl = 'https://gateway.igloorooms.com/PrintBooking/%1/printing?id=%2';
  private confirmationBG = {
    '001': 'bg-ir-orange',
    '002': 'bg-ir-green',
    '003': 'bg-ir-red',
    '004': 'bg-ir-red',
  };

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

  @Listen('clickHanlder')
  handleIconClick(e: CustomEvent) {
    const target = e.target as HTMLIrButtonElement;
    switch (target.id) {
      case 'pickup':
        this.sidebarState = 'pickup';
        return;
      case 'close':
        this.closeSidebar.emit(null);
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
          booking: this.bookingData,
          BOOKING_NUMBER: this.bookingData.booking_nbr,
          ADD_ROOM_TO_BOOKING: this.bookingData.booking_nbr,
          GUEST: this.bookingData.guest,
          message: this.bookingData.remark,
          SOURCE: this.bookingData.source,
          ROOMS: this.bookingData.rooms,
        };
        return;
      case 'extra_service_btn':
        this.sidebarState = 'extra_service';
        return;
      case 'add-payment':
        return;
    }
  }

  @Listen('resetExposedCancelationDueAmount')
  async handleResetExposedCancelationDueAmount(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    //TODO: Payment action
    const paymentActions = await this.paymentService.GetExposedCancelationDueAmount({ booking_nbr: this.bookingData.booking_nbr, currency_id: this.bookingData.currency.id });
    this.paymentActions = [...paymentActions];
  }
  @Listen('selectChange')
  handleSelectChange(e: CustomEvent<any>) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    const target = e.target;
    this.tempStatus = (target as any).selectedValue;
  }
  @Listen('editInitiated')
  handleEditInitiated(e: CustomEvent<TIglBookPropertyPayload>) {
    this.bookingItem = e.detail;
  }

  @Listen('resetBookingData')
  async handleResetBookingData(e: CustomEvent<Booking | null>) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    if (e.detail) {
      return (this.bookingData = e.detail);
    }
    await this.resetBookingData();
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
  private async initializeApp() {
    try {
      const [roomResponse, languageTexts, countriesList, bookingDetails] = await Promise.all([
        this.roomService.getExposedProperty({ id: this.propertyid || 0, language: this.language, aname: this.p }),
        this.roomService.fetchLanguage(this.language),
        this.bookingService.getCountries(this.language),
        this.bookingService.getExposedBooking(this.bookingNumber, this.language),
      ]);
      this.property_id = roomResponse?.My_Result?.id;
      //TODO:Reenable payment actions
      if (bookingDetails?.booking_nbr && bookingDetails?.currency?.id) {
        this.paymentService
          .GetExposedCancelationDueAmount({
            booking_nbr: bookingDetails.booking_nbr,
            currency_id: bookingDetails.currency.id,
          })
          .then(res => {
            this.paymentActions = res;
          });
      } else {
        console.warn('Booking details are incomplete for payment actions.');
      }
      if (!locales?.entries) {
        locales.entries = languageTexts.entries;
        locales.direction = languageTexts.direction;
      }
      this.defaultTexts = languageTexts;
      this.countryNodeList = countriesList;
      const guestCountryId = bookingDetails?.guest?.country_id;
      this.userCountry = guestCountryId ? this.countryNodeList.find(country => country.id === guestCountryId) || null : null;
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
      this.bookingData = bookingDetails;
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }

  private async updateStatus() {
    if (this.tempStatus !== '' && this.tempStatus !== null) {
      try {
        this.isUpdateClicked = true;
        await axios.post(`/Change_Exposed_Booking_Status`, {
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
  private async openPMSLogsDialog() {
    try {
      this.dialogRef?.openModal();
      if (!this.pms_status) {
        this.isPMSLogLoading = true;
        this.pms_status = await this.bookingService.fetchPMSLogs(this.bookingData.booking_nbr);
      }
    } catch (error) {
      console.log(error);
    } finally {
      if (this.isPMSLogLoading) {
        this.isPMSLogLoading = false;
      }
    }
  }

  private async openPrintingScreen(mode: 'invoice' | 'print' = 'print', version: 'old' | 'new' = 'new') {
    if (version === 'old') {
      if (mode === 'invoice') {
        return window.open(`https://x.igloorooms.com/manage/AcBookingEdit.aspx?IRID=${this.bookingData.system_id}&&PM=I&TK=${this.ticket}`);
      }
      return window.open(`https://x.igloorooms.com/manage/AcBookingEdit.aspx?IRID=${this.bookingData.system_id}&&PM=B&TK=${this.ticket}`);
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
    this.bookingData = { ...this.bookingData, rooms: this.bookingData.rooms.filter(room => room.identifier !== e.detail) };
  }

  private async resetBookingData() {
    try {
      const booking = await this.bookingService.getExposedBooking(this.bookingNumber, this.language);
      this.bookingData = { ...booking };
      this.bookingChanged.emit(this.bookingData);
    } catch (error) {
      console.log(error);
    }
  }

  private renderSidebarContent() {
    const handleClose = () => {
      this.sidebarState = null;
    };
    switch (this.sidebarState) {
      case 'guest':
        return (
          <ir-guest-info
            slot="sidebar-body"
            booking_nbr={this.bookingNumber}
            defaultTexts={this.defaultTexts}
            email={this.bookingData?.guest.email}
            language={this.language}
            onCloseSideBar={handleClose}
          ></ir-guest-info>
        );
      case 'pickup':
        return (
          <ir-pickup
            slot="sidebar-body"
            defaultPickupData={this.bookingData.pickup_info}
            bookingNumber={this.bookingData.booking_nbr}
            numberOfPersons={this.bookingData.occupancy.adult_nbr + this.bookingData.occupancy.children_nbr}
            onCloseModal={handleClose}
          ></ir-pickup>
        );
      case 'extra_note':
        return <ir-booking-extra-note slot="sidebar-body" booking={this.bookingData} onCloseModal={() => (this.sidebarState = null)}></ir-booking-extra-note>;
      case 'extra_service':
        return (
          <ir-extra-service-config
            service={this.selectedService}
            booking={{ from_date: this.bookingData.from_date, to_date: this.bookingData.to_date, booking_nbr: this.bookingData.booking_nbr, currency: this.bookingData.currency }}
            slot="sidebar-body"
            onCloseModal={() => {
              handleClose();
              if (this.selectedService) {
                this.selectedService = null;
              }
            }}
          ></ir-extra-service-config>
        );
      default:
        return null;
    }
  }
  render() {
    if (!this.bookingData) {
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
            </p>
          </div>

          <div class="d-flex justify-content-end align-items-center">
            <span class={`confirmed btn-sm m-0 mr-2 ${this.confirmationBG[this.bookingData.status.code]}`}>{this.bookingData.status.description}</span>
            {this.bookingData.allowed_actions.length > 0 && this.bookingData.is_editable && (
              <Fragment>
                <ir-select
                  selectContainerStyle="h-28"
                  selectStyles="d-flex status-select align-items-center h-28"
                  firstOption={locales.entries.Lcz_Select}
                  id="update-status"
                  size="sm"
                  label-available="false"
                  data={this.bookingData.allowed_actions.map(b => ({ text: b.description, value: b.code }))}
                  textSize="sm"
                  class="sm-padding-right m-0 "
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
            {calendar_data.is_pms_enabled && (
              <button type="button" class="btn btn-outline btn-sm ml-1" onClick={this.openPMSLogsDialog.bind(this)}>
                {locales.entries.Lcz_pms}
              </button>
            )}
            {this.hasReceipt && <ir-button variant="icon" id="receipt" icon_name="reciept" class="mx-1" style={{ '--icon-size': '1.65rem' }}></ir-button>}
            {this.hasPrint && <ir-button variant="icon" id="print" icon_name="print" class="mr-1" style={{ '--icon-size': '1.65rem' }}></ir-button>}
            {this.hasDelete && <ir-button variant="icon" id="book-delete" icon_name="trash" class="mr-1" style={{ ...colorVariants.danger, '--icon-size': '1.65rem' }}></ir-button>}
            {this.hasMenu && <ir-button variant="icon" class="mr-1" id="menu" icon_name="menu_list" style={{ '--icon-size': '1.65rem' }}></ir-button>}

            {this.hasCloseButton && (
              <ir-button
                id="close"
                variant="icon"
                style={{ '--icon-size': '1.65rem' }}
                icon_name="xmark"
                class="ml-2"
                onClickHanlder={e => {
                  e.stopPropagation();
                  e.stopImmediatePropagation();
                  this.closeSidebar.emit(null);
                }}
              ></ir-button>
            )}
          </div>
        </div>
      </div>,
      <div class="fluid-container p-1 text-left mx-0">
        <div class="row m-0">
          <div class="col-12 p-0 mx-0 pr-lg-1 col-lg-6">
            <ir-reservation-information
              onEditBookingClick={e => (this.sidebarState = e.detail.type)}
              countries={this.countryNodeList}
              booking={this.bookingData}
            ></ir-reservation-information>
            <div class="font-size-large d-flex justify-content-between align-items-center mb-1">
              <ir-date-view from_date={this.bookingData.from_date} to_date={this.bookingData.to_date}></ir-date-view>
              {this.hasRoomAdd && this.bookingData.is_direct && this.bookingData.is_editable && (
                <ir-button id="room-add" icon_name="square_plus" variant="icon" style={{ '--icon-size': '1.5rem' }}></ir-button>
              )}
            </div>
            <div class="card p-0 mx-0">
              {this.bookingData.rooms.map((room: Room, index: number) => {
                return [
                  <ir-room
                    isEditable={this.bookingData.is_editable}
                    defaultTexts={this.defaultTexts}
                    legendData={this.calendarData.legendData}
                    roomsInfo={this.calendarData.roomsInfo}
                    myRoomTypeFoodCat={room.roomtype.name}
                    mealCodeName={room.rateplan.name}
                    currency={this.bookingData.currency.symbol}
                    hasRoomEdit={this.hasRoomEdit && this.bookingData.status.code !== '003' && this.bookingData.is_direct}
                    hasRoomDelete={this.hasRoomDelete && this.bookingData.status.code !== '003' && this.bookingData.is_direct}
                    hasCheckIn={this.hasCheckIn}
                    hasCheckOut={this.hasCheckOut}
                    bookingEvent={this.bookingData}
                    bookingIndex={index}
                    ticket={this.ticket}
                    onDeleteFinished={this.handleDeleteFinish.bind(this)}
                  />,
                  index !== this.bookingData.rooms.length - 1 && <hr class="mr-2 ml-2 my-0 p-0" />,
                ];
              })}
            </div>
            <ir-pickup-view booking={this.bookingData}></ir-pickup-view>
            <section>
              <div class="font-size-large d-flex justify-content-between align-items-center mb-1">
                <p class={'font-size-large p-0 m-0 '}>{this.defaultTexts.entries.Lcz_ExtraServices}</p>
                <ir-button id="extra_service_btn" icon_name="square_plus" variant="icon" style={{ '--icon-size': '1.5rem' }}></ir-button>
              </div>
              <ir-extra-services
                booking={{ booking_nbr: this.bookingData.booking_nbr, currency: this.bookingData.currency, extra_services: this.bookingData.extra_services }}
              ></ir-extra-services>
            </section>
          </div>
          <div class="col-12 p-0 m-0 pl-lg-1 col-lg-6">
            <ir-payment-details paymentActions={this.paymentActions} defaultTexts={this.defaultTexts} bookingDetails={this.bookingData}></ir-payment-details>
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
        {this.renderSidebarContent()}
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
            propertyid={this.property_id}
            bookingData={this.bookingItem}
            onCloseBookingWindow={() => this.handleCloseBookingWindow()}
          ></igl-book-property>
        )}
      </Fragment>,
      <Fragment>
        <ir-dialog ref={el => (this.dialogRef = el)}>
          <div slot="modal-body" class="p-1">
            <h3 class=" text-left mb-1 dialog-title ">{locales.entries.Lcz_PMS_Logs}</h3>
            {!this.isPMSLogLoading && (
              <Fragment>
                <div class="d-flex align-items-center">
                  <p class="list-title">{locales.entries.Lcz_SentAt}</p>
                  {this.pms_status?.sent_date ? (
                    <p class="list-item">
                      {this.pms_status?.sent_date} {_formatTime(this.pms_status?.sent_hour.toString(), this.pms_status?.sent_minute.toString())}
                    </p>
                  ) : (
                    <p class={`list-item ${this.pms_status?.sent_date ? 'green' : 'red'}`}>{this.pms_status?.is_acknowledged ? locales.entries.Lcz_YES : locales.entries.Lcz_NO}</p>
                  )}
                </div>
                <div class="d-flex align-items-center">
                  <h4 class="list-title">{locales.entries.Lcz_Acknowledged}</h4>
                  <p class={`list-item ${this.pms_status?.is_acknowledged ? 'green' : 'red'}`}>
                    {this.pms_status?.is_acknowledged ? locales.entries.Lcz_YES : locales.entries.Lcz_NO}
                  </p>
                </div>
              </Fragment>
            )}
          </div>
        </ir-dialog>
      </Fragment>,
    ];
  }
}

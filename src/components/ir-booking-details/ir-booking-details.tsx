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
import { BookingDetailsSidebarEvents, OpenSidebarEvent, PaymentEntries, PrintScreenOptions } from './types';
import calendar_data from '@/stores/calendar-data';
import moment from 'moment';
import { IrModalCustomEvent } from '@/components';
import { isRequestPending } from '@/stores/ir-interceptor.store';
import { buildSplitIndex, SplitIndex } from '@/utils/booking';

@Component({
  tag: 'ir-booking-details',
  styleUrls: ['../../global/app.css', 'ir-booking-details.css'],
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
  @State() splitIndex: SplitIndex;

  // Payment Event
  @Event() toast: EventEmitter<IToast>;
  @Event() bookingChanged: EventEmitter<Booking>;
  @Event() closeSidebar: EventEmitter<null>;

  private bookingService = new BookingService();
  private roomService = new RoomService();
  private paymentService = new PaymentService();
  private token = new Token();

  // private printingBaseUrl = 'https://gateway.igloorooms.com/PrintBooking/%1/printing?id=%2';
  private printingBaseUrl = 'http://localhost:5863/%1/printing?id=%2';
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
        this.openPrintingScreen({ mode: 'printing' });
        return;
      case 'invoice':
        this.openPrintingScreen({ mode: 'invoice' });
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
    this.splitIndex = buildSplitIndex(this.booking.rooms);
  }

  @Listen('resetBookingEvt')
  async handleResetBooking(e: CustomEvent<Booking | null>) {
    // e.stopPropagation();
    // e.stopImmediatePropagation();
    if (e.detail) {
      this.booking = e.detail;
      this.splitIndex = buildSplitIndex(this.booking.rooms);
      return;
    }
    await this.resetBooking();
  }
  @Listen('editExtraService')
  handleEditExtraService(e: CustomEvent) {
    this.selectedService = e.detail;
    this.sidebarState = 'extra_service';
  }
  @Listen('openPrintScreen')
  handleOpenPrintScreen(e: CustomEvent<PrintScreenOptions>) {
    this.openPrintingScreen(e.detail);
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
      // if (bookingDetails?.booking_nbr && bookingDetails?.currency?.id && bookingDetails.is_direct) {
      //   this.paymentService
      //     .GetExposedCancellationDueAmount({
      //       booking_nbr: bookingDetails.booking_nbr,
      //       currency_id: bookingDetails.currency.id,
      //     })
      //     .then(res => {
      //       this.paymentActions = res;
      //     });
      // }
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
      this.splitIndex = buildSplitIndex(this.booking.rooms);
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  }

  private async openPrintingScreen(options: PrintScreenOptions, version: 'old' | 'new' = 'new') {
    const { mode } = options;

    if (version === 'old') {
      if (mode === 'invoice') {
        return window.open(`https://x.igloorooms.com/manage/AcBookingEdit.aspx?IRID=${encodeURIComponent(this.booking.system_id)}&&PM=I&TK=${encodeURIComponent(this.ticket)}`);
      }
      return window.open(`https://x.igloorooms.com/manage/AcBookingEdit.aspx?IRID=${encodeURIComponent(this.booking.system_id)}&&PM=B&TK=${encodeURIComponent(this.ticket)}`);
    }

    // Start with base URL
    let url = this.printingBaseUrl;

    // Add mode safely
    url += `&mode=${encodeURIComponent(mode)}`;

    // Add ANY payload safely
    if ('payload' in options && options.payload) {
      const payload = options.payload;

      const safeParams = Object.entries(payload)
        .map(([key, value]) => {
          const safeKey = encodeURIComponent(key);
          const safeValue = encodeURIComponent(String(value));
          return `${safeKey}=${safeValue}`;
        })
        .join('&');

      url += `&${safeParams}`;
    }

    // Add token safely
    const { data } = await axios.post(`Get_ShortLiving_Token`);
    if (!data.ExceptionMsg) {
      url += `&token=${encodeURIComponent(data.My_Result)}`;
    }

    // Final: fully safe URL
    window.open(url);
  }

  private handleCloseBookingWindow() {
    this.bookingItem = null;
  }

  private handleDeleteFinish = (e: CustomEvent) => {
    this.booking = { ...this.booking, rooms: this.booking.rooms.filter(room => room.identifier !== e.detail) };
    this.splitIndex = buildSplitIndex(this.booking.rooms);
  };

  private async resetBooking() {
    try {
      const booking = await this.bookingService.getExposedBooking(this.bookingNumber, this.language);
      this.booking = { ...booking };
      this.splitIndex = buildSplitIndex(this.booking.rooms);
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
            payment={this.sidebarPayload.payment}
            mode={this.sidebarPayload.mode}
            onCloseModal={handleClose}
          ></ir-payment-folio>
        );
      default:
        return null;
    }
  }

  private computeRoomGroups(rooms: Room[]) {
    const indexById = new Map<string, number>();
    rooms.forEach((room, idx) => indexById.set(room.identifier, idx));

    if (!rooms.length) {
      return { groups: [], indexById, hasSplitGroups: false };
    }

    const groupSortKey = (groupRooms: Room[]) => {
      let min = Number.MAX_SAFE_INTEGER;
      for (const r of groupRooms) {
        const ts = Date.parse(r?.from_date ?? '');
        if (!Number.isNaN(ts)) {
          min = Math.min(min, ts);
        }
      }
      return min;
    };

    const splitIndex = this.splitIndex ?? buildSplitIndex(rooms);
    if (!splitIndex) {
      const sortedRooms = [...rooms].sort((a, b) => {
        const diff = Date.parse(a?.from_date ?? '') - Date.parse(b?.from_date ?? '');
        if (!Number.isNaN(diff) && diff !== 0) {
          return diff;
        }
        return (indexById.get(a.identifier) ?? 0) - (indexById.get(b.identifier) ?? 0);
      });
      return { groups: [{ rooms: sortedRooms, order: 0, isSplit: false, sortKey: groupSortKey(sortedRooms) }], indexById, hasSplitGroups: false };
    }

    const roomsById = new Map<string, Room>(rooms.map(room => [room.identifier, room]));
    const grouped: { rooms: Room[]; order: number; sortKey: number; isSplit: boolean }[] = [];
    const visited = new Set<string>();

    for (const head of splitIndex.heads) {
      const chain = splitIndex.chainOf.get(head) ?? [head];
      const chainRooms = chain.map(id => roomsById.get(id)).filter((room): room is Room => Boolean(room));
      if (!chainRooms.length) continue;

      const chainHasSplitLink =
        chain.some(id => {
          const parent = splitIndex.parentOf.get(id);
          const children = splitIndex.childrenOf.get(id) ?? [];
          return Boolean(parent) || children.length > 0;
        }) || chainRooms.some(room => Boolean(room?.is_split));

      if (chainHasSplitLink) {
        chainRooms.forEach(room => visited.add(room.identifier));
        const order = Math.min(...chainRooms.map(room => indexById.get(room.identifier) ?? Number.MAX_SAFE_INTEGER));
        grouped.push({ rooms: chainRooms, order, sortKey: groupSortKey(chainRooms), isSplit: true });
      }
    }

    for (const room of rooms) {
      if (!visited.has(room.identifier)) {
        const order = indexById.get(room.identifier) ?? Number.MAX_SAFE_INTEGER;
        const singleGroup = [room];
        grouped.push({ rooms: singleGroup, order, sortKey: groupSortKey(singleGroup), isSplit: false });
      }
    }

    grouped.sort((a, b) => {
      if (a.sortKey !== b.sortKey) {
        return a.sortKey - b.sortKey;
      }
      return a.order - b.order;
    });
    const hasSplitGroups = grouped.some(group => group.isSplit);

    if (!hasSplitGroups) {
      const merged = grouped
        .map(group => group.rooms)
        .reduce<Room[]>((acc, curr) => acc.concat(curr), [])
        .sort((a, b) => {
          const diff = Date.parse(a?.from_date ?? '') - Date.parse(b?.from_date ?? '');
          if (!Number.isNaN(diff) && diff !== 0) {
            return diff;
          }
          return (indexById.get(a.identifier) ?? 0) - (indexById.get(b.identifier) ?? 0);
        });
      return { groups: [{ rooms: merged, order: 0, sortKey: groupSortKey(merged), isSplit: false }], indexById, hasSplitGroups: false };
    }

    return { groups: grouped, indexById, hasSplitGroups: true };
  }

  private renderRoomItem(room: Room, bookingIndex: number, includeDepartureTime: boolean = true) {
    const showCheckin = this.handleRoomCheckin(room);
    const showCheckout = this.handleRoomCheckout(room);

    return (
      <ir-room
        key={room.identifier}
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
        includeDepartureTime={includeDepartureTime}
        currency={this.booking.currency.symbol}
        hasRoomEdit={this.hasRoomEdit && this.booking.status.code !== '003' && this.booking.is_direct}
        hasRoomDelete={this.hasRoomDelete && this.booking.status.code !== '003' && this.booking.is_direct}
        hasCheckIn={showCheckin}
        hasCheckOut={showCheckout}
        booking={this.booking}
        bookingIndex={bookingIndex}
        onDeleteFinished={this.handleDeleteFinish}
      />
    );
  }

  private renderRooms() {
    const rooms = this.booking?.rooms ?? [];
    if (!rooms.length) {
      return null;
    }

    const { groups, indexById, hasSplitGroups } = this.computeRoomGroups(rooms);

    if (!hasSplitGroups) {
      const groupRooms = groups[0].rooms;
      return groupRooms.map((room, idx) => (
        <Fragment>
          {this.renderRoomItem(room, indexById.get(room.identifier) ?? idx)}
          {idx < groupRooms.length - 1 ? <wa-divider></wa-divider> : null}
        </Fragment>
      ));
    }

    return (
      <Fragment>
        <div class="d-flex flex-column" style={{ gap: '1rem' }}>
          {groups.map((group, groupIdx) => {
            const isLastGroup = groupIdx === groups.length - 1;
            return (
              <div class={`${isLastGroup ? '' : 'room-group'}`} key={`room-group-${group.order}-${groupIdx}`}>
                {group.rooms.map((room, roomIdx) => (
                  <Fragment>
                    {this.renderRoomItem(room, indexById.get(room.identifier) ?? roomIdx, roomIdx === group.rooms.length - 1)}
                    {roomIdx < group.rooms.length - 1 ? <wa-divider></wa-divider> : null}
                  </Fragment>
                ))}
                {!isLastGroup && <wa-divider style={{ '--width': '3px' }}></wa-divider>}
              </div>
            );
          })}
        </div>
      </Fragment>
    );
  }
  render() {
    if (!this.booking) {
      return (
        <div class={'loading-container'}>
          <ir-spinner></ir-spinner>
        </div>
      );
    }
    const roomsSection = this.renderRooms();
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
      <div class="booking-details__booking-info">
        <div class="booking-details__info-column">
          <ir-reservation-information countries={this.countries} booking={this.booking}></ir-reservation-information>
          <wa-card>
            <ir-date-view class="font-size-large" slot="header" from_date={this.booking.from_date} to_date={this.booking.to_date}></ir-date-view>
            {!this.hasRoomAdd && this.booking.is_editable && (
              <Fragment>
                <wa-tooltip for="room-add">Add unit</wa-tooltip>
                <ir-custom-button slot="header-actions" id="room-add" appearance={'plain'} size={'small'} variant={'neutral'}>
                  <wa-icon name="plus" style={{ fontSize: '1rem' }} label="Add unit"></wa-icon>
                </ir-custom-button>
              </Fragment>
            )}

            {roomsSection}
          </wa-card>
          {/* <ir-ota-services services={this.booking.ota_services}></ir-ota-services> */}
          <ir-pickup-view booking={this.booking}></ir-pickup-view>
          <section>
            <ir-extra-services
              booking={{ booking_nbr: this.booking.booking_nbr, currency: this.booking.currency, extra_services: this.booking.extra_services }}
            ></ir-extra-services>
          </section>
        </div>

        <ir-payment-details
          class="booking-details__info-column"
          propertyId={this.property_id}
          paymentEntries={this.paymentEntries}
          paymentActions={this.paymentActions}
          booking={this.booking}
        ></ir-payment-details>
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
        open={this.sidebarState !== null && this.sidebarState !== 'payment-folio'}
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
      // <ir-sidebar
      //   open={this.sidebarState === 'payment-folio'}
      //   side={'left'}
      //   id="folioSidebar"
      //   onIrSidebarToggle={e => {
      //     e.stopImmediatePropagation();
      //     e.stopPropagation();
      //     this.sidebarState = null;
      //   }}
      //   showCloseButton={false}
      // >
      //   {this.renderSidebarContent()}
      // </ir-sidebar>,
      <ir-drawer
        placement="start"
        label="New Folio Entry"
        open={this.sidebarState === 'payment-folio'}
        onDrawerHide={e => {
          e.stopImmediatePropagation();
          e.stopPropagation();
          this.sidebarState = null;
        }}
      >
        {this.renderSidebarContent()}
        <div slot="footer" class="w-100 d-flex align-items-center" style={{ gap: 'var(--wa-space-xs)' }}>
          <ir-custom-button class="flex-fill" size="medium" data-drawer="close" appearance="filled" variant="neutral">
            Cancel
          </ir-custom-button>
          <ir-custom-button class="flex-fill" type="submit" form="ir__folio-form" size="medium" appearance="accent" variant="brand">
            Save
          </ir-custom-button>
        </div>
      </ir-drawer>,
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

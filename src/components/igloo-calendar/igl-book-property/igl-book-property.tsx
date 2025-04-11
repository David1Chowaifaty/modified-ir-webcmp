import { Component, Event, EventEmitter, Host, Prop, State, h, Listen, Fragment } from '@stencil/core';
import { BookingService } from '@/services/booking.service';
import { dateToFormattedString, getReleaseHoursString } from '@/utils/utils';
import { IEntries, RoomBlockDetails } from '@/models/IBooking';
import { IPageTwoDataUpdateProps } from '@/models/models';
import { IglBookPropertyService } from './igl-book-property.service';
import { IglBookPropertyPayloadEditBooking, TAdultChildConstraints, TEventType, TPropertyButtonsTypes, TSourceOption, TSourceOptions } from '@/models/igl-book-property';
import locales from '@/stores/locales.store';
import { IToast } from '@/components/ui/ir-toast/toast';
import { isRequestPending } from '@/stores/ir-interceptor.store';
import { ICurrency } from '@/models/calendarData';
import booking_store, { calculateTotalRooms, modifyBookingStore, reserveRooms, resetBookingStore, resetReserved } from '@/stores/booking.store';
import moment from 'moment';
export type IHistoryEntry = {
  dates: { checkIn: Date; checkOut: Date };
  adults: number;
  children: number;
};
@Component({
  tag: 'igl-book-property',
  styleUrls: ['igl-book-property.css'],
  scoped: true,
})
export class IglBookProperty {
  @Prop() propertyid: number;
  @Prop() allowedBookingSources: any;
  @Prop() language: string;
  @Prop() countryNodeList;
  @Prop() showPaymentDetails: boolean = false;
  @Prop() currency: ICurrency;
  @Prop({ reflect: true, mutable: true }) bookingData: { [key: string]: any };
  @Prop() adultChildConstraints: TAdultChildConstraints;

  @State() adultChildCount: { adult: number; child: number } = { adult: 0, child: 0 };
  @State() renderAgain: boolean = false;
  @State() dateRangeData: { [key: string]: any };
  @State() defaultData: any;
  @State() isLoading: string;
  @State() bookingHistory: Array<{
    dates: { checkIn: Date; checkOut: Date };
    adults: number;
    children: number;
  }> = [];

  @Event() closeBookingWindow: EventEmitter<{ [key: string]: any }>;
  @Event() blockedCreated: EventEmitter<RoomBlockDetails>;
  @Event() resetBookingEvt: EventEmitter<null>;
  @Event({ bubbles: true, composed: true }) animateIrButton: EventEmitter<string>;
  @Event({ bubbles: true, composed: true }) animateIrSelect: EventEmitter<string>;
  @Event({ bubbles: true, composed: true }) toast: EventEmitter<IToast>;

  private initialRoomIds: { roomName: string; ratePlanId: number; roomId: string; roomTypeId: string } | null = null;
  private sourceOption: TSourceOption;
  private page: string;
  private showSplitBookingOption: boolean = false;
  private sourceOptions: TSourceOptions[] = [];
  private guestData: { [key: string]: any }[] = [];
  private bookedByInfoData: { [key: string]: any } = {};
  private blockDatesData: { [key: string]: any } = {};
  private ratePricingMode: IEntries[] = [];
  private selectedUnits: Map<string, Map<string, any>> = new Map();
  private bedPreferenceType: IEntries[] = [];
  private bookingService: BookingService = new BookingService();
  private bookPropertyService = new IglBookPropertyService();
  private defaultDateRange: { from_date: string; to_date: string };
  private updatedBooking: boolean = false;
  private MAX_HISTORY_LENGTH: number = 2;
  private didReservation: boolean;
  private wasBlockedUnit: boolean;

  async componentWillLoad() {
    console.log('<==>roomtypes<==>', booking_store?.roomTypes);
    if (booking_store.roomTypes) {
      modifyBookingStore('roomTypes', []);
      modifyBookingStore('ratePlanSelections', {});
    }
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.initializeDefaultDateRange();

    if (!this.bookingData.defaultDateRange) {
      return;
    }
    console.log('testing');
    // console.log(this.bookingData);
    this.initializeDefaultData();
    this.wasBlockedUnit = this.defaultData.hasOwnProperty('block_exposed_unit_props');
    modifyBookingStore('event_type', { type: this.defaultData.event_type });
    await this.fetchSetupEntriesAndInitialize();
    this.initializeEventData();
  }

  componentDidLoad() {
    document.addEventListener('keydown', this.handleKeyDown);
  }

  disconnectedCallback() {
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  @Listen('inputCleared')
  clearBooking(e: CustomEvent) {
    if (this.isEventType('SPLIT_BOOKING')) {
      e.stopImmediatePropagation();
      e.stopPropagation();
      this.bookedByInfoData = {};
      this.bookPropertyService.resetRoomsInfoAndMessage(this);
      this.renderPage();
    }
  }

  @Listen('spiltBookingSelected')
  async handleSpiltBookingSelected(e: CustomEvent<{ key: string; data: unknown }>) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const { key, data } = e.detail;
    if (key === 'select' || (key === 'blur' && data !== '')) {
      const res = await this.bookingService.getExposedBooking((data as any).booking_nbr || (data as string), this.language);
      this.defaultData = { ...this.defaultData, booking: res };
      this.bookPropertyService.setBookingInfoFromAutoComplete(this, res);
      this.sourceOption = res.source;
      this.renderPage();
    }
  }

  // @Listen('adultChild')
  // handleAdultChildChange(event: CustomEvent) {
  //   if (this.isEventType('ADD_ROOM') || this.isEventType('SPLIT_BOOKING')) {
  //     this.bookPropertyService.resetRoomsInfoAndMessage(this);
  //   }
  //   const { adult, child } = event.detail;
  //   this.adultChildCount = { ...event.detail };
  //   this.updateBookingHistory({ adults: adult, children: child });
  // }
  @Listen('adultChild')
  handleAdultChildChange(event: CustomEvent) {
    if (this.isEventType('ADD_ROOM') || this.isEventType('SPLIT_BOOKING')) {
      this.bookPropertyService.resetRoomsInfoAndMessage(this);
    }
    const { adult, child } = event.detail;
    this.adultChildCount = { ...event.detail };

    // Update the booking history
    this.updateBookingHistory({ adults: Number(adult), children: Number(child) });
  }

  @Listen('dateSelectEvent')
  onDateRangeSelect(event: CustomEvent<{ [key: string]: any }>) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    const opt: { [key: string]: any } = event.detail;
    this.updateBookingHistory({
      dates: {
        checkIn: new Date(this.dateRangeData.fromDate),
        checkOut: new Date(new Date(opt.data.toDate)),
      },
    });
    console.log('date changed', opt);
    if (opt.key === 'selectedDateRange') {
      this.dateRangeData = opt.data;
      if (this.isEventType('ADD_ROOM') || this.isEventType('SPLIT_BOOKING')) {
        this.defaultData.roomsInfo = [];
      } else if (this.adultChildCount.adult !== 0) {
        this.checkBookingAvailability();
        // this.checkBookingAvailability(dateToFormattedString(new Date(this.dateRangeData.fromDate)), dateToFormattedString(new Date(this.dateRangeData.toDate)));
      }
    }
  }
  @Listen('sourceDropDownChange')
  handleSourceDropDown(event: CustomEvent) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    const value = event.detail;
    const selectedSource = this.sourceOptions.find(opt => opt.id === value.toString());
    this.sourceOption = {
      code: value,
      description: selectedSource.value || '',
      tag: selectedSource.tag,
      id: selectedSource.id,
      type: selectedSource.type,
    };
  }

  @Listen('gotoSplitPageTwoEvent', { target: 'window' })
  gotoSplitPageTwo() {
    this.gotoPage('page_two');
  }

  @Listen('buttonClicked')
  handleButtonClicked(event: CustomEvent<{ key: TPropertyButtonsTypes; data?: CustomEvent }>) {
    switch (event.detail.key) {
      case 'save':
        this.bookUser(false);
        break;
      case 'cancel':
        event.stopImmediatePropagation();
        event.stopPropagation();
        this.closeWindow();
        break;
      case 'back':
        event.stopImmediatePropagation();
        event.stopPropagation();
        if (this.isEventType('BAR_BOOKING')) {
          resetReserved();
        }
        this.gotoPage('page_one');
        break;
      case 'book':
        this.bookUser(false);
        break;
      case 'bookAndCheckIn':
        this.bookUser(true);
        break;
      case 'next':
        event.stopImmediatePropagation();
        event.stopPropagation();
        if (!this.adultChildCount?.adult) {
          this.animateIrSelect.emit('adult_child_select');
          break;
        }
        if (calculateTotalRooms() > 0) {
          this.gotoPage('page_two');
          break;
        } else if (this.defaultData?.roomsInfo.length === 0) {
          this.animateIrButton.emit('check_availability');
          break;
        }
        this.toast.emit({
          type: 'error',
          description: locales.entries.Lcz_SelectRatePlan,
          title: locales.entries.Lcz_SelectRatePlan,
        });
        break;
      case 'check':
        this.checkBookingAvailability();
        break;
      default:
        break;
    }
  }

  private updateBookingHistory(partialData: Partial<IHistoryEntry>) {
    const lastEntry = this.bookingHistory[this.bookingHistory.length - 1];

    const newEntry: IHistoryEntry = {
      dates: {
        checkIn: partialData.dates?.checkIn || lastEntry?.dates?.checkIn || new Date(this.dateRangeData.fromDate),
        checkOut: partialData.dates?.checkOut || lastEntry?.dates?.checkOut || new Date(this.dateRangeData.toDate),
      },
      adults: partialData.adults ?? lastEntry?.adults ?? this.adultChildCount.adult,
      children: partialData.children ?? lastEntry?.children ?? this.adultChildCount.child,
    };

    // Update the booking history
    this.bookingHistory.push(newEntry);
    if (this.bookingHistory.length > this.MAX_HISTORY_LENGTH) {
      this.bookingHistory.shift();
    }
  }

  private handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      this.closeWindow();
    }
  }

  private initializeDefaultDateRange() {
    this.defaultDateRange = {
      from_date: this.bookingData.FROM_DATE,
      to_date: this.bookingData.TO_DATE,
    };
  }

  private initializeDefaultData() {
    this.defaultData = this.bookingData;
    this.dateRangeData = { ...this.defaultData.defaultDateRange };
  }

  private async fetchSetupEntriesAndInitialize() {
    try {
      const setupEntries = await this.fetchSetupEntries();
      this.setSourceOptions(this.allowedBookingSources);
      this.setOtherProperties(setupEntries);
    } catch (error) {
      console.error('Error fetching setup entries:', error);
    }
  }

  private initializeEventData() {
    if (this.isEventType('EDIT_BOOKING')) {
      this.initializeEditBookingData();
    }

    if (!this.isEventType('BAR_BOOKING')) {
      this.bookPropertyService.resetRoomsInfoAndMessage(this);
    }

    this.initializePage();
  }

  private initializeEditBookingData() {
    this.adultChildCount = {
      adult: this.defaultData.ADULTS_COUNT,
      child: this.defaultData.CHILDREN_COUNT,
    };

    this.initialRoomIds = {
      roomName: this.defaultData.roomName,
      ratePlanId: this.defaultData.RATE_PLAN_ID,
      roomId: this.defaultData.PR_ID,
      roomTypeId: this.defaultData.RATE_TYPE,
    };
    const { currentRoomType } = this.defaultData as IglBookPropertyPayloadEditBooking;

    modifyBookingStore('guest', {
      bed_preference: currentRoomType.bed_preference?.toString(),
      infant_nbr: currentRoomType.occupancy.infant_nbr,
      name: currentRoomType.guest.last_name ? currentRoomType.guest.first_name + ' ' + currentRoomType.guest.last_name : currentRoomType.guest.first_name,
      unit: (currentRoomType.unit as any)?.id?.toString(),
    });
    this.checkBookingAvailability();
    this.bookPropertyService.setEditingRoomInfo(this.defaultData, this.selectedUnits);
  }

  private initializePage() {
    switch (this.defaultData.event_type) {
      case 'SPLIT_BOOKING':
        this.showSplitBookingOption = true;
        this.page = 'page_one';
        break;
      case 'BLOCK_DATES':
        this.page = 'page_block_date';
        break;
      default:
        this.page = 'page_one';
        break;
    }
  }

  async fetchSetupEntries() {
    return await this.bookingService.fetchSetupEntries();
  }

  private isGuestDataIncomplete() {
    for (const roomtypeId in booking_store.ratePlanSelections) {
      const roomtype = booking_store.ratePlanSelections[roomtypeId];
      for (const rateplanId in roomtype) {
        const rateplan = roomtype[rateplanId];
        if (rateplan.reserved > 0) {
          for (const guest of rateplan.guest) {
            if (guest.name === '') {
              return true;
            }
          }
        }
      }
    }
    return false;
  }

  private isButtonDisabled() {
    const isValidProperty = (property, key, comparedBy) => {
      if (!property) {
        return true;
      }
      if (property === this.guestData) {
        return this.isGuestDataIncomplete();
      }
      if (key === 'selectedArrivalTime') {
        if (property[key] !== undefined) {
          return property[key].code === '';
        } else {
          return true;
        }
      }
      return property[key] === comparedBy || property[key] === undefined;
    };
    return (
      isValidProperty(this.guestData, 'guestName', '') ||
      isValidProperty(this.bookedByInfoData, 'firstName', '') ||
      isValidProperty(this.bookedByInfoData, 'lastName', '') ||
      isValidProperty(this.bookedByInfoData, 'selectedArrivalTime', '')
    );
  }

  private setSourceOptions(bookingSource: any[]) {
    this.sourceOptions = bookingSource.map(source => ({
      id: source.id,
      value: source.description,
      tag: source.tag,
      type: source.type,
    }));
    if (this.isEventType('EDIT_BOOKING')) {
      this.sourceOption = { ...this.defaultData.SOURCE };
    } else {
      this.sourceOption = {
        code: bookingSource[0].code,
        description: bookingSource[0].description,
        tag: bookingSource[0].tag,
        type: bookingSource[0].type,
        id: bookingSource[0].id,
      };
    }
  }

  private setOtherProperties(res: any) {
    this.ratePricingMode = res?.ratePricingMode;
    this.bookedByInfoData.arrivalTime = res.arrivalTime;
    this.bedPreferenceType = res.bedPreferenceType;
  }

  private async checkBookingAvailability() {
    resetBookingStore();
    const from_date = moment(this.dateRangeData.fromDate).format('YYYY-MM-DD');
    const to_date = moment(this.dateRangeData.toDate).format('YYYY-MM-DD');
    const is_in_agent_mode = this.sourceOption['type'] === 'TRAVEL_AGENCY';
    try {
      const room_type_ids_to_update = this.isEventType('EDIT_BOOKING') ? [this.defaultData.RATE_TYPE] : [];
      const room_type_ids = this.isEventType('BAR_BOOKING') ? this.defaultData.roomsInfo.map(room => room.id) : [];
      const data = await this.bookingService.getBookingAvailability({
        from_date,
        to_date,
        propertyid: this.propertyid,
        adultChildCount: this.adultChildCount,
        language: this.language,
        room_type_ids,
        currency: this.currency,
        agent_id: is_in_agent_mode ? this.sourceOption['tag'] : null,
        is_in_agent_mode,
        room_type_ids_to_update,
      });
      if (!this.isEventType('EDIT_BOOKING')) {
        this.defaultData.defaultDateRange.fromDate = new Date(this.dateRangeData.fromDate);
        this.defaultData.defaultDateRange.toDate = new Date(this.dateRangeData.toDate);
      }
      this.defaultData = { ...this.defaultData, roomsInfo: data };
      if (this.isEventType('EDIT_BOOKING') && !this.updatedBooking) {
        this.updateBooking();
      }
    } catch (error) {
      console.error('Error initializing booking availability:', error);
    }
  }

  private updateBooking() {
    try {
      const { currentRoomType } = this.defaultData as IglBookPropertyPayloadEditBooking;
      const roomtypeId = currentRoomType.roomtype.id;
      const rateplanId = currentRoomType.rateplan.id;
      const guest = {
        bed_preference: currentRoomType.bed_preference?.toString(),
        infant_nbr: currentRoomType.occupancy.infant_nbr,
        name: currentRoomType.guest.last_name ? currentRoomType.guest.first_name + ' ' + currentRoomType.guest.last_name : currentRoomType.guest.first_name,
        unit: (currentRoomType.unit as any)?.id?.toString(),
        roomtype_id: roomtypeId,
      };
      modifyBookingStore('guest', guest);
      reserveRooms({
        roomTypeId: roomtypeId,
        ratePlanId: rateplanId,
        rooms: 1,
        guest: [guest],
      });
    } catch (error) {
      console.error(error);
    }
  }
  private async checkAndBlockDate() {
    try {
      const { block_exposed_unit_props } = this.defaultData;
      await this.bookingService.getBookingAvailability({
        from_date: block_exposed_unit_props.from_date,
        to_date: block_exposed_unit_props.to_date,
        propertyid: this.propertyid,
        adultChildCount: {
          adult: 2,
          child: 0,
        },
        language: this.language,
        room_type_ids: this.defaultData.roomsInfo.map(room => room.id),
        currency: this.currency,
      });
      const isAvailable = booking_store.roomTypes.every(rt => {
        if (rt.is_available_to_book) {
          return true;
        }
        return rt.inventory > 0 && rt['not_available_reason'] === 'ALL-RATES-PLAN-NOT-BOOKABLE';
      });
      if (isAvailable) {
        await this.handleBlockDate(false);
      } else {
        console.log('Blocked date is unavailable. Continuing...');
      }
    } catch (error) {
      console.error('Error checking and blocking date:', error);
    }
  }
  private async closeWindow() {
    resetBookingStore();
    this.closeBookingWindow.emit();

    if (this.wasBlockedUnit && !this.didReservation) {
      await this.checkAndBlockDate();
    }
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  private isEventType(key: TEventType) {
    return this.defaultData.event_type === key;
  }

  private handleBlockDateUpdate(event: CustomEvent<{ [key: string]: any }>) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    const opt: { [key: string]: any } = event.detail;
    this.blockDatesData = opt.data;
  }

  private handleGuestInfoUpdate(event: CustomEvent<{ [key: string]: any }>) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    const opt = event.detail;
    if (opt.guestRefKey) {
      if (this.isEventType('BAR_BOOKING') || this.isEventType('SPLIT_BOOKING')) {
        this.guestData[opt.guestRefKey] = {
          ...opt.data,
          roomId: this.defaultData.PR_ID,
        };
      } else this.guestData[opt.guestRefKey] = opt.data;
    }
  }

  private handleBookedByInfoUpdate(event: CustomEvent<{ [key: string]: any }>) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    const opt: { [key: string]: any } = event.detail;
    this.bookedByInfoData = opt.value.data;
  }

  private renderPage() {
    this.renderAgain = !this.renderAgain;
  }

  private gotoPage(gotoPage: string) {
    this.page = gotoPage;
    this.renderPage();
  }

  private getPageBlockDatesView() {
    return (
      <Fragment>
        <igl-block-dates-view
          fromDate={this.defaultData.FROM_DATE}
          toDate={this.defaultData.TO_DATE}
          entryDate={this.defaultData.ENTRY_DATE}
          onDataUpdateEvent={event => this.handleBlockDateUpdate(event)}
        ></igl-block-dates-view>
        <div class="p-0 mb-1 mt-2 gap-30 d-flex align-items-center justify-content-between">
          <ir-button text={locales.entries.Lcz_Cancel} btn_color="secondary" class="flex-fill" onClick={() => this.closeWindow()}></ir-button>
          <ir-button text={locales.entries.Lcz_Blockdates} isLoading={isRequestPending('/Block_Exposed_Unit')} class="flex-fill" onClick={() => this.handleBlockDate()}></ir-button>
        </div>
      </Fragment>
    );
  }

  private handlePageTwoDataUpdateEvent(event: CustomEvent<IPageTwoDataUpdateProps>) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    if (event.detail.key === 'propertyBookedBy') {
      this.handleBookedByInfoUpdate(event);
    } else {
      this.handleGuestInfoUpdate(event);
    }
  }

  private async handleBlockDate(auto_close = true) {
    const props = this.wasBlockedUnit
      ? this.defaultData.block_exposed_unit_props
      : (() => {
          const releaseData = getReleaseHoursString(+this.blockDatesData.RELEASE_AFTER_HOURS);
          return {
            from_date: dateToFormattedString(this.defaultData.defaultDateRange.fromDate),
            to_date: dateToFormattedString(this.defaultData.defaultDateRange.toDate),
            NOTES: this.blockDatesData.OPTIONAL_REASON || '',
            pr_id: this.defaultData.PR_ID.toString(),
            STAY_STATUS_CODE: this.blockDatesData.OUT_OF_SERVICE ? '004' : this.blockDatesData.RELEASE_AFTER_HOURS === 0 ? '002' : '003',
            DESCRIPTION: this.blockDatesData.RELEASE_AFTER_HOURS || '',
            ...releaseData,
          };
        })();
    await this.bookingService.blockUnit(props);
    // const blockedUnit = await transformNewBLockedRooms(result);
    // this.blockedCreated.emit(blockedUnit);
    if (auto_close) this.closeWindow();
  }

  private async bookUser(check_in: boolean) {
    this.setLoadingState(check_in);

    if (this.isEventType('EDIT_BOOKING') || this.isEventType('ADD_ROOM')) {
      if (this.isGuestDataIncomplete()) {
        this.isLoading = '';
        return;
      }
    } else if (this.isButtonDisabled()) {
      this.isLoading = '';
      return;
    }

    try {
      if (this.isEventType('EDIT_BOOKING') || this.isEventType('ADD_ROOM')) {
        this.bookedByInfoData.message = this.defaultData.NOTES;
      }
      this.didReservation = true;
      const serviceParams = await this.bookPropertyService.prepareBookUserServiceParams({
        context: this,
        sourceOption: this.sourceOption,
        check_in,
      });
      // console.log(serviceParams);
      await this.bookingService.doReservation(serviceParams);
      this.resetBookingEvt.emit(null);
    } catch (error) {
      console.error('Error booking user:', error);
    } finally {
      // this.isLoading = null;
      this.resetLoadingState();
    }
  }

  private setLoadingState(assign_units: boolean) {
    if (this.isEventType('EDIT_BOOKING') || this.isEventType('ADD_ROOM')) {
      this.isLoading = 'save';
    } else {
      this.isLoading = assign_units ? 'bookAndCheckIn' : 'book';
    }
  }

  private resetLoadingState() {
    this.isLoading = '';
    setTimeout(() => {
      this.closeWindow();
    }, 100);
  }

  private getCurrentPage(name: string) {
    return this.page === name;
  }

  render() {
    return (
      <Host>
        <div class="background-overlay" onClick={() => this.closeWindow()}></div>
        <div class={'sideWindow pb-5 pb-md-0 ' + (this.getCurrentPage('page_block_date') ? 'block-date' : '')}>
          <div class="card position-sticky mb-0 shadow-none p-0 ">
            <div class="card-header-container mb-2">
              <h3 class=" text-left font-medium-2 px-2 px-md-3">{this.getCurrentPage('page_block_date') ? this.defaultData.BLOCK_DATES_TITLE : this.defaultData.TITLE}</h3>
              <ir-icon
                class={'px-2'}
                onIconClickHandler={() => {
                  this.closeWindow();
                }}
              >
                <svg slot="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" height={20} width={20}>
                  <path
                    fill="currentColor"
                    d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
                  />
                </svg>
              </ir-icon>
            </div>
          </div>
          <div class="px-2 px-md-3">
            {this.getCurrentPage('page_one') && (
              <igl-booking-overview-page
                initialRoomIds={this.initialRoomIds}
                defaultDaterange={this.defaultDateRange}
                class={'p-0 mb-1'}
                eventType={this.defaultData.event_type}
                selectedRooms={this.selectedUnits}
                currency={this.currency}
                showSplitBookingOption={this.showSplitBookingOption}
                ratePricingMode={this.ratePricingMode}
                dateRangeData={this.dateRangeData}
                bookingData={this.defaultData}
                adultChildCount={this.adultChildCount}
                bookedByInfoData={this.bookedByInfoData}
                adultChildConstraints={this.adultChildConstraints}
                sourceOptions={this.sourceOptions}
                propertyId={this.propertyid}
              ></igl-booking-overview-page>
            )}

            {this.getCurrentPage('page_two') && (
              <igl-booking-form
                currency={this.currency}
                propertyId={this.propertyid}
                showPaymentDetails={this.showPaymentDetails}
                selectedGuestData={this.guestData}
                countryNodeList={this.countryNodeList}
                isLoading={this.isLoading}
                selectedRooms={this.selectedUnits}
                bedPreferenceType={this.bedPreferenceType}
                dateRangeData={this.dateRangeData}
                bookingData={this.defaultData}
                showSplitBookingOption={this.showSplitBookingOption}
                language={this.language}
                bookedByInfoData={this.bookedByInfoData}
                defaultGuestData={this.defaultData}
                isEditOrAddRoomEvent={this.isEventType('EDIT_BOOKING') || this.isEventType('ADD_ROOM')}
                onDataUpdateEvent={event => this.handlePageTwoDataUpdateEvent(event)}
              ></igl-booking-form>
            )}
            {this.getCurrentPage('page_block_date') ? this.getPageBlockDatesView() : null}
          </div>
        </div>
      </Host>
    );
  }
}

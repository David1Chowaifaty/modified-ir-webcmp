import { Component, Event, EventEmitter, Host, Prop, State, h, Listen } from '@stencil/core';
import { BookingService } from '../../../services/booking.service';
import { dateToFormattedString, getReleaseHoursString } from '../../../utils/utils';
import { IEntries, RoomBlockDetails, RoomBookingDetails } from '../../../models/IBooking';
import { IPageTwoDataUpdateProps, PageTwoButtonsTypes } from '../../../models/models';
import { EventsService } from '../../../services/events.service';
import { transformNewBLockedRooms, transformNewBooking } from '../../../utils/booking';

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
  @Prop() currency: { id: number; code: string };
  @Prop({ reflect: true, mutable: true }) bookingData: { [key: string]: any };
  @State() sourceOption: { code: string; description: string; tag: string } = {
    code: '',
    description: '',
    tag: '',
  };
  @State() splitBookingId: any = '';
  @State() renderAgain: boolean = false;
  @State() message: string = '';
  @State() isLoading: string;
  @State() isConvertedBooking: boolean;
  @State() dateRangeData: { [key: string]: any };
  @State() selectedUnits: { [key: string]: any } = {};
  @Event() closeBookingWindow: EventEmitter<{ [key: string]: any }>;
  @Event() bookingCreated: EventEmitter<{ pool?: string; data: RoomBookingDetails[] }>;
  @Event() blockedCreated: EventEmitter<RoomBlockDetails>;
  private PAGE_ZERO: string = 'page_zero';
  private PAGE_ONE: string = 'page_one';
  private PAGE_TWO: string = 'page_two';
  private PAGE_BLOCK_DATES: string = 'page_block_date';
  private page: string;
  private showSplitBookingOption: boolean = false;
  private sourceOptions: { id: string; value: string; tag: string }[] = [];
  private selectedRooms: { [key: string]: any } = {};
  private guestData: { [key: string]: any }[] = [];
  private bookedByInfoData: { [key: string]: any } = {};
  private blockDatesData: { [key: string]: any } = {};
  private ratePricingMode: IEntries[] = [];
  private bedPreferenceType: IEntries[] = [];
  private bookingService: BookingService = new BookingService();
  private eventsService = new EventsService();
  componentDidLoad() {
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        this.closeWindow();
      }
    });
  }
  disconnectedCallback() {
    document.removeEventListener('keydown', () => {});
  }
  async componentWillLoad() {
    if (!this.bookingData.defaultDateRange) {
      return;
    }

    this.dateRangeData = { ...this.bookingData.defaultDateRange };

    try {
      const setupEntries = await this.fetchSetupEntries();
      this.setSourceOptions(this.allowedBookingSources);
      this.setOtherProperties(setupEntries);

      if (this.isEventType('EDIT_BOOKING')) {
        this.setEditingRoomInfo();
      }
      //this.bookingData.roomsInfo = [];
      this.page = this.getDefaultPage();
    } catch (error) {
      console.error('Error fetching setup entries:', error);
    }
  }

  async fetchSetupEntries() {
    return await this.bookingService.fetchSetupEntries();
  }

  setSourceOptions(bookingSource: any[]) {
    this.sourceOptions = bookingSource.map(source => ({
      id: source.code,
      value: source.description,
      tag: source.tag,
    }));
    if (this.isEventType('EDIT_BOOKING')) {
      this.sourceOption = { ...this.bookingData.SOURCE };
      console.log(this.sourceOption);
    } else {
      this.sourceOption = {
        code: bookingSource[0].code,
        description: bookingSource[0].description,
        tag: bookingSource[0].tag,
      };
    }
  }

  setOtherProperties(res: any) {
    this.ratePricingMode = res.ratePricingMode;
    this.bookedByInfoData.arrivalTime = res.arrivalTime;
    this.bedPreferenceType = res.bedPreferenceType;
  }

  setEditingRoomInfo() {
    const category = this.getRoomCategoryByRoomId(this.getBookingPreferenceRoomId());
    const key = `c_${category.id}`;
    this.selectedRooms[key] = {
      [`p_${this.bookingData.RATE_PLAN_ID}`]: {
        adultCount: this.bookingData.ADULTS_COUNT,
        rate: this.bookingData.RATE,
        rateType: this.bookingData.RATE_TYPE,
        ratePlanId: this.bookingData.RATE_PLAN_ID,
        roomCategoryId: category.id,
        roomCategoryName: category.name,
        totalRooms: 1,
        ratePlanName: this.bookingData.RATE_PLAN,
        roomId: this.bookingData.PR_ID,
        guestName: this.bookingData.NAME,
        cancelation: this.bookingData.cancelation,
        guarantee: this.bookingData.guarantee,
        adult_child_offering: this.bookingData.adult_child_offering,
      },
    };
  }

  async initializeBookingAvailability(from_date: string, to_date: string) {
    try {
      const room_type_ids = this.bookingData.roomsInfo.map(room => room.id);
      const data = await this.bookingService.getBookingAvailability(from_date, to_date, this.propertyid, this.language, room_type_ids, this.currency);
      this.message = '';
      this.bookingData = {
        ...this.bookingData,
        roomsInfo: data.roomtypes,
      };
      this.message = data.tax_statement;
      console.log(data);
    } catch (error) {
      // toastr.error(error);
    }
  }
  getRoomCategoryByRoomId(roomId) {
    return this.bookingData.roomsInfo?.find(roomCategory => {
      return roomCategory.physicalrooms.find(room => room.id === +roomId);
    });
  }

  getDefaultPage() {
    if (this.bookingData.event_type === 'BLOCK_DATES') {
      return this.PAGE_BLOCK_DATES;
    } else if (this.bookingData.event_type === 'SPLIT_BOOKING') {
      this.showSplitBookingOption = true;
      return this.PAGE_ONE;
    } else {
      // if( || this.bookingData.event_type === "NEW_BOOKING")
      return this.PAGE_ONE;
    }
  }

  getBookingPreferenceRoomId() {
    //console.log(this.bookingData);
    return (this.bookingData.hasOwnProperty('PR_ID') && this.bookingData.PR_ID) || null;
  }

  getSplitBookings() {
    return (this.bookingData.hasOwnProperty('splitBookingEvents') && this.bookingData.splitBookingEvents) || [];
  }
  isEventType(key: string) {
    return this.bookingData.event_type === key;
  }

  closeWindow() {
    this.isConvertedBooking = false;
    this.closeBookingWindow.emit();
  }
  isEditBooking() {
    return this.bookingData.event_type === 'EDIT_BOOKING';
  }
  onRoomsDataUpdate(event: CustomEvent<{ [key: string]: any }>) {
    const { data, key, changedKey } = event.detail;
    const roomCategoryKey = this.getRoomCategoryKey(data.roomCategoryId);
    const ratePlanKey = this.getRatePlanKey(data.ratePlanId);

    if (this.shouldClearData(key)) {
      this.selectedRooms = {};
    }

    this.initializeRoomCategoryIfNeeded(roomCategoryKey);

    if (this.isEditBooking()) {
      if (changedKey === 'rate') {
        if (this.selectedRooms.hasOwnProperty(roomCategoryKey) && this.selectedRooms[roomCategoryKey].hasOwnProperty(ratePlanKey)) {
          this.applyBookingEditToSelectedRoom(roomCategoryKey, ratePlanKey, data);
        }
      } else {
        if (changedKey !== 'rateType') {
          if (changedKey === 'adult_child_offering') {
            if (this.selectedRooms.hasOwnProperty(roomCategoryKey) && this.selectedRooms[roomCategoryKey].hasOwnProperty(ratePlanKey)) {
              this.applyBookingEditToSelectedRoom(roomCategoryKey, ratePlanKey, data);
            }
          } else {
            this.applyBookingEditToSelectedRoom(roomCategoryKey, ratePlanKey, data);
          }
        }
      }
    } else {
      this.setSelectedRoomData(roomCategoryKey, ratePlanKey, data);
    }

    this.cleanupEmptyData(roomCategoryKey, ratePlanKey);
    this.renderPage();
  }
  getRoomCategoryKey(roomCategoryId: string): string {
    return `c_${roomCategoryId}`;
  }

  getRatePlanKey(ratePlanId: string): string {
    return `p_${ratePlanId}`;
  }

  shouldClearData(key: string | undefined): boolean {
    return key === 'clearData' || this.isEditBookingEvent(key);
  }

  isEditBookingEvent(key: string | undefined): boolean {
    return key === 'EDIT_BOOKING';
  }

  initializeRoomCategoryIfNeeded(roomCategoryKey: string) {
    if (!this.selectedRooms[roomCategoryKey]) {
      this.selectedRooms[roomCategoryKey] = {};
    }
  }

  setSelectedRoomData(roomCategoryKey: string, ratePlanKey: string, data: any) {
    this.selectedRooms[roomCategoryKey][ratePlanKey] = data;
  }

  hasSelectedRoomData(roomCategoryKey: string, ratePlanKey: string): boolean {
    return this.selectedRooms[roomCategoryKey] && this.selectedRooms[roomCategoryKey][ratePlanKey];
  }

  cleanupEmptyData(roomCategoryKey: string, ratePlanKey: string) {
    if (this.selectedRooms[roomCategoryKey][ratePlanKey]?.totalRooms === 0) {
      delete this.selectedRooms[roomCategoryKey][ratePlanKey];
    }

    if (!Object.keys(this.selectedRooms[roomCategoryKey]).length) {
      delete this.selectedRooms[roomCategoryKey];
    }
  }

  applyBookingEditToSelectedRoom(roomCategoryKey: string, ratePlanKey: string, data) {
    this.selectedRooms = {
      [roomCategoryKey]: {
        [ratePlanKey]: {
          ...data,
          guestName: this.bookingData.NAME,
          roomId: this.bookingData.PR_ID,
        },
      },
    };
  }

  onDateRangeSelect(event: CustomEvent<{ [key: string]: any }>) {
    const opt: { [key: string]: any } = event.detail;
    if (opt.key === 'selectedDateRange') {
      this.dateRangeData = opt.data;
      this.bookingData.defaultDateRange.fromDate = new Date(this.dateRangeData.fromDate);
      this.bookingData.defaultDateRange.toDate = new Date(this.dateRangeData.toDate);
      this.initializeBookingAvailability(dateToFormattedString(this.bookingData.defaultDateRange.fromDate), dateToFormattedString(this.bookingData.defaultDateRange.toDate));
    }
  }

  handleBlockDateUpdate(event: CustomEvent<{ [key: string]: any }>) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    const opt: { [key: string]: any } = event.detail;
    this.blockDatesData = opt.data;
    //console.log("blocked date data", this.blockDatesData);
  }

  handleSubmit(event) {
    event.preventDefault();
    //console.log(event);
  }

  handleGuestInfoUpdate(event: CustomEvent<{ [key: string]: any }>) {
    event.stopImmediatePropagation();
    event.stopPropagation();

    const opt = event.detail;
    if (opt.guestRefKey) {
      if (this.isEventType('BAR_BOOKING')) {
        this.guestData[opt.guestRefKey] = {
          ...opt.data,
          roomId: this.bookingData.PR_ID,
        };
      } else this.guestData[opt.guestRefKey] = opt.data;
    }
  }

  handleBookedByInfoUpdate(event: CustomEvent<{ [key: string]: any }>) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    const opt: { [key: string]: any } = event.detail;
    this.bookedByInfoData = opt.value.data;
  }

  isActiveSouceOption(srcIndex) {
    return this.sourceOption === srcIndex ? 'active' : '';
  }

  handleSourceDropDown(selectedOption) {
    const selectedSource = this.sourceOptions.find(opt => opt.id === selectedOption.target.value.toString());
    this.sourceOption = {
      code: selectedOption.target.value,
      description: selectedSource.value || '',
      tag: selectedSource.tag,
    };
  }

  renderPage() {
    this.renderAgain = !this.renderAgain;
  }

  @Listen('gotoSplitPageTwoEvent', { target: 'window' })
  gotoSplitPageTwo() {
    this.gotoPage(this.PAGE_TWO);
  }

  gotoPage(gotoPage) {
    this.page = gotoPage;
    this.renderPage();
  }

  showSplitBooking() {
    this.showSplitBookingOption = true;
    this.gotoPage(this.PAGE_ONE);
  }

  getSelectedSplitBookingName(bookingId) {
    let splitBooking = this.getSplitBookings().find(booking => booking.ID === bookingId);
    return splitBooking.ID + ' ' + splitBooking.NAME;
  }

  isActiveSplitBookingOption(spltIndex) {
    return this.splitBookingId === spltIndex ? 'active' : '';
  }

  handleSplitBookingDropDown(evt) {
    this.splitBookingId = evt.target.value;
  }

  isPageZero() {
    return this.page === this.PAGE_ZERO;
  }

  isPageOne() {
    return this.page === this.PAGE_ONE;
  }

  isPageTwo() {
    return this.page === this.PAGE_TWO;
  }

  isPageBlockDates() {
    return this.page === this.PAGE_BLOCK_DATES;
  }

  getSplitBookingList() {
    return (
      <fieldset class="form-group col-12 text-left">
        <label class="h5">To booking# </label>
        <div class="btn-group ml-1">
          <select class="form-control input-sm" id="xSmallSelect" onChange={evt => this.handleSplitBookingDropDown(evt)}>
            <option value="" selected={this.splitBookingId != ''}>
              Select
            </option>
            {this.getSplitBookings().map(option => (
              <option value={option.ID} selected={this.splitBookingId === option.ID}>
                {this.getSelectedSplitBookingName(option.ID)}
              </option>
            ))}
          </select>

          {/* <button type="button" class="btn btn-primary dropdown-toggle" name="sourceType" data-toggle="dropdown">
                    {this.splitBookingId!=null ? this.getSelectedSplitBookingName(this.splitBookingId) : "Select"}
                </button>
                <div class="dropdown-menu">
                  {this.getSplitBookings().map((option) => <button class={`dropdown-item ${this.isActiveSplitBookingOption(option.ID)}`}  type="button" onClick={() => this.handleSplitBookingDropDown(option.ID)}>{this.getSelectedSplitBookingName(option.ID)}</button>)}
                </div> */}
        </div>
      </fieldset>
    );
  }

  getSourceNode() {
    return (
      <fieldset class="form-group col-12 text-left">
        <label class="h5">Source </label>
        <div class="btn-group ml-1">
          <select class="form-control input-sm" id="xSmallSelect" onChange={evt => this.handleSourceDropDown(evt)}>
            {this.sourceOptions.map(option => (
              <option value={option.id} selected={this.sourceOption.code === option.id}>
                {option.value}
              </option>
            ))}
          </select>
        </div>
      </fieldset>
    );
  }

  getRoomsListFromCategoryId(categoryId) {
    let category = this.bookingData.roomsInfo?.find(category => category.id === categoryId);
    return (category && category.physicalrooms) || [];
  }

  getPageZeroView() {
    return (
      <div class="scrollContent">
        <div class="row p-0 mb-1">
          <div class="col-md-3 col-sm-12 mb-1">
            <button class="btn btn-primary full-width" onClick={() => this.gotoPage(this.PAGE_ONE)}>
              Create New Booking
            </button>
          </div>
          {this.getSplitBookings().length ? (
            <div class="col-md-3 col-sm-12 mb-1">
              <button class="btn btn-primary full-width" onClick={() => this.showSplitBooking()}>
                Add Unit to Existing Booking
              </button>
            </div>
          ) : null}
          <div class="col-md-3 col-sm-12 mb-1">
            <button class="btn btn-primary full-width" onClick={() => this.gotoPage(this.PAGE_BLOCK_DATES)}>
              Block Dates
            </button>
          </div>
          <div class="col-md-3 col-sm-12 mb-1">
            <button class="btn btn-secondary full-width" onClick={() => this.closeWindow()}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  getPageOneView() {
    return (
      <div class="scrollContent">
        {this.showSplitBookingOption ? this.getSplitBookingList() : this.isEventType('EDIT_BOOKING') || this.isEventType('ADD_ROOM') ? null : this.getSourceNode()}

        <fieldset class="form-group col-12 row">
          <igl-date-range
            disabled={this.isEventType('BAR_BOOKING')}
            message={this.message}
            defaultData={this.bookingData.defaultDateRange}
            onDateSelectEvent={evt => this.onDateRangeSelect(evt)}
          ></igl-date-range>
        </fieldset>

        <div class="col text-left">
          {this.bookingData.roomsInfo?.map(roomInfo => (
            <igl-booking-rooms
              currency={this.currency}
              ratePricingMode={this.ratePricingMode}
              dateDifference={this.dateRangeData.dateDifference}
              bookingType={this.bookingData.event_type}
              roomTypeData={roomInfo}
              class="mt-2 mb-1"
              defaultData={this.selectedRooms['c_' + roomInfo.id]}
              onDataUpdateEvent={evt => this.onRoomsDataUpdate(evt)}
            ></igl-booking-rooms>
          ))}
        </div>

        {this.isEventType('EDIT_BOOKING') ? (
          <div class="row p-0 mb-1 mt-2">
            <div class="col-6">
              <button class="btn btn-secondary full-width" onClick={() => this.closeWindow()}>
                Cancel
              </button>
            </div>
            <div class="col-6">
              <button class="btn btn-primary full-width" onClick={() => this.gotoPage(this.PAGE_TWO)}>
                Next &gt;&gt;
              </button>
            </div>
          </div>
        ) : (
          <div class="row p-0 mb-1 mt-2">
            <div class={this.bookingData.event_type === 'PLUS_BOOKING' || this.isEventType('ADD_ROOM') ? 'col-6' : 'col-12'}>
              <button class="btn btn-secondary full-width" onClick={() => this.closeWindow()}>
                Cancel
              </button>
            </div>
            {this.bookingData.event_type === 'PLUS_BOOKING' || this.isEventType('ADD_ROOM') ? (
              <div class="col-6">
                <button class="btn btn-primary full-width" disabled={Object.keys(this.selectedRooms).length === 0} onClick={() => this.gotoPage(this.PAGE_TWO)}>
                  Next &gt;&gt;
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    );
  }

  getPageBlockDatesView() {
    return (
      <div class="scrollContent blockDatesForm">
        <igl-block-dates-view
          fromDate={this.dateRangeData.fromDateStr}
          toDate={this.dateRangeData.toDateStr}
          entryDate={this.bookingData.ENTRY_DATE}
          onDataUpdateEvent={event => this.handleBlockDateUpdate(event)}
        ></igl-block-dates-view>
        <div class="row p-0 mb-1 mt-2">
          <div class="col-6">
            <button class="btn btn-secondary full-width" onClick={() => this.closeWindow()}>
              Cancel
            </button>
          </div>
          <div class="col-6">
            <button class="btn btn-primary full-width" onClick={() => this.handleBlockDate()}>
              Block dates
            </button>
          </div>
        </div>
      </div>
    );
  }

  handleButtonClicked(
    event: CustomEvent<{
      key: PageTwoButtonsTypes;
      data?: CustomEvent;
    }>,
  ) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    switch (event.detail.key) {
      case 'save':
        this.bookUser(false);
        break;
      case 'cancel':
        this.closeWindow();
        break;
      case 'back':
        this.gotoPage(this.PAGE_ONE);
        break;
      case 'book':
        this.bookUser(false);
        break;
      case 'bookAndCheckIn':
        this.bookUser(true);
        break;
      default:
        break;
    }
  }
  handlePageTwoDataUpdateEvent(event: CustomEvent<IPageTwoDataUpdateProps>) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    if (event.detail.key === 'propertyBookedBy') {
      this.handleBookedByInfoUpdate(event);
    } else {
      this.handleGuestInfoUpdate(event);
    }
  }
  async handleBlockDate() {
    const releaseData = getReleaseHoursString(+this.blockDatesData.RELEASE_AFTER_HOURS);
    const result = await this.bookingService.blockUnit({
      from_date: dateToFormattedString(this.bookingData.defaultDateRange.fromDate),
      to_date: dateToFormattedString(this.bookingData.defaultDateRange.toDate),
      NOTES: this.blockDatesData.OPTIONAL_REASON || '',
      pr_id: this.bookingData.PR_ID.toString(),
      STAY_STATUS_CODE: this.blockDatesData.OUT_OF_SERVICE ? '004' : this.blockDatesData.RELEASE_AFTER_HOURS === 0 ? '002' : '003',
      DESCRIPTION: this.blockDatesData.RELEASE_AFTER_HOURS || '',
      ...releaseData,
    });
    const blockedUnit = await transformNewBLockedRooms(result);
    this.blockedCreated.emit(blockedUnit);
    this.closeWindow();
    //window.location.reload();
  }

  async bookUser(check_in: boolean) {
    this.setLoadingState(check_in);

    try {
      let booking = {
        pool: '',
        data: [],
      };
      if (['003', '002', '004'].includes(this.bookingData.STATUS_CODE)) {
        this.eventsService.deleteEvent(this.bookingData.POOL);
        booking.pool = this.bookingData.POOL;
      }
      if (this.isEventType('EDIT_BOOKING')) {
        booking.pool = this.bookingData.POOL;
      }

      const arrivalTime = this.isEventType('EDIT_BOOKING') ? this.getArrivalTimeForBooking() : '';
      const pr_id = this.isEventType('BAR_BOOKING') ? this.bookingData.PR_ID : undefined;
      const booking_nbr = this.isEventType('EDIT_BOOKING') ? this.bookingData.BOOKING_NUMBER : undefined;
      if (this.isEventType('EDIT_BOOKING')) {
        this.bookedByInfoData.message = this.bookingData.NOTES;
      }
      console.log(this.guestData);
      const result = await this.bookingService.bookUser(
        this.bookedByInfoData,
        check_in,
        this.bookingData.defaultDateRange.fromDate,
        this.bookingData.defaultDateRange.toDate,
        this.guestData,
        this.dateRangeData.dateDifference,
        this.sourceOption,
        this.propertyid,
        this.currency,
        booking_nbr,
        this.bookingData.GUEST,
        arrivalTime,
        pr_id,
      );
      if (check_in || this.isEventType('EDIT_BOOKING')) {
        const newBookings: RoomBookingDetails[] = transformNewBooking(result);
        booking.data = newBookings;
        //this.bookingCreated.emit(booking);
      }
      //window.location.reload();
      //console.log("booking data ", this.bookingData);
    } catch (error) {
      //  toastr.error(error);
    } finally {
      this.resetLoadingState();
    }
  }

  setLoadingState(assign_units: boolean) {
    if (this.isEventType('EDIT_BOOKING')) {
      this.isLoading = 'save';
    } else {
      this.isLoading = assign_units ? 'bookAndCheckIn' : 'book';
    }
  }

  getArrivalTimeForBooking(): string {
    return this.bookedByInfoData.arrivalTime.find(e => e.CODE_VALUE_EN === this.bookingData.ARRIVAL_TIME).CODE_NAME;
  }

  resetLoadingState() {
    this.isLoading = '';
    setTimeout(() => {
      this.closeWindow();
    }, 100);
  }
  render() {
    return (
      <Host>
        <div class="background-overlay" onClick={() => this.closeWindow()}></div>
        <div class={'sideWindow ' + (this.isPageBlockDates() ? 'col-sm-12 col-md-6 col-lg-5 col-xl-4' : 'col-sm-12 col-md-11 col-lg-9 col-xl-8')}>
          <div class="card mb-0 shadow-none p-0">
            <div class="card-header">
              <h3 class="card-title text-left pb-1 font-medium-2">{this.isPageBlockDates() ? this.bookingData.BLOCK_DATES_TITLE : this.bookingData.TITLE}</h3>
              <button type="button" class="close close-icon" onClick={() => this.closeWindow()}>
                <i class="ft-x"></i>
              </button>
            </div>
          </div>

          {this.isPageZero() && this.getPageZeroView()}

          {this.isPageOne() && this.getPageOneView()}

          {this.isPageTwo() && (
            <igl-pagetwo
              showPaymentDetails={this.showPaymentDetails}
              selectedGuestData={this.guestData}
              countryNodeList={this.countryNodeList}
              isLoading={this.isLoading}
              selectedRooms={this.selectedRooms}
              bedPreferenceType={this.bedPreferenceType}
              dateRangeData={this.dateRangeData}
              bookingData={this.bookingData}
              showSplitBookingOption={this.showSplitBookingOption}
              language={this.language}
              bookedByInfoData={this.bookedByInfoData}
              isEditOrAddRoomEvent={this.isEventType('EDIT_BOOKING') || this.isEventType('ADD_ROOM')}
              onDataUpdateEvent={event => this.handlePageTwoDataUpdateEvent(event)}
              onButtonClicked={event => this.handleButtonClicked(event)}
            ></igl-pagetwo>
          )}

          {this.isPageBlockDates() ? this.getPageBlockDatesView() : null}
        </div>
      </Host>
    );
  }
}

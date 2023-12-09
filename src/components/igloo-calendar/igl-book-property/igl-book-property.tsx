import { Component, Event, EventEmitter, Host, Prop, State, h, Listen, Fragment } from '@stencil/core';
import { BookingService } from '../../../services/booking.service';
import { dateToFormattedString, getReleaseHoursString } from '../../../utils/utils';
import { IEntries, RoomBlockDetails, RoomBookingDetails } from '../../../models/IBooking';
import { IPageTwoDataUpdateProps } from '../../../models/models';
import { transformNewBLockedRooms } from '../../../utils/booking';
import { IglBookPropertyService } from './igl-book-property.service';
import { TAdultChildConstraints, TPropertyButtonsTypes, TSourceOption, TSourceOptions } from '../../../models/igl-book-property';
import { EventsService } from '../../../services/events.service';

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
  @Prop() adultChildConstraints: TAdultChildConstraints;
  @State() adultChildCount: { adult: number; child: number } = {
    adult: 0,
    child: 0,
  };
  @State() renderAgain: boolean = false;
  @State() defaultData: any;
  @State() isLoading: string;
  private message: string = '';
  private sourceOption: TSourceOption;
  private dateRangeData: { [key: string]: any };
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
  private eventsService = new EventsService();

  @Event() closeBookingWindow: EventEmitter<{ [key: string]: any }>;
  @Event() bookingCreated: EventEmitter<{ pool?: string; data: RoomBookingDetails[] }>;
  @Event() blockedCreated: EventEmitter<RoomBlockDetails>;
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
    this.defaultData = this.bookingData;
    this.dateRangeData = { ...this.defaultData.defaultDateRange };
    try {
      const setupEntries = await this.fetchSetupEntries();
      this.setSourceOptions(this.allowedBookingSources);
      this.setOtherProperties(setupEntries);

      if (this.isEventType('EDIT_BOOKING')) {
        this.adultChildCount = {
          adult: this.defaultData.ADULTS_COUNT,
          child: this.defaultData.CHILDREN_COUNT,
        };

        this.bookPropertyService.setEditingRoomInfo(this.defaultData, this.selectedUnits);
      }
      if (!this.isEventType('BAR_BOOKING')) {
        this.defaultData.roomsInfo = [];
      }

      if (this.defaultData.event_type === 'SPLIT_BOOKING') {
        this.showSplitBookingOption = true;
        this.page = 'page_one';
      } else if (this.defaultData.event_type === 'BLOCK_DATES') {
        this.page = 'page_block_date';
      } else {
        this.page = 'page_one';
      }
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
      type: source.type,
    }));
    if (this.isEventType('EDIT_BOOKING')) {
      this.sourceOption = { ...this.defaultData.SOURCE };
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
  @Listen('adultChild')
  handleAdultChildChange(event: CustomEvent) {
    this.adultChildCount = { ...event.detail };
  }

  async initializeBookingAvailability(from_date: string, to_date: string) {
    try {
      const room_type_ids = this.defaultData.roomsInfo.map(room => room.id);
      const data = await this.bookingService.getBookingAvailability(from_date, to_date, this.propertyid, this.adultChildCount, this.language, room_type_ids, this.currency);
      this.message = '';
      this.message = data.tax_statement;
      if (!this.isEventType('EDIT_BOOKING')) {
        this.defaultData.defaultDateRange.fromDate = new Date(this.dateRangeData.fromDate);
        this.defaultData.defaultDateRange.toDate = new Date(this.dateRangeData.toDate);
      }
      this.defaultData = { ...this.defaultData, roomsInfo: data.roomtypes };
    } catch (error) {
      // toastr.error(error);
    }
  }
  getRoomCategoryByRoomId(roomId) {
    return this.defaultData.roomsInfo?.find(roomCategory => {
      return roomCategory.physicalrooms.find(room => room.id === +roomId);
    });
  }

  getSplitBookings() {
    return (this.defaultData.hasOwnProperty('splitBookingEvents') && this.defaultData.splitBookingEvents) || [];
  }
  closeWindow() {
    this.dateRangeData = {};
    this.closeBookingWindow.emit();
  }
  isEventType(key: string) {
    return this.defaultData.event_type === key;
  }
  @Listen('dateSelectEvent')
  onDateRangeSelect(event: CustomEvent<{ [key: string]: any }>) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    const opt: { [key: string]: any } = event.detail;
    if (opt.key === 'selectedDateRange') {
      this.dateRangeData = opt.data;
      if (this.adultChildCount.adult !== 0) {
        this.initializeBookingAvailability(dateToFormattedString(new Date(this.dateRangeData.fromDate)), dateToFormattedString(new Date(this.dateRangeData.toDate)));
      }
    }
  }

  handleBlockDateUpdate(event: CustomEvent<{ [key: string]: any }>) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    const opt: { [key: string]: any } = event.detail;
    this.blockDatesData = opt.data;
  }

  handleGuestInfoUpdate(event: CustomEvent<{ [key: string]: any }>) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    const opt = event.detail;
    if (opt.guestRefKey) {
      if (this.isEventType('BAR_BOOKING')) {
        this.guestData[opt.guestRefKey] = {
          ...opt.data,
          roomId: this.defaultData.PR_ID,
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
    };
  }
  renderPage() {
    this.renderAgain = !this.renderAgain;
  }

  @Listen('gotoSplitPageTwoEvent', { target: 'window' })
  gotoSplitPageTwo() {
    this.gotoPage('page_two');
  }
  gotoPage(gotoPage) {
    this.page = gotoPage;
    this.renderPage();
  }

  showSplitBooking() {
    this.showSplitBookingOption = true;
    this.gotoPage('page_one');
  }

  getPageBlockDatesView() {
    return (
      <Fragment>
        <igl-block-dates-view
          fromDate={this.dateRangeData.fromDateStr}
          toDate={this.dateRangeData.toDateStr}
          entryDate={this.defaultData.ENTRY_DATE}
          onDataUpdateEvent={event => this.handleBlockDateUpdate(event)}
        ></igl-block-dates-view>
        <div class="p-0 mb-1 mt-2 gap-30 d-flex align-items-center justify-content-between">
          <button class="btn btn-secondary flex-fill" onClick={() => this.closeWindow()}>
            Cancel
          </button>

          <button class="btn btn-primary flex-fill" onClick={() => this.handleBlockDate()}>
            Block dates
          </button>
        </div>
      </Fragment>
    );
  }
  @Listen('buttonClicked')
  handleButtonClicked(
    event: CustomEvent<{
      key: TPropertyButtonsTypes;
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
        this.gotoPage('page_one');
        break;
      case 'book':
        this.bookUser(false);
        break;
      case 'bookAndCheckIn':
        this.bookUser(true);
        break;
      case 'next':
        this.gotoPage('page_two');
      case 'check':
        this.initializeBookingAvailability(dateToFormattedString(new Date(this.dateRangeData.fromDate)), dateToFormattedString(new Date(this.dateRangeData.toDate)));
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
      from_date: dateToFormattedString(this.defaultData.defaultDateRange.fromDate),
      to_date: dateToFormattedString(this.defaultData.defaultDateRange.toDate),
      NOTES: this.blockDatesData.OPTIONAL_REASON || '',
      pr_id: this.defaultData.PR_ID.toString(),
      STAY_STATUS_CODE: this.blockDatesData.OUT_OF_SERVICE ? '004' : this.blockDatesData.RELEASE_AFTER_HOURS === 0 ? '002' : '003',
      DESCRIPTION: this.blockDatesData.RELEASE_AFTER_HOURS || '',
      ...releaseData,
    });
    const blockedUnit = await transformNewBLockedRooms(result);
    this.blockedCreated.emit(blockedUnit);
    this.closeWindow();
  }

  async bookUser(check_in: boolean) {
    this.setLoadingState(check_in);
    try {
      if (['003', '002', '004'].includes(this.defaultData.STATUS_CODE)) {
        this.eventsService.deleteEvent(this.defaultData.POOL);
      }
      if (this.isEventType('EDIT_BOOKING')) {
        this.bookedByInfoData.message = this.defaultData.NOTES;
      }
      const serviceParams = this.bookPropertyService.prepareBookUserServiceParams(this, check_in, this.sourceOption);
      await this.bookingService.bookUser(...serviceParams);
    } catch (error) {
      // Handle error
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
    return this.bookedByInfoData.arrivalTime.find(e => e.CODE_VALUE_EN === this.defaultData.ARRIVAL_TIME).CODE_NAME;
  }

  resetLoadingState() {
    this.isLoading = '';
    setTimeout(() => {
      this.closeWindow();
    }, 100);
  }
  onRoomDataUpdate(event: CustomEvent) {
    const units = this.bookPropertyService.onDataRoomUpdate(event, this.selectedUnits, this.isEventType('EDIT_BOOKING'), this.defaultData.NAME);
    this.selectedUnits = new Map(units);
    this.renderPage();
  }
  getCurrentPage(name: string) {
    return this.page === name;
  }
  render() {
    //console.log('render');
    return (
      <Host>
        <div class="background-overlay" onClick={() => this.closeWindow()}></div>
        <div class={'sideWindow ' + (this.getCurrentPage('page_block_date') ? 'block-date' : '')}>
          <div class="card position-sticky mb-0 shadow-none p-0 ">
            <div class="d-flex mt-2 align-items-center justify-content-between  ">
              <h3 class="card-title text-left pb-1 font-medium-2 px-2 px-md-3">
                {this.getCurrentPage('page_block_date') ? this.defaultData.BLOCK_DATES_TITLE : this.defaultData.TITLE}
              </h3>
              <button type="button" class="close close-icon" onClick={() => this.closeWindow()}>
                <i class="ft-x"></i>
              </button>
            </div>
          </div>
          <div class="px-2 px-md-3">
            {this.getCurrentPage('page_one') && (
              <igl-booking-overview-page
                class={'p-0 mb-1'}
                eventType={this.defaultData.event_type}
                selectedRooms={this.selectedUnits}
                currency={this.currency}
                message={this.message}
                showSplitBookingOption={this.showSplitBookingOption}
                ratePricingMode={this.ratePricingMode}
                dateRangeData={this.dateRangeData}
                bookingData={this.defaultData}
                adultChildCount={this.adultChildCount}
                // bookingDataDefaultDateRange={this.dateRangeData}
                adultChildConstraints={this.adultChildConstraints}
                onRoomsDataUpdate={evt => {
                  this.onRoomDataUpdate(evt);
                }}
                sourceOptions={this.sourceOptions}
              ></igl-booking-overview-page>
            )}

            {this.getCurrentPage('page_two') && (
              <igl-pagetwo
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
                isEditOrAddRoomEvent={this.isEventType('EDIT_BOOKING') || this.isEventType('ADD_ROOM')}
                onDataUpdateEvent={event => this.handlePageTwoDataUpdateEvent(event)}
              ></igl-pagetwo>
            )}
            {this.getCurrentPage('page_block_date') ? this.getPageBlockDatesView() : null}
          </div>
        </div>
      </Host>
    );
  }
}

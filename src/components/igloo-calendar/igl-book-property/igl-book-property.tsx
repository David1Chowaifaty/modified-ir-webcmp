import { Component, Event, EventEmitter, Host, Prop, State, h, Listen } from '@stencil/core';
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
  @State() sourceOption: TSourceOption;
  @State() splitBookingId: any = '';
  @State() renderAgain: boolean = false;
  @State() message: string = '';
  @State() isLoading: string;
  @State() dateRangeData: { [key: string]: any };
  @State() adultChildCount: { adult: number; child: number } = {
    adult: 0,
    child: 0,
  };
  @Event() closeBookingWindow: EventEmitter<{ [key: string]: any }>;
  @Event() bookingCreated: EventEmitter<{ pool?: string; data: RoomBookingDetails[] }>;
  @Event() blockedCreated: EventEmitter<RoomBlockDetails>;
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
        this.adultChildCount = {
          adult: this.bookingData.ADULTS_COUNT,
          child: this.bookingData.CHILDREN_COUNT,
        };

        this.bookPropertyService.setEditingRoomInfo(this.bookingData, this.selectedUnits);
      }
      if (!this.isEventType('BAR_BOOKING')) {
        this.bookingData.roomsInfo = [];
      }

      if (this.bookingData.event_type === 'SPLIT_BOOKING') {
        this.showSplitBookingOption = true;
        this.page = 'page_one';
      } else if (this.bookingData.event_type === 'BLOCK_DATES') {
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
    }));
    if (this.isEventType('EDIT_BOOKING')) {
      this.sourceOption = { ...this.bookingData.SOURCE };
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
    this.adultChildCount = event.detail;
  }

  async initializeBookingAvailability(from_date: string, to_date: string) {
    try {
      const room_type_ids = this.bookingData.roomsInfo.map(room => room.id);
      const data = await this.bookingService.getBookingAvailability(from_date, to_date, this.propertyid, this.adultChildCount, this.language, room_type_ids, this.currency);
      this.message = '';
      this.bookingData = {
        ...this.bookingData,
        roomsInfo: data.roomtypes,
      };
      this.message = data.tax_statement;
    } catch (error) {
      // toastr.error(error);
    }
  }
  getRoomCategoryByRoomId(roomId) {
    return this.bookingData.roomsInfo?.find(roomCategory => {
      return roomCategory.physicalrooms.find(room => room.id === +roomId);
    });
  }

  getSplitBookings() {
    return (this.bookingData.hasOwnProperty('splitBookingEvents') && this.bookingData.splitBookingEvents) || [];
  }
  closeWindow() {
    this.closeBookingWindow.emit();
  }
  isEventType(key: string) {
    return this.bookingData.event_type === key;
  }
  @Listen('dateRangeSelectChange')
  onDateRangeSelect(event: CustomEvent<{ [key: string]: any }>) {
    const opt: { [key: string]: any } = event.detail;
    event.stopImmediatePropagation();
    event.stopPropagation();
    if (opt.key === 'selectedDateRange') {
      if (!this.isEventType('EDIT_BOOKING')) {
        this.dateRangeData = opt.data;
      }
      this.bookingData.defaultDateRange.fromDate = new Date(this.dateRangeData.fromDate);
      this.bookingData.defaultDateRange.toDate = new Date(this.dateRangeData.toDate);
      if (this.adultChildCount.adult !== 0) {
        this.initializeBookingAvailability(dateToFormattedString(this.bookingData.defaultDateRange.fromDate), dateToFormattedString(this.bookingData.defaultDateRange.toDate));
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
        this.initializeBookingAvailability(dateToFormattedString(this.bookingData.defaultDateRange.fromDate), dateToFormattedString(this.bookingData.defaultDateRange.toDate));
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
  }

  async bookUser(check_in: boolean) {
    this.setLoadingState(check_in);
    try {
      if (['003', '002', '004'].includes(this.bookingData.STATUS_CODE)) {
        this.eventsService.deleteEvent(this.bookingData.POOL);
      }
      if (this.isEventType('EDIT_BOOKING')) {
        this.bookedByInfoData.message = this.bookingData.NOTES;
      }
      const serviceParams = this.bookPropertyService.prepareBookUserServiceParams(this, check_in);
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
    return this.bookedByInfoData.arrivalTime.find(e => e.CODE_VALUE_EN === this.bookingData.ARRIVAL_TIME).CODE_NAME;
  }

  resetLoadingState() {
    this.isLoading = '';
    setTimeout(() => {
      this.closeWindow();
    }, 100);
  }
  onRoomDataUpdate(event: CustomEvent) {
    const units = this.bookPropertyService.onDataRoomUpdate(
      event,
      this.selectedUnits,
      this.isEventType('EDIT_BOOKING'),
      this.bookingData.NAME,
      this.bookingData.PR_ID,
      this.bookingData,
    );
    this.selectedUnits = new Map(units);
    this.renderPage();
  }
  getCurrentPage(name: string) {
    return this.page === name;
  }
  render() {
    return (
      <Host>
        <div class="background-overlay" onClick={() => this.closeWindow()}></div>
        <div class={'sideWindow ' + (this.getCurrentPage('page_block_date') ? 'col-sm-12 col-md-6 col-lg-5 col-xl-4' : 'col-sm-12 col-md-11 col-lg-9 col-xl-8')}>
          <div class="card mb-0 shadow-none p-0">
            <div class="card-header">
              <h3 class="card-title text-left pb-1 font-medium-2">{this.getCurrentPage('page_block_date') ? this.bookingData.BLOCK_DATES_TITLE : this.bookingData.TITLE}</h3>
              <button type="button" class="close close-icon" onClick={() => this.closeWindow()}>
                <i class="ft-x"></i>
              </button>
            </div>
          </div>
          {this.getCurrentPage('page_one') && (
            <div class="scrollContent">
              <igl-booking-overview-page
                class={'p-0 mb-1 mt-2'}
                eventType={this.bookingData.event_type}
                selectedRooms={this.selectedUnits}
                currency={this.currency}
                message={this.message}
                showSplitBookingOption={this.showSplitBookingOption}
                ratePricingMode={this.ratePricingMode}
                dateRangeData={this.dateRangeData}
                bookingData={this.bookingData}
                bookingDataDefaultDateRange={this.dateRangeData}
                adultChildConstraints={this.adultChildConstraints}
                onRoomsDataUpdate={evt => {
                  this.onRoomDataUpdate(evt);
                }}
                sourceOptions={this.sourceOptions}
              ></igl-booking-overview-page>
            </div>
          )}

          {this.getCurrentPage('page_two') && (
            <igl-pagetwo
              showPaymentDetails={this.showPaymentDetails}
              selectedGuestData={this.guestData}
              countryNodeList={this.countryNodeList}
              isLoading={this.isLoading}
              selectedRooms={this.selectedUnits}
              bedPreferenceType={this.bedPreferenceType}
              dateRangeData={this.dateRangeData}
              bookingData={this.bookingData}
              showSplitBookingOption={this.showSplitBookingOption}
              language={this.language}
              bookedByInfoData={this.bookedByInfoData}
              isEditOrAddRoomEvent={this.isEventType('EDIT_BOOKING') || this.isEventType('ADD_ROOM')}
              onDataUpdateEvent={event => this.handlePageTwoDataUpdateEvent(event)}
            ></igl-pagetwo>
          )}
          {this.getCurrentPage('page_block_date') ? this.getPageBlockDatesView() : null}
        </div>
      </Host>
    );
  }
}

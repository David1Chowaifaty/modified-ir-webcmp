import { Component, Event, EventEmitter, Host, Prop, h, State, Listen, Watch, Fragment } from '@stencil/core';
import { ToBeAssignedService } from '@/services/toBeAssigned.service';
import { dateToFormattedString, isWeekend } from '@/utils/utils';
import moment from 'moment';
import locales from '@/stores/locales.store';
import { handleUnAssignedDatesChange } from '@/stores/unassigned_dates.store';
import { colorVariants } from '@/components/ui/ir-icons/icons';

@Component({
  tag: 'igl-cal-header',
  styleUrl: 'igl-cal-header.css',
  scoped: true,
})
export class IglCalHeader {
  @Event() optionEvent: EventEmitter<{ [key: string]: any }>;
  @Event({ bubbles: true, composed: true }) gotoRoomEvent: EventEmitter<{
    [key: string]: any;
  }>;
  @Event({ bubbles: true, composed: true }) gotoToBeAssignedDate: EventEmitter<{
    [key: string]: any;
  }>;
  @Prop() calendarData: { [key: string]: any };
  @Prop() today: String;
  @Prop() propertyid: number;
  @Prop() unassignedDates;
  @Prop() to_date: string;
  @Prop() highlightedDate: string;
  @State() renderAgain: boolean = false;
  @State() unassignedRoomsNumber: any = {};
  // private searchValue: string = '';
  // private searchList: { [key: string]: any }[] = [];
  private roomsList: { [key: string]: any }[] = [];
  private toBeAssignedService = new ToBeAssignedService();
  dateRef: HTMLIrButtonElement;
  componentWillLoad() {
    try {
      this.initializeRoomsList();

      if (!this.calendarData.is_vacation_rental) {
        handleUnAssignedDatesChange('unassigned_dates', newValue => {
          if (Object.keys(newValue).length > 0) {
            this.fetchAndAssignUnassignedRooms();
          }
        });
      }
    } catch (error) {
      console.error('Error in componentWillLoad:', error);
    }
  }
  @Watch('unassignedDates')
  handleCalendarDataChanged() {
    this.fetchAndAssignUnassignedRooms();
  }
  private initializeRoomsList() {
    this.roomsList = [];
    this.calendarData.roomsInfo.forEach(category => {
      this.roomsList = this.roomsList.concat(...category.physicalrooms);
    });
  }

  private async fetchAndAssignUnassignedRooms() {
    await this.assignRoomsToDate();
  }

  private async assignRoomsToDate() {
    try {
      const { fromDate, toDate, data } = this.unassignedDates;
      let dt = new Date(fromDate);
      dt.setHours(0, 0, 0, 0);
      let endDate = dt.getTime();
      while (endDate <= new Date(toDate).getTime()) {
        const selectedDate = moment(endDate).format('D_M_YYYY');
        if (data[endDate]) {
          const result = await this.toBeAssignedService.getUnassignedRooms(
            { from_date: this.calendarData.from_date, to_date: this.calendarData.to_date },
            this.propertyid,
            dateToFormattedString(new Date(endDate)),
            this.calendarData.roomsInfo,
            this.calendarData.formattedLegendData,
          );
          this.unassignedRoomsNumber[selectedDate] = result.length;
        } else if (this.unassignedRoomsNumber[selectedDate]) {
          const res = this.unassignedRoomsNumber[selectedDate] - 1;
          this.unassignedRoomsNumber[selectedDate] = res < 0 ? 0 : res;
        }
        const newEndDate = moment(endDate).add(1, 'days').toDate();
        newEndDate.setHours(0, 0, 0, 0);
        endDate = newEndDate.getTime();
        this.renderView();
      }
    } catch (error) {
      console.error(error);
    }
  }

  @Listen('reduceAvailableUnitEvent', { target: 'window' })
  handleReduceAvailableUnitEvent(event: CustomEvent<{ fromDate: string; toDate: string }>) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    const { fromDate, toDate } = event.detail;
    let endDate = new Date(fromDate).getTime();
    while (endDate < new Date(toDate).getTime()) {
      const selectedDate = moment(endDate).format('D_M_YYYY');
      this.unassignedRoomsNumber[selectedDate] = this.unassignedRoomsNumber[selectedDate] - 1;
      endDate = moment(endDate).add(1, 'days').toDate().getTime();
    }
    this.renderView();
  }

  showToBeAssigned(dayInfo) {
    if (this.unassignedRoomsNumber[dayInfo.day] || 0) {
      this.handleOptionEvent('showAssigned');
      setTimeout(() => {
        this.gotoToBeAssignedDate.emit({
          key: 'gotoToBeAssignedDate',
          data: dayInfo.currentDate,
        });
      }, 100);
    } else {
      // do nothing as the value is 0;
    }
  }

  handleOptionEvent(key, data: any = '') {
    this.optionEvent.emit({ key, data });
  }

  handleDateSelect(event: CustomEvent) {
    if (Object.keys(event.detail).length > 0) {
      this.handleOptionEvent('calendar', event.detail);
    }
  }

  handleClearSearch() {
    // this.searchValue = '';
    // this.searchList = [];
    this.renderView();
  }

  handleFilterRooms(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value.trim();
    // this.searchValue = value;
    value = value.toLowerCase();
    if (value === '') {
      this.handleClearSearch();
    } else {
      // this.searchList = this.roomsList.filter(room => room.name.toLocaleLowerCase().indexOf(value) != -1);
    }
    this.renderView();
  }

  handleScrollToRoom(roomId) {
    this.handleClearSearch();
    this.gotoRoomEvent.emit({ key: 'gotoRoom', roomId });
  }

  getStringDateFormat(dt) {
    return dt.getFullYear() + '-' + (dt.getMonth() < 9 ? '0' : '') + (dt.getMonth() + 1) + '-' + (dt.getDate() <= 9 ? '0' : '') + dt.getDate();
  }

  getNewBookingModel() {
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    let from_date = this.getStringDateFormat(today);
    today.setDate(today.getDate() + 1);
    today.setHours(0, 0, 0, 0);
    let to_date = this.getStringDateFormat(today);
    return {
      ID: '',
      NAME: '',
      EMAIL: '',
      PHONE: '',
      REFERENCE_TYPE: 'PHONE',
      FROM_DATE: from_date, // "2023-07-09",
      TO_DATE: to_date, // "2023-07-11",
      roomsInfo: this.calendarData.roomsInfo,
      TITLE: locales.entries.Lcz_NewBooking,
      event_type: 'PLUS_BOOKING',
      legendData: this.calendarData.formattedLegendData,
      defaultDateRange: {
        fromDate: new Date(from_date), //new Date("2023-09-10"),
        fromDateStr: '', //"10 Sep 2023",
        toDate: new Date(to_date), //new Date("2023-09-15"),
        toDateStr: '', // "15 Sep 2023",
        dateDifference: 0,
        editabled: true,
        message: '',
      },
    };
  }

  renderView() {
    this.renderAgain = !this.renderAgain;
  }

  render() {
    return (
      <Host>
        <div class="stickyCell align-items-center topLeftCell preventPageScroll">
          <div class="header__fd-actions">
            <div class="row justify-content-around no-gutters" style={{ gap: '0' }}>
              {!this.calendarData.is_vacation_rental && (
                <Fragment>
                  <wa-tooltip for="fd-unassigned-dates_btn">{locales.entries.Lcz_UnassignedUnitsTooltip}</wa-tooltip>
                  <ir-custom-button id="fd-unassigned-dates_btn" variant="neutral" appearance="plain" onClickHandler={() => this.handleOptionEvent('showAssigned')}>
                    <wa-icon
                      style={{ fontSize: '1.5rem' }}
                      name="server"
                      label={locales.entries.Lcz_UnassignedUnitsTooltip}
                      aria-label={locales.entries.Lcz_UnassignedUnitsTooltip}
                    ></wa-icon>
                  </ir-custom-button>
                </Fragment>
              )}
              <ir-date-picker
                minDate={moment().add(-2, 'months').startOf('month').format('YYYY-MM-DD')}
                // autoApply
                // singleDatePicker
                onDateChanged={evt => {
                  console.log('evt', evt);
                  this.handleDateSelect(evt);
                }}
                // class="datePickerHidden"
                class={'date_btn'}
                title={locales.entries.Lcz_Navigate}
                data-toggle="tooltip"
                data-placement="bottom"
              >
                <ir-custom-button slot="trigger" id="fd-dates-navigation_btn" variant="neutral" appearance="plain" onClickHandler={() => this.handleOptionEvent('calendar')}>
                  <wa-icon
                    style={{ fontSize: '1.5rem' }}
                    name="calendar"
                    variant="regular"
                    label={locales.entries.Lcz_Navigate}
                    aria-label={locales.entries.Lcz_Navigate}
                  ></wa-icon>
                </ir-custom-button>
              </ir-date-picker>
              <wa-tooltip for="fd-dates-navigation_btn">{locales.entries.Lcz_Navigate}</wa-tooltip>
              <Fragment>
                <wa-tooltip for="fd-today-navigation_btn">{locales.entries.Lcz_Today}</wa-tooltip>
                <ir-custom-button slot="trigger" id="fd-today-navigation_btn" variant="neutral" appearance="plain" onClickHandler={() => this.handleOptionEvent('gotoToday')}>
                  <wa-icon style={{ fontSize: '1.5rem' }} name="clock" variant="regular" label={locales.entries.Lcz_Today} aria-label={locales.entries.Lcz_Today}></wa-icon>
                </ir-custom-button>
              </Fragment>
              <Fragment>
                <wa-tooltip for="fd-new-booking_btn">{locales.entries.Lcz_CreateNewBooking}</wa-tooltip>
                <ir-custom-button
                  slot="trigger"
                  id="fd-new-booking_btn"
                  variant="neutral"
                  appearance="plain"
                  onClickHandler={() => this.handleOptionEvent('add', this.getNewBookingModel())}
                >
                  <wa-icon style={{ fontSize: '1.5rem' }} name="plus" label={locales.entries.Lcz_CreateNewBooking} aria-label={locales.entries.Lcz_CreateNewBooking}></wa-icon>
                </ir-custom-button>
              </Fragment>
              <Fragment>
                <wa-tooltip for="fd-stop-open-sale_btn">{locales.entries.Lcz_StopOpenSale}</wa-tooltip>
                <ir-custom-button
                  slot="trigger"
                  id="fd-stop-open-sale_btn"
                  variant="neutral"
                  appearance="plain"
                  onClickHandler={() => this.handleOptionEvent('bulk', this.getNewBookingModel())}
                >
                  <wa-icon
                    variant="regular"
                    style={{ fontSize: '1.5rem' }}
                    name="calendar-xmark"
                    label={locales.entries.Lcz_StopOpenSale}
                    aria-label={locales.entries.Lcz_StopOpenSale}
                  ></wa-icon>
                </ir-custom-button>
              </Fragment>

              {/* <div
              class="caledarBtns"
              onClick={() => this.handleOptionEvent('add', this.getNewBookingModel())}
              data-toggle="tooltip"
              data-placement="bottom"
              title={locales.entries.Lcz_CreateNewBooking}
            >

              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="svg-icon">
                <path
                  fill="#6b6f82"
                  d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
                />
              </svg>
            </div> */}
            </div>
            {/* <div class="row justify-content-around no-gutters searchContiner">
            <ir-m-combobox
              placeholder={locales.entries.Lcz_FindUnit}
              options={this.roomsList.map(r => ({
                label: r.name,
                value: r.id,
              }))}
              onOptionChange={e => {
                console.log(e.detail.value);
                this.handleScrollToRoom(e.detail.value);
              }}
            ></ir-m-combobox>
          </div> */}
            <div class="searchContiner">
              <ir-picker
                size="small"
                onCombobox-select={e => {
                  this.handleScrollToRoom(Number(e.detail.item.value));
                }}
              >
                {this.roomsList.map(room => (
                  <ir-picker-item label={room.name} value={room.id}>
                    {room.name}
                  </ir-picker-item>
                ))}
              </ir-picker>
            </div>
          </div>
        </div>
        <div class="stickyCell headersContainer">
          <div class="monthsContainer">
            {this.calendarData.monthsInfo.map(monthInfo => (
              <div class="monthCell" style={{ width: monthInfo.daysCount * 58 + 'px' }}>
                <div class="monthTitle">{monthInfo.monthName}</div>
              </div>
            ))}
          </div>
          {this.calendarData.days.map(dayInfo => {
            return (
              <div
                class={`headerCell align-items-center ${'day-' + dayInfo.day} ${dayInfo.day === this.today || dayInfo.day === this.highlightedDate ? 'currentDay' : ''}`}
                data-day={dayInfo.day}
              >
                {!this.calendarData.is_vacation_rental && (
                  <div class="preventPageScroll">
                    {this.unassignedRoomsNumber[dayInfo.day] || dayInfo.unassigned_units_nbr !== 0 ? (
                      <button class={'fd-header__badge-btn'}>
                        <wa-badge class="fd-header__badge" variant={'brand'} appearance={'accent'} pill>
                          {this.unassignedRoomsNumber[dayInfo.day] || dayInfo.unassigned_units_nbr}
                        </wa-badge>
                      </button>
                    ) : (
                      <wa-badge variant={'neutral'} appearance={'filled'} pill>
                        {' '}
                        {this.unassignedRoomsNumber[dayInfo.day] || dayInfo.unassigned_units_nbr}
                      </wa-badge>
                    )}
                    {/* <span
                      class={`badge badge-${this.unassignedRoomsNumber[dayInfo.day] || dayInfo.unassigned_units_nbr !== 0 ? 'info pointer' : 'light'} badge-pill`}
                      onClick={() => this.showToBeAssigned(dayInfo)}
                    >
                      {this.unassignedRoomsNumber[dayInfo.day] || dayInfo.unassigned_units_nbr}
                    </span> */}
                  </div>
                )}

                <div class={{ dayTitle: true, weekend: isWeekend(dayInfo.value) }}>{dayInfo.dayDisplayName}</div>
                <div class="dayCapacityPercent">{dayInfo.occupancy}%</div>
              </div>
            );
          })}
        </div>
      </Host>
    );
  }
}

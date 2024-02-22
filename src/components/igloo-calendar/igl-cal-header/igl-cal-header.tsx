import { Component, Event, EventEmitter, Host, Prop, h, State, Listen, Watch } from '@stencil/core';
import { ToBeAssignedService } from '../../../services/toBeAssigned.service';
import { dateToFormattedString } from '../../../utils/utils';
import moment from 'moment';
import locales from '@/stores/locales.store';
import calendar_data from '@/stores/calendar-data';
import { handleUnAssignedDatesChange } from '@/stores/unassigned_dates.store';

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
  @State() renderAgain: boolean = false;
  @State() unassignedRoomsNumber: any = {};
  private searchValue: string = '';
  private searchList: { [key: string]: any }[] = [];
  private roomsList: { [key: string]: any }[] = [];
  private toBeAssignedService = new ToBeAssignedService();
  componentWillLoad() {
    this.toBeAssignedService.setToken(calendar_data.token);
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
      dt.setHours(0);
      dt.setMinutes(0);
      dt.setSeconds(0);
      let endDate = dt.getTime();
      console.log(data);
      while (endDate <= new Date(toDate).getTime()) {
        console.log(endDate);
        const selectedDate = moment(endDate).format('D_M_YYYY');
        if (data[endDate]) {
          const result = await this.toBeAssignedService.getUnassignedRooms(
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
        endDate = moment(endDate).add(1, 'days').toDate().getTime();
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
    this.searchValue = '';
    this.searchList = [];
    this.renderView();
  }

  handleFilterRooms(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let value = inputElement.value.trim();
    this.searchValue = value;
    value = value.toLowerCase();
    if (value === '') {
      this.handleClearSearch();
    } else {
      this.searchList = this.roomsList.filter(room => room.name.toLocaleLowerCase().indexOf(value) != -1);
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
          <div class="row justify-content-around no-gutters">
            {!this.calendarData.is_vacation_rental && (
              <div
                class="caledarBtns"
                onClick={() => this.handleOptionEvent('showAssigned')}
                data-toggle="tooltip"
                data-placement="bottom"
                title={locales.entries.Lcz_UnassignedUnitsTooltip}
              >
                {/* <i class="la la-tasks"></i> */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-icon">
                  <path
                    fill="#6b6f82"
                    d="M448 160H320V128H448v32zM48 64C21.5 64 0 85.5 0 112v64c0 26.5 21.5 48 48 48H464c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zM448 352v32H192V352H448zM48 288c-26.5 0-48 21.5-48 48v64c0 26.5 21.5 48 48 48H464c26.5 0 48-21.5 48-48V336c0-26.5-21.5-48-48-48H48z"
                  />
                </svg>
              </div>
            )}
            <div class="caledarBtns" onClick={() => this.handleOptionEvent('calendar')} data-toggle="tooltip" data-placement="bottom" title={locales.entries.Lcz_Navigate}>
              {/* <i class="la la-calendar-o"></i> */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class={'svg-icon'}>
                <path
                  fill="#6b6f82"
                  d="M152 24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H64C28.7 64 0 92.7 0 128v16 48V448c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V192 144 128c0-35.3-28.7-64-64-64H344V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H152V24zM48 192H400V448c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192z"
                />
              </svg>
              {/* <input  type="date" onChange={this.handleDateSelect.bind(this)} title="" /> */}
              <ir-date-picker
                minDate={moment().add(-2, 'months').startOf('month').format('YYYY-MM-DD')}
                autoApply
                singleDatePicker
                onDateChanged={evt => {
                  console.log('evt', evt);
                  this.handleDateSelect(evt);
                }}
                class="datePickerHidden"
              ></ir-date-picker>
            </div>
            <div class="caledarBtns" onClick={() => this.handleOptionEvent('gotoToday')} data-toggle="tooltip" data-placement="bottom" title={locales.entries.Lcz_Today}>
              {/* <i class="la la-clock-o"></i> */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" class="svg-icon">
                <path
                  fill="#6b6f82"
                  d="M464 256A208 208 0 1 1 48 256a208 208 0 1 1 416 0zM0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"
                />
              </svg>
            </div>
            <div
              class="caledarBtns"
              onClick={() => this.handleOptionEvent('add', this.getNewBookingModel())}
              data-toggle="tooltip"
              data-placement="bottom"
              title={locales.entries.Lcz_CreateNewBooking}
            >
              {/* <i class="la la-plus"></i> */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="svg-icon">
                <path
                  fill="#6b6f82"
                  d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
                />
              </svg>
            </div>
          </div>
          <div class="row justify-content-around no-gutters searchContiner">
            <fieldset class={`form-group position-relative ${this.searchValue != '' ? 'show' : ''}`}>
              <input
                type="text"
                class="form-control form-control-sm input-sm"
                id="iconLeft7"
                value={this.searchValue}
                placeholder={locales.entries.Lcz_FindUnit}
                onInput={event => this.handleFilterRooms(event)}
              />
              {this.searchValue !== '' ? (
                <div
                  class="form-control-position pointer"
                  onClick={() => this.handleClearSearch()}
                  data-toggle="tooltip"
                  data-placement="top"
                  data-original-title="Clear Selection"
                >
                  <i class="la la-close font-small-4"></i>
                </div>
              ) : null}

              {this.searchList.length ? (
                <div class="position-absolute searchListContainer dropdown-menu dropdown-menu-left min-width-full">
                  {this.searchList.map(room => (
                    <div class="searchListItem1 dropdown-item px-1 text-left pointer" onClick={() => this.handleScrollToRoom(room.id)}>
                      {room.name}
                    </div>
                  ))}
                </div>
              ) : null}
            </fieldset>
          </div>
        </div>
        <div class="stickyCell headersContainer">
          <div class="monthsContainer">
            {this.calendarData.monthsInfo.map(monthInfo => (
              <div class="monthCell" style={{ width: monthInfo.daysCount * 70 + 'px' }}>
                <div class="monthTitle">{monthInfo.monthName}</div>
              </div>
            ))}
          </div>
          {this.calendarData.days.map(dayInfo => (
            <div class={`headerCell align-items-center ${'day-' + dayInfo.day} ${dayInfo.day === this.today ? 'currentDay' : ''}`} data-day={dayInfo.day}>
              {!this.calendarData.is_vacation_rental && (
                <div class="preventPageScroll">
                  <span
                    class={`badge badge-${this.unassignedRoomsNumber[dayInfo.day] || dayInfo.unassigned_units_nbr !== 0 ? 'info pointer' : 'light'} badge-pill`}
                    onClick={() => this.showToBeAssigned(dayInfo)}
                  >
                    {this.unassignedRoomsNumber[dayInfo.day] || dayInfo.unassigned_units_nbr}
                  </span>
                </div>
              )}
              <div class="dayTitle">{dayInfo.dayDisplayName}</div>
              <div class="dayCapacityPercent">{dayInfo.occupancy}%</div>
            </div>
          ))}
        </div>
      </Host>
    );
  }
}

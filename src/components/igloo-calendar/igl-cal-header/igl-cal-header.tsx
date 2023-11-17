import { Component, Event, EventEmitter, Element, Host, Prop, h, State, Listen } from '@stencil/core';
import { ToBeAssignedService } from '../../../services/toBeAssigned.service';
import { dateToFormattedString } from '../../../utils/utils';
import { transformDateFormatWithMoment } from '../../../utils/events.utils';
import moment from 'moment';

@Component({
  tag: 'igl-cal-header',
  styleUrl: 'igl-cal-header.css',
  scoped: true,
})
export class IglCalHeader {
  @Element() private element: HTMLElement;
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
  @Prop() to_date: string;
  @State() renderAgain: boolean = false;
  @State() unassignedRoomsNumber: any = {};
  private searchValue: string = '';
  private searchList: { [key: string]: any }[] = [];
  private roomsList: { [key: string]: any }[] = [];
  private toBeAssignedService = new ToBeAssignedService();
  componentWillLoad() {
    try {
      this.initializeRoomsList();
      if (!this.calendarData.is_vacation_rental) {
        this.fetchAndAssignUnassignedRooms();
      }
    } catch (error) {
      console.error('Error in componentWillLoad:', error);
    }
  }
  private initializeRoomsList() {
    this.roomsList = [];
    this.calendarData.roomsInfo.forEach(category => {
      this.roomsList = this.roomsList.concat(...category.physicalrooms);
    });
  }

  private async fetchAndAssignUnassignedRooms() {
    //const days = await this.toBeAssignedService.getUnassignedDates(this.propertyid, dateToFormattedString(new Date()), this.to_date);
    const days = this.calendarData.unassignedDates;
    await this.assignRoomsToDate(days);
  }

  private async assignRoomsToDate(days) {
    for (const day of Object.keys(days)) {
      const result = await this.toBeAssignedService.getUnassignedRooms(
        this.propertyid,
        dateToFormattedString(new Date(+day)),
        this.calendarData.roomsInfo,
        this.calendarData.formattedLegendData,
      );
      this.unassignedRoomsNumber = { ...this.unassignedRoomsNumber, [transformDateFormatWithMoment(days[day].dateStr)]: result.length };
    }
    console.log(this.unassignedRoomsNumber);
  }

  @Listen('reduceAvailableUnitEvent', { target: 'window' })
  handleReduceAvailableUnitEvent(event: CustomEvent<{ [key: string]: any }>) {
    const opt: { [key: string]: any } = event.detail;
    const data = opt.data;
    event.stopImmediatePropagation();
    event.stopPropagation();

    // return {day, dayDisplayName, currentDate, tobeAssignedCount: dates[currentDate]};
    if (opt.key === 'reduceAvailableDays') {
      const selectedDate = moment(+data.selectedDate).format('D_M_YYYY');
      this.unassignedRoomsNumber[selectedDate] = this.unassignedRoomsNumber[selectedDate] - 1;
      this.renderView();
    }
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

  handleDateSelect(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let selectedDate = inputElement.value;

    // // Manually close the date picker - for Safari
    const picker = this.element.querySelector('.datePickerHidden') as HTMLInputElement;
    picker.blur();
    if (selectedDate) {
      this.handleOptionEvent('calendar', selectedDate);
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
      TITLE: 'New Booking',
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
              <div class="caledarBtns" onClick={() => this.handleOptionEvent('showAssigned')} data-toggle="tooltip" data-placement="bottom" title="Unassigned Units">
                <i class="la la-tasks"></i>
              </div>
            )}
            <div class="caledarBtns" onClick={() => this.handleOptionEvent('calendar')} data-toggle="tooltip" data-placement="bottom" title="Navigate">
              <i class="la la-calendar-o"></i>
              <input class="datePickerHidden" type="date" onChange={this.handleDateSelect.bind(this)} title="" />
            </div>
            <div class="caledarBtns" onClick={() => this.handleOptionEvent('gotoToday')} data-toggle="tooltip" data-placement="bottom" title="Today">
              <i class="la la-clock-o"></i>
            </div>
            <div
              class="caledarBtns"
              onClick={() => this.handleOptionEvent('add', this.getNewBookingModel())}
              data-toggle="tooltip"
              data-placement="bottom"
              title="Create new booking"
            >
              <i class="la la-plus"></i>
            </div>
          </div>
          <div class="row justify-content-around no-gutters searchContiner">
            <fieldset class={`form-group position-relative ${this.searchValue != '' ? 'show' : ''}`}>
              <input
                type="text"
                class="form-control form-control-sm input-sm"
                id="iconLeft7"
                value={this.searchValue}
                placeholder="Find unit"
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

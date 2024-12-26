import { Component, Host, h, Prop, Event, EventEmitter, State, Listen, Fragment, Watch } from '@stencil/core';
import { ToBeAssignedService } from '@/services/toBeAssigned.service';
import { dateToFormattedString } from '@/utils/utils';
import moment from 'moment';
import locales from '@/stores/locales.store';
import { getUnassignedDates } from '@/stores/unassigned_dates.store';
import { colorVariants } from '@/components/ui/ir-icons/icons';
//import { updateCategories } from '@/utils/events.utils';

@Component({
  tag: 'igl-to-be-assigned',
  styleUrl: 'igl-to-be-assigned.css',
  scoped: true,
})
export class IglToBeAssigned {
  @Prop() unassignedDatesProp: any;
  @Prop() propertyid: number;
  @Prop() from_date: string;
  @Prop() to_date: string;
  @Prop({ mutable: true }) calendarData: { [key: string]: any };

  @State() loadingMessage: string;
  @State() showDatesList: boolean = false;
  @State() renderAgain: boolean = false;
  @State() orderedDatesList: any[] = [];
  @State() noScroll = false;

  @Event() optionEvent: EventEmitter<{ [key: string]: any }>;
  @Event({ bubbles: true, composed: true })
  reduceAvailableUnitEvent: EventEmitter<{ [key: string]: any }>;
  @Event() showBookingPopup: EventEmitter;
  @Event({ bubbles: true, composed: true }) addToBeAssignedEvent: EventEmitter;
  @Event({ bubbles: true, composed: true })
  highlightToBeAssignedBookingEvent: EventEmitter;

  private isGotoToBeAssignedDate: boolean = false;
  private isLoading: boolean = true;
  private selectedDate = null;
  private data: { [key: string]: any } = {};
  private today = new Date();
  private categoriesData: { [key: string]: any } = {};
  private toBeAssignedService: ToBeAssignedService = new ToBeAssignedService();
  private unassignedDates: any;

  componentWillLoad() {
    this.reArrangeData();
    this.loadingMessage = locales.entries.Lcz_FetchingUnAssignedUnits;
  }

  @Watch('unassignedDatesProp')
  handleUnassignedDatesToBeAssignedChange(newValue: any) {
    const { fromDate, toDate, data } = newValue;
    let dt = new Date(fromDate);
    dt.setHours(0);
    dt.setMinutes(0);
    dt.setSeconds(0);
    let endDate = dt.getTime();
    while (endDate <= new Date(toDate).getTime()) {
      if (data && !data[endDate] && this.unassignedDates.hasOwnProperty(endDate)) {
        delete this.unassignedDates[endDate];
      } else if (data && data[endDate]) {
        this.unassignedDates[endDate] = data[endDate];
      }
      endDate = moment(endDate).add(1, 'days').toDate().getTime();
    }
    this.data = { ...this.unassignedDates };
    this.orderedDatesList = Object.keys(this.data).sort((a, b) => parseInt(a) - parseInt(b));

    if (this.orderedDatesList.length) {
      if (!this.data.hasOwnProperty(this.selectedDate)) {
        this.selectedDate = this.orderedDatesList.length ? this.orderedDatesList[0] : null;
      }
      this.showForDate(this.selectedDate, false);
      this.renderView();
    } else {
      this.selectedDate = null;
    }
  }
  handleAssignUnit(event: CustomEvent<{ [key: string]: any }>) {
    const opt: { [key: string]: any } = event.detail;
    const data = opt.data;
    event.stopImmediatePropagation();
    event.stopPropagation();

    if (opt.key === 'assignUnit') {
      if (Object.keys(this.data[data.selectedDate].categories).length === 1) {
        this.isLoading = true;
        this.noScroll = true;
      }
      this.data[data.selectedDate].categories[data.RT_ID] = this.data[data.selectedDate].categories[data.RT_ID].filter(eventData => eventData.ID != data.assignEvent.ID);
      this.calendarData = data.calendarData;
      // this.calendarData.bookingEvents.push(data.assignEvent);

      // if (!this.data[data.selectedDate].categories[data.RT_ID].length) {
      //   delete this.data[data.selectedDate].categories[data.RT_ID];

      //   if (!Object.keys(this.data[data.selectedDate].categories).length) {
      //     delete this.data[data.selectedDate];
      //     //this.orderedDatesList = this.orderedDatesList.filter(dateStamp => dateStamp != data.selectedDate);
      //     //this.selectedDate = this.orderedDatesList.length ? this.orderedDatesList[0] : null;
      //   }
      // }
      this.renderView();

      // this.reduceAvailableUnitEvent.emit({key: "reduceAvailableDays", data: {selectedDate: data.selectedDate}});
    }
  }

  async updateCategories(key, calendarData) {
    try {
      //console.log("called")
      let categorisedRooms = {};
      const result = await this.toBeAssignedService.getUnassignedRooms(
        { from_date: calendarData.from_date, to_date: calendarData.to_date },
        this.propertyid,
        dateToFormattedString(new Date(+key)),
        calendarData.roomsInfo,
        calendarData.formattedLegendData,
      );
      result.forEach(room => {
        if (!categorisedRooms.hasOwnProperty(room.RT_ID)) {
          categorisedRooms[room.RT_ID] = [room];
        } else {
          categorisedRooms[room.RT_ID].push(room);
        }
      });
      this.unassignedDates[key].categories = categorisedRooms;
    } catch (error) {
      //  toastr.error(error);
    }
  }

  async reArrangeData() {
    try {
      this.today.setHours(0, 0, 0, 0);
      this.calendarData.roomsInfo.forEach(category => {
        this.categoriesData[category.id] = {
          name: category.name,
          roomsList: category.physicalrooms,
          roomIds: category.physicalrooms.map(room => {
            return room.id;
          }),
        };
      });

      this.selectedDate = null;
      //this.unassignedDates = await this.toBeAssignedService.getUnassignedDates(this.propertyid, dateToFormattedString(new Date()), this.to_date);
      this.unassignedDates = getUnassignedDates();
      console.log(this.unassignedDates);

      this.data = this.unassignedDates;
      this.orderedDatesList = Object.keys(this.data).sort((a, b) => parseInt(a) - parseInt(b));

      if (!this.selectedDate && this.orderedDatesList.length) {
        this.selectedDate = this.orderedDatesList[0];
      }
    } catch (error) {
      console.error('Error fetching unassigned dates:', error);
      //  toastr.error(error);
    }
  }
  async componentDidLoad() {
    setTimeout(() => {
      if (!this.isGotoToBeAssignedDate && Object.keys(this.unassignedDates).length > 0) {
        //console.log(this.isGotoToBeAssignedDate);
        const firstKey = Object.keys(this.unassignedDates)[0];

        this.showForDate(firstKey);
      }
    }, 100);
  }
  @Listen('gotoToBeAssignedDate', { target: 'window' })
  async gotoDate(event: CustomEvent) {
    this.isGotoToBeAssignedDate = true;
    this.showForDate(event.detail.data);
    this.showDatesList = false;
    this.renderView();
  }
  @Listen('highlightToBeAssignedBookingEvent')
  handleToBeAssignedDate(e: CustomEvent) {
    this.showBookingPopup.emit({
      key: 'calendar',
      data: new Date(e.detail.data.fromDate).getTime() - 86400000,
      noScroll: false,
    });
  }
  async showForDate(dateStamp, withLoading = true) {
    try {
      if (withLoading) {
        this.isLoading = true;
      }
      if (this.showDatesList) {
        this.showUnassignedDate();
      }
      await this.updateCategories(dateStamp, this.calendarData);
      this.addToBeAssignedEvent.emit({ key: 'tobeAssignedEvents', data: [] });
      this.showBookingPopup.emit({
        key: 'calendar',
        data: parseInt(dateStamp) - 86400000,
        noScroll: this.noScroll,
      });
      if (this.isGotoToBeAssignedDate) {
        this.isGotoToBeAssignedDate = false;
      }
      this.isLoading = false;
      this.selectedDate = dateStamp;
      this.renderView();
    } catch (error) {
      // toastr.error(error);
    }
  }

  getDay(dt) {
    const currentDate = new Date(dt);
    const locale = 'default'; //'en-US';
    const dayOfWeek = this.getLocalizedDayOfWeek(currentDate, locale);
    // const monthName = currentDate.toLocaleString("default", { month: 'short' })
    return dayOfWeek + ' ' + currentDate.getDate() + ', ' + currentDate.getFullYear();
  }

  getLocalizedDayOfWeek(date, locale) {
    const options = { weekday: 'short' };
    return date.toLocaleDateString(locale, options);
  }

  handleOptionEvent(key, data = '') {
    this.highlightToBeAssignedBookingEvent.emit({
      key: 'highlightBookingId',
      data: { bookingId: '----' },
    });
    this.addToBeAssignedEvent.emit({ key: 'tobeAssignedEvents', data: [] });
    this.optionEvent.emit({ key, data });
  }

  showUnassignedDate() {
    this.showDatesList = !this.showDatesList;
  }

  getToBeAssignedEntities() {
    // toBeAssignedEvents
  }

  getCategoryView() {
    if (this.orderedDatesList.length && this.selectedDate && this.data[this.selectedDate]) {
      return Object.entries(this.data[this.selectedDate].categories).map(([id, eventDatas], ind) => (
        <igl-tba-category-view
          calendarData={this.calendarData}
          selectedDate={this.selectedDate}
          categoryId={id}
          categoryIndex={ind}
          categoriesData={this.categoriesData}
          eventDatas={eventDatas}
          onAssignUnitEvent={evt => this.handleAssignUnit(evt)}
        ></igl-tba-category-view>
      ));
    } else {
      return null;
    }
  }

  renderView() {
    this.renderAgain = !this.renderAgain;
  }

  render() {
    return (
      <Host class="tobeAssignedContainer pr-1 text-left">
        <div>
          <div>
            <div class="stickyHeader pt-1">
              <div class={'assignment_header'}>
                <p class="tobeAssignedHeader ">{locales.entries.Lcz_Assignments}</p>
                <ir-button
                  class="close_btn"
                  variant="icon"
                  btn_styles="close_btn_style"
                  icon_name="double_caret_left"
                  style={colorVariants.secondary}
                  onClickHandler={() => this.handleOptionEvent('closeSideMenu')}
                  visibleBackgroundOnHover
                ></ir-button>
              </div>
              <hr />
              {Object.keys(this.data).length === 0 ? (
                <p>{locales.entries.Lcz_AllBookingsAreAssigned}</p>
              ) : this.isLoading ? (
                <p class="d-flex align-items-center">
                  <span class="p-0">{this.loadingMessage}</span>
                  <div class="dots">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                  </div>
                </p>
              ) : (
                <Fragment>
                  {this.orderedDatesList.length ? (
                    <div
                      class={`custom-dropdown border border-light rounded text-center ` + (this.showDatesList ? 'show' : '')}
                      id="dropdownMenuButton"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      <div
                        class={'dropdown-toggle'}
                        //onClick={() => this.showUnassignedDate()}
                      >
                        <span class="font-weight-bold">{this.data[this.selectedDate].dateStr}</span>
                        <svg class={'caret-icon'} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" height={14} width={14}>
                          <path
                            fill="#6b6f82"
                            d="M201.4 342.6c12.5 12.5 32.8 12.5 45.3 0l160-160c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L224 274.7 86.6 137.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l160 160z"
                          />
                        </svg>
                      </div>
                      <div class="dropdown-menu dropdown-menu-right full-width" aria-labelledby="dropdownMenuButton">
                        {this.orderedDatesList?.map(ordDate => (
                          <div class="dropdown-item pointer" onClick={() => this.showForDate(ordDate)}>
                            {this.data[ordDate].dateStr}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    locales.entries.Lcz_AllBookingsAreAssigned
                  )}
                </Fragment>
              )}
            </div>
            {!this.isLoading && (
              <div class="scrollabledArea">
                {this.orderedDatesList.length ? (
                  Object.keys(this.data[this.selectedDate].categories).length ? (
                    this.getCategoryView()
                  ) : (
                    <div class="mt-1">{locales.entries.Lcz_AllAssignForThisDay}</div>
                  )
                ) : null}
              </div>
            )}
          </div>
        </div>
      </Host>
    );
  }
}

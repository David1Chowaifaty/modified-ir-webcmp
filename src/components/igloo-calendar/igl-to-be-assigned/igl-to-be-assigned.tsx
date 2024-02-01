import { Component, Host, h, Prop, Event, EventEmitter, State, Listen, Fragment, Watch } from '@stencil/core';
import { ToBeAssignedService } from '../../../services/toBeAssigned.service';
import { dateToFormattedString } from '../../../utils/utils';
import moment from 'moment';
import locales from '@/stores/locales.store';
//import { updateCategories } from '../../../utils/events.utils';

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
  @State() loadingMessage: string;
  @Prop({ mutable: true }) calendarData: { [key: string]: any };
  @Event() optionEvent: EventEmitter<{ [key: string]: any }>;
  @Event({ bubbles: true, composed: true })
  reduceAvailableUnitEvent: EventEmitter<{ [key: string]: any }>;
  @Event() showBookingPopup: EventEmitter;
  @Event({ bubbles: true, composed: true }) addToBeAssignedEvent: EventEmitter;
  @Event({ bubbles: true, composed: true })
  highlightToBeAssignedBookingEvent: EventEmitter;
  @State() showDatesList: boolean = false;
  @State() renderAgain: boolean = false;
  @State() orderedDatesList: any[] = [];
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
      this.unassignedDates = this.calendarData.unassignedDates;

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
            <div class="stickyHeader">
              <div class="tobeAssignedHeader pt-1">{locales.entries.Lcz_Assignments}</div>
              <div class="closeBtn pt-1" onClick={() => this.handleOptionEvent('closeSideMenu')}>
                <i class="ft-chevrons-left"></i>
              </div>
              <hr />
              {Object.keys(this.data).length === 0 ? (
                <p>{locales.entries.Lcz_AllBookingsAreAssigned}</p>
              ) : this.isLoading ? (
                <p>{this.loadingMessage}</p>
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
                        {/* <i class="la la-angle-down ml-2"></i> */}
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

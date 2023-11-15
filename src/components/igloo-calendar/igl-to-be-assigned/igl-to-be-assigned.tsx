import { Component, Host, h, Prop, Event, EventEmitter, State, Listen, Fragment } from '@stencil/core';
import { ToBeAssignedService } from '../../../services/toBeAssigned.service';
import { dateToFormattedString } from '../../../utils/utils';

@Component({
  tag: 'igl-to-be-assigned',
  styleUrl: 'igl-to-be-assigned.css',
  scoped: true,
})
export class IglToBeAssigned {
  @Prop() propertyid: number;
  @Prop() from_date: string;
  @Prop() to_date: string;
  @Prop() loadingMessage: string = 'Fetching unassigned units';
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
  @State() isLoading: boolean = false;
  private selectedDate = null;
  private data: { [key: string]: any } = {};
  private today = new Date();
  private categoriesData: { [key: string]: any } = {};
  private toBeAssignedService: ToBeAssignedService = new ToBeAssignedService();
  private unassignedDates: any;
  componentWillLoad() {
    this.reArrangeData();
  }
  async updateCategories(key, calendarData) {
    try {
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
      this.isLoading = true;
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
      this.unassignedDates = await this.toBeAssignedService.getUnassignedDates(this.propertyid, dateToFormattedString(new Date()), this.to_date);
      console.log(this.unassignedDates);
      if (Object.keys(this.unassignedDates).length > 0) {
        const firstKey = Object.keys(this.unassignedDates)[0];
        await this.updateCategories(firstKey, this.calendarData);
      }

      this.data = this.unassignedDates;
      this.orderedDatesList = Object.keys(this.data).sort((a, b) => parseInt(a) - parseInt(b));
      if (!this.selectedDate && this.orderedDatesList.length) {
        this.selectedDate = this.orderedDatesList[0];
      }
    } catch (error) {
      console.error('Error fetching unassigned dates:', error);
      //  toastr.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  @Listen('gotoToBeAssignedDate', { target: 'window' })
  gotoDate(event: CustomEvent) {
    this.showForDate(event.detail.data);
    this.showDatesList = false;
    this.renderView();
  }

  async showForDate(dateStamp) {
    try {
      this.isLoading = true;
      this.showUnassignedDate();
      await this.updateCategories(dateStamp, this.calendarData);
      this.addToBeAssignedEvent.emit({ key: 'tobeAssignedEvents', data: [] });
      this.selectedDate = dateStamp;
      this.showBookingPopup.emit({
        key: 'calendar',
        data: parseInt(dateStamp) - 86400000,
      });
      this.isLoading = false; // goto 1 days before.. // calendar moves another 1 day
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

  handleAssignUnit(event: CustomEvent<{ [key: string]: any }>) {
    const opt: { [key: string]: any } = event.detail;
    const data = opt.data;
    event.stopImmediatePropagation();
    event.stopPropagation();

    if (opt.key === 'assignUnit') {
      // this.data[data.selectedDate].categories[data.RT_ID] = this.data[data.selectedDate].categories[data.RT_ID].filter(eventData => eventData.ID != data.assignEvent.ID);
      // // this.calendarData = data.calendarData; // RAJA
      // // this.calendarData.bookingEvents.push(data.assignEvent);

      // if (!this.data[data.selectedDate].categories[data.RT_ID].length) {
      //   delete this.data[data.selectedDate].categories[data.RT_ID];

      //   if (!Object.keys(this.data[data.selectedDate].categories).length) {
      //     delete this.data[data.selectedDate];
      //     this.orderedDatesList = this.orderedDatesList.filter(dateStamp => dateStamp != data.selectedDate);
      //     this.selectedDate = this.orderedDatesList.length ? this.orderedDatesList[0] : null;
      //   }
      // }

      this.reduceAvailableUnitEvent.emit({
        key: 'reduceAvailableDays',
        data: { selectedDate: data.selectedDate },
      });
      this.renderView();
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
              <div class="tobeAssignedHeader pt-1">Assignments</div>
              <div class="closeBtn pt-1" onClick={() => this.handleOptionEvent('closeSideMenu')}>
                <i class="ft-chevrons-left"></i>
              </div>
              <hr />
              {this.isLoading ? (
                <p>{this.loadingMessage}</p>
              ) : (
                <Fragment>
                  {this.orderedDatesList.length ? (
                    <div class={`text-center ` + (this.showDatesList ? 'show' : '')}>
                      <div onClick={() => this.showUnassignedDate()}>
                        <span class="font-weight-bold">{this.data[this.selectedDate].dateStr}</span>
                        <i class="la la-angle-down ml-2"></i>
                      </div>
                      {this.showDatesList ? (
                        <div class="dropdown-menu dropdown-menu-right full-width">
                          {this.orderedDatesList.map(ordDate => (
                            <div class="pointer dropdown-item pointer" onClick={() => this.showForDate(ordDate)}>
                              {this.data[ordDate].dateStr}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : (
                    'All bookings assigned'
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
                    <div class="mt-1">All assigned for this day.</div>
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

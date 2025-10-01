import { Component, Host, Prop, h, Event, EventEmitter, Listen, State } from '@stencil/core';
import { ToBeAssignedService } from '@/services/toBeAssigned.service';
import { v4 } from 'uuid';
import locales from '@/stores/locales.store';
import { CalendarSidebarState } from '@/components/igloo-calendar/igloo-calendar';
import { canCheckIn } from '@/utils/utils';
import { IUnit } from '@/models/booking.dto';

@Component({
  tag: 'igl-tba-booking-view',
  styleUrl: 'igl-tba-booking-view.css',
  scoped: true,
})
export class IglTbaBookingView {
  @Prop() calendarData: { [key: string]: any };
  @Prop() selectedDate;
  @Prop() eventData: { [key: string]: any } = {};
  @Prop() categoriesData: { [key: string]: any } = {};
  @Prop() categoryId;
  @Prop() categoryIndex;
  @Prop() eventIndex;

  @State() renderAgain: boolean = false;
  @State() selectedRoom: number = -1;
  @State() isLoading: 'default' | 'checkin' | null = null;

  private highlightSection: boolean = false;
  private allRoomsList: { [key: string]: any }[] = [];
  private toBeAssignedService = new ToBeAssignedService();

  @Event({ bubbles: true, composed: true })
  highlightToBeAssignedBookingEvent: EventEmitter;
  @Event({ bubbles: true, composed: true }) openCalendarSidebar: EventEmitter<CalendarSidebarState>;
  @Event({ bubbles: true, composed: true }) addToBeAssignedEvent: EventEmitter;
  @Event({ bubbles: true, composed: true }) scrollPageToRoom: EventEmitter;
  @Event() assignRoomEvent: EventEmitter<{ [key: string]: any }>;

  componentShouldUpdate(newValue: string, oldValue: string, propName: string): boolean {
    if (propName === 'selectedDate' && newValue !== oldValue) {
      this.highlightSection = false;
      this.selectedRoom = -1;
      return true;
    } else if (propName === 'eventData' && newValue !== oldValue) {
      this.selectedRoom = -1;
      return true;
    }
    return true;
  }

  componentWillLoad() {
    if (this.categoryIndex === 0 && this.eventIndex === 0) {
      setTimeout(() => {
        this.handleHighlightAvailability();
      }, 100);
    }
  }

  @Listen('highlightToBeAssignedBookingEvent', { target: 'window' })
  highlightBookingEvent(event: CustomEvent) {
    let data = event.detail.data;
    if (data.bookingId != this.eventData.ID) {
      this.highlightSection = false;
      this.selectedRoom = -1;
      this.renderView();
    } else {
      this.highlightSection = true;
      this.renderView();
    }
  }

  private onSelectRoom(evt) {
    if (evt.stopImmediatePropagation) {
      evt.stopImmediatePropagation();
      evt.stopPropagation();
    }
    this.selectedRoom = parseInt(evt.target.value);
  }

  private async handleAssignUnit(event: CustomEvent, check_in: boolean = false) {
    try {
      event.stopImmediatePropagation();
      event.stopPropagation();
      if (this.selectedRoom) {
        this.isLoading = check_in ? 'checkin' : 'default';
        const booking = await this.toBeAssignedService.assignUnit({
          booking_nbr: this.eventData.BOOKING_NUMBER,
          identifier: this.eventData.ID,
          pr_id: this.selectedRoom,
          check_in,
        });
        const room = booking.rooms.find(r => r.identifier === this.eventData.identifier);
        console.log('room=>', room);
        if (room && check_in) {
          // TODO:enable this when applying the check in module
          const { adult_nbr, children_nbr, infant_nbr } = room.occupancy;
          window.dispatchEvent(
            new CustomEvent('openCalendarSidebar', {
              detail: {
                type: 'room-guests',
                payload: {
                  identifier: this.eventData.ID,
                  bookingNumber: this.eventData.BOOKING_NUMBER,
                  checkin: false,
                  roomName: (room.unit as IUnit)?.name ?? '',
                  sharing_persons: room.sharing_persons,
                  totalGuests: adult_nbr + children_nbr + infant_nbr,
                },
              },
              bubbles: true,
              composed: true,
            }),
          );
          console.log('event emitted directly to window 🔥');
        }
        let assignEvent = { ...this.eventData, PR_ID: this.selectedRoom };
        this.addToBeAssignedEvent.emit({
          key: 'tobeAssignedEvents',
          data: [assignEvent],
        });
        this.assignRoomEvent.emit({ key: 'assignRoom', data: assignEvent });
      }
    } catch (error) {
      console.log(error);
    } finally {
      this.isLoading = null;
    }
  }

  private handleHighlightAvailability() {
    this.highlightToBeAssignedBookingEvent.emit({
      key: 'highlightBookingId',
      data: { bookingId: this.eventData.ID, fromDate: this.eventData.FROM_DATE },
    });
    if (!this.selectedDate) {
      return;
    }
    let filteredEvents = [];
    let allRoomsList = [];
    filteredEvents = this.eventData.availableRooms.map(room => {
      allRoomsList.push({
        calendar_cell: null,
        id: room.PR_ID,
        name: room.roomName,
      });
      return {
        ...room,
        defaultDateRange: this.eventData.defaultDateRange,
        identifier: this.eventData.identifier,
      };
    });
    this.allRoomsList = allRoomsList;
    this.addToBeAssignedEvent.emit({
      key: 'tobeAssignedEvents',
      data: filteredEvents,
    });

    this.scrollPageToRoom.emit({
      key: 'scrollPageToRoom',
      id: this.categoryId,
      refClass: 'category_' + this.categoryId,
    });
    this.renderView();
  }

  private handleCloseAssignment(event) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    this.highlightSection = false;
    this.highlightToBeAssignedBookingEvent.emit({
      key: 'highlightBookingId',
      data: { bookingId: '----' },
    });
    this.onSelectRoom({ target: { value: '' } });
    this.selectedRoom = -1;
    this.addToBeAssignedEvent.emit({ key: 'tobeAssignedEvents', data: [] });
    this.renderView();
  }

  private renderView() {
    this.renderAgain = !this.renderAgain;
  }
  private canCheckIn() {
    // if (!calendar_data.checkin_enabled || calendar_data.is_automatic_check_in_out) {
    //   return false;
    // }
    // const now = moment();
    // if (
    //   (moment().isSameOrAfter(new Date(this.eventData.FROM_DATE), 'days') && moment().isBefore(new Date(this.eventData.TO_DATE), 'days')) ||
    //   (moment().isSame(new Date(this.eventData.TO_DATE), 'days') &&
    //     !compareTime(now.toDate(), createDateWithOffsetAndHour(calendar_data.checkin_checkout_hours?.offset, calendar_data.checkin_checkout_hours?.hour)))
    // ) {
    //   return true;
    // }
    // return false;
    return canCheckIn({
      from_date: this.eventData.FROM_DATE,
      to_date: this.eventData.TO_DATE,
    });
  }

  render() {
    return (
      <Host>
        <div class="bookingContainer" onClick={() => this.handleHighlightAvailability()}>
          <div
            class={`guestTitle ${this.highlightSection ? 'selectedOrder' : ''} pointer font-small-3`}
            data-toggle="tooltip"
            data-placement="top"
            data-original-title="Click to assign unit"
          >
            {`Book# ${this.eventData.BOOKING_NUMBER} - ${this.eventData.NAME}`}
          </div>
          <div class="row m-0 p-0 actionsContainer">
            <select class="form-control input-sm room-select flex-grow-1" id={v4()} onChange={evt => this.onSelectRoom(evt)}>
              <option value="" selected={this.selectedRoom == -1}>
                {locales.entries.Lcz_AssignUnit}
              </option>
              {this.allRoomsList.map(room => (
                <option value={room.id} selected={this.selectedRoom == room.id}>
                  {room.name}
                </option>
              ))}
            </select>
            {this.highlightSection ? (
              <div class="buttonsContainer bg-red">
                <button type="button" class="btn btn-secondary btn-sm mx-0" onClick={evt => this.handleCloseAssignment(evt)}>
                  <svg class="m-0 p-0" xmlns="http://www.w3.org/2000/svg" height="12" width="9" viewBox="0 0 384 512">
                    <path
                      fill="currentColor"
                      d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
                    />
                  </svg>
                </button>
              </div>
            ) : null}
          </div>
          <div class="d-flex align-items-center " style={{ gap: '0.5rem', paddingInline: '5px' }}>
            <ir-button
              isLoading={this.isLoading === 'default'}
              size="sm"
              class="flex-grow-1"
              text={locales.entries.Lcz_Assign}
              onClickHandler={evt => this.handleAssignUnit(evt)}
              btn_disabled={this.selectedRoom === -1}
            ></ir-button>
            {this.canCheckIn() && (
              <ir-button
                isLoading={this.isLoading === 'checkin'}
                size="sm"
                class="flex-grow-1"
                text={locales.entries.Lcz_AssignedAndChecIn}
                onClickHandler={evt => this.handleAssignUnit(evt, true)}
                btn_disabled={this.selectedRoom === -1}
              ></ir-button>
            )}
          </div>
          <hr />
        </div>
      </Host>
    );
  }
}

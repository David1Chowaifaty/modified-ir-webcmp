import { Component, Host, Prop, h, Event, EventEmitter, Listen, State } from '@stencil/core';
import { ToBeAssignedService } from '../../../../services/toBeAssigned.service';
import { v4 } from 'uuid';
import { transformNewBooking } from '../../../../utils/booking';

@Component({
  tag: 'igl-tba-booking-view',
  styleUrl: 'igl-tba-booking-view.css',
  scoped: true,
})
export class IglTbaBookingView {
  // @Element() private element: HTMLElement;
  @Event({ bubbles: true, composed: true })
  highlightToBeAssignedBookingEvent: EventEmitter;
  @Event({ bubbles: true, composed: true }) addToBeAssignedEvent: EventEmitter;
  @Event({ bubbles: true, composed: true }) scrollPageToRoom: EventEmitter;
  @Event() assignRoomEvent: EventEmitter<{ [key: string]: any }>;
  @Prop() calendarData: { [key: string]: any };
  @Prop() selectedDate;
  @Prop() eventData: { [key: string]: any } = {};
  @Prop() categoriesData: { [key: string]: any } = {};
  @Prop() categoryId;
  @Prop() categoryIndex;
  @Prop() eventIndex;
  @State() renderAgain: boolean = false;

  @State() selectedRoom: number = -1;
  private highlightSection: boolean = false;
  private allRoomsList: { [key: string]: any }[] = [];
  private toBeAssignedService = new ToBeAssignedService();
  onSelectRoom(evt) {
    if (evt.stopImmediatePropagation) {
      evt.stopImmediatePropagation();
      evt.stopPropagation();
    }
    this.selectedRoom = parseInt(evt.target.value);
  }

  // componentDidLoad(){
  //   this.initializeToolTips();
  // }

  componentShouldUpdate(newValue: string, oldValue: string, propName: string): boolean {
    if (propName === 'selectedDate' && newValue !== oldValue) {
      this.highlightSection = false;
      this.selectedRoom = -1;
      return true; // Prevent update for a specific prop value
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

  async handleAssignUnit(event) {
    try {
      event.stopImmediatePropagation();
      event.stopPropagation();
      if (this.selectedRoom) {
        const result = await this.toBeAssignedService.assignUnit(this.eventData.BOOKING_NUMBER, this.eventData.ID, this.selectedRoom);
        let assignEvent = transformNewBooking(result);
        const newEvent = { ...this.eventData, ...assignEvent[0], ID: this.eventData.ID };
        console.log(newEvent);
        //this.calendarData.bookingEvents.push(newEvent);
        //console.log(newEvent);
        this.addToBeAssignedEvent.emit({
          key: 'tobeAssignedEvents',
          data: [assignEvent[0]],
        });
        this.assignRoomEvent.emit({ key: 'assignRoom', data: newEvent });
      }
    } catch (error) {
      //   toastr.error(error);
    }
  }

  handleHighlightAvailability() {
    this.highlightToBeAssignedBookingEvent.emit({
      key: 'highlightBookingId',
      data: { bookingId: this.eventData.ID },
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
        // roomsInfo: this.eventData.roomsInfo,
        // legendData: this.eventData.legendData,
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
    // ID: "NEW_TEMP_EVENT",
    // STATUS: "PENDING_CONFIRMATION"
    this.renderView();
  }

  handleCloseAssignment(event) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    this.highlightSection = false;
    this.highlightToBeAssignedBookingEvent.emit({
      key: 'highlightBookingId',
      data: { bookingId: '----' },
    });
    this.onSelectRoom({ target: { value: '' } });
    this.addToBeAssignedEvent.emit({ key: 'tobeAssignedEvents', data: [] });
    this.renderView();
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

  renderView() {
    this.renderAgain = !this.renderAgain;
    // this.initializeToolTips();
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
            {`Book# ${this.eventData.BOOKING_NUMBER} , ${this.eventData.NAME}`}
          </div>
          <div class="row m-0 p-0 actionsContainer">
            <div class="d-inline-block p-0 selectContainer">
              <select class="form-control input-sm" id={v4()} onChange={evt => this.onSelectRoom(evt)}>
                <option value="" selected={this.selectedRoom == -1}>
                  Assign unit
                </option>
                {this.allRoomsList.map(room => (
                  <option value={room.id} selected={this.selectedRoom == room.id}>
                    {room.name}
                  </option>
                ))}
              </select>
            </div>
            {this.highlightSection ? (
              <div class="d-inline-block text-right buttonsContainer">
                <button type="button" class="btn btn-secondary btn-sm" onClick={evt => this.handleCloseAssignment(evt)}>
                  X
                </button>
                <button type="button" class="btn btn-primary btn-sm" onClick={evt => this.handleAssignUnit(evt)} disabled={this.selectedRoom === -1}>
                  Assign
                </button>
              </div>
            ) : null}
          </div>
          <hr />
        </div>
      </Host>
    );
  }
}

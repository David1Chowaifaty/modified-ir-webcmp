import { Component, Host, Prop, h, Event, EventEmitter, Listen, State } from '@stencil/core';
import { ToBeAssignedService } from '@/services/toBeAssigned.service';
import { v4 } from 'uuid';
import locales from '@/stores/locales.store';
import { isRequestPending } from '@/stores/ir-interceptor.store';

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
        await this.toBeAssignedService.assignUnit(this.eventData.BOOKING_NUMBER, this.eventData.ID, this.selectedRoom);
        // //let assignEvent = transformNewBooking(result);
        // const newEvent = { ...this.eventData, ID: this.eventData.ID };

        // //this.calendarData.bookingEvents.push(newEvent);
        // //console.log(newEvent);
        // this.addToBeAssignedEvent.emit({
        //   key: 'tobeAssignedEvents',
        //   //data: [assignEvent[0]],
        // });
        //this.assignRoomEvent.emit({ key: 'assignRoom', data: newEvent });
        let assignEvent = { ...this.eventData, PR_ID: this.selectedRoom };
        this.addToBeAssignedEvent.emit({
          key: 'tobeAssignedEvents',
          data: [assignEvent],
        });
        this.assignRoomEvent.emit({ key: 'assignRoom', data: assignEvent });
      }
    } catch (error) {
      //   toastr.error(error);
    }
  }

  handleHighlightAvailability() {
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
    this.selectedRoom = -1;
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
            {`Book# ${this.eventData.BOOKING_NUMBER} - ${this.eventData.NAME}`}
          </div>
          <div class="row m-0 p-0 actionsContainer">
            <select class="form-control input-sm room-select" id={v4()} onChange={evt => this.onSelectRoom(evt)}>
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
              <div class="d-flex buttonsContainer">
                <button type="button" class="btn btn-secondary btn-sm" onClick={evt => this.handleCloseAssignment(evt)}>
                  <svg class="m-0 p-0" xmlns="http://www.w3.org/2000/svg" height="12" width="9" viewBox="0 0 384 512">
                    <path
                      fill="currentColor"
                      d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
                    />
                  </svg>
                </button>
                <ir-button
                  isLoading={isRequestPending('/Assign_Exposed_Room')}
                  size="sm"
                  text={locales.entries.Lcz_Assign}
                  onClickHandler={evt => this.handleAssignUnit(evt)}
                  btn_disabled={this.selectedRoom === -1}
                ></ir-button>
              </div>
            ) : null}
          </div>
          <hr />
        </div>
      </Host>
    );
  }
}

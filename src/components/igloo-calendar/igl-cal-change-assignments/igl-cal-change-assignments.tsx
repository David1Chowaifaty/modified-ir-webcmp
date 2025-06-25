import { Booking, Room } from '@/models/booking.dto';
import { BookingService } from '@/services/booking.service';
import { EventsService } from '@/services/events.service';
import booking_store from '@/stores/booking.store';
import locales from '@/stores/locales.store';
import { formatName } from '@/utils/booking';
import { Component, Event, EventEmitter, Prop, State, h } from '@stencil/core';

@Component({
  tag: 'igl-cal-change-assignments',
  styleUrls: ['igl-cal-change-assignments.css', '../../../common/sheet.css'],
  scoped: true,
})
export class IglCalChangeAssignments {
  @Prop() booking: Booking;
  @Prop() identifier: string;
  @Prop() propertyId: number;
  @Prop() language: string = 'en';

  @State() isLoading = null;
  @State() selectedRoom: Room;
  @State() newRoom: number;
  @State() guestName: string;

  @Event() closeModal: EventEmitter<null>;

  private bookingService = new BookingService();
  private eventService = new EventsService();

  componentWillLoad() {
    this.init();
  }
  private async init() {
    try {
      this.isLoading = 'init';
      this.selectedRoom = this.booking.rooms.find(r => r.identifier === this.identifier);
      if (!this.selectedRoom) {
        console.error(`No room found with identifier ${this.identifier}`);
        return;
      }

      const {
        from_date,
        to_date,
        occupancy,
        sharing_persons,
        guest: { first_name, last_name },
      } = this.selectedRoom;

      const mainGuest = sharing_persons.find(p => p.is_main);
      this.guestName = formatName(mainGuest?.first_name ?? first_name, mainGuest?.last_name ?? last_name);

      await this.bookingService.getBookingAvailability({
        from_date,
        to_date,
        propertyid: this.propertyId,
        adultChildCount: {
          adult: occupancy.adult_nbr,
          child: occupancy.children_nbr,
        },
        language: this.language,
        room_type_ids: [],
        currency: this.booking.currency,
        // agent_id,
        // is_in_agent_mode,
        room_type_ids_to_update: [],
      });
    } catch (error) {
    } finally {
      this.isLoading = null;
    }
  }
  private async reallocateRoom() {
    try {
      this.isLoading = 'submit';
      await this.eventService.reallocateEvent(this.selectedRoom.identifier, this.newRoom, this.selectedRoom.from_date, this.selectedRoom.to_date);
      this.closeModal.emit(null);
    } catch {
    } finally {
      this.isLoading = null;
    }
  }
  render() {
    if (this.isLoading === 'init') {
      return (
        <div class={'loading-container'}>
          <ir-spinner></ir-spinner>
        </div>
      );
    }
    return (
      <form
        class="sheet-container"
        onSubmit={e => {
          e.preventDefault();
          this.reallocateRoom();
        }}
      >
        <div class="sheet-header d-flex align-items-center">
          <ir-title
            onCloseSideBar={e => {
              e.stopImmediatePropagation();
              e.stopPropagation();
              if (this.isLoading) {
                return;
              }
              this.closeModal.emit(null);
            }}
            class="px-1 mb-0"
            label={'Change Assignment'}
            displayContext="sidebar"
          ></ir-title>
        </div>
        <div class={'sheet-body px-1 text-left'}>
          <p>
            {this.guestName} - {this.booking.booking_nbr}
          </p>
          <ul class="mx-0 px-0">
            {booking_store.roomTypes.map(r => {
              if (!r.is_available_to_book) {
                return;
              }
              return (
                <li key={r.id} class="pb-1">
                  <p>{r.name}</p>
                  <ul>
                    {r.physicalrooms.map(room => (
                      <li key={room.id}>
                        <ir-radio
                          onCheckChange={e => {
                            if (e.detail) this.newRoom = room.id;
                          }}
                          name="newRoom"
                          label={room.name}
                        ></ir-radio>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        </div>
        <div class={'sheet-footer'}>
          <ir-button text={locales.entries.Lcz_Cancel} btn_color="secondary" class={'flex-fill'} onClickHandler={() => this.closeModal.emit(null)}></ir-button>
          <ir-button isLoading={this.isLoading === 'submit'} text={locales.entries.Lcz_Save} btn_type="submit" class="flex-fill"></ir-button>
        </div>
      </form>
    );
  }
}

import { SharedPerson } from '@/models/booking.dto';
import { Component, Event, EventEmitter, Prop, h } from '@stencil/core';
import { ICountry } from '@/models/IBooking';
import locales from '@/stores/locales.store';
import { isRequestPending } from '@/stores/ir-interceptor.store';
@Component({
  tag: 'ir-room-guests',
  styleUrl: 'ir-room-guests.css',
  scoped: true,
})
export class IrRoomGuests {
  @Prop() open: boolean;
  /**
   * The name of the room currently being displayed.
   * Used to label the room in the user interface for clarity.
   */
  @Prop() roomName: string;

  /**
   * A unique identifier for the room.
   * This is used to distinguish between rooms, especially when performing operations like saving or checking in guests.
   */
  @Prop() identifier: string;

  /**
   * An array of people sharing the room.
   * Contains information about the {locales.entries.Lcz_MainGuest} and additional guests, such as their name, date of birth, {locales.entries.Lcz_Nationality}, and ID details.
   */
  @Prop() sharedPersons: SharedPerson[] = [];

  /**
   * The total number of guests for the room.
   * Determines how many guest input forms to display in the UI.
   */
  @Prop() totalGuests: number = 0;

  /**
   * A list of available countries.
   * Used to populate dropdowns for selecting the {locales.entries.Lcz_Nationality} of guests.
   */
  @Prop() countries: ICountry[];

  /**
   * A boolean indicating whether the room is in the process of being checked in.
   * If true, additional actions like saving the room state as "checked in" are performed.
   */
  @Prop() checkIn: boolean;

  /**
   * The language used for displaying text content in the component.
   * Defaults to English ('en'), but can be set to other supported languages.
   */
  @Prop() language: string = 'en';

  /**
   * A unique booking number associated with the room.
   * This is used for backend operations like saving guest information or checking in the room.
   */
  @Prop() bookingNumber: string;

  @Event() closeModal: EventEmitter<null>;

  render() {
    return (
      <ir-drawer
        style={{
          '--ir-drawer-width': '60rem',
          '--ir-drawer-background-color': 'var(--wa-color-surface-default)',
          '--ir-drawer-padding-left': 'var(--spacing)',
          '--ir-drawer-padding-right': 'var(--spacing)',
          '--ir-drawer-padding-top': 'var(--spacing)',
          '--ir-drawer-padding-bottom': 'var(--spacing)',
        }}
        label={`Room ${this.roomName}`}
        open={this.open}
        onDrawerHide={e => {
          e.stopImmediatePropagation();
          e.stopPropagation();
          this.closeModal.emit();
        }}
      >
        {this.open && (
          <ir-room-guests-form
            sharedPersons={this.sharedPersons}
            roomName={this.roomName}
            countries={this.countries}
            totalGuests={this.totalGuests}
            identifier={this.identifier}
            bookingNumber={this.bookingNumber}
            checkIn={this.checkIn}
            language={this.language}
          ></ir-room-guests-form>
        )}
        <div slot="footer" class="ir__drawer-footer">
          <ir-custom-button size="medium" data-drawer="close" appearance="filled" variant="neutral">
            {locales?.entries?.Lcz_Cancel ?? 'Save'}
          </ir-custom-button>

          <ir-custom-button loading={isRequestPending('/Handle_Exposed_Room_Guests')} size="medium" form={`room-guests__${this.identifier}`} type="submit" variant="brand">
            {this.checkIn ? locales.entries?.Lcz_CheckIn ?? 'Check in' : locales?.entries?.Lcz_Save ?? 'Save'}
          </ir-custom-button>
        </div>
      </ir-drawer>
    );
  }
}

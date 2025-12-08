import { Component, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core';
import { Booking } from '@/models/booking.dto';
@Component({
  tag: 'ir-booking-billing-recipient',
  styleUrls: ['ir-booking-billing-recipient.css'],
  scoped: true,
})
export class IrBookingBillingRecipient {
  @Prop({ mutable: true }) booking: Booking;

  @State() selectedRecipient: string;
  @State() rooms: Booking['rooms'] = [];

  @Event() recipientChange: EventEmitter<string>;

  private initialValue: string;
  private bookingCompanyFormRef: HTMLIrBookingCompanyFormElement;

  componentWillLoad() {
    this.initializeDefaultValue();
  }

  @Watch('booking')
  handleBookingChange() {
    this.initializeDefaultValue();
  }

  private initializeDefaultValue() {
    this.initialValue = this.booking?.guest?.id?.toString();
    this.selectedRecipient = this.initialValue;
    this.filterRoomGuests();
  }

  private handleRecipientChange(value: string) {
    this.selectedRecipient = value;
    switch (value) {
      case 'company':
        if (!this.booking.company_name) {
          this.bookingCompanyFormRef.openCompanyForm();
          return;
        }
        break;

      default:
        break;
    }
    this.recipientChange.emit(this.selectedRecipient);
  }

  private filterRoomGuests() {
    const normalize = (str: string) => {
      return str?.toLocaleLowerCase()?.trim();
    };
    const { guest: mainGuest } = this.booking;
    let _rooms = [];
    const guests = new Set<string>();
    const main_guest = `${normalize(mainGuest.first_name)}_${normalize(mainGuest.last_name)}`;
    guests.add(main_guest);
    for (const room of this.booking.rooms) {
      const _g = `${normalize(room.guest.first_name)}_${normalize(room.guest.last_name)}`;
      if (guests.has(_g)) {
        continue;
      }
      guests.add(_g);
      _rooms.push(room);
    }
    this.rooms = [..._rooms];
  }

  render() {
    return (
      <Host>
        <wa-radio-group
          defaultValue={this.initialValue}
          onchange={e => this.handleRecipientChange((e.target as any).value)}
          label="Bill to"
          orientation="vertical"
          name={`${this.booking?.booking_nbr}-bill-to`}
          value={this.selectedRecipient}
          size="small"
        >
          <wa-radio appearance="button" value={this.booking?.guest?.id?.toString()}>
            {this.booking?.guest.first_name} {this.booking.guest.last_name}
          </wa-radio>
          {this.rooms.map((r, idx) => (
            <wa-radio appearance="button" class="billing-recipient__room" value={r.guest.id?.toString() ?? `guest_${idx}`} key={r.guest?.id ?? `guest_${idx}`}>
              <span class="billing-recipient__guest-name">
                {r.guest.first_name} {r.guest.last_name}
              </span>

              {/* <div class="billing-recipient__room-details">
                <b class="billing-recipient__roomtype">{r.roomtype.name}</b>
                <span class="billing-recipient__rateplan">{r.rateplan.short_name}</span>

                {r.unit && (
                  <wa-tag variant="brand" size="small" appearance="accent">
                    {(r.unit as IUnit)?.name}
                  </wa-tag>
                )}
              </div> */}
            </wa-radio>
          ))}
          <wa-radio appearance="button" value="company">
            {this.booking.company_name ? this.booking.company_name : 'Company'}
          </wa-radio>
        </wa-radio-group>
        <ir-booking-company-form
          onCompanyFormClosed={() => {
            if (this.selectedRecipient === 'company' && !this.booking.company_name) {
              this.handleRecipientChange(this.initialValue);
            }
          }}
          onResetBookingEvt={e => {
            this.booking = { ...e.detail };
            if (!this.booking.company_name) {
              this.handleRecipientChange(this.initialValue);
            }
          }}
          booking={this.booking}
          ref={el => (this.bookingCompanyFormRef = el)}
        ></ir-booking-company-form>
      </Host>
    );
  }
}

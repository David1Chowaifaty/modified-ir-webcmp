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
  private bookingCompanyFormRef: HTMLIrBookingCompanyDialogElement;

  componentWillLoad() {
    this.initializeDefaultValue();
  }

  @Watch('booking')
  handleBookingChange() {
    this.initializeDefaultValue();
  }

  private initializeDefaultValue() {
    this.initialValue = 'guest';
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
    const joinKey = '|';
    const normalize = (value?: string) => value?.split(' ')?.join(joinKey)?.toLocaleLowerCase().trim() || '';

    const rooms: Booking['rooms'] = [];
    const seenNames = new Set<string>();

    const mainGuest = this.booking?.guest;
    if (mainGuest) {
      const mainKey = `${normalize(mainGuest.first_name)}${mainGuest.last_name ? joinKey : ''}${normalize(mainGuest.last_name)}`;
      seenNames.add(mainKey);
    }
    for (const room of this.booking.rooms || []) {
      const guest = room?.guest;
      if (!guest) continue;

      const key = `${normalize(guest.first_name)}${guest.last_name ? joinKey : ''}${normalize(guest.last_name)}`;

      // Skip exact duplicate first + last names
      if (seenNames.has(key)) continue;

      seenNames.add(key);
      rooms.push(room);
    }

    this.rooms = rooms;
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
          <wa-radio appearance="button" value={'guest'}>
            {this.booking?.guest.first_name} {this.booking.guest.last_name}
          </wa-radio>
          {this.rooms.map((r, idx) => (
            <wa-radio appearance="button" class="billing-recipient__room" value={`room__${r.guest.first_name} ${r.guest.last_name}`} key={r.guest?.id ?? `guest_${idx}`}>
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
            {this.booking.company_name ? this.booking.company_name : 'Use company name'}
          </wa-radio>
        </wa-radio-group>
        <ir-booking-company-dialog
          onCompanyFormClosed={() => {
            if (this.selectedRecipient === 'company' && !this.booking.company_name) {
              this.handleRecipientChange(this.initialValue);
            } else {
              this.handleRecipientChange('company');
            }
          }}
          onResetBookingEvt={e => {
            this.booking = { ...e.detail };
            if (!this.booking.company_name) {
              this.handleRecipientChange(this.initialValue);
            } else {
              this.handleRecipientChange('company');
            }
          }}
          booking={this.booking}
          ref={el => (this.bookingCompanyFormRef = el)}
        ></ir-booking-company-dialog>
      </Host>
    );
  }
}

import Token from '@/models/Token';
import { Component, Host, Listen, Prop, State, Watch, h } from '@stencil/core';

@Component({
  tag: 'ir-departures',
  styleUrls: ['../../assets/webawesome/component/host.css', '../../global/app.css', 'ir-departures.css'],
  scoped: true,
})
export class IrDepartures {
  @Prop() ticket: string;
  @Prop() propertyId: string;
  @Prop() language: string = 'en';

  @State() bookingNumber: number;

  private tokenService = new Token();

  componentWillLoad() {
    if (this.ticket) {
      this.tokenService.setToken(this.ticket);
      this.init();
    }
  }

  @Watch('ticket')
  handleTicketChange(newValue: string, oldValue: string) {
    if (newValue !== oldValue && newValue) {
      this.tokenService.setToken(this.ticket);
      this.init();
    }
  }

  @Listen('openBookingDetails')
  handleOpen(e: CustomEvent) {
    this.bookingNumber = e.detail;
  }

  private init() {}

  render() {
    return (
      <Host>
        <h3 class="page-title">Departures</h3>
        <ir-departures-filter></ir-departures-filter>
        <ir-departures-table></ir-departures-table>
        <ir-drawer
          onDrawerHide={e => {
            e.stopImmediatePropagation();
            e.stopPropagation();
            this.bookingNumber = null;
          }}
          withoutHeader
          open={!!this.bookingNumber}
          style={{ '--ir-drawer-width': '80rem', '--ir-drawer-background-color': '#F2F3F8', '--ir-drawer-padding-left': '0', '--ir-drawer-padding-right': '0' }}
        >
          {this.bookingNumber && (
            <ir-booking-details
              hasPrint
              hasReceipt
              hasCloseButton
              onCloseSidebar={() => (this.bookingNumber = null)}
              is_from_front_desk
              propertyid={this.propertyId as any}
              hasRoomEdit
              hasRoomDelete
              bookingNumber={this.bookingNumber.toString()}
              ticket={this.ticket}
              language={this.language}
              hasRoomAdd
            ></ir-booking-details>
          )}
        </ir-drawer>
      </Host>
    );
  }
}

import Token from '@/models/Token';
import { checkUserAuthState, manageAnchorSession } from '@/utils/utils';
import { Component, Host, Prop, State, h } from '@stencil/core';

@Component({
  tag: 'ir-booking',
  styleUrl: 'ir-booking.css',
  scoped: true,
})
export class IrBooking {
  @Prop() propertyid: number;
  @Prop() p: string;
  @Prop() bookingNumber: string;
  @State() isAuthenticated: boolean = false;
  private token = new Token();

  componentWillLoad() {
    const isAuthenticated = checkUserAuthState();
    if (isAuthenticated) {
      this.isAuthenticated = true;
      this.token.setToken(isAuthenticated.token);
    }
  }

  private handleAuthFinish(e: CustomEvent) {
    const token = e.detail.token;
    this.token.setToken(token);
    this.isAuthenticated = true;
    manageAnchorSession({ login: { method: 'direct', isLoggedIn: true, token } });
  }
  render() {
    if (!this.isAuthenticated)
      return (
        <Host>
          <ir-login onAuthFinish={this.handleAuthFinish.bind(this)}></ir-login>
        </Host>
      );
    return (
      <Host>
        <ir-booking-details
          p={this.p}
          hasPrint
          hasReceipt
          propertyid={this.propertyid}
          hasRoomEdit
          hasRoomDelete
          language="en"
          ticket={this.token.getToken()}
          bookingNumber={this.bookingNumber}
        ></ir-booking-details>
      </Host>
    );
  }
}

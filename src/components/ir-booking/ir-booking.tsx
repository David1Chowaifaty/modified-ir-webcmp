import { checkUserAuthState, manageAnchorSession } from '@/utils/utils';
import { Component, Host, Prop, State, h } from '@stencil/core';
import axios from 'axios';

@Component({
  tag: 'ir-booking',
  styleUrl: 'ir-booking.css',
  scoped: true,
})
export class IrBooking {
  @Prop() baseurl = '';
  @Prop() propertyid: number;
  @Prop() p: string;
  @Prop() bookingNumber: string;

  @State() token: string;

  componentWillLoad() {
    axios.defaults.baseURL = this.baseurl;
    const isAuthenticated = checkUserAuthState();
    if (isAuthenticated) {
      this.token = isAuthenticated.token;
    }
  }

  private handleAuthFinish(e: CustomEvent) {
    this.token = e.detail.token;
    manageAnchorSession({ login: { method: 'direct', isLoggedIn: true, token: this.token } });
  }
  render() {
    if (!this.token)
      return (
        <Host>
          <ir-login baseurl={this.baseurl} onAuthFinish={this.handleAuthFinish.bind(this)}></ir-login>
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
          bookingNumber={this.bookingNumber}
          baseurl={this.baseurl}
          ticket={this.token}
        ></ir-booking-details>
      </Host>
    );
  }
}

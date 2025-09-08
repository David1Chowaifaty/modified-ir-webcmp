import Token from '@/models/Token';
import { Component, Host, Prop, State, Watch, h } from '@stencil/core';
import axios from 'axios';

@Component({
  tag: 'ir-booking-email-logs',
  styleUrl: 'ir-booking-email-logs.css',
  scoped: true,
})
export class IrBookingEmailLogs {
  @Prop() ticket: string;

  @State() data: any[];
  @State() bookingNumber: string;

  private token = new Token();

  componentWillLoad() {
    if (this.ticket) {
      this.token.setToken(this.ticket);
    }
  }

  @Watch('ticket')
  handleTicketChange() {
    if (this.ticket) {
      this.token.setToken(this.ticket);
    }
  }

  render() {
    return (
      <Host class="p-1">
        <ir-interceptor handledEndpoints={['/Get_Email_log_By_BOOK_NBR']}></ir-interceptor>
        <ir-toast></ir-toast>
        <div class="d-flex align-items-center mb-1" style={{ gap: '0.5rem' }}>
          <ir-input-text
            class="m-0"
            inputContainerStyle={{ margin: '0' }}
            value={this.bookingNumber}
            onTextChange={e => (this.bookingNumber = e.detail)}
            placeholder="booking number"
          ></ir-input-text>
          <ir-button
            size="sm"
            text="search"
            onClickHandler={async () => {
              const { data } = await axios.post('/Get_Email_log_By_BOOK_NBR', {
                BOOK_NBR: this.bookingNumber,
              });
              if (data.ExceptionMsg) {
                return;
              }
              this.data = data.My_Result;
            }}
          ></ir-button>
        </div>
        <p>{JSON.stringify(this.data, null, 2)}</p>
      </Host>
    );
  }
}

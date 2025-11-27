import { Booking } from '@/models/booking.dto';
import { formatAmount } from '@/utils/utils';
import { Component, Host, Method, Prop, State, Watch, h } from '@stencil/core';

@Component({
  tag: 'ir-invoice',
  styleUrls: ['ir-invoice.css', '../../global/app.css'],
  scoped: true,
})
export class IrInvoice {
  @Prop({ mutable: true, reflect: true }) open: boolean;
  @Prop() booking: Booking;
  @Prop() mode: 'create' | 'check_in-create' = 'create';

  @State() selectedRecipient: string;

  componentWillLoad() {
    if (this.booking) {
      this.selectedRecipient = this.booking.guest.id.toString();
    }
  }

  @Watch('booking')
  handleBookingChange() {
    if (this.booking) {
      this.selectedRecipient = this.booking.guest.id.toString();
    }
  }
  @Method()
  async openDrawer() {
    this.open = true;
  }
  @Method()
  async closeDrawer() {
    this.open = false;
  }

  render() {
    return (
      <Host>
        <ir-drawer
          label="Invoice"
          open={this.open}
          onDrawerHide={e => {
            console.log('hello');
            e.stopImmediatePropagation();
            e.stopPropagation();
            this.closeDrawer();
          }}
        >
          <div class="ir-invoice__container">
            <ir-custom-date-picker></ir-custom-date-picker>
            <ir-booking-billing-recipient onRecipientChange={e => (this.selectedRecipient = e.detail)} booking={this.booking}></ir-booking-billing-recipient>
            <div class={'ir-invoice__services'}>
              <p class="ir-invoice__form-control-label">Choose what to invoice</p>
              <div class="ir-invoice__services-container">
                {this.booking?.rooms?.map(r => {
                  return (
                    <div class="ir-invoice__service" key={r.identifier}>
                      <wa-checkbox class="ir-invoice__checkbox" checked>
                        <div class={'ir-invoice__room-checkbox-container'}>
                          <b>{r.roomtype.name}</b>
                          <span>{r.rateplan.short_name}</span>
                          <span class="ir-invoice__checkbox-price">{formatAmount('$US', r.gross_total)}</span>
                        </div>
                      </wa-checkbox>
                    </div>
                  );
                })}
                {this.booking.pickup_info && (
                  <div class="ir-invoice__service">
                    <wa-checkbox class="ir-invoice__checkbox">
                      <div>Pickup</div>
                    </wa-checkbox>
                  </div>
                )}
                {this.booking.extra_services?.map(extra_service => (
                  <div key={extra_service.system_id} class="ir-invoice__service">
                    <wa-checkbox class="ir-invoice__checkbox">
                      <div></div>
                    </wa-checkbox>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div slot="footer" class="ir__drawer-footer">
            <ir-custom-button
              size="medium"
              appearance="filled"
              variant="neutral"
              onClickHandler={() => {
                this.closeDrawer();
              }}
            >
              Cancel
            </ir-custom-button>
            <ir-custom-button size="medium" appearance="outlined" variant="brand">
              Pro-forma Invoice
            </ir-custom-button>
            <ir-custom-button size="medium" variant="brand">
              Confirm Invoice
            </ir-custom-button>
          </div>
        </ir-drawer>
      </Host>
    );
  }
}

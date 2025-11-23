import { Component, h, Method, Prop, State } from '@stencil/core';
import { Booking } from '@/models/booking.dto';
import { BookingService } from '@/services/booking.service';
@Component({
  tag: 'ir-booking-company-form',
  styleUrl: 'ir-booking-company-form.css',
  scoped: true,
})
export class IrBookingCompanyForm {
  @Prop() booking: Booking;

  @State() open: boolean;
  @State() isLoading: boolean;
  @State() guest: Booking['guest'];

  private bookingService = new BookingService();
  componentWillLoad() {
    this.guest = { ...this.booking.guest };
  }

  @Method()
  async openCompanyForm() {
    this.open = true;
  }
  private updateGuest(params: Partial<Booking['guest']>) {
    this.guest = { ...this.guest, ...params };
  }
  private async saveCompany() {
    try {
      await this.bookingService.editExposedGuest(this.guest, this.booking.booking_nbr ?? null);
      this.open = false;
    } catch (error) {
    } finally {
      this.isLoading = false;
    }
  }

  render() {
    return (
      <ir-dialog open={this.open} onIrDialogHide={() => (this.open = false)} label="Company" id="dialog-overview">
        <div class="d-flex  flex-column" style={{ gap: '1rem' }}>
          <ir-custom-input onTextChange={e => this.updateGuest({ company_name: e.detail })} label="Name" autofocus placeholder="XYZ LTD"></ir-custom-input>
          <ir-custom-input onTextChange={e => this.updateGuest({ company_tax_nbr: e.detail })} label="Tax ID" placeholder="VAT 123456"></ir-custom-input>
        </div>
        <div slot="footer" class={'d-flex align-items-center'} style={{ gap: '0.5rem' }}>
          <ir-custom-button size="medium" appearance="filled" variant="neutral" data-dialog="close">
            Cancel
          </ir-custom-button>
          <ir-custom-button loading={this.isLoading} size="medium" variant="brand" onClickHandler={() => this.saveCompany}>
            Save
          </ir-custom-button>
        </div>
      </ir-dialog>
    );
  }
}

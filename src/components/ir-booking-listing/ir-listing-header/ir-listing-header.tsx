import { BookingListingService } from '@/services/booking_listing.service';
import booking_listing, { updateUserSelection } from '@/stores/booking_listing.store';
import locales from '@/stores/locales.store';
import { Component, Host, Listen, State, h } from '@stencil/core';

@Component({
  tag: 'ir-listing-header',
  styleUrl: 'ir-listing-header.css',
  scoped: true,
})
export class IrListingHeader {
  @State() inputValue: string = '';
  private bookingListingService = new BookingListingService();

  componentWillLoad() {
    this.bookingListingService.setToken(booking_listing.token);
  }

  @Listen('dateChanged')
  handleDateRangeChange(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const { start, end } = e.detail;
    booking_listing.userSelection = {
      ...booking_listing.userSelection,
      from: start.format('YYYY-MM-DD'),
      to: end.format('YYYY-MM-DD'),
    };
  }
  async handleSearchClicked() {
    if (this.inputValue !== '') {
      if (/^-?\d+$/.test(this.inputValue)) {
        updateUserSelection('book_nbr', this.inputValue);
      } else if (this.inputValue[3] === '-') {
        updateUserSelection('book_nbr', this.inputValue);
      } else {
        updateUserSelection('name', this.inputValue);
      }
    }
    await this.bookingListingService.getExposedBookings(booking_listing.userSelection);
    this.inputValue = '';
  }
  render() {
    return (
      <Host>
        <form class="d-flex align-items-center booking-container">
          <h3>{locales.entries.Lcz_Bookings}</h3>
          <ir-input-text value={this.inputValue} onTextChange={e => (this.inputValue = e.detail)} variant="icon" class="ml-md-5" placeholder="Find booking number/name">
            <svg slot="icon" xmlns="http://www.w3.org/2000/svg" height="12" width="12" viewBox="0 0 512 512">
              <path
                fill="currentColor"
                d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"
              />
            </svg>
          </ir-input-text>
          <h5 class="m-0">{locales.entries.Lcz_Or}</h5>
        </form>
        <section class="d-flex align-items-center flex-wrap filters-container justify-content-lg-start mt-1">
          <fieldset class="flex-fill-sm-none">
            <label htmlFor="dateTo">{locales.entries.Lcz_DateOf}</label>
            <ir-select
              onSelectChange={e => updateUserSelection('filter_type', e.detail)}
              showFirstOption={false}
              data={booking_listing?.types.map(channel => ({
                value: channel.name,
                text: channel.name,
              }))}
              select_id="dateTo"
              LabelAvailable={false}
            ></ir-select>
          </fieldset>
          <fieldset class="flex-fill-sm-none">
            <label htmlFor="dates">Dates</label>
            <igl-date-range
              minDate="2000-01-01"
              withDateDifference={false}
              defaultData={{
                fromDate: booking_listing.userSelection.from,
                toDate: booking_listing.userSelection.to,
              }}
            ></igl-date-range>
          </fieldset>
          <fieldset class="flex-fill-sm-none">
            <label htmlFor="booking_status">{locales.entries.Lcz_BookingStatus}</label>
            <ir-select
              onSelectChange={e => updateUserSelection('booking_status', e.detail)}
              showFirstOption={false}
              data={booking_listing?.statuses.map(channel => ({
                value: channel.name,
                text: channel.name,
              }))}
              select_id="booking_status"
              LabelAvailable={false}
            ></ir-select>
          </fieldset>
          <fieldset class="flex-fill-sm-none">
            <label htmlFor="channels">{locales.entries.Lcz_Channel}</label>
            <ir-select
              onSelectChange={e => updateUserSelection('channel', e.detail)}
              showFirstOption={false}
              data={booking_listing?.channels.map(channel => ({
                value: channel.name,
                text: channel.name,
              }))}
              select_id="channels"
              LabelAvailable={false}
            ></ir-select>
          </fieldset>
          <fieldset class="flex-fill-sm-none">
            <label htmlFor="payment_status">{locales.entries.Lcz_Payments} Status</label>
            <ir-select
              showFirstOption={false}
              data={booking_listing?.settlement_methods.map(channel => ({
                value: channel.name,
                text: channel.name,
              }))}
              select_id="payment_status"
              LabelAvailable={false}
            ></ir-select>
          </fieldset>
          <div class="d-flex align-items-end m-0 mt-2 buttons-container">
            <ir-icon onIconClickHandler={() => this.handleSearchClicked()}>
              <svg slot="icon" xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 512 512">
                <path
                  fill="currentColor"
                  d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"
                />
              </svg>
            </ir-icon>
            <ir-icon>
              <svg slot="icon" xmlns="http://www.w3.org/2000/svg" height="20" width="22.5" viewBox="0 0 576 512">
                <path
                  fill="currentColor"
                  d="M290.7 57.4L57.4 290.7c-25 25-25 65.5 0 90.5l80 80c12 12 28.3 18.7 45.3 18.7H288h9.4H512c17.7 0 32-14.3 32-32s-14.3-32-32-32H387.9L518.6 285.3c25-25 25-65.5 0-90.5L381.3 57.4c-25-25-65.5-25-90.5 0zM297.4 416H288l-105.4 0-80-80L227.3 211.3 364.7 348.7 297.4 416z"
                />
              </svg>
            </ir-icon>
            <ir-icon>
              <svg slot="icon" xmlns="http://www.w3.org/2000/svg" height="20" width="22.5" viewBox="0 0 576 512">
                <path
                  fill="currentColor"
                  d="M0 64C0 28.7 28.7 0 64 0H224V128c0 17.7 14.3 32 32 32H384V288H216c-13.3 0-24 10.7-24 24s10.7 24 24 24H384V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zM384 336V288H494.1l-39-39c-9.4-9.4-9.4-24.6 0-33.9s24.6-9.4 33.9 0l80 80c9.4 9.4 9.4 24.6 0 33.9l-80 80c-9.4 9.4-24.6 9.4-33.9 0s-9.4-24.6 0-33.9l39-39H384zm0-208H256V0L384 128z"
                />
              </svg>
            </ir-icon>
          </div>
        </section>
      </Host>
    );
  }
}

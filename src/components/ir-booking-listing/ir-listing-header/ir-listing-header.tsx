import { BookingListingService } from '@/services/booking_listing.service';
import booking_listing, { initializeUserSelection, updateUserSelection } from '@/stores/booking_listing.store';
import locales from '@/stores/locales.store';
import { Component, Event, EventEmitter, Host, Listen, Prop, State, h } from '@stencil/core';

@Component({
  tag: 'ir-listing-header',
  styleUrl: 'ir-listing-header.css',
  scoped: true,
})
export class IrListingHeader {
  @Prop() propertyId: number;
  @Prop() language: string;
  @Prop() baseurl: string;

  @State() inputValue: string = '';
  @State() isLoading: 'search' | 'excel' = null;

  @Event() preventPageLoad: EventEmitter<string>;

  private bookingListingService = new BookingListingService();

  componentWillLoad() {
    this.bookingListingService.setToken(booking_listing.token);
  }
  private downloadUrlTag: HTMLAnchorElement;
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
  async handleSearchClicked(is_to_export: boolean) {
    if (this.inputValue !== '') {
      if (/^-?\d+$/.test(this.inputValue.trim())) {
        updateUserSelection('book_nbr', this.inputValue.trim());
      } else if (this.inputValue[3] === '-') {
        updateUserSelection('book_nbr', this.inputValue.trim());
      } else {
        updateUserSelection('name', this.inputValue.trim());
      }
    }
    if (this.inputValue === '' && (booking_listing.userSelection.book_nbr !== '' || booking_listing.userSelection.name !== '')) {
      booking_listing.userSelection = {
        ...booking_listing.userSelection,
        name: '',
        book_nbr: '',
      };
    }
    this.isLoading = is_to_export ? 'excel' : 'search';
    this.preventPageLoad.emit('/Get_Exposed_Bookings');
    await this.bookingListingService.getExposedBookings({ ...booking_listing.userSelection, start_row: 0, end_row: 20, is_to_export });
    this.isLoading = null;
    if (booking_listing.download_url) {
      const url = booking_listing.download_url;
      this.downloadUrlTag.href = url;
      this.downloadUrlTag.download = url;
      this.downloadUrlTag.click();
      booking_listing.download_url = null;
    }
  }
  async handleClearUserField() {
    initializeUserSelection();
    if (this.inputValue) {
      this.inputValue = '';
    }
    await this.bookingListingService.getExposedBookings({ ...booking_listing.userSelection, start_row: 0, end_row: 20, is_to_export: false });
  }
  render() {
    return (
      <Host>
        <a ref={el => (this.downloadUrlTag = el)}>
          <p class="sr-only">download url</p>
        </a>
        <section class="d-flex align-items-center ">
          <div class="d-flex flex-fill flex-column flex-md-row align-items-md-center booking-container">
            <div class="d-flex mb-1 d-md-none align-items-center justify-content-bettween width-fill">
              <h3 class="flex-fill">{locales.entries?.Lcz_Bookings}</h3>
              <div>
                {booking_listing.token && (
                  <igl-book-property-container
                    withIrToastAndInterceptor={false}
                    propertyid={this.propertyId}
                    language={this.language}
                    title={locales.entries.Lcz_CreateNewBooking}
                    baseurl={this.baseurl}
                    ticket={booking_listing.token}
                  >
                    <ir-button slot="trigger" class={'new-booking-btn'} variant="icon" icon_name="square_plus"></ir-button>
                  </igl-book-property-container>
                )}
              </div>
            </div>
            <h3 class="d-none d-md-block">{locales.entries?.Lcz_Bookings}</h3>
            <form
              onSubmit={e => {
                e.preventDefault();
                console.log(this.inputValue);
                this.handleSearchClicked(false);
              }}
              class="booking-search-field width-fill"
            >
              <ir-input-text
                class={'flex-fill'}
                value={this.inputValue}
                onTextChange={e => (this.inputValue = e.detail)}
                variant="icon"
                placeholder={locales.entries?.Lcz_FindBookNbrorName}
              >
                <svg slot="icon" xmlns="http://www.w3.org/2000/svg" height="14" width="14" viewBox="0 0 512 512">
                  <path
                    fill="currentColor"
                    d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"
                  />
                </svg>
              </ir-input-text>
              <h5 class="m-0 font-weight-bold d-none d-sm-block">{locales.entries?.Lcz_Or}</h5>
            </form>
          </div>
          <div class="d-none d-md-block">
            {booking_listing.token && (
              <igl-book-property-container
                withIrToastAndInterceptor={false}
                propertyid={this.propertyId}
                language={this.language}
                title={locales.entries.Lcz_CreateNewBooking}
                baseurl={this.baseurl}
                ticket={booking_listing.token}
              >
                <ir-button slot="trigger" class={'new-booking-btn'} variant="icon" icon_name="square_plus"></ir-button>
              </igl-book-property-container>
            )}
          </div>
        </section>
        <section class="d-flex align-items-center justify-evenly seperator-container d-sm-none">
          <span></span>
          <h5 class="m-0 font-weight-bold">{locales.entries?.Lcz_Or}</h5>
          <span></span>
        </section>
        <section class="d-flex flex-column align-items-sm-center flex-sm-row flex-sm-wrap filters-container justify-content-lg-start mt-1">
          {/* <fieldset class="d-flex align-items-center flex-sm-column align-items-sm-start flex-fill-sm-none">
            <label htmlFor="dateTo"></label> */}
          <ir-select
            onSelectChange={e => updateUserSelection('filter_type', e.detail)}
            showFirstOption={false}
            data={booking_listing?.types.map(t => ({
              value: t.id.toString(),
              text: t.name,
            }))}
            class="flex-sm-wrap"
            selectedValue={booking_listing.userSelection.filter_type}
            select_id="dateTo"
            LabelAvailable={false}
          ></ir-select>
          {/* </fieldset> */}
          {/* <fieldset class="d-flex align-items-center flex-sm-column align-items-sm-start flex-fill-sm-none">
            <label htmlFor="dates">{locales.entries?.Lcz_Dates}</label> */}
          <igl-date-range
            class="flex-sm-wrap"
            minDate="2000-01-01"
            withDateDifference={false}
            defaultData={{
              fromDate: booking_listing.userSelection.from,
              toDate: booking_listing.userSelection.to,
            }}
          ></igl-date-range>
          {/* </fieldset> */}
          {/* <fieldset class="d-flex align-items-center flex-sm-column align-items-sm-start flex-fill-sm-none">
            <label htmlFor="booking_status">{locales.entries?.Lcz_BookingStatus}</label> */}
          <ir-select
            class="flex-sm-wrap"
            selectedValue={booking_listing.userSelection.booking_status}
            onSelectChange={e => updateUserSelection('booking_status', e.detail)}
            showFirstOption={false}
            data={booking_listing?.statuses.map(status => ({
              value: status.code,
              text: status.name,
            }))}
            select_id="booking_status"
            LabelAvailable={false}
          ></ir-select>
          {/* </fieldset>
          <fieldset class="d-flex align-items-center flex-sm-column align-items-sm-start flex-fill-sm-none">
            <label htmlFor="channels">{locales.entries?.Lcz_Channels}</label> */}
          <ir-select
            class="flex-sm-wrap"
            selectedValue={booking_listing.userSelection.channel}
            onSelectChange={e => updateUserSelection('channel', e.detail)}
            LabelAvailable={false}
            data={booking_listing?.channels.map(channel => ({
              value: channel.name,
              text: channel.name,
            }))}
            select_id="channels"
            firstOption={locales.entries?.Lcz_All + ' ' + locales.entries?.Lcz_Channels}
          ></ir-select>
          {/* </fieldset> */}
          {/* <fieldset class="flex-fill-sm-none">
            <label htmlFor="payment_status">{locales.entries?.Lcz_PaymentStatus}</label>
            <ir-select
              showFirstOption={false}
              data={booking_listing?.settlement_methods.map(method => ({
                value: method.code,
                text: method.name,
              }))}
              select_id="payment_status"
              LabelAvailable={false}
            ></ir-select>
          </fieldset> */}
          <div class="d-flex flex-fill align-items-end m-0  buttons-container">
            <ir-button
              title={locales.entries?.Lcz_Search}
              variant="icon"
              icon_name="search"
              isLoading={this.isLoading === 'search'}
              onClickHanlder={() => this.handleSearchClicked(false)}
            ></ir-button>
            <ir-button title={locales.entries?.Lcz_Erase} variant="icon" icon_name="eraser" onClickHanlder={() => this.handleClearUserField()}></ir-button>
            <ir-button
              title={locales.entries?.Lcz_ExportToExcel}
              variant="icon"
              icon_name="file"
              isLoading={this.isLoading === 'excel'}
              onClickHanlder={() => this.handleSearchClicked(true)}
            ></ir-button>
          </div>
        </section>
      </Host>
    );
  }
}

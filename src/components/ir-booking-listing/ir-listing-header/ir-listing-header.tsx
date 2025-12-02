import { BookingListingService } from '@/services/booking_listing.service';
import booking_listing, { initializeUserSelection, updateUserSelection } from '@/stores/booking_listing.store';
import locales from '@/stores/locales.store';
import { downloadFile, isPrivilegedUser } from '@/utils/utils';
import { Component, Event, EventEmitter, Host, Prop, State, h } from '@stencil/core';
import moment from 'moment';

@Component({
  tag: 'ir-listing-header',
  styleUrl: 'ir-listing-header.css',
  scoped: true,
})
export class IrListingHeader {
  @Prop() propertyId: number;
  @Prop() language: string;
  @Prop() p: string;

  @State() inputValue: string = '';
  @State() isLoading: 'search' | 'excel' = null;

  @Event() preventPageLoad: EventEmitter<string>;

  private bookingListingService = new BookingListingService();

  // private toDateRef: HTMLIrDatePickerElement;

  private async handleSearchClicked(is_to_export: boolean) {
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
    // setParams({
    //   s: booking_listing.userSelection.start_row,
    //   e: booking_listing.userSelection.end_row,
    //   c: booking_listing.userSelection.channel,
    //   status: booking_listing.userSelection.booking_status,
    //   from: booking_listing.userSelection.from,
    //   to: booking_listing.userSelection.to,
    //   filter: booking_listing.userSelection.filter_type,
    // });
    this.isLoading = is_to_export ? 'excel' : 'search';
    this.preventPageLoad.emit('/Get_Exposed_Bookings');
    await this.bookingListingService.getExposedBookings({ ...booking_listing.userSelection, start_row: 0, end_row: 20, is_to_export });
    this.isLoading = null;
    if (booking_listing.download_url) {
      downloadFile(booking_listing.download_url);
    }
  }
  private async handleClearUserField() {
    initializeUserSelection();
    if (this.inputValue) {
      this.inputValue = '';
    }
    await this.bookingListingService.getExposedBookings({ ...booking_listing.userSelection, start_row: 0, end_row: 20, is_to_export: false });
  }
  render() {
    const havePrivilege = isPrivilegedUser(booking_listing.userSelection.userTypeCode);
    return (
      <Host>
        <section class="d-flex align-items-center ">
          <div class="d-flex flex-fill flex-column flex-md-row align-items-md-center booking-container">
            <div class="d-flex mb-1 d-md-none align-items-center justify-content-bettween width-fill">
              <h3 class="page-title">{locales.entries?.Lcz_Bookings}</h3>
              <div>
                {!havePrivilege && (
                  <igl-book-property-container
                    p={this.p}
                    withIrToastAndInterceptor={false}
                    propertyid={this.propertyId}
                    language={this.language}
                    title={locales.entries.Lcz_CreateNewBooking}
                    ticket={booking_listing.token}
                  >
                    {/* <ir-button slot="trigger"  variant="icon" icon_name="square_plus"></ir-button> */}
                    <ir-custom-button id="new-booking" class={'new-booking-btn'} variant="brand" appearance="plain" slot="trigger">
                      <wa-icon name="plus" style={{ fontSize: '1.2rem' }}></wa-icon>
                    </ir-custom-button>
                  </igl-book-property-container>
                )}
              </div>
            </div>
            <h3 class="d-none d-md-block page-title">{locales.entries?.Lcz_Bookings}</h3>
            <form
              onSubmit={e => {
                e.preventDefault();
                console.log(this.inputValue);
                this.handleSearchClicked(false);
              }}
              class="booking-search-field width-fill"
            >
              <ir-custom-input
                class={'flex-fill'}
                value={this.inputValue}
                onText-change={e => (this.inputValue = e.detail)}
                size="small"
                placeholder={locales.entries?.Lcz_FindBookNbrorName}
              >
                <wa-icon name="magnifying-glass" slot="start"></wa-icon>
              </ir-custom-input>
              <h5 class="m-0 font-weight-bold d-none d-sm-block">{locales.entries?.Lcz_Or}</h5>
            </form>
          </div>
          <div class="d-none d-md-block">
            <wa-tooltip for="new-booking">Create new booking</wa-tooltip>
            {!havePrivilege && (
              <igl-book-property-container
                p={this.p}
                withIrToastAndInterceptor={false}
                propertyid={this.propertyId}
                language={this.language}
                title={locales.entries.Lcz_CreateNewBooking}
                ticket={booking_listing.token}
              >
                <ir-custom-button id="new-booking" variant="brand" appearance="plain" slot="trigger">
                  <wa-icon name="plus" style={{ fontSize: '1.2rem' }}></wa-icon>
                </ir-custom-button>
                {/* <ir-button slot="trigger" class={'new-booking-btn'} variant="icon" icon_name="square_plus"></ir-button> */}
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

          <wa-select
            onchange={e => {
              updateUserSelection('filter_type', (e.target as any).value);
            }}
            value={booking_listing.userSelection.filter_type?.toString()}
            size="small"
            defaultValue={booking_listing?.types[0]?.id?.toString()}
          >
            {booking_listing?.types.map(b => (
              <wa-option key={b.id} value={b.id?.toString()}>
                {b.name}
              </wa-option>
            ))}
          </wa-select>
          <ir-range-picker
            onDateRangeChanged={e => {
              e.stopImmediatePropagation();
              e.stopPropagation();
              const { fromDate, toDate } = e.detail;
              let to_date = toDate.format('YYYY-MM-DD');
              if (
                toDate.isSame(moment(booking_listing.userSelection.to, 'YYYY-MM-DD'), 'days') ||
                toDate.isBefore(moment(booking_listing.userSelection.from, 'YYYY-MM-DD'), 'days')
              ) {
                to_date = booking_listing.userSelection.to;
              }
              booking_listing.userSelection = { ...booking_listing.userSelection, to: to_date, from: fromDate.format('YYYY-MM-DD') };
            }}
            allowNullDates={false}
            fromDate={moment(booking_listing.userSelection.from, 'YYYY-MM-DD')}
            toDate={moment(booking_listing.userSelection.to, 'YYYY-MM-DD')}
          />

          <wa-select
            onchange={e => {
              updateUserSelection('booking_status', (e.target as any).value);
            }}
            value={booking_listing.userSelection.booking_status}
            size="small"
            defaultValue={booking_listing?.statuses[0]?.code}
          >
            {booking_listing?.statuses.map(b => (
              <wa-option key={b.code} value={b.code}>
                {b.name}
              </wa-option>
            ))}
          </wa-select>
          {!isPrivilegedUser(booking_listing.userSelection.userTypeCode) && (
            <wa-select
              onchange={e => {
                updateUserSelection('channel', (e.target as any).value);
              }}
              value={booking_listing.userSelection.channel}
              size="small"
              defaultValue={booking_listing?.channels[0]?.value}
            >
              {booking_listing?.channels.map(b => (
                <wa-option key={b.value} value={b.value}>
                  {b.name}
                </wa-option>
              ))}
            </wa-select>
          )}

          <wa-select
            onchange={e => {
              updateUserSelection('balance_filter', (e.target as any).value);
            }}
            value={booking_listing.userSelection.balance_filter}
            size="small"
            defaultValue={booking_listing?.balance_filter[0]?.value}
          >
            {booking_listing?.balance_filter.map(b => (
              <wa-option key={b.value} value={b.value}>
                {b.name}
              </wa-option>
            ))}
          </wa-select>
          <div class="d-flex flex-fill align-items-end m-0">
            <wa-tooltip for="search-btn">{locales.entries?.Lcz_Search}</wa-tooltip>
            <ir-custom-button id="search-btn" loading={this.isLoading === 'search'} onClickHandler={() => this.handleSearchClicked(false)} variant="neutral" appearance="plain">
              <wa-icon name="magnifying-glass" style={{ fontSize: '1.2rem' }}></wa-icon>
            </ir-custom-button>

            <wa-tooltip for="clear-btn">{locales.entries?.Lcz_Erase}</wa-tooltip>
            <ir-custom-button id="clear-btn" variant="neutral" appearance="plain" onClickHandler={() => this.handleClearUserField()}>
              <wa-icon name="eraser" style={{ fontSize: '1.2rem' }}></wa-icon>
            </ir-custom-button>

            <wa-tooltip for="excel-btn">{locales.entries?.Lcz_ExportToExcel}</wa-tooltip>
            <ir-custom-button loading={this.isLoading === 'excel'} id="excel-btn" variant="neutral" appearance="plain" onClickHandler={() => this.handleSearchClicked(true)}>
              <wa-icon name="file-excel" variant="regular" style={{ fontSize: '1.2rem' }}></wa-icon>
            </ir-custom-button>
          </div>
        </section>
      </Host>
    );
  }
}

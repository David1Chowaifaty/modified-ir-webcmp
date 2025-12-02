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
  // private async handleFromDateChange(e: CustomEvent) {
  //   e.stopImmediatePropagation();
  //   e.stopPropagation();
  //   const date = e.detail.start;
  //   if (moment(booking_listing.userSelection.from, 'YYYY-MM-DD').isSame(date, 'days')) {
  //     return;
  //   }
  //   let fromDate = date;
  //   let toDate = moment(new Date(booking_listing.userSelection.to));
  //   if (fromDate.isAfter(toDate)) {
  //     toDate = fromDate;
  //   }
  //   booking_listing.userSelection = { ...booking_listing.userSelection, from: fromDate.format('YYYY-MM-DD'), to: toDate.format('YYYY-MM-DD') };
  //   await this.toDateRef.openDatePicker();
  // }
  render() {
    console.log(booking_listing.balance_filter);
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
              {/* <ir-input-text
                
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
              </ir-input-text> */}
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
          {/* <div class={'booking-dates-container'}>
            <span>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox={'0 0 448 512'} style={{ height: '14px', width: '14px' }}>
                <path
                  fill="currentColor"
                  d={
                    'M152 24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H64C28.7 64 0 92.7 0 128v16 48V448c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V192 144 128c0-35.3-28.7-64-64-64H344V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H152V24zM48 192H400V448c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192z'
                  }
                ></path>
              </svg>
            </span>
            <ir-date-picker
              id="fromDate"
              class="date-picker-wrapper"
              date={new Date(booking_listing.userSelection.from)}
              minDate="2000-01-01"
              onDateChanged={e => this.handleFromDateChange(e)}
            >
              <p slot="trigger" class="m-0 p-0 date-display">
                {moment(new Date(booking_listing.userSelection.from)).format('MMM DD, yyyy')}
              </p>
            </ir-date-picker>

            <span>
              <svg xmlns="http://www.w3.org/2000/svg" class="arrow-icon" height="14" width="14" viewBox="0 0 512 512">
                <path
                  fill="currentColor"
                  d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l370.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z"
                />
              </svg>
            </span>
            <ir-date-picker
              id="toDate"
              forceDestroyOnUpdate
              class="date-picker-wrapper"
              date={new Date(booking_listing.userSelection.to)}
              ref={el => (this.toDateRef = el)}
              minDate={new Date(booking_listing.userSelection.from)}
              maxDate={moment().add(1, 'years').endOf('year').toDate()}
              onDateChanged={e => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                if (e.detail.start.isSame(booking_listing.userSelection.to, 'days') || e.detail.start.isBefore(booking_listing.userSelection.from, 'days')) {
                  return;
                }
                booking_listing.userSelection = { ...booking_listing.userSelection, to: e.detail.start.format('YYYY-MM-DD') };
              }}
            >
              <p slot="trigger" class="m-0 p-0 date-display">
                {moment(new Date(booking_listing.userSelection.to)).format('MMM DD, YYYY')}
              </p>
            </ir-date-picker>
          </div> */}
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

          {/* <ir-select
            class="flex-sm-wrap"
            selectedValue={booking_listing.userSelection.balance_filter}
            onSelectChange={e => updateUserSelection('balance_filter', e.detail)}
            data={booking_listing?.balance_filter.map(b => ({
              value: b.value,
              text: b.name,
            }))}
            showFirstOption={false}
            selectId="balance_filter"
          ></ir-select> */}
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

import { Booking } from '@/models/booking.dto';
import { BookingListingService } from '@/services/booking_listing.service';
import { RoomService } from '@/services/room.service';
import booking_listing, { updateUserSelection, onBookingListingChange } from '@/stores/booking_listing.store';
import locales from '@/stores/locales.store';
import { formatAmount } from '@/utils/utils';
import { Component, Host, Prop, State, Watch, h, Element, Listen } from '@stencil/core';
import axios from 'axios';
import moment from 'moment';
import { _formatTime } from '../ir-booking-details/functions';

@Component({
  tag: 'ir-booking-listing',
  styleUrl: 'ir-booking-listing.css',
  scoped: true,
})
export class IrBookingListing {
  @Element() el: HTMLElement;

  @Prop() language: string = '';
  @Prop() ticket: string = '';
  @Prop() baseurl: string = '';
  @Prop() propertyid: number;
  @Prop() rowCount: number = 10;

  @State() isLoading = false;
  @State() currentPage = 1;
  @State() totalPages = 1;
  @State() oldStartValue = 0;
  @State() editBookingItem: { booking: Booking; cause: 'edit' | 'payment' | 'delete' } | null = null;

  private bookingListingService = new BookingListingService();
  private roomService = new RoomService();
  private listingModal: HTMLIrListingModalElement;
  private listingModalTimeout: NodeJS.Timeout;
  private statusColors = {
    '001': 'badge-warning',
    '002': 'badge-success',
    '003': 'badge-danger',
    '004': 'badge-danger',
  };

  componentWillLoad() {
    updateUserSelection('end_row', this.rowCount);
    booking_listing.rowCount = this.rowCount;
    if (this.baseurl) {
      axios.defaults.baseURL = this.baseurl;
    }
    if (this.ticket !== '') {
      this.bookingListingService.setToken(this.ticket);
      this.roomService.setToken(this.ticket);
      booking_listing.token = this.ticket;
      this.initializeApp();
    }
    onBookingListingChange('userSelection', async newValue => {
      const newTotal = newValue.total_count;
      this.totalPages = Math.round(newTotal / this.rowCount);
    });
  }
  @Watch('ticket')
  async ticketChanged(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      this.bookingListingService.setToken(this.ticket);
      this.roomService.setToken(this.ticket);
      booking_listing.token = this.ticket;
      this.initializeApp();
    }
  }

  async initializeApp() {
    try {
      this.isLoading = true;
      updateUserSelection('property_id', this.propertyid);
      await Promise.all([this.bookingListingService.getExposedBookingsCriteria(this.propertyid), this.roomService.fetchLanguage(this.language, ['_BOOKING_LIST_FRONT'])]);
      await this.bookingListingService.getExposedBookings({ ...booking_listing.userSelection, is_to_export: false });
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  handleSideBarToggle(e: CustomEvent<boolean>) {
    if (e.detail && this.editBookingItem) {
      this.editBookingItem = null;
    }
  }

  getPaginationBounds() {
    const totalCount = booking_listing.userSelection.total_count;
    const startItem = (this.currentPage - 1) * this.rowCount;
    let endItem = this.currentPage * this.rowCount;
    endItem = endItem > totalCount ? totalCount : endItem;
    return { startItem, endItem, totalCount };
  }

  openModal() {
    this.listingModalTimeout = setTimeout(() => {
      this.listingModal = this.el.querySelector('ir-listing-modal');
      this.listingModal.editBooking = this.editBookingItem;
      this.listingModal.openModal();
    }, 100);
  }
  disconnectedCallback() {
    clearTimeout(this.listingModalTimeout);
  }
  @Listen('resetData')
  async handleResetData(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    await this.bookingListingService.getExposedBookings({ ...booking_listing.userSelection, is_to_export: false });
  }

  @Listen('resetBookingData')
  async handleResetStoreData(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    await this.bookingListingService.getExposedBookings({ ...booking_listing.userSelection, is_to_export: false });
  }
  @Listen('bookingChanged')
  handleBookingChanged(e: CustomEvent<Booking>) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    booking_listing.bookings = [
      ...booking_listing.bookings.map(b => {
        if (b.booking_nbr === e.detail.booking_nbr) {
          return e.detail;
        }
        return b;
      }),
    ];
  }

  renderItemRange() {
    const { endItem, startItem, totalCount } = this.getPaginationBounds();
    return `${locales.entries.Lcz_View} ${startItem} - ${endItem} ${locales.entries.Lcz_Of} ${totalCount}`;
  }

  async updateData() {
    const { endItem, startItem } = this.getPaginationBounds();
    await this.bookingListingService.getExposedBookings({
      ...booking_listing.userSelection,
      is_to_export: false,
      start_row: startItem,
      end_row: endItem,
    });
  }

  render() {
    if (this.isLoading || this.ticket === '') {
      return <ir-loading-screen></ir-loading-screen>;
    }
    return (
      <Host>
        <ir-interceptor></ir-interceptor>
        <ir-toast></ir-toast>
        <div class="p-1 main-container">
          <ir-listing-header propertyId={this.propertyid} language={this.language} baseurl={this.baseurl}></ir-listing-header>
          <section>
            <div class="card p-1 flex-fill m-0 mt-2">
              <table class="table table-striped table-bordered no-footer dataTable">
                <thead>
                  <tr>
                    <th scope="col" class="text-left">
                      {locales.entries?.Lcz_Bookings}#
                    </th>
                    <th scope="col">{locales.entries?.Lcz_BookedOn}</th>
                    <th scope="col">{locales.entries?.Lcz_GuestSource}</th>
                    <th scope="col">
                      <span class="price-span">{locales.entries?.Lcz_Price}</span>

                      <ir-tooltip
                        customSlot
                        message={`<span style="width:100%;display:block;">${locales.entries?.Lcz_BookingBalance}</span><span>${locales.entries?.Lcz_ClickToSettle}</span>`}
                      >
                        <span slot="tooltip-trigger" class={'m-0 btn due-btn'}>
                          {locales.entries?.Lcz_Balance}
                        </span>
                      </ir-tooltip>
                    </th>
                    <th scope="col" class="text-left services-cell">
                      {locales.entries?.Lcz_Services}
                    </th>
                    <th scope="col" class="in-out">
                      {locales.entries?.Lcz_InOut}
                    </th>
                    <th scope="col">{locales.entries?.Lcz_Status}</th>
                    <th scope="col">
                      <p class="sr-only">actions</p>
                    </th>
                  </tr>
                </thead>
                <tbody class="">
                  {booking_listing.bookings.length === 0 && (
                    <tr>
                      <td colSpan={8}>{locales.entries?.Lcz_NoDataAvailable}</td>
                    </tr>
                  )}
                  {booking_listing.bookings?.map(booking => {
                    let confirmationBG: string = this.statusColors[booking.status.code];
                    return (
                      <tr key={booking.booking_nbr}>
                        <td class="text-left">
                          <div class="h-100 d-flex align-items-center justify-content-between">
                            <button onClick={() => (this.editBookingItem = { booking, cause: 'edit' })} class="booking_number">
                              {booking.booking_nbr}
                            </button>{' '}
                            <img class="ml-2" src={booking.origin.Icon} alt="logo" />
                          </div>
                        </td>
                        <td>
                          <p class="p-0 m-0 date-p">{moment(booking.booked_on.date, 'YYYY-MM-DD').format('DD-MMM-YYYY')}</p>
                          <p class="p-0 m-0 secondary-p">{_formatTime(booking.booked_on.hour.toString(), +' ' + booking.booked_on.minute.toString())}</p>
                        </td>
                        <td>
                          <p class="p-0 m-0">
                            {booking.guest.first_name} {booking.guest.last_name ?? ''} {booking.occupancy.adult_nbr}
                            {locales.entries.Lcz_P}
                          </p>
                          <p class="p-0 m-0 secondary-p">{booking.origin.Label}</p>
                        </td>
                        <td>
                          <p class="p-0 m-0">{formatAmount(booking.currency.code, booking.financial?.gross_total ?? 0)}</p>
                          {booking.financial.due_amount > 0 && (
                            <buuton
                              onClick={() => {
                                this.editBookingItem = { booking, cause: 'payment' };
                                this.openModal();
                              }}
                              class="btn p-0 m-0 due-btn"
                            >
                              {formatAmount(booking.currency.code, booking.financial.due_amount)}
                            </buuton>
                          )}
                        </td>
                        <td>
                          <ul>
                            {booking.rooms.map(room => (
                              <li>{room.roomtype.name}</li>
                            ))}
                          </ul>
                        </td>
                        <td>
                          <p class="p-0 m-0 date-p">{moment(booking.from_date, 'YYYY-MM-DD').format('DD-MMM-YYYY')}</p>
                          <p class="p-0 m-0 date-p">{moment(booking.to_date, 'YYYY-MM-DD').format('DD-MMM-YYYY')}</p>
                        </td>
                        <td>
                          <p class={`m-0 badge ${confirmationBG}`}>{booking.status.description}</p>
                        </td>
                        <td>
                          <div class="d-flex justify-content-center align-items-center">
                            <ir-icon onIconClickHandler={() => (this.editBookingItem = { booking, cause: 'edit' })}>
                              <svg slot="icon" xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 512 512">
                                <path
                                  fill="#104064"
                                  d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z"
                                />
                              </svg>
                            </ir-icon>
                            <ir-icon
                              onIconClickHandler={() => {
                                this.editBookingItem = { booking, cause: 'delete' };
                                this.openModal();
                              }}
                              class="ml-1"
                            >
                              <svg slot="icon" xmlns="http://www.w3.org/2000/svg" height="20" width="17.5" viewBox="0 0 448 512">
                                <path
                                  fill="#ff4961"
                                  d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z"
                                />
                              </svg>
                            </ir-icon>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {this.totalPages > 1 && (
                <section class={'d-flex flex-column flex-md-row align-items-center justify-content-between'}>
                  <p class="m-0 mb-1 mb-md-0">{this.renderItemRange()}</p>
                  <div class={'d-flex align-items-center buttons-container'}>
                    <ir-button
                      size="sm"
                      btn_disabled={this.currentPage === 1}
                      onClickHanlder={async () => {
                        this.currentPage = 1;
                        await this.updateData();
                      }}
                    >
                      <svg slot="icon" xmlns="http://www.w3.org/2000/svg" height="14" width="14" viewBox="0 0 512 512">
                        <path
                          fill="white"
                          d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160zm352-160l-160 160c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L301.3 256 438.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0z"
                        />
                      </svg>
                    </ir-button>
                    <ir-button
                      size="sm"
                      btn_disabled={this.currentPage === 1}
                      onClickHanlder={async () => {
                        this.currentPage = this.currentPage - 1;
                        console.log(this.currentPage);
                        await this.updateData();
                      }}
                    >
                      <svg slot="icon" xmlns="http://www.w3.org/2000/svg" height="14" width="8.75" viewBox="0 0 320 512">
                        <path
                          fill="white"
                          d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160z"
                        />
                      </svg>
                    </ir-button>
                    <ir-select
                      selectedValue={this.currentPage.toString()}
                      LabelAvailable={false}
                      showFirstOption={false}
                      onSelectChange={async e => {
                        this.currentPage = +e.detail;
                        await this.updateData();
                      }}
                      data={Array.from(Array(this.totalPages), (_, i) => i + 1).map(i => ({
                        text: i.toString(),
                        value: i.toString(),
                      }))}
                    ></ir-select>
                    <ir-button
                      size="sm"
                      btn_disabled={this.currentPage === this.totalPages}
                      onClickHanlder={async () => {
                        this.currentPage = this.currentPage + 1;
                        await this.updateData();
                      }}
                    >
                      <svg slot="icon" xmlns="http://www.w3.org/2000/svg" height="14" width="8.75" viewBox="0 0 320 512">
                        <path
                          fill="white"
                          d="M278.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-160 160c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L210.7 256 73.4 118.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l160 160z"
                        />
                      </svg>
                    </ir-button>
                    <ir-button
                      size="sm"
                      btn_disabled={this.currentPage === this.totalPages}
                      onClickHanlder={async () => {
                        this.currentPage = this.totalPages;
                        console.log(this.currentPage);
                        await this.updateData();
                      }}
                    >
                      <svg slot="icon" xmlns="http://www.w3.org/2000/svg" height="14" width="14" viewBox="0 0 512 512">
                        <path
                          fill="white"
                          d="M470.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 256 265.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160zm-352 160l160-160c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L210.7 256 73.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0z"
                        />
                      </svg>
                    </ir-button>
                  </div>
                </section>
              )}
            </div>
          </section>
        </div>
        {this.editBookingItem && <ir-listing-modal onModalClosed={() => (this.editBookingItem = null)}></ir-listing-modal>}
        <ir-sidebar
          onIrSidebarToggle={this.handleSideBarToggle.bind(this)}
          open={this.editBookingItem !== null && this.editBookingItem.cause === 'edit'}
          showCloseButton={this.editBookingItem !== null}
          sidebarStyles={{ width: this.editBookingItem ? '80rem' : 'var(--sidebar-width,40rem)', background: '#F2F3F8' }}
        >
          {this.editBookingItem?.cause === 'edit' && (
            <ir-booking-details
              hasPrint
              hasReceipt
              is_from_front_desk
              propertyid={this.propertyid}
              hasRoomEdit
              hasRoomDelete
              bookingNumber={this.editBookingItem.booking.booking_nbr}
              ticket={this.ticket}
              baseurl={this.baseurl}
              language={this.language}
              hasRoomAdd
            ></ir-booking-details>
          )}
        </ir-sidebar>
      </Host>
    );
  }
}

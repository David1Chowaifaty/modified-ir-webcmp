import { Booking } from '@/models/booking.dto';
import { BookingListingService } from '@/services/booking_listing.service';
import { RoomService } from '@/services/room.service';
import booking_listing, {
  updateUserSelection,
  onBookingListingChange,
  updateUserSelections,
  ExposedBookingsParams,
  setPaginationPage,
  setPaginationPageSize,
  updatePaginationFromSelection,
} from '@/stores/booking_listing.store';
import { isPrivilegedUser } from '@/utils/utils';
import { Component, Host, Prop, State, Watch, h, Element, Listen } from '@stencil/core';
import Token from '@/models/Token';
import { getAllParams } from '@/utils/browserHistory';
import { BookingService } from '@/services/booking.service';
import { Payment, PaymentEntries } from '../ir-booking-details/types';
import { AllowedProperties, PropertyService } from '@/services/property.service';
import type { PaginationChangeEvent } from '@/components/ir-pagination/ir-pagination';

@Component({
  tag: 'ir-booking-listing',
  styleUrls: ['ir-booking-listing.css', '../../global/app.css'],
  scoped: true,
})
export class IrBookingListing {
  @Element() el: HTMLElement;

  @Prop() language: string = '';
  @Prop() ticket: string = '';
  @Prop() propertyid: number;
  @Prop() rowCount: number = 10;
  @Prop() p: string;
  @Prop() baseUrl: string;
  @Prop() userType: number;

  @State() isLoading = false;
  @State() editBookingItem: { booking: Booking; cause: 'edit' | 'payment' | 'delete' | 'guest' } | null = null;
  @State() showCost = false;
  @State() paymentEntries: PaymentEntries;
  @State() payment: Payment;
  @State() booking: Booking;

  private bookingListingService = new BookingListingService();
  private bookingService = new BookingService();
  private roomService = new RoomService();
  private propertyService = new PropertyService();
  private token = new Token();

  private listingModal: HTMLIrListingModalElement;
  private listingModalTimeout: NodeJS.Timeout;
  private allowedProperties: number[];
  private havePrivilege: boolean;
  private paymentFolioRef: HTMLIrPaymentFolioElement;

  componentWillLoad() {
    if (this.baseUrl) {
      this.token.setBaseUrl(this.baseUrl);
    }
    updateUserSelection('end_row', this.rowCount);
    booking_listing.rowCount = this.rowCount;
    setPaginationPageSize(this.rowCount);
    if (this.ticket !== '') {
      booking_listing.token = this.ticket;
      this.token.setToken(this.ticket);
      this.initializeApp();
    }
    onBookingListingChange('userSelection', newValue => {
      updatePaginationFromSelection(newValue);
    });
    onBookingListingChange('bookings', newValue => {
      this.showCost = newValue.some(booking => booking.financial.gross_cost !== null && booking.financial.gross_cost > 0);
    });
  }
  @Watch('ticket')
  ticketChanged(newValue: string, oldValue: string) {
    if (newValue === oldValue) {
      return;
    }
    this.token.setToken(this.ticket);
    booking_listing.token = this.ticket;
    this.initializeApp();
  }

  private async fetchBookings() {
    await this.bookingListingService.getExposedBookings({
      ...booking_listing.userSelection,
      is_to_export: false,
    });
  }

  private async initializeApp() {
    try {
      this.isLoading = true;
      this.havePrivilege = isPrivilegedUser(this.userType);

      let propertyId = this.propertyid;
      if (!this.havePrivilege) {
        if (!this.propertyid && !this.p) {
          throw new Error('Property ID or username is required');
        }

        if (!propertyId) {
          const propertyData = await this.roomService.getExposedProperty({
            id: 0,
            aname: this.p,
            language: this.language,
            is_backend: true,
          });
          propertyId = propertyData.My_Result.id;
        }
      }

      const parallelRequests: Promise<unknown>[] = [
        this.bookingService.getSetupEntriesByTableNameMulti(['_PAY_TYPE', '_PAY_TYPE_GROUP', '_PAY_METHOD']),
        this.bookingListingService.getExposedBookingsCriteria(this.havePrivilege ? null : propertyId),
        this.roomService.fetchLanguage(this.language, ['_BOOKING_LIST_FRONT']),
      ];

      // let propertyDataIndex: number | null = null;
      let allowedPropertiesIndex: number | null = null;

      if (this.propertyid && !this.havePrivilege) {
        // propertyDataIndex = parallelRequests.length;
        parallelRequests.push(
          this.roomService.getExposedProperty({
            id: this.propertyid,
            language: this.language,
            is_backend: true,
          }),
        );
      }

      if (this.havePrivilege) {
        allowedPropertiesIndex = parallelRequests.length;
        parallelRequests.push(this.propertyService.getExposedAllowedProperties());
      }

      const results = await Promise.all(parallelRequests);

      const [setupEntries] = results;
      const { pay_type, pay_type_group, pay_method } = this.bookingService.groupEntryTablesResult(setupEntries as any);

      this.paymentEntries = {
        groups: pay_type_group,
        methods: pay_method,
        types: pay_type,
      };

      this.allowedProperties = allowedPropertiesIndex !== null ? (results[allowedPropertiesIndex] as AllowedProperties)?.map(p => p.id) : null;

      updateUserSelection('property_id', propertyId);

      updateUserSelections({
        property_ids: this.allowedProperties,
        userTypeCode: this.userType,
      });

      await this.fetchBookings();
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      this.isLoading = false;
    }
  }

  handleSideBarToggle(e: CustomEvent<boolean>) {
    if (e.detail) {
      this.editBookingItem = null;
    }
  }
  geSearchFiltersFromParams() {
    //e=10&status=002&from=2025-04-15&to=2025-04-22&filter=2&c=Alitalia+Cabin+Crew
    const params = getAllParams();
    if (params) {
      console.log('update params');
      let obj: Partial<ExposedBookingsParams> = {};
      if (params.e) {
        obj['end_row'] = Number(params.e);
      }
      if (params.s) {
        obj['start_row'] = Number(params.s);
      }
      if (params.status) {
        obj['booking_status'] = params.status;
      }
      if (params.filter) {
        obj['filter_type'] = params.filter;
      }
      if (params.from) {
        obj['from'] = params.from;
      }
      if (params.to) {
        obj['to'] = params.to;
      }
      updateUserSelections(obj);
    }
    console.log('params=>', params);
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

  @Listen('requestPageChange')
  async handlePaginationChange(event: CustomEvent<PaginationChangeEvent>) {
    event.stopImmediatePropagation();
    event.stopPropagation();
    if (!event.detail) {
      return;
    }
    setPaginationPage(event.detail.currentPage);
    await this.fetchBookings();
  }

  @Listen('requestPageSizeChange')
  async handlePaginationPageSizeChange(event: CustomEvent<PaginationChangeEvent>) {
    if (!event.detail || !event.detail.pageSize) {
      return;
    }
    event.stopImmediatePropagation();
    event.stopPropagation();
    setPaginationPageSize(event.detail.pageSize);
    await this.fetchBookings();
  }

  @Listen('resetData')
  async handleResetData(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    await this.fetchBookings();
  }

  @Listen('resetBookingData')
  async handleResetStoreData(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    await this.fetchBookings();
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
  @Listen('payBookingBalance')
  handleBookingPayment(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const { booking_nbr, payment } = e.detail;
    this.booking = this.findBooking(booking_nbr);
    this.payment = payment;
    this.paymentFolioRef.openFolio();
  }
  @Listen('guestSelected')
  handleSelectGuestEvent(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const booking = this.findBooking(e.detail);
    if (!booking) {
      return;
    }
    this.editBookingItem = {
      booking,
      cause: 'guest',
    };
  }
  @Listen('openBookingDetails')
  handleOpen(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation;
    const booking = this.findBooking(e.detail);
    if (!booking) {
      return;
    }
    this.editBookingItem = {
      booking,
      cause: 'edit',
    };
  }

  private findBooking(bookingNumber: Booking['booking_nbr']) {
    return booking_listing.bookings.find(b => b.booking_nbr === bookingNumber);
  }
  render() {
    if (this.isLoading || this.ticket === '') {
      return <ir-loading-screen></ir-loading-screen>;
    }
    return (
      <Host>
        <ir-interceptor></ir-interceptor>
        <ir-toast></ir-toast>
        <div class="main-container">
          <ir-listing-header propertyId={this.propertyid} p={this.p} language={this.language}></ir-listing-header>
          <section class="mt-2">
            {/* <table class="table table-striped table-bordered no-footer dataTable">
                <thead>
                  <tr>
                    {this.havePrivilege && <th class="text-left">Property</th>}
                    <th scope="col" class="text-center">
                      {locales.entries?.Lcz_Booking}#
                    </th>
                    <th scope="col">{locales.entries?.Lcz_BookedOn}</th>
                    <th scope="col">{locales.entries?.Lcz_GuestSource}</th>
                    <th scope="col" class="text-left services-cell">
                      {locales.entries?.Lcz_Services}
                    </th>
                    <th scope="col" class="in-out">
                      {locales.entries?.Lcz_Dates}
                    </th>
                    <th scope="col">
                      <span class="price-span">{locales.entries?.Lcz_Amount}</span>

                      <ir-tooltip
                        customSlot
                        message={`<span style="width:100%;display:block;">${locales.entries?.Lcz_BookingBalance}</span><span>${locales.entries?.Lcz_ClickToSettle}</span>`}
                      >
                        <span slot="tooltip-trigger" class={'m-0 btn due-btn'}>
                          {locales.entries?.Lcz_Balance}
                        </span>
                      </ir-tooltip>
                    </th>
                    {this.showCost && (
                      <th scope="col" class="services-cell">
                        {locales.entries?.Lcz_Cost}
                      </th>
                    )}
                    <th scope="col">{locales.entries?.Lcz_Status}</th>
                    <th scope="col">
                      <p class="sr-only">actions</p>
                    </th>
                  </tr>
                </thead>
                <tbody class="">
                  {booking_listing.bookings.length === 0 && (
                    <tr>
                      <td colSpan={this.havePrivilege ? 9 : 8}>{locales.entries?.Lcz_NoDataAvailable}</td>
                    </tr>
                  )}
                  {booking_listing.bookings?.map(booking => {
                    let confirmationBG: string = this.statusColors[booking.is_requested_to_cancel ? '003' : booking.status.code];
                    const lastManipulation = booking.ota_manipulations ? booking.ota_manipulations[booking.ota_manipulations.length - 1] : null;
                    const totalPersons = this.calculateTotalPersons(booking);
                    return (
                      <tr key={booking.booking_nbr}>
                        {this.havePrivilege && <td class="text-left">{booking.property.name}</td>}
                        <td class="text-left">
                          <ir-button
                            btn_color="link"
                            btnStyle={{ padding: '0', margin: '0' }}
                            onClickHandler={() => (this.editBookingItem = { booking, cause: 'edit' })}
                            text={booking.booking_nbr}
                          ></ir-button>
                          {booking.channel_booking_nbr && <p class="p-0 m-0 text-center secondary-p">{booking.channel_booking_nbr}</p>}
                        </td>
                        <td>
                          <p class="p-0 m-0 date-p">{moment(booking.booked_on.date, 'YYYY-MM-DD').format('DD-MMM-YYYY')}</p>
                          <p class="p-0 m-0 secondary-p">{_formatTime(booking.booked_on.hour.toString(), booking.booked_on.minute.toString())}</p>
                        </td>
                        <td>
                          <div class="h-100 d-flex align-items-center " style={{ width: 'max-content' }}>
                            <img class="mr-2 logo" src={booking.origin.Icon} alt={booking.origin.Label} />
                            <div class="text-left">
                              <div class="d-flex align-items-center">
                                <div class="booking_name m-0 p-0">
                                  <ir-button
                                    btn_color="link"
                                    onClickHandler={() => (this.editBookingItem = { booking, cause: 'guest' })}
                                    text={`${booking.guest.first_name} ${booking.guest.last_name ?? ''}`}
                                    btnStyle={{
                                      width: 'fit-content',
                                      padding: '0',
                                      margin: '0',
                                    }}
                                    labelStyle={{
                                      padding: '0',
                                    }}
                                  ></ir-button>
                                  {booking.guest.nbr_confirmed_bookings > 1 && !booking.agent && (
                                    <div class="m-0 p-0">
                                      <ir-tooltip message={`${locales.entries.Lcz_BookingsNbr}`.replace('%1', booking.guest.nbr_confirmed_bookings.toString())} customSlot>
                                        <div class="d-flex align-items-center my-0 p-0" slot="tooltip-trigger">
                                          <ir-icons style={{ '--icon-size': '0.875rem' }} color="#FB0AAD" name="heart-fill"></ir-icons>
                                        </div>
                                      </ir-tooltip>
                                    </div>
                                  )}

                                  <span class={'p-0 m-0'}>
                                    {totalPersons}
                                    {locales.entries.Lcz_P}
                                  </span>
                                  {getPrivateNote(booking.extras) && <span class="yellow_dot"></span>}
                                </div>
                              </div>
                              <div class={'d-flex align-items-center booking-label-gap'}>
                                <p class="p-0 m-0 secondary-p">{booking.origin.Label}</p>
                                {booking.is_in_loyalty_mode && !booking.promo_key && (
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" height={18} width={18}>
                                    <title>{locales.entries.Lcz_LoyaltyDiscountApplied}</title>
                                    <path
                                      fill="#fc6c85"
                                      d="M225.8 468.2l-2.5-2.3L48.1 303.2C17.4 274.7 0 234.7 0 192.8v-3.3c0-70.4 50-130.8 119.2-144C158.6 37.9 198.9 47 231 69.6c9 6.4 17.4 13.8 25 22.3c4.2-4.8 8.7-9.2 13.5-13.3c3.7-3.2 7.5-6.2 11.5-9c0 0 0 0 0 0C313.1 47 353.4 37.9 392.8 45.4C462 58.6 512 119.1 512 189.5v3.3c0 41.9-17.4 81.9-48.1 110.4L288.7 465.9l-2.5 2.3c-8.2 7.6-19 11.9-30.2 11.9s-22-4.2-30.2-11.9zM239.1 145c-.4-.3-.7-.7-1-1.1l-17.8-20c0 0-.1-.1-.1-.1c0 0 0 0 0 0c-23.1-25.9-58-37.7-92-31.2C81.6 101.5 48 142.1 48 189.5v3.3c0 28.5 11.9 55.8 32.8 75.2L256 430.7 431.2 268c20.9-19.4 32.8-46.7 32.8-75.2v-3.3c0-47.3-33.6-88-80.1-96.9c-34-6.5-69 5.4-92 31.2c0 0 0 0-.1 .1s0 0-.1 .1l-17.8 20c-.3 .4-.7 .7-1 1.1c-4.5 4.5-10.6 7-16.9 7s-12.4-2.5-16.9-7z"
                                    />
                                  </svg>
                                )}
                                {booking.promo_key && (
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" height={18} width={18}>
                                    <title>{locales.entries.Lcz_Coupon + ':' + booking.promo_key}</title>
                                    <path
                                      stroke-linecap="round"
                                      stroke-linejoin="round"
                                      d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 0 1 0 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 0 1 0-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375Z"
                                    />
                                  </svg>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td>
                          <ul>
                            {booking.rooms.map(room => (
                              <li>
                                <div class={'room-service'}>
                                  <p class={'m-0 p-0'}>{room.roomtype.name}</p>
                                  {room.unit &&
                                    !isSingleUnit(room.roomtype.id) &&
                                    ((room.unit as IUnit)?.name?.length > 4 ? (
                                      <ir-tooltip customSlot message={(room.unit as IUnit)?.name}>
                                        <p class={'room-name-container cursor-pointer m-0'} slot="tooltip-trigger">
                                          {(room.unit as IUnit)?.name?.substring(0, 4)}
                                        </p>
                                      </ir-tooltip>
                                    ) : (
                                      <p class={'room-name-container  m-0'}>{(room.unit as IUnit)?.name?.substring(0, 4)}</p>
                                    ))}
                                </div>
                              </li>
                            ))}
                            {booking.extra_services && <li>{locales.entries.Lcz_ExtraServices}</li>}
                          </ul>
                        </td>
                        <td>
                          <p class="p-0 m-0 date-p">{moment(booking.from_date, 'YYYY-MM-DD').format('DD-MMM-YYYY')}</p>
                          <p class="p-0 m-0 date-p">{moment(booking.to_date, 'YYYY-MM-DD').format('DD-MMM-YYYY')}</p>
                        </td>
                        <td>
                          <p class="p-0 m-0" style={{ whiteSpace: 'nowrap' }}>
                            {formatAmount(booking.currency.symbol, booking.financial?.gross_total ?? 0)}
                          </p>
                          <Fragment>
                            {['003', '004'].includes(booking.status.code) && booking.is_direct
                              ? booking.financial.cancelation_penality_as_if_today !== 0 &&
                                booking.financial.due_amount !== 0 && (
                                  <button
                                    onClick={() => {
                                      this.editBookingItem = { booking, cause: 'payment' };
                                      this.openModal();
                                    }}
                                    style={{ whiteSpace: 'nowrap' }}
                                    class="btn p-0 m-0 due-btn"
                                  >
                                    <span>{booking.financial.cancelation_penality_as_if_today < 0 ? 'Refund' : 'Charge'} </span>
                                    {formatAmount(booking.currency.symbol, Math.abs(booking.financial.cancelation_penality_as_if_today))}
                                  </button>
                                )
                              : booking.financial.due_amount !== 0 && (
                                  <button
                                    onClick={() => {
                                      this.editBookingItem = { booking, cause: 'payment' };
                                      this.openModal();
                                    }}
                                    style={{ whiteSpace: 'nowrap' }}
                                    class="btn p-0 m-0 due-btn"
                                  >
                                    {formatAmount(booking.currency.symbol, booking.financial.due_amount)}
                                  </button>
                                )}
                          </Fragment>
                        </td>
                        {this.showCost && (
                          <td>
                            {booking.financial.gross_cost !== null && booking.financial.gross_cost === 0
                              ? '_'
                              : formatAmount(booking.currency.symbol, booking.financial.gross_cost)}
                          </td>
                        )}

                        <td>
                          <p class={`m-0 badge ${confirmationBG} ct_ir_badge`}>
                            {booking.is_requested_to_cancel ? locales?.entries?.Lcz_CancellationRequested : booking.status.description}
                          </p>
                          {!lastManipulation && booking.events?.length > 0 && booking.events[0].type.toLowerCase() === 'modified' && (
                            <p class="mx-0 p-0 small" style={{ marginTop: '0.25rem', marginBottom: '0' }}>
                              Modified
                            </p>
                          )}
                          {lastManipulation && (
                            <ir-popover
                              trigger="hover"
                              content={`Modified by ${lastManipulation.user} at ${lastManipulation.date} ${lastManipulation.hour}:${lastManipulation.minute}`}
                            >
                              <p class="mx-0 p-0 small text-danger" style={{ marginTop: '0.25rem', marginBottom: '0' }}>
                                <b>Modified</b>
                              </p>
                            </ir-popover>
                          )}
                        </td>
                        <td>
                          <div class="d-flex justify-content-center align-items-center" style={{ gap: '8px' }}>
                            <ir-button title="Edit booking" variant="icon" icon_name="edit" onClickHandler={() => (this.editBookingItem = { booking, cause: 'edit' })}></ir-button>
                            <ir-button
                              title="Delete booking"
                              style={{ '--icon-button-color': '#ff4961', '--icon-button-hover-color': '#FF1635' }}
                              variant="icon"
                              icon_name="trash"
                              onClickHandler={() => {
                                this.editBookingItem = { booking, cause: 'delete' };
                                this.openModal();
                              }}
                            ></ir-button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table> */}
            <ir-booking-listing-table></ir-booking-listing-table>
            {/* {this.totalPages > 1 && (
              <section class={'d-flex flex-column flex-md-row align-items-center justify-content-between pagination-container'}>
                <p class="m-0 mb-1 mb-md-0">{this.renderItemRange()}</p>
                <div class={'d-flex align-items-center buttons-container'}>
                  <ir-button
                    size="sm"
                    btn_disabled={this.currentPage === 1}
                    onClickHandler={async () => {
                      this.currentPage = 1;
                      await this.updateData();
                    }}
                    icon_name="angles_left"
                    style={{ '--icon-size': '0.875rem' }}
                  ></ir-button>
                  <ir-button
                    size="sm"
                    btn_disabled={this.currentPage === 1}
                    onClickHandler={async () => {
                      this.currentPage = this.currentPage - 1;
                      await this.updateData();
                    }}
                    icon_name="angle_left"
                    style={{ '--icon-size': '0.875rem' }}
                  ></ir-button>
                  <ir-select
                    selectedValue={this.currentPage.toString()}
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
                    onClickHandler={async () => {
                      this.currentPage = this.currentPage + 1;
                      await this.updateData();
                    }}
                    icon_name="angle_right"
                    style={{ '--icon-size': '0.875rem' }}
                  ></ir-button>
                  <ir-button
                    size="sm"
                    btn_disabled={this.currentPage === this.totalPages}
                    onClickHandler={async () => {
                      this.currentPage = this.totalPages;
                      console.log(this.currentPage);
                      await this.updateData();
                    }}
                    icon_name="angles_right"
                    style={{ '--icon-size': '0.875rem' }}
                  ></ir-button>
                </div>
              </section>
            )} */}
          </section>
        </div>
        {/* {this.editBookingItem && <ir-listing-modal paymentEntries={this.paymentEntries} onModalClosed={() => (this.editBookingItem = null)}></ir-listing-modal>} */}
        {/* <ir-sidebar
          onIrSidebarToggle={this.handleSideBarToggle.bind(this)}
          open={this.editBookingItem !== null && ['edit', 'guest'].includes(this.editBookingItem.cause)}
          showCloseButton={false}
          sidebarStyles={
            this.editBookingItem?.cause === 'guest' ? { background: 'white' } : { width: this.editBookingItem ? '80rem' : 'var(--sidebar-width,40rem)', background: '#F2F3F8' }
          }
        >
          {this.editBookingItem?.cause === 'edit' && (
            <ir-booking-details
              slot="sidebar-body"
              p={this.p}
              hasPrint
              hasReceipt
              is_from_front_desk
              propertyid={this.editBookingItem?.booking?.property?.id}
              hasRoomEdit
              hasRoomDelete
              hasCloseButton
              onCloseSidebar={() => (this.editBookingItem = null)}
              bookingNumber={this.editBookingItem.booking.booking_nbr}
              ticket={this.ticket}
              language={this.language}
              hasRoomAdd
            ></ir-booking-details>
          )}
          {this.editBookingItem?.cause === 'guest' && (
            <ir-guest-info
              slot="sidebar-body"
              isInSideBar={true}
              headerShown
              booking_nbr={this.editBookingItem?.booking?.booking_nbr}
              email={this.editBookingItem?.booking?.guest.email}
              language={this.language}
              onCloseSideBar={() => (this.editBookingItem = null)}
            ></ir-guest-info>
          )}
        </ir-sidebar> */}
        <ir-drawer
          style={{
            '--ir-drawer-width': '40rem',
            '--ir-drawer-background-color': 'var(--wa-color-surface-default)',
            '--ir-drawer-padding-left': 'var(--spacing)',
            '--ir-drawer-padding-right': 'var(--spacing)',
          }}
          onDrawerHide={e => {
            e.stopImmediatePropagation();
            e.stopPropagation();
            this.editBookingItem = null;
          }}
          withoutHeader
          open={this.editBookingItem?.cause === 'edit'}
        >
          {this.editBookingItem?.booking && (
            <ir-booking-details
              hasPrint
              hasReceipt
              hasCloseButton
              onCloseSidebar={() => (this.editBookingItem = null)}
              is_from_front_desk
              propertyid={this.propertyid as any}
              hasRoomEdit
              hasRoomDelete
              bookingNumber={this.editBookingItem.booking?.booking_nbr.toString()}
              ticket={this.ticket}
              language={this.language}
              hasRoomAdd
            ></ir-booking-details>
          )}
        </ir-drawer>
        <ir-guest-info-drawer
          onGuestInfoDrawerClosed={() => {
            this.editBookingItem = null;
          }}
          booking_nbr={this.editBookingItem?.booking?.booking_nbr}
          email={this.editBookingItem?.booking?.guest.email}
          language={this.language}
          open={this.editBookingItem?.cause === 'guest'}
        ></ir-guest-info-drawer>
        <ir-payment-folio
          style={{ height: 'auto' }}
          bookingNumber={this.booking?.booking_nbr}
          paymentEntries={this.paymentEntries}
          payment={this.payment}
          mode={'payment-action'}
          ref={el => (this.paymentFolioRef = el)}
          onCloseModal={() => {
            this.booking = null;
            this.payment = null;
          }}
        ></ir-payment-folio>
      </Host>
    );
  }
}

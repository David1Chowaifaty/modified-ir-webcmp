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
  styleUrls: ['ir-booking-listing.css'],
  scoped: true,
})
export class IrBookingListing {
  @Element() el: HTMLElement;

  @Prop() language: string = '';
  @Prop() ticket: string = '';
  @Prop() propertyid: number;
  @Prop() rowCount: number = 20;
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
    const paymentType = this.paymentEntries.types.find(p => p.CODE_NAME === payment.payment_type.code);
    this.payment = {
      ...payment,
      payment_type: {
        code: paymentType.CODE_NAME,
        description: paymentType.CODE_VALUE_EN,
        operation: paymentType.NOTES,
      },
    };
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
            <ir-booking-listing-table></ir-booking-listing-table>
          </section>
        </div>
        <ir-drawer
          style={{
            '--ir-drawer-width': '80rem',
            '--ir-drawer-background-color': '#F2F3F8',
            '--ir-drawer-padding-left': '0',
            '--ir-drawer-padding-top': '0',
            '--ir-drawer-padding-bottom': '0',
            '--ir-drawer-padding-right': '0',
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

import Token from '@/models/Token';
import { BookingService } from '@/services/booking-service/booking.service';
import { PropertyService } from '@/services/property.service';
import { RoomService } from '@/services/room.service';
import locales from '@/stores/locales.store';
import { Component, Event, EventEmitter, Host, Listen, Prop, State, Watch, h } from '@stencil/core';
import { DailyPaymentFilter, FolioPayment, GroupedFolioPayment, SidebarOpenEvent } from './types';
import { v4 } from 'uuid';
import moment from 'moment';
import { PaymentEntries } from '../ir-booking-details/types';

@Component({
  tag: 'ir-daily-revenue',
  styleUrl: 'ir-daily-revenue.css',
  scoped: true,
})
export class IrDailyRevenue {
  @Prop() language: string = '';
  @Prop() ticket: string = '';
  @Prop() propertyid: number;
  @Prop() p: string;

  @State() isPageLoading: boolean;
  @State() property_id: number;
  @State() groupedPayment: GroupedFolioPayment;
  @State() previousDateGroupedPayments: GroupedFolioPayment;
  @State() isLoading: string;
  @State() filters: DailyPaymentFilter = { date: moment().format('YYYY-MM-DD'), users: null };
  @State() sideBarEvent: SidebarOpenEvent | null;

  private tokenService = new Token();
  private roomService = new RoomService();
  private propertyService = new PropertyService();
  private bookingService = new BookingService();
  private paymentEntries: PaymentEntries;

  @Event() preventPageLoad: EventEmitter<null>;

  componentWillLoad() {
    if (this.ticket) {
      this.tokenService.setToken(this.ticket);
      this.initializeApp();
    }
  }

  @Watch('ticket')
  ticketChanged(newValue: string, oldValue: string) {
    if (newValue === oldValue) {
      return;
    }
    this.tokenService.setToken(this.ticket);
    this.initializeApp();
  }

  @Listen('revenueOpenSidebar')
  handleOpenSidebar(e: CustomEvent<SidebarOpenEvent>) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.sideBarEvent = e.detail;
  }
  @Listen('fetchNewReports')
  handleFetchNewReports(e: CustomEvent<DailyPaymentFilter>) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.filters = { ...e.detail };
    this.getPaymentReports();
  }
  @Listen('resetBookingEvt')
  async handleResetBooking(e: CustomEvent) {
    e.stopPropagation();
    e.stopImmediatePropagation();
    this.getPaymentReports(false, true);
  }

  private handleSidebarClose = (e: CustomEvent) => {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.sideBarEvent = null;
  };

  private renderSidebarBody() {
    if (!this.sideBarEvent) {
      return;
    }
    switch (this.sideBarEvent.type) {
      case 'booking':
        return (
          <ir-booking-details
            slot="sidebar-body"
            hasPrint
            hasReceipt
            hasCloseButton
            onCloseSidebar={this.handleSidebarClose}
            is_from_front_desk
            propertyid={this.property_id}
            hasRoomEdit
            hasRoomDelete
            bookingNumber={this.sideBarEvent.payload.bookingNumber.toString()}
            ticket={this.ticket}
            language={this.language}
            hasRoomAdd
          ></ir-booking-details>
        );
      default:
        return null;
    }
  }

  private async initializeApp() {
    this.isPageLoading = true;

    try {
      let propertyId = this.propertyid;
      if (!propertyId && !this.p) {
        throw new Error('Property ID or username is required');
      }
      if (!propertyId) {
        const propertyData = await this.roomService.getExposedProperty({
          id: 0,
          aname: this.p,
          language: this.language,
          is_backend: true,
          include_units_hk_status: true,
        });
        propertyId = propertyData.My_Result.id;
      }

      this.property_id = propertyId;

      const requests: Promise<any>[] = [
        this.bookingService.getSetupEntriesByTableNameMulti(['_PAY_TYPE', '_PAY_TYPE_GROUP', '_PAY_METHOD']),
        this.getPaymentReports(),
        this.roomService.fetchLanguage(this.language),
      ];
      if (propertyId) {
        requests.push(
          this.roomService.getExposedProperty({
            id: propertyId,
            language: this.language,
            is_backend: true,
            include_units_hk_status: true,
          }),
        );
      }

      const [setupEntries] = await Promise.all(requests);
      const { pay_type, pay_type_group, pay_method } = this.bookingService.groupEntryTablesResult(setupEntries);
      this.paymentEntries = {
        groups: pay_type_group,
        methods: pay_method,
        types: pay_type,
      };
    } catch (error) {
      console.log(error);
    } finally {
      this.isPageLoading = false;
    }
  }
  private groupPaymentsByName(payments: FolioPayment[]): GroupedFolioPayment {
    const groupedPayment: GroupedFolioPayment = new Map();

    for (const payment of payments) {
      const key = `${payment.payTypeCode}_${payment.payMethodCode}`;
      const p = groupedPayment.get(key) ?? [];
      groupedPayment.set(key, [...p, payment]);
    }
    return new Map(
      [...groupedPayment.entries()].sort(([a], [b]) => {
        const aNum = Number(a);
        const bNum = Number(b);
        if (!isNaN(aNum) && !isNaN(bNum)) {
          return aNum - bNum;
        }
        return a.localeCompare(b);
      }),
    );
  }

  private async getPaymentReports(isExportToExcel = false, excludeYesterday = false) {
    try {
      const getReportObj = (report): FolioPayment => {
        return {
          method: report.METHOD,
          payTypeCode: report.PAY_TYPE_CODE,
          payMethodCode: report.PAY_METHOD_CODE,
          amount: report.AMOUNT,
          date: report.DATE,
          hour: report.HOUR,
          minute: report.MINUTE,
          user: report.USER,
          currency: report.CURRENCY,
          bookingNbr: report.BOOKING_NBR,
          id: v4(),
        };
      };
      this.isLoading = isExportToExcel ? 'export' : 'filter';

      const requests = [
        this.propertyService.getDailyRevenueReport({
          date: this.filters.date,
          property_id: this.property_id?.toString(),
          is_export_to_excel: isExportToExcel,
        }),
      ];
      if (!isExportToExcel && !excludeYesterday) {
        requests.push(
          this.propertyService.getDailyRevenueReport({
            date: moment(this.filters.date, 'YYYY-MM-DD').add(-1, 'days').format('YYYY-MM-DD'),
            property_id: this.property_id?.toString(),
            is_export_to_excel: isExportToExcel,
          }),
        );
      }

      const results = await Promise.all(requests);
      if (!isExportToExcel) {
        if (results[0]) {
          this.groupedPayment = this.groupPaymentsByName(results[0]?.map(getReportObj));
        } else {
          this.groupedPayment = new Map();
        }
        if (results[1]) this.previousDateGroupedPayments = this.groupPaymentsByName(results[1]?.map(getReportObj));
      }
    } catch (e) {
      console.log(e);
    } finally {
      this.isLoading = null;
    }
  }

  render() {
    if (this.isPageLoading) {
      return <ir-loading-screen></ir-loading-screen>;
    }
    return (
      <Host>
        <ir-toast></ir-toast>
        <ir-interceptor></ir-interceptor>
        <section class="p-2 d-flex flex-column" style={{ gap: '1rem' }}>
          <div class="d-flex align-items-center justify-content-between">
            <h3 class="mb-1 mb-md-0">Daily Revenue</h3>
            <ir-button
              size="sm"
              btn_color="outline"
              isLoading={this.isLoading === 'export'}
              text={locales.entries?.Lcz_Export}
              onClickHandler={async e => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                await this.getPaymentReports(true);
              }}
              btnStyle={{ height: '100%' }}
              iconPosition="right"
              icon_name="file"
              icon_style={{ '--icon-size': '14px' }}
            ></ir-button>
          </div>
          <ir-revenue-summary
            previousDateGroupedPayments={this.previousDateGroupedPayments}
            groupedPayments={this.groupedPayment}
            paymentEntries={this.paymentEntries}
          ></ir-revenue-summary>
          <div class="daily-revenue__meta">
            <ir-daily-revenue-filters isLoading={this.isLoading === 'filter'} payments={this.groupedPayment}></ir-daily-revenue-filters>
            <ir-revenue-table filters={this.filters} class={'daily-revenue__table'} paymentEntries={this.paymentEntries} payments={this.groupedPayment}></ir-revenue-table>
          </div>
        </section>
        <ir-sidebar
          sidebarStyles={{
            width: this.sideBarEvent?.type === 'booking' ? '80rem' : 'var(--sidebar-width,40rem)',
            background: this.sideBarEvent?.type === 'booking' ? '#F2F3F8' : 'white',
          }}
          open={Boolean(this.sideBarEvent)}
          showCloseButton={false}
          onIrSidebarToggle={this.handleSidebarClose}
        >
          {this.renderSidebarBody()}
        </ir-sidebar>
      </Host>
    );
  }
}

import Token from '@/models/Token';
import { Component, Host, Listen, Prop, State, Watch, h } from '@stencil/core';
import { SidebarOpenEvent } from './types';
import locales from '@/stores/locales.store';
import { RoomService } from '@/services/room.service';
import { PaymentEntries } from '../ir-booking-details/types';
import { BookingService } from '@/services/booking.service';

@Component({
  tag: 'ir-financial-actions',
  styleUrl: 'ir-financial-actions.css',
  scoped: true,
})
export class IrFinancialActions {
  @Prop() language: string = '';
  @Prop() ticket: string = '';
  @Prop() propertyid: number;
  @Prop() p: string;

  @State() isLoading: string;
  @State() isPageLoading: boolean = true;
  @State() property_id: number;
  @State() sideBarEvent: SidebarOpenEvent | null;

  private tokenService = new Token();
  private roomService = new RoomService();
  private bookingService = new BookingService();
  private paymentEntries: PaymentEntries;

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
      case 'payment':
        return (
          <ir-payment-folio
            bookingNumber={this.sideBarEvent.payload?.bookingNumber?.toString()}
            paymentEntries={this.paymentEntries}
            slot="sidebar-body"
            payment={this.sideBarEvent.payload.payment}
            mode={'new'}
            onCloseModal={this.handleSidebarClose}
          ></ir-payment-folio>
        );
      default:
        return null;
    }
  }
  @Listen('financialActionsOpenSidebar')
  handleOpenSidebar(e: CustomEvent<SidebarOpenEvent>) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.sideBarEvent = e.detail;
  }
  private async getFinancialAction(isExportToExcel: boolean = false) {
    console.log(isExportToExcel);
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
        this.getFinancialAction(),
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
            <h3 class="mb-1 mb-md-0">Payment Actions</h3>
            <ir-button
              size="sm"
              btn_color="outline"
              isLoading={this.isLoading === 'export'}
              text={locales.entries?.Lcz_Export}
              onClickHandler={async e => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                await this.getFinancialAction(true);
              }}
              btnStyle={{ height: '100%' }}
              iconPosition="right"
              icon_name="file"
              icon_style={{ '--icon-size': '14px' }}
            ></ir-button>
          </div>
          {/* <ir-financial-summary
          previousDateGroupedPayments={this.previousDateGroupedPayments}
          groupedPayments={this.groupedPayment}
          paymentEntries={this.paymentEntries}
        ></ir-financial-summary> */}
          <div class="financial-actions__meta">
            <ir-financial-filters isLoading={this.isLoading === 'filter'}></ir-financial-filters>
            <ir-financial-table class={'financial-actions__table card  w-100'}></ir-financial-table>
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

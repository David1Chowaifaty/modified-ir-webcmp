import { Guest } from '@/models/booking.dto';
import { Component, Element, Event, EventEmitter, h, Prop, State, Watch } from '@stencil/core';
import { BookingService } from '@/services/booking.service';
import { RoomService } from '@/services/room.service';
import locales from '@/stores/locales.store';
import Token from '@/models/Token';
import { ICountry } from '@/models/IBooking';
import { IToast } from '@/components/ui/ir-toast/toast';
import { isRequestPending } from '@/stores/ir-interceptor.store';
import { guestInfoFormSchema } from '../ir-guest-info-form/types';

@Component({
  tag: 'ir-guest-info-drawer',
  styleUrl: 'ir-guest-info-drawer.css',
  scoped: true,
})
export class IrGuestInfoDrawer {
  @Prop() open: boolean;
  @Prop() language: string = 'en';
  @Prop() email: string;
  @Prop() booking_nbr: string;
  @Prop() ticket: string;

  @State() guest: Guest = null;
  @State() countries: ICountry[] = [];
  @State() isLoading: boolean = true;
  @State() autoValidate = false;

  @Event() guestInfoDrawerClosed: EventEmitter<{ source: Element }>;
  @Event({ bubbles: true }) resetBookingEvt: EventEmitter<null>;
  @Event() toast: EventEmitter<IToast>;

  @Element() hostElement: HTMLElement;

  private bookingService = new BookingService();
  private roomService = new RoomService();
  private token: Token = new Token();

  componentWillLoad() {
    if (this.ticket) {
      this.token.setToken(this.ticket);
    }
    if (this.open && !!this.token.getToken()) {
      this.init();
    }
  }

  @Watch('ticket')
  ticketChanged(newValue: string, oldValue: string) {
    if (newValue === oldValue) {
      return;
    }
    this.token.setToken(this.ticket);
    this.init();
  }

  @Watch('open')
  openChanged(newValue: boolean) {
    if (!newValue) {
      return;
    }
    if (!!this.token.getToken() && (!this.guest || !this.countries.length)) {
      this.init();
    }
  }

  private async init() {
    if (!this.open) {
      return;
    }
    try {
      this.isLoading = true;
      const [guest, countries, fetchedLocales] = await Promise.all([
        this.bookingService.fetchGuest(this.email),
        this.bookingService.getCountries(this.language),
        !locales || !locales.entries || Object.keys(locales.entries).length === 0 ? this.roomService.fetchLanguage(this.language) : Promise.resolve(null),
      ]);

      if (fetchedLocales) {
        locales.entries = fetchedLocales.entries;
        locales.direction = fetchedLocales.direction;
      }

      this.countries = countries;
      this.guest = guest ? { ...guest, mobile: guest.mobile_without_prefix } : null;
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }

  private handleGuestChanged = (event: CustomEvent<Partial<Guest>>) => {
    this.guest = { ...this.guest, ...event.detail };
  };

  private handleDrawerHide = (event: CustomEvent<{ source: Element }>) => {
    event.stopImmediatePropagation();
    event.stopPropagation();
    this.guestInfoDrawerClosed.emit({ source: event.detail?.source ?? this.hostElement });
  };

  private handleCancel = () => {
    this.guestInfoDrawerClosed.emit({ source: this.hostElement });
  };

  private async editGuest() {
    try {
      this.autoValidate = true;
      guestInfoFormSchema.parse(this.guest);
      await this.bookingService.editExposedGuest(this.guest, this.booking_nbr ?? null);
      this.toast.emit({
        type: 'success',
        description: '',
        title: 'Saved Successfully',
        position: 'top-right',
      });
      this.resetBookingEvt.emit(null);
      this.guestInfoDrawerClosed.emit({ source: this.hostElement });
    } catch (error) {
      console.error(error);
    }
  }

  render() {
    const drawerLabel = locales?.entries?.Lcz_GuestDetails || 'Guest info';

    return (
      <ir-drawer
        open={this.open}
        label={drawerLabel}
        onDrawerHide={this.handleDrawerHide}
        style={{
          '--ir-drawer-width': '40rem',
          '--ir-drawer-background-color': 'var(--wa-color-surface-default)',
          '--ir-drawer-padding-left': 'var(--spacing)',
          '--ir-drawer-padding-right': 'var(--spacing)',
          '--ir-drawer-padding-top': 'var(--spacing)',
          '--ir-drawer-padding-bottom': 'var(--spacing)',
        }}
      >
        {this.isLoading ? (
          <div class={'loading-container'}>
            <wa-spinner style={{ fontSize: '2rem' }}></wa-spinner>
          </div>
        ) : (
          <ir-guest-info-form
            guest={this.guest}
            countries={this.countries}
            language={this.language}
            autoValidate={this.autoValidate}
            onGuestChanged={this.handleGuestChanged}
          ></ir-guest-info-form>
        )}
        <div slot="footer" class="ir__drawer-footer">
          <ir-custom-button size="medium" appearance="filled" variant="neutral" type="button" onClickHandler={this.handleCancel}>
            {locales.entries?.Lcz_Cancel || 'Cancel'}
          </ir-custom-button>
          <ir-custom-button size="medium" variant="brand" onClick={() => this.editGuest()} loading={isRequestPending('/Edit_Exposed_Guest')} disabled={this.isLoading}>
            {locales.entries?.Lcz_Save || 'Save'}
          </ir-custom-button>
        </div>
      </ir-drawer>
    );
  }
}

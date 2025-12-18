import { Component, Element, Event, EventEmitter, h, Prop } from '@stencil/core';
import locales from '@/stores/locales.store';
import { IToast } from '@/components/ui/ir-toast/toast';
import { isRequestPending } from '@/stores/ir-interceptor.store';
import { GuestChangedEvent } from '@/components';
import { v4 } from 'uuid';

@Component({
  tag: 'ir-guest-info-drawer',
  styleUrl: 'ir-guest-info-drawer.css',
  scoped: true,
})
export class IrGuestInfoDrawer {
  @Prop({ reflect: true }) open: boolean;
  @Prop() language: string = 'en';
  @Prop() email: string;
  @Prop() booking_nbr: string;
  @Prop() ticket: string;

  @Event() guestInfoDrawerClosed: EventEmitter<{ source: Element }>;
  @Event() guestChanged: EventEmitter<GuestChangedEvent>;
  @Event({ bubbles: true }) resetBookingEvt: EventEmitter<null>;
  @Event() toast: EventEmitter<IToast>;

  @Element() hostElement: HTMLElement;

  private handleDrawerHide = (event: CustomEvent<{ source: Element }>) => {
    event.stopImmediatePropagation();
    event.stopPropagation();
    this.guestInfoDrawerClosed.emit({ source: event.detail?.source ?? this.hostElement });
  };

  private handleCancel = () => {
    this.guestInfoDrawerClosed.emit({ source: this.hostElement });
  };

  private _formId = `guest-details-form_${v4()}`;

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
        {this.open && (
          <ir-guest-info-form ticket={this.ticket} language={this.language} email={this.email} booking_nbr={this.booking_nbr} fromId={this._formId}></ir-guest-info-form>
        )}

        <div slot="footer" class="ir__drawer-footer">
          <ir-custom-button size="medium" appearance="filled" variant="neutral" type="button" onClickHandler={this.handleCancel}>
            {locales.entries?.Lcz_Cancel || 'Cancel'}
          </ir-custom-button>
          <ir-custom-button type="submit" form={this._formId} size="medium" variant="brand" loading={isRequestPending('/Edit_Exposed_Guest')}>
            {locales.entries?.Lcz_Save || 'Save'}
          </ir-custom-button>
        </div>
      </ir-drawer>
    );
  }
}

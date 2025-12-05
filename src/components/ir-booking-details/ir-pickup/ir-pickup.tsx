import locales from '@/stores/locales.store';
import { Component, Event, EventEmitter, Prop, State, h } from '@stencil/core';
import { IBookingPickupInfo } from '@/models/booking.dto';
import { v4 } from 'uuid';

@Component({
  tag: 'ir-pickup',
  styleUrls: ['ir-pickup.css'],
  scoped: true,
})
export class IrPickup {
  /**
   * Pre-filled pickup information coming from the booking.
   * When provided, the pickup form initializes with this data and
   * the user may update or remove it.
   */
  @Prop() defaultPickupData: IBookingPickupInfo | null;

  /**
   * Total number of persons included in the booking.
   * Used to compute vehicle capacity and validate pickup options.
   */
  @Prop() numberOfPersons: number = 0;

  /**
   * Unique booking reference number used to associate pickup updates
   * with a specific reservation.
   */
  @Prop() bookingNumber: string;

  /**
   * The date range of the booking (check-in and check-out).
   * Determines allowed pickup dates and validation rules.
   */
  @Prop() bookingDates: { from: string; to: string };

  /**
   * Controls whether the pickup drawer/modal is open.
   * When true, the drawer becomes visible and initializes the form.
   */
  @Prop({ reflect: true }) open: boolean;

  @State() isLoading = false;
  @State() canSubmitPickup = false;

  /**
   * Emitted when the pickup drawer should be closed.
   * Triggered when the user dismisses the drawer or when the
   * inner pickup form requests the modal to close.
   */
  @Event() closeModal: EventEmitter<null>;

  private _id = `pickup-form-${v4()}`;

  render() {
    return (
      <ir-drawer
        style={{
          '--ir-drawer-width': '40rem',
          '--ir-drawer-background-color': 'var(--wa-color-surface-default)',
          '--ir-drawer-padding-left': 'var(--spacing)',
          '--ir-drawer-padding-right': 'var(--spacing)',
          '--ir-drawer-padding-top': 'var(--spacing)',
          '--ir-drawer-padding-bottom': 'var(--spacing)',
        }}
        label={locales.entries.Lcz_Pickup}
        open={this.open}
        onDrawerHide={e => {
          e.stopImmediatePropagation();
          e.stopPropagation();

          this.closeModal.emit();
        }}
      >
        {this.open && (
          <ir-pickup-form
            onCanSubmitPickupChange={e => {
              e.stopImmediatePropagation();
              e.stopPropagation();
              this.canSubmitPickup = e.detail;
            }}
            defaultPickupData={this.defaultPickupData}
            numberOfPersons={this.numberOfPersons}
            bookingNumber={this.bookingNumber}
            bookingDates={this.bookingDates}
            onLoadingChange={e => (this.isLoading = e.detail)}
            onCloseModal={e => {
              e.stopImmediatePropagation();
              e.stopPropagation();
              this.closeModal.emit();
            }}
            formId={this._id}
          ></ir-pickup-form>
        )}
        <div slot="footer" class={'ir__drawer-footer'}>
          <ir-custom-button class={`flex-fill`} size="medium" appearance="filled" variant="neutral" data-drawer="close">
            {locales.entries.Lcz_Cancel}
          </ir-custom-button>

          {this.canSubmitPickup && (
            <ir-custom-button type="submit" loading={this.isLoading} form={this._id} size="medium" class={`flex-fill`} variant="brand">
              {locales.entries.Lcz_Save}
            </ir-custom-button>
          )}
        </div>
      </ir-drawer>
    );
  }
}

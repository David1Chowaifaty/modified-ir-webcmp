import { Booking } from '@/models/booking.dto';
import locales from '@/stores/locales.store';
import { Component, Event, EventEmitter, Fragment, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-booked-by-cell',
  styleUrls: ['ir-booked-by-cell.css'],
  scoped: true,
})
export class IrBookedByCell {
  @Prop() label: string;
  @Prop() cellId: string;
  @Prop({ reflect: true }) display: 'inline' | 'block' = 'block';
  /**
   * Guest associated with this booking.
   */
  @Prop() guest: Booking['guest'];

  /**
   * Unique identifier for this cell. Used for tooltip scoping.
   */
  @Prop() identifier: string;

  /**
   * Total number of persons staying (adults + children).
   */
  @Prop() totalPersons: string;

  /**
   * Promo key if a promo/coupon was applied.
   */
  @Prop() promoKey: string;

  /**
   * Show pink heart icon if guest has repeated bookings.
   */
  @Prop() showRepeatGuestBadge: boolean = false;

  /**
   * Show total persons count (e.g. "3P").
   */
  @Prop() showPersons: boolean = false;

  /**
   * Show yellow dot indicating the booking has a private note.
   */
  @Prop() showPrivateNoteDot: boolean = false;

  /**
   * Show loyalty discount icon (pink heart-outline).
   */
  @Prop() showLoyaltyIcon: boolean = false;

  /**
   * Show promo/coupon icon.
   */
  @Prop() showPromoIcon: boolean = false;

  /**
   * Makes the guest name clickable.
   * Emits `openGuestDetails` when clicked.
   */
  @Prop() clickableGuest: boolean = false;

  /**
   * Emitted when the guest name is clicked.
   * Sends the `identifier` for parent lookup.
   */
  @Event({ bubbles: true, composed: true })
  guestSelected: EventEmitter<string>;

  private handleGuestClick(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.guestSelected.emit(this.identifier);
  }

  render() {
    const repeatGuestBadgeId = `repeat-guest-badge-${this.guest.id}_${this.cellId ?? this.identifier}`;
    const loyaltyBadgeId = `loyalty-badge-${this.guest.id}_${this.cellId ?? this.identifier}`;
    const couponBadgeId = `coupon-badge-${this.guest.id}_${this.cellId ?? this.identifier}`;
    const guest = `${this.guest.first_name} ${this.guest.last_name}`;
    return (
      <Host>
        {this.label && <p class="cell-label">{this.label}:</p>}
        <div class="booked-by-source__container">
          {this.clickableGuest ? (
            <ir-custom-button size="medium" onClickHandler={this.handleGuestClick.bind(this)} variant="brand" appearance="plain" link>
              {guest}
            </ir-custom-button>
          ) : (
            <p>{guest}</p>
          )}
          {this.showRepeatGuestBadge && (
            <Fragment>
              <wa-tooltip for={repeatGuestBadgeId}>{`${locales.entries.Lcz_BookingsNbr}`.replace('%1', this.guest.nbr_confirmed_bookings.toString())}</wa-tooltip>
              <wa-icon name="heart" style={{ color: '#FB0AAD' }} id={repeatGuestBadgeId}></wa-icon>
            </Fragment>
          )}
          {this.showPersons && (
            <p>
              {this.totalPersons}
              {locales.entries.Lcz_P}
            </p>
          )}
          {this.showPrivateNoteDot && <span class="booked-by-source__private-note"></span>}
        </div>
        <div class="booked-by-source__container">
          {this.showLoyaltyIcon && (
            <Fragment>
              <wa-tooltip for={loyaltyBadgeId}>{locales.entries.Lcz_LoyaltyDiscountApplied}</wa-tooltip>
              <wa-icon name="heart" variant="regular" style={{ color: '#fc6c85' }} id={loyaltyBadgeId}></wa-icon>
            </Fragment>
          )}
          {this.showPromoIcon && (
            <Fragment>
              <wa-tooltip for={couponBadgeId}>
                {locales.entries.Lcz_Coupon}: {this.promoKey}
              </wa-tooltip>
              <wa-icon id={couponBadgeId} name="ticket"></wa-icon>
            </Fragment>
          )}
        </div>
      </Host>
    );
  }
}

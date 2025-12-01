import { Booking } from '@/models/booking.dto';
import locales from '@/stores/locales.store';
import { Component, Fragment, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'ir-booked-by-source-cell',
  styleUrls: ['ir-booked-by-source-cell.css', '../../../../global/app.css'],
  scoped: true,
})
export class IrBookedBySourceCell {
  @Prop() guest: Booking['guest'];
  @Prop() source: Booking['source'];
  @Prop() origin: Booking['origin'];
  @Prop() identifier: string;
  @Prop() totalPersons: string;
  @Prop() promoKey: string;

  @Prop() showRepeatGuestBadge: boolean = false;
  @Prop() showPersons: boolean = false;
  @Prop() showPrivateNoteDot: boolean = false;
  @Prop() showLoyaltyIcon: boolean = false;
  @Prop() showPromoIcon: boolean = false;
  @Prop() clickableGuest: boolean = false;

  render() {
    const repeatGuestBadgeId = `repeat-guest-badge-${this.guest.id}_${this.identifier}`;
    const loyaltyBadgeId = `loyalty-badge-${this.guest.id}_${this.identifier}`;
    const couponBadgeId = `coupon-badge-${this.guest.id}_${this.identifier}`;
    const guest = `${this.guest.first_name} ${this.guest.last_name}`;
    return (
      <Host>
        <img class="booked-by-source__logo" src={this.origin.Icon} alt={this.origin.Label} />
        <div>
          <div class="booked-by-source__container">
            {this.clickableGuest ? (
              <ir-custom-button variant="brand" appearance="plain" link>
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
            <p class="booked-by-cell__description">{this.origin.Label}</p>
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
        </div>
      </Host>
    );
  }
}

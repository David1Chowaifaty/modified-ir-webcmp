import { Component, Host, h, Prop, State, Listen } from '@stencil/core';
import { TPropertyButtonsTypes } from '@/components';
import { ICurrency } from '@/models/calendarData';
import booking_store, { IRatePlanSelection, modifyBookingStore, RatePlanGuest, updateBookedByGuest, updateRoomGuest } from '@/stores/booking.store';
import locales from '@/stores/locales.store';
import calendar_data, { isSingleUnit } from '@/stores/calendar-data';
import { formatAmount } from '@/utils/utils';
import VariationService from '@/services/variation.service';
import { GuestCredentials } from '../../types';
import { z } from 'zod';

@Component({
  tag: 'igl-application-info',
  styleUrl: 'igl-application-info.css',
  scoped: true,
})
export class IglApplicationInfo {
  @Prop() rateplanSelection: IRatePlanSelection;
  @Prop() guestInfo: RatePlanGuest | null;
  @Prop() currency: ICurrency;
  @Prop() bedPreferenceType = [];
  @Prop() bookingType: string = 'PLUS_BOOKING';
  @Prop() roomIndex: number;
  @Prop() totalNights: number = 1;
  @Prop() baseData: { unit: { id: string; name: string }; roomtypeId: number };
  @Prop() autoFillGuest: boolean;

  @State() isButtonPressed = false;

  private variationService = new VariationService();
  private shouldSyncBookedByFirstName = !booking_store.bookedByGuest?.firstName;
  private shouldSyncBookedByLastName = !booking_store.bookedByGuest?.lastName;

  componentWillLoad() {
    if (isSingleUnit(this.rateplanSelection.roomtype.id)) {
      const filteredRooms = this.filterRooms();
      if (filteredRooms.length > 0) this.updateGuest({ unit: filteredRooms[0]?.id?.toString() });
    }
  }

  private updateGuest(params: Partial<RatePlanGuest>) {
    const roomTypeId = this.rateplanSelection.roomtype.id;
    const ratePlanId = this.rateplanSelection.ratePlan.id;
    let prevGuest = [...this.rateplanSelection.guest];
    prevGuest[this.roomIndex] = {
      ...prevGuest[this.roomIndex],
      ...params,
    };
    updateRoomGuest({
      ratePlanSelection: this.rateplanSelection,
      ratePlanId,
      roomTypeId,
      guest: prevGuest,
    });

    const shouldAutoFill = this.autoFillGuest && !booking_store.bookedByGuestManuallyEdited;
    if (!shouldAutoFill) {
      if (booking_store.bookedByGuestManuallyEdited) {
        this.shouldSyncBookedByFirstName = false;
        this.shouldSyncBookedByLastName = false;
      }
      return;
    }

    if (typeof params.first_name === 'string' && this.shouldSyncBookedByFirstName) {
      updateBookedByGuest({
        firstName: params.first_name,
      });
    }

    if (typeof params.last_name === 'string' && this.shouldSyncBookedByLastName) {
      updateBookedByGuest({
        lastName: params.last_name,
      });
    }
  }

  @Listen('buttonClicked', { target: 'body' })
  handleButtonClicked(
    event: CustomEvent<{
      key: TPropertyButtonsTypes;
      data?: CustomEvent;
    }>,
  ) {
    switch (event.detail.key) {
      case 'book':
      case 'bookAndCheckIn':
      case 'save':
        this.isButtonPressed = true;
        break;
    }
  }

  private getTooltipMessages(): string | undefined {
    const { ratePlan, selected_variation } = this.rateplanSelection;
    let selectedVariation = selected_variation;
    if (this.guestInfo?.infant_nbr) {
      selectedVariation = this.variationService.getVariationBasedOnInfants({
        variations: ratePlan.variations,
        baseVariation: selected_variation,
        infants: this.guestInfo?.infant_nbr,
      });
    }

    if (!selectedVariation) return;

    const matchingVariation = ratePlan.variations?.find(variation => variation.adult_nbr === selectedVariation.adult_nbr && variation.child_nbr === selectedVariation.child_nbr);

    if (!matchingVariation) return;

    const cancellationPolicy = matchingVariation.applicable_policies?.find(p => p.type === 'cancelation')?.combined_statement;
    const guaranteePolicy = matchingVariation.applicable_policies?.find(p => p.type === 'guarantee')?.combined_statement;

    let tooltip = '';
    if (cancellationPolicy) {
      tooltip += `<b><u>Cancellation:</u></b> ${cancellationPolicy}<br/>`;
    }
    if (guaranteePolicy) {
      tooltip += `<b><u>Guarantee:</u></b> ${guaranteePolicy}`;
    }
    return tooltip || undefined;
  }

  private getAmount(): number {
    if (this.rateplanSelection.is_amount_modified) {
      return this.rateplanSelection.view_mode === '001' ? this.rateplanSelection.rp_amount : this.rateplanSelection.rp_amount * this.totalNights;
    }
    let variation = this.rateplanSelection.selected_variation;
    if (this.guestInfo?.infant_nbr) {
      variation = this.variationService.getVariationBasedOnInfants({
        variations: this.rateplanSelection.ratePlan.variations,
        baseVariation: this.rateplanSelection.selected_variation,
        infants: this.guestInfo?.infant_nbr,
      });
    }
    return variation.discounted_gross_amount;
  }

  private filterRooms(): { name: string; id: number }[] {
    const result = [];
    if (!calendar_data.is_frontdesk_enabled) {
      return result;
    }
    this.rateplanSelection.ratePlan?.assignable_units?.forEach(unit => {
      if (unit.Is_Fully_Available) {
        result.push({ name: unit.name, id: unit.pr_id });
      }
    });
    const filteredGuestsRoom = this.rateplanSelection.guest.filter((_, i) => i !== this.roomIndex).map(r => r.unit);
    const filteredResults = result.filter(r => !filteredGuestsRoom.includes(r.id.toString()));
    return this.bookingType === 'EDIT_BOOKING'
      ? [...filteredResults, this.rateplanSelection.roomtype.id === this.baseData?.roomtypeId ? this.baseData?.unit : null]
          .filter(f => !!f)
          .sort((a, b) => a.name.localeCompare(b.name))
      : filteredResults;
  }

  render() {
    const filteredRoomList = this.filterRooms();
    const formattedVariation = this.variationService.formatVariationBasedOnInfants({
      baseVariation: this.rateplanSelection.selected_variation,
      infants: this.guestInfo.infant_nbr,
      variations: this.rateplanSelection.ratePlan.variations,
    });

    return (
      <Host class="fd-application-info" data-testid={`room_info_${this.rateplanSelection.ratePlan.id}`}>
        <div class="fd-application-info__header">
          {(this.bookingType === 'PLUS_BOOKING' || this.bookingType === 'ADD_ROOM' || this.bookingType === 'EDIT_BOOKING') && (
            <span class="fd-application-info__roomtype-title">{this.rateplanSelection.roomtype.name}</span>
          )}

          <div class="fd-application-info__details">
            <div class="fd-application-info__rateplan">
              <p class="fd-application-info__rateplan-name">
                {this.rateplanSelection.ratePlan.short_name}
                {this.rateplanSelection.ratePlan.is_non_refundable && <span class="fd-application-info__non-refundable">Non Refundable</span>}
              </p>
              <wa-tooltip for={`room_info_tooltip_${this.rateplanSelection.ratePlan.id}`}>
                <span innerHTML={this.getTooltipMessages()}></span>
              </wa-tooltip>
              <wa-icon name="circle-info" id={`room_info_tooltip_${this.rateplanSelection.ratePlan.id}`}></wa-icon>
              {/* <ir-tooltip class="fd-application-info__tooltip" message={this.getTooltipMessages()}></ir-tooltip> */}
            </div>

            <p class="fd-application-info__variation" innerHTML={formattedVariation}></p>
          </div>

          <p class="fd-application-info__price p-0 m-0">
            <span class="ir-price">{formatAmount(this.currency?.symbol, this.getAmount())}</span>/{locales.entries.Lcz_Stay}
          </p>
        </div>

        <div class="fd-application-info__footer">
          <div class="fd-application-info__rateplan">
            <p class="fd-application-info__rateplan-name">{this.rateplanSelection.ratePlan.short_name}</p>
            <wa-tooltip for={`room_info_tooltip_mobile_${this.rateplanSelection.ratePlan.id}`}>
              <span innerHTML={this.getTooltipMessages()}></span>
            </wa-tooltip>
            <wa-icon name="circle-info" id={`room_info_tooltip_mobile_${this.rateplanSelection.ratePlan.id}`}></wa-icon>
          </div>

          <p class="fd-application-info__variation" innerHTML={formattedVariation}></p>
        </div>

        <div class="fd-application-info__form">
          <ir-validator value={this.guestInfo?.first_name} schema={GuestCredentials.shape.first_name}>
            <ir-input
              class="fd-application-info__input"
              // aria-invalid={String(Boolean(this.isButtonPressed && this.guestInfo?.first_name === ''))}
              value={this.guestInfo?.first_name}
              defaultValue={this.guestInfo?.first_name}
              data-testid="guest_first_name"
              placeholder={locales.entries['Lcz_GuestFirstname'] ?? 'Guest first name'}
              onText-change={event => {
                const name = event.detail.trim();
                this.updateGuest({ first_name: name });
                if (booking_store.event_type.type === 'EDIT_BOOKING') {
                  modifyBookingStore('guest', {
                    ...booking_store.guest,
                    name,
                  });
                }
              }}
            ></ir-input>
          </ir-validator>
          <ir-validator value={this.guestInfo?.last_name} schema={GuestCredentials.shape.last_name}>
            <ir-input
              class="fd-application-info__input"
              type="text"
              // aria-invalid={String(Boolean(this.isButtonPressed && this.guestInfo?.last_name === ''))}
              value={this.guestInfo?.last_name}
              defaultValue={this.guestInfo?.last_name}
              data-testid="guest_last_name"
              placeholder={locales.entries['Lcz_GuestLastname'] ?? 'Guest last name'}
              onText-change={event => {
                const name = event.detail.trim();
                this.updateGuest({ last_name: name });
                if (booking_store.event_type.type === 'EDIT_BOOKING') {
                  modifyBookingStore('guest', {
                    ...booking_store.guest,
                    name,
                  });
                }
              }}
            ></ir-input>
          </ir-validator>

          {calendar_data.is_frontdesk_enabled &&
            !isSingleUnit(this.rateplanSelection.roomtype.id) &&
            (this.bookingType === 'PLUS_BOOKING' || this.bookingType === 'ADD_ROOM' || this.bookingType === 'EDIT_BOOKING') && (
              <wa-select
                with-clear
                size="small"
                class="fd-application-info__select"
                placeholder={locales.entries.Lcz_Assignunits}
                data-testid="unit"
                value={this.guestInfo?.unit}
                defaultValue={this.guestInfo?.unit}
                onchange={event =>
                  this.updateGuest({
                    unit: (event.target as HTMLInputElement).value,
                  })
                }
              >
                {filteredRoomList.map(room => (
                  <wa-option value={room.id.toString()} selected={this.guestInfo?.unit === room.id.toString()}>
                    {room.name}
                  </wa-option>
                ))}
              </wa-select>
            )}

          {this.rateplanSelection.roomtype.is_bed_configuration_enabled && (
            <ir-validator value={this.guestInfo?.bed_preference} schema={z.string().nonempty()}>
              <wa-select
                with-clear
                size="small"
                class="fd-application-info__select"
                placeholder={locales.entries.Lcz_BedConfiguration}
                data-testid="bed_configuration"
                value={this.guestInfo?.bed_preference}
                defaultValue={this.guestInfo?.bed_preference}
                // aria-invalid={String(Boolean(this.isButtonPressed && this.guestInfo?.bed_preference === ''))}
                onchange={event =>
                  this.updateGuest({
                    bed_preference: (event.target as HTMLInputElement).value,
                  })
                }
              >
                {this.bedPreferenceType.map(data => (
                  <wa-option value={data.CODE_NAME} selected={this.guestInfo?.bed_preference === data.CODE_NAME}>
                    {data.CODE_VALUE_EN}
                  </wa-option>
                ))}
              </wa-select>
            </ir-validator>
          )}

          <p class="fd-application-info__price-inline">
            <span class="ir-price">{formatAmount(this.currency?.symbol, this.getAmount())}</span>/{locales.entries.Lcz_Stay}
          </p>
        </div>

        {this.rateplanSelection.selected_variation.child_nbr > 0 && (
          <div class="fd-application-info__infant">
            <p class="fd-application-info__infant-label">Any of the children below 3 years?</p>
            <wa-select
              size="small"
              class="fd-application-info__select fd-application-info__select--inline"
              placeholder={locales.entries['No'] || 'No'}
              value={this.guestInfo?.infant_nbr?.toString()}
              defaultValue={this.guestInfo?.infant_nbr?.toString()}
              onchange={event =>
                this.updateGuest({
                  infant_nbr: Number((event.target as HTMLInputElement).value),
                })
              }
              withClear
            >
              {Array.from({ length: this.rateplanSelection.selected_variation.child_nbr }, (_, i) => i + 1).map(item => (
                <wa-option value={item.toString()} selected={this.guestInfo?.infant_nbr === item}>
                  {item}
                </wa-option>
              ))}
            </wa-select>
          </div>
        )}
      </Host>
    );
  }
}

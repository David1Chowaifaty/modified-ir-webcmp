import { Component, Host, h, Prop, State, Listen } from '@stencil/core';
import { TPropertyButtonsTypes } from '@/components';
import { ICurrency } from '@/models/calendarData';
import booking_store, { IRatePlanSelection, modifyBookingStore, RatePlanGuest } from '@/stores/booking.store';
import { Variation } from '@/models/property';
import locales from '@/stores/locales.store';
import { v4 } from 'uuid';
import calendar_data from '@/stores/calendar-data';
import { formatAmount } from '@/utils/utils';

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

  @State() isButtonPressed = false;

  private updateGuest(params: Partial<RatePlanGuest>) {
    const roomTypeId = this.rateplanSelection.roomtype.id;
    const ratePlanId = this.rateplanSelection.ratePlan.id;
    let prevGuest = [...this.rateplanSelection.guest];
    prevGuest[this.roomIndex] = {
      ...prevGuest[this.roomIndex],
      ...params,
    };
    booking_store.ratePlanSelections = {
      ...booking_store.ratePlanSelections,
      [roomTypeId]: {
        ...booking_store.ratePlanSelections[roomTypeId],
        [ratePlanId]: { ...this.rateplanSelection, guest: [...prevGuest] },
      },
    };
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

  private formatVariation(variation: Variation): string {
    if (!variation) return '';
    const adults = `${variation.adult_nbr} ${variation.adult_nbr === 1 ? locales.entries['Lcz_Adult']?.toLowerCase() : locales.entries['Lcz_Adults']?.toLowerCase()}`;
    const children =
      variation.child_nbr > 0
        ? `${variation.child_nbr} ${variation.child_nbr > 1 ? locales.entries['Lcz_Children']?.toLowerCase() : locales.entries['Lcz_Child']?.toLowerCase()}`
        : '';
    return children ? `${adults} ${children}` : adults;
  }

  private getTooltipMessages(): string | undefined {
    const { ratePlan, selected_variation } = this.rateplanSelection;
    const selectedVariation = selected_variation;
    if (!selectedVariation) return;

    const matchingVariation = ratePlan.variations?.find(variation => this.formatVariation(variation) === this.formatVariation(selectedVariation));

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
    return this.rateplanSelection.selected_variation.discounted_gross_amount;
  }

  private filterRooms(): { name: string; id: number }[] {
    const result = [];
    this.rateplanSelection.ratePlan?.assignable_units.forEach(unit => {
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
    return (
      <Host class={'my-2'}>
        <div class="booking-header">
          {(this.bookingType === 'PLUS_BOOKING' || this.bookingType === 'ADD_ROOM' || this.bookingType === 'EDIT_BOOKING') && (
            <span class="booking-roomtype-title">{this.rateplanSelection.roomtype.name}</span>
          )}
          <div class="booking-details-container">
            <div class="booking-rateplan">
              <p class="booking-rateplan-name">{this.rateplanSelection.ratePlan.short_name}</p>
              <ir-tooltip class="booking-tooltip" message={this.getTooltipMessages()}></ir-tooltip>
            </div>
            <p class="booking-variation">{this.formatVariation(this.rateplanSelection.selected_variation)}</p>
          </div>
          <p class="booking-price">
            {formatAmount(this.currency?.symbol, this.getAmount())}/{locales.entries.Lcz_Stay}
          </p>
        </div>
        <div class="booking-footer">
          <div class="booking-rateplan">
            <p class="booking-rateplan-name">{this.rateplanSelection.ratePlan.short_name}</p>
            <ir-tooltip class="booking-tooltip" message={this.getTooltipMessages()}></ir-tooltip>
          </div>
          <p class="booking-variation">{this.formatVariation(this.rateplanSelection.selected_variation)}</p>
        </div>
        <div class="d-flex flex-column flex-md-row  p-0 align-items-md-center aplicationInfoContainer">
          <div class="mr-1 flex-fill guest-info-container">
            <input
              id={v4()}
              type="email"
              class={`form-control ${this.isButtonPressed && this.guestInfo?.name === '' && 'border-danger'}`}
              placeholder={locales.entries.Lcz_GuestFirstnameAndLastname}
              name="guestName"
              onInput={event => {
                const name = (event.target as HTMLInputElement).value;
                this.updateGuest({ name });
                if (booking_store.event_type.type === 'EDIT_BOOKING') {
                  modifyBookingStore('guest', {
                    ...booking_store.guest,
                    name,
                  });
                }
              }}
              required
              value={this.guestInfo?.name}
            />
          </div>
          <div class="mt-1 mt-md-0 d-flex align-items-center flex-fill">
            {calendar_data.is_frontdesk_enabled && (this.bookingType === 'PLUS_BOOKING' || this.bookingType === 'ADD_ROOM' || this.bookingType === 'EDIT_BOOKING') && (
              <div class="mr-1 p-0 flex-fill preference-select-container">
                <select class="form-control input-sm pr-0" id={v4()} onChange={event => this.updateGuest({ unit: (event.target as HTMLInputElement).value })}>
                  <option value="" selected={this.guestInfo?.unit === ''}>
                    {locales.entries.Lcz_Assignunits}
                  </option>
                  {filteredRoomList?.map(room => (
                    <option value={room.id} selected={this.guestInfo?.unit === room.id.toString()}>
                      {room.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          {this.rateplanSelection.roomtype.is_bed_configuration_enabled && (
            <div class="mr-1 flex-fill">
              <select
                class={`form-control input-sm ${this.isButtonPressed && this.guestInfo?.bed_preference === '' && 'border-danger'}`}
                id={v4()}
                onChange={event => this.updateGuest({ bed_preference: (event.target as HTMLInputElement).value })}
              >
                <option value="" selected={this.guestInfo?.bed_preference === ''}>
                  {locales.entries.Lcz_BedConfiguration}
                </option>
                {this.bedPreferenceType.map(data => (
                  <option value={data.CODE_NAME} selected={this.guestInfo?.bed_preference === data.CODE_NAME}>
                    {data.CODE_VALUE_EN}
                  </option>
                ))}
              </select>
            </div>
          )}
          <p class="rate_amount">
            {formatAmount(this.currency?.symbol, this.getAmount())}/{locales.entries.Lcz_Stay}
          </p>
        </div>
        {this.rateplanSelection.selected_variation.child_nbr > 0 && (
          <div style={{ gap: '0.5rem', marginTop: '0.5rem' }} class="d-flex  flex-row  p-0 align-items-center aplicationInfoContainer">
            <p class={'m-0 p-0 text-danger'}>Any of the children below 3 years?</p>
            <div class="mr-1 flex-fill">
              <select
                class={`form-control input-sm ${this.isButtonPressed && this.guestInfo?.bed_preference === '' && 'border-danger'}`}
                id={v4()}
                style={{ width: 'max-content' }}
                onChange={event => this.updateGuest({ infant_nbr: Number((event.target as HTMLInputElement).value) })}
              >
                <option value="" selected={Number(this.guestInfo?.infant_nbr) === 0}>
                  {locales.entries['No'] || 'No'}
                </option>
                {Array.from({ length: this.rateplanSelection.selected_variation.child_nbr }, (_, i) => i + 1).map(item => (
                  <option value={item} selected={this.guestInfo?.infant_nbr === item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </Host>
    );
  }
}

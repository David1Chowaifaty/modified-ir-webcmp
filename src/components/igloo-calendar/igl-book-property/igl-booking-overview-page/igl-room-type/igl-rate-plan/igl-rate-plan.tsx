import { Component, Host, Prop, h, Event, EventEmitter, Fragment } from '@stencil/core';
import { v4 as uuidv4 } from 'uuid';
import locales from '@/stores/locales.store';
import calendar_data from '@/stores/calendar-data';
import { RatePlan, Variation } from '@/models/property';
import booking_store, { IRatePlanSelection, reserveRooms, updateRoomParams } from '@/stores/booking.store';

@Component({
  tag: 'igl-rate-plan',
  styleUrl: 'igl-rate-plan.css',
  scoped: true,
})
export class IglRatePlan {
  // Used Props with type annotations
  @Prop() ratePlan!: RatePlan;
  @Prop() roomTypeId!: number;
  @Prop() ratePricingMode: Array<{ CODE_NAME: string; CODE_VALUE_EN: string }> = [];
  @Prop() currency!: { symbol: string };
  @Prop() shouldBeDisabled!: boolean;
  @Prop() bookingType: string = 'PLUS_BOOKING';
  @Prop() isBookDisabled: boolean = false;
  @Prop() visibleInventory!: IRatePlanSelection;

  @Event() gotoSplitPageTwoEvent!: EventEmitter<{ [key: string]: any }>;

  // Determine if the form inputs should be disabled
  private disableForm(): boolean {
    const { bookingType, shouldBeDisabled, ratePlan, visibleInventory } = this;
    if (bookingType === 'EDIT_BOOKING' && shouldBeDisabled) {
      return false;
    }
    return !ratePlan.is_available_to_book || visibleInventory?.visibleInventory === 0 || !calendar_data.is_frontdesk_enabled;
  }

  // Update the rate plan selection in the booking store
  private updateRateplanSelection(props: Partial<IRatePlanSelection>): void {
    const { roomTypeId, ratePlan } = this;
    const currentSelections = booking_store.ratePlanSelections;

    booking_store.ratePlanSelections = {
      ...currentSelections,
      [roomTypeId]: {
        ...currentSelections[roomTypeId],
        [ratePlan.id]: {
          ...currentSelections[roomTypeId][ratePlan.id],
          ...props,
        },
      },
    };
  }

  // Handle changes to select inputs
  private handleDataChange(key: 'adult_child_offering' | 'rate' | 'totalRooms', evt: Event): void {
    const value = (evt.target as HTMLInputElement | HTMLSelectElement).value;
    if (key === 'adult_child_offering') {
      this.handleVariationChange(value);
    } else if (key === 'rate') {
      this.updateRateplanSelection({ view_mode: value as any });
    } else if (key === 'totalRooms') {
      reserveRooms({
        roomTypeId: this.roomTypeId,
        ratePlanId: this.ratePlan.id,
        rooms: Number(value),
      });
    }
  }

  // Navigate to the next page for booking
  private bookProperty(): void {
    this.handleDataChange('totalRooms', { target: { value: '1' } } as any);
    this.gotoSplitPageTwoEvent.emit({ key: 'gotoSplitPage', data: '' });
  }

  // Render the rate amount
  private renderRate(): string {
    const { visibleInventory } = this;
    if (!visibleInventory) return '';
    if (visibleInventory.is_amount_modified) {
      return visibleInventory.rp_amount.toString();
    }
    const { selected_variation, view_mode } = visibleInventory;
    const amount = view_mode === '001' ? selected_variation?.discounted_gross_amount : selected_variation?.amount_per_night_gross;
    return amount?.toString() || '';
  }

  // Format variation for display
  private formatVariation(variation: Variation): string {
    if (!variation) return '';
    const adults = `${variation.adult_nbr} ${variation.adult_nbr === 1 ? locales.entries['Lcz_Adult']?.toLowerCase() : locales.entries['Lcz_Adults']?.toLowerCase()}`;
    const children =
      variation.child_nbr > 0
        ? `${variation.child_nbr} ${variation.child_nbr > 1 ? locales.entries['Lcz_Children']?.toLowerCase() : locales.entries['Lcz_Child']?.toLowerCase()}`
        : '';
    return children ? `${adults} ${children}` : adults;
  }

  // Get tooltip messages for the rate plan
  private getTooltipMessages(): string | undefined {
    const { ratePlan, visibleInventory } = this;
    const selectedVariation = visibleInventory?.selected_variation;
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

  // Handle variation change when a different option is selected
  private async handleVariationChange(value: string): Promise<void> {
    const { ratePlan, roomTypeId } = this;
    const variations = ratePlan.variations || [];
    const selectedVariation = variations.find(v => this.formatVariation(v) === value);

    if (!selectedVariation) return;

    updateRoomParams({
      params: { selected_variation: selectedVariation },
      ratePlanId: ratePlan.id,
      roomTypeId,
    });
  }

  // Reset reserved rooms in the booking store
  private resetReserved(): void {
    const updatedSelections = Object.entries(booking_store.ratePlanSelections).reduce((acc, [roomTypeId, ratePlans]) => {
      acc[roomTypeId] = Object.entries(ratePlans).reduce((rpAcc, [ratePlanId, ratePlan]) => {
        rpAcc[ratePlanId] = { ...ratePlan, reserved: 0 };
        return rpAcc;
      }, {} as any);
      return acc;
    }, {} as any);
    booking_store.ratePlanSelections = updatedSelections;
  }

  render() {
    const { ratePlan, bookingType, currency, ratePricingMode, visibleInventory } = this;
    const isAvailableToBook = ratePlan.is_available_to_book;
    const disableForm = this.disableForm();
    const selectedVariation = visibleInventory?.selected_variation;
    const formattedVariations = ratePlan.variations?.map(v => this.formatVariation(v));

    return (
      <Host>
        <div
          class={`d-flex m-0 p-0 ${isAvailableToBook ? 'flex-column flex-lg-row align-items-lg-center justify-content-lg-between' : 'align-items-center justify-content-between'}`}
        >
          <div class="rateplan-name-container d-flex align-items-center" style={{ gap: '0.5rem' }}>
            {bookingType === 'BAR_BOOKING' ? (
              <Fragment>
                <span class="font-weight-bold">{ratePlan.name.split('/')[0]}</span>
                <span>/{ratePlan.name.split('/')[1]}</span>
              </Fragment>
            ) : (
              <span>{ratePlan.short_name}</span>
            )}
            {isAvailableToBook && <ir-tooltip message={this.getTooltipMessages()}></ir-tooltip>}
          </div>

          {isAvailableToBook ? (
            <div class="d-md-flex justify-content-md-end align-items-md-center flex-fill rateplan-container">
              <div class="mt-1 mt-md-0 flex-fill max-w-300">
                <fieldset class="position-relative">
                  <select disabled={disableForm} class="form-control input-sm" id={uuidv4()} onChange={evt => this.handleDataChange('adult_child_offering', evt)}>
                    {formattedVariations?.map(variation => (
                      <option value={variation} selected={this.formatVariation(selectedVariation) === variation}>
                        {variation}
                      </option>
                    ))}
                  </select>
                </fieldset>
              </div>
              <div class="m-0 p-0 mt-1 mt-md-0 d-flex justify-content-between align-items-md-center ml-md-1">
                <div class="d-flex m-0 p-0 rate-total-night-view mt-0">
                  <ir-price-input
                    disabled={disableForm}
                    onTextChange={e =>
                      this.updateRateplanSelection({
                        is_amount_modified: true,
                        rp_amount: Number(e.detail),
                      })
                    }
                    aria-label={`${this.visibleInventory.roomtype.name} ${this.ratePlan.short_name}'s rate`}
                    aria-describedby={`${this.ratePlan.short_name}'s rate`}
                    class="ir-br-input-none"
                    currency={currency.symbol}
                    value={this.renderRate()}
                    placeholder={locales.entries.Lcz_Rate || 'Rate'}
                  ></ir-price-input>
                  <fieldset class="position-relative m-0 total-nights-container p-0">
                    <select
                      disabled={disableForm}
                      class="form-control input-sm m-0 nightBorder rounded-0 py-0"
                      id={uuidv4()}
                      onChange={evt =>
                        this.updateRateplanSelection({
                          view_mode: (evt.target as HTMLSelectElement).value as any,
                        })
                      }
                    >
                      {ratePricingMode.map(data => (
                        <option value={data.CODE_NAME} selected={visibleInventory.view_mode === data.CODE_NAME}>
                          {data.CODE_VALUE_EN}
                        </option>
                      ))}
                    </select>
                  </fieldset>
                </div>

                {(bookingType === 'PLUS_BOOKING' || bookingType === 'ADD_ROOM') && (
                  <div class="flex-fill mt-lg-0 ml-1 m-0 mt-md-0 p-0">
                    <fieldset class="position-relative">
                      <select
                        disabled={visibleInventory.visibleInventory === 0}
                        class="form-control input-sm"
                        id={uuidv4()}
                        onChange={evt => this.handleDataChange('totalRooms', evt)}
                      >
                        {Array.from({ length: (visibleInventory.visibleInventory || 0) + 1 }, (_, i) => i).map(i => (
                          <option value={i} selected={visibleInventory.reserved === i}>
                            {i}
                          </option>
                        ))}
                      </select>
                    </fieldset>
                  </div>
                )}
              </div>

              {bookingType === 'EDIT_BOOKING' && (
                <Fragment>
                  <div class="m-0 p-0 mt-lg-0 ml-md-1 mt-md-1 d-none d-md-block">
                    <fieldset class="position-relative">
                      <input
                        disabled={disableForm}
                        type="radio"
                        name="ratePlanGroup"
                        value="1"
                        onChange={() => {
                          this.resetReserved();
                          reserveRooms({
                            roomTypeId: this.roomTypeId,
                            ratePlanId: this.ratePlan.id,
                            rooms: 1,
                            guest: [
                              {
                                name: booking_store.guest.name,
                                unit: null,
                                bed_preference: this.visibleInventory.roomtype.is_bed_configuration_enabled ? booking_store.guest.bed_preference : null,
                                infant_nbr: this.visibleInventory.selected_variation.child_nbr > 0 ? booking_store.guest.infant_nbr : null,
                              },
                            ],
                          });
                        }}
                        checked={visibleInventory.reserved === 1}
                      />
                    </fieldset>
                  </div>
                  <button
                    disabled={disableForm}
                    type="button"
                    class="btn btn-primary booking-btn mt-lg-0 btn-sm ml-md-1 mt-1 d-md-none"
                    onClick={() => {
                      this.resetReserved();
                      reserveRooms({
                        roomTypeId: this.roomTypeId,
                        ratePlanId: this.ratePlan.id,
                        rooms: 1,
                        guest: [
                          {
                            name: booking_store.guest.name,
                            unit: null,
                            bed_preference: this.visibleInventory.roomtype.is_bed_configuration_enabled ? booking_store.guest.bed_preference : null,
                            infant_nbr: this.visibleInventory.selected_variation.child_nbr > 0 ? booking_store.guest.infant_nbr : null,
                          },
                        ],
                      });
                      this.bookProperty();
                    }}
                  >
                    {visibleInventory.reserved === 1 ? locales.entries.Lcz_Current : locales.entries.Lcz_Select}
                  </button>
                </Fragment>
              )}

              {(bookingType === 'BAR_BOOKING' || bookingType === 'SPLIT_BOOKING') && (
                <button
                  disabled={disableForm || (bookingType === 'SPLIT_BOOKING' && this.isBookDisabled)}
                  type="button"
                  class="btn btn-primary booking-btn mt-lg-0 btn-sm ml-md-1 mt-1"
                  onClick={() => this.bookProperty()}
                >
                  {locales.entries.Lcz_Book}
                </button>
              )}
            </div>
          ) : (
            <p class="text-danger m-0 p-0">{locales.entries['Lcz_NotAvailable'] || 'Not available'}</p>
          )}
        </div>
      </Host>
    );
  }
}

import { Component, Host, Prop, h, Event, EventEmitter, Fragment } from '@stencil/core';
import { v4 as uuidv4 } from 'uuid';
import locales from '@/stores/locales.store';
import { RatePlan, Variation } from '@/models/property';
import booking_store, { IRatePlanSelection, reserveRooms, resetReserved, updateRoomParams } from '@/stores/booking.store';
import WaRadio from '@awesome.me/webawesome/dist/components/radio/radio';

@Component({
  tag: 'igl-rate-plan',
  styleUrl: 'igl-rate-plan.css',
  scoped: true,
})
export class IglRatePlan {
  // Used Props with type annotations
  @Prop() ratePlan: RatePlan;
  @Prop() roomTypeId: number;
  @Prop() ratePricingMode: Array<{ CODE_NAME: string; CODE_VALUE_EN: string }> = [];
  @Prop() currency!: { symbol: string };
  @Prop() shouldBeDisabled!: boolean;
  @Prop() bookingType: string = 'PLUS_BOOKING';
  @Prop() isBookDisabled: boolean = false;
  @Prop() visibleInventory!: IRatePlanSelection;

  @Event() buttonClicked!: EventEmitter<{ [key: string]: any }>;
  private radioRef: WaRadio;

  componentDidLoad() {
    this.radioRef.name = 'ratePlanGroup';
  }

  // Determine if the form inputs should be disabled
  private disableForm(): boolean {
    const { bookingType, shouldBeDisabled, ratePlan, visibleInventory } = this;
    if (bookingType === 'EDIT_BOOKING' && shouldBeDisabled) {
      return false;
    }
    return !ratePlan.is_available_to_book || visibleInventory?.visibleInventory === 0;
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
    if (this.bookingType === 'BAR_BOOKING') {
      resetReserved();
    }
    this.reserveRoom();
    this.buttonClicked.emit({ key: 'next' });
  }

  private reserveRoom() {
    reserveRooms({
      roomTypeId: this.roomTypeId,
      ratePlanId: this.ratePlan.id,
      rooms: 1,
      guest: [
        {
          last_name: booking_store.guest?.last_name,
          first_name: booking_store.guest?.first_name,
          unit: this.roomTypeId === booking_store.guest?.roomtype_id ? booking_store.guest?.unit : null,
          bed_preference: this.visibleInventory.roomtype.is_bed_configuration_enabled ? booking_store.guest?.bed_preference : null,
          infant_nbr: this.visibleInventory.selected_variation?.child_nbr > 0 ? booking_store.guest?.infant_nbr : null,
        },
      ],
    });
  }
  // Render the rate amount
  private renderRate(): string {
    const { visibleInventory } = this;
    if (!visibleInventory) return '';
    if (visibleInventory.is_amount_modified) {
      return visibleInventory.rp_amount.toString();
    }
    const { selected_variation, view_mode } = visibleInventory;
    const amount = view_mode === '001' ? selected_variation?.discounted_amount : selected_variation?.amount_per_night_gross;
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

  render() {
    const { ratePlan, bookingType, currency, ratePricingMode, visibleInventory } = this;
    const isAvailableToBook = ratePlan.is_available_to_book;
    const disableForm = this.disableForm();
    const selectedVariation = visibleInventory?.selected_variation;
    const formattedVariations = ratePlan.variations?.map(v => this.formatVariation(v));
    // if (!this.visibleInventory) {
    //   return null;
    // }
    return (
      <Host data-testid={`rp-${this.ratePlan.id}`}>
        <div class={`rate-plan ${isAvailableToBook ? 'rate-plan--available' : 'rate-plan--unavailable'}`}>
          <div data-testid={'rp_name'} class="rateplan-name-container">
            {bookingType === 'BAR_BOOKING' ? (
              <p>
                {/* <span class="font-weight-bold">{ratePlan.name.split('/')[0]}</span> */}
                <span>
                  {ratePlan.name.split('/')[1]} {ratePlan.is_non_refundable && <span class="non-ref-span">Non Refundable</span>}
                </span>
              </p>
            ) : (
              <span>
                {ratePlan.short_name} {ratePlan.is_non_refundable && <span class="non-ref-span">Non Refundable</span>}
              </span>
            )}
            {isAvailableToBook && (
              <Fragment>
                <wa-tooltip for={`rateplan-${this.ratePlan.id}`}>
                  <span innerHTML={this.getTooltipMessages()}></span>
                </wa-tooltip>
                <wa-icon name="circle-info" id={`rateplan-${this.ratePlan.id}`}></wa-icon>
              </Fragment>
            )}
          </div>

          {isAvailableToBook ? (
            <div class="rateplan-container">
              <wa-select
                size="small"
                disabled={disableForm}
                data-testid="adult-child-offering"
                onchange={evt => this.handleDataChange('adult_child_offering', evt)}
                onwa-hide={e => {
                  e.stopImmediatePropagation();
                  e.stopPropagation();
                }}
                value={this.formatVariation(selectedVariation)}
                defaultValue={this.formatVariation(selectedVariation)}
              >
                {formattedVariations?.map(variation => (
                  <wa-option value={variation} selected={this.formatVariation(selectedVariation) === variation}>
                    {variation}
                  </wa-option>
                ))}
              </wa-select>

              <div class="rateplan-config">
                <div class="rate-total-night-view">
                  {/* <ir-price-input
                    testId={'amount_input'}
                    disabled={disableForm}
                    onTextChange={e =>
                      this.updateRateplanSelection({
                        is_amount_modified: true,
                        rp_amount: Number(e.detail),
                      })
                    }
                    aria-label={`${this.visibleInventory?.roomtype?.name} ${this.ratePlan.short_name}'s rate`}
                    aria-describedby={`${this.ratePlan.short_name}'s rate`}
                    class="ir-br-input-none price-amount rateplan-price-input"
                    currency={currency.symbol}
                    value={this.renderRate()}
                    placeholder={locales.entries.Lcz_Rate || 'Rate'}
                  ></ir-price-input> */}
                  <ir-input
                    disabled={disableForm}
                    class="fd-rateplan__price-input"
                    onText-change={e =>
                      this.updateRateplanSelection({
                        is_amount_modified: true,
                        rp_amount: Number(e.detail),
                      })
                    }
                    aria-label={`${this.visibleInventory?.roomtype?.name} ${this.ratePlan.short_name}'s rate`}
                    aria-describedby={`${this.ratePlan.short_name}'s rate`}
                    value={this.renderRate()}
                    placeholder={locales.entries.Lcz_Rate || 'Rate'}
                    mask="price"
                  >
                    <span slot="start">{currency.symbol}</span>
                  </ir-input>
                  <wa-select
                    data-testid={'nigh_stay_select'}
                    disabled={disableForm}
                    onwa-hide={e => {
                      e.stopImmediatePropagation();
                      e.stopPropagation();
                    }}
                    size="small"
                    class="fd-rateplan__nights-select"
                    id={uuidv4()}
                    onchange={evt =>
                      this.updateRateplanSelection({
                        view_mode: (evt.target as HTMLSelectElement).value as any,
                      })
                    }
                    value={visibleInventory?.view_mode}
                    defaultValue={visibleInventory?.view_mode}
                  >
                    {ratePricingMode.map(data => (
                      <wa-option value={data.CODE_NAME} selected={visibleInventory?.view_mode === data.CODE_NAME}>
                        {data.CODE_VALUE_EN}
                      </wa-option>
                    ))}
                  </wa-select>
                </div>
                {(bookingType === 'PLUS_BOOKING' || bookingType === 'ADD_ROOM') && (
                  <wa-select
                    data-testid={'inventory_select'}
                    disabled={visibleInventory.visibleInventory === 0}
                    class="fd-rateplan__inventory-select"
                    onchange={evt => this.handleDataChange('totalRooms', evt)}
                    value={visibleInventory.reserved?.toString()}
                    defaultValue={visibleInventory.reserved?.toString()}
                    size="small"
                    onwa-hide={e => {
                      e.stopImmediatePropagation();
                      e.stopPropagation();
                    }}
                  >
                    {Array.from({ length: (visibleInventory.visibleInventory || 0) + 1 }, (_, i) => i).map(i => (
                      <wa-option value={i?.toString()} selected={visibleInventory.reserved === i}>
                        {i}
                      </wa-option>
                    ))}
                  </wa-select>
                )}
              </div>
              {bookingType === 'EDIT_BOOKING' && (
                <Fragment>
                  {/* <div class="edit-booking-radio desktop-only">
                    <fieldset class="rp-fieldset">
                      <input
                        data-testid={'inventory_radio'}
                        disabled={disableForm}
                        type="radio"
                        name="ratePlanGroup"
                        value="1"
                        onChange={() => {
                          resetReserved();
                          this.reserveRoom();
                        }}
                        checked={visibleInventory.reserved === 1}
                      />
                    </fieldset> 
                  
                  </div> */}
                  <ir-custom-button
                    variant="brand"
                    data-testid="book_property"
                    disabled={disableForm}
                    type="button"
                    class="rateplan__booking-btn"
                    onClickHandler={() => {
                      resetReserved();
                      this.reserveRoom();
                      this.bookProperty();
                    }}
                  >
                    {visibleInventory.reserved === 1 ? locales.entries.Lcz_Current : locales.entries.Lcz_Select}
                  </ir-custom-button>
                </Fragment>
              )}

              {(bookingType === 'BAR_BOOKING' || bookingType === 'SPLIT_BOOKING') && (
                <ir-custom-button
                  data-testid="book"
                  disabled={disableForm || (bookingType === 'SPLIT_BOOKING' && this.isBookDisabled)}
                  type="button"
                  class="booking-btn"
                  variant="brand"
                  onClickHandler={() => this.bookProperty()}
                >
                  {locales.entries.Lcz_Book}
                </ir-custom-button>
              )}
            </div>
          ) : (
            <p class="rate-plan-unavailable-text">{locales.entries['Lcz_NotAvailable'] || 'Not available'}</p>
          )}
        </div>
      </Host>
    );
  }
}

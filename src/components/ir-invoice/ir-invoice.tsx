import { Booking, Room } from '@/models/booking.dto';
import { buildSplitIndex } from '@/utils/booking';
import { formatAmount } from '@/utils/utils';
import { Component, Event, EventEmitter, Host, Method, Prop, State, Watch, h } from '@stencil/core';
import moment from 'moment';

@Component({
  tag: 'ir-invoice',
  styleUrls: ['ir-invoice.css'],
  scoped: true,
})
export class IrInvoice {
  /**
   * Whether the invoice drawer is open.
   *
   * This prop is mutable and reflected to the host element,
   * allowing parent components to control visibility via markup
   * or via the public `openDrawer()` / `closeDrawer()` methods.
   */
  @Prop({ mutable: true, reflect: true }) open: boolean;

  /**
   * The booking object for which the invoice is being generated.
   * Should contain room, guest, and pricing information.
   */
  @Prop() booking: Booking;

  /**
   * Determines what should happen after creating the invoice.
   * - `"create"`: create an invoice normally
   * - `"check_in-create"`: create an invoice as part of the check-in flow
   */
  @Prop() mode: 'create' | 'check_in-create' = 'create';

  /**
   * Specifies what the invoice is for.
   * - `"room"`: invoice for a specific room
   * - `"booking"`: invoice for the entire booking
   */
  @Prop() for: 'room' | 'booking' = 'booking';

  /**
   * The identifier of the room for which the invoice is being generated.
   * Used when invoicing at room level instead of booking level.
   */
  @Prop() roomIdentifier: string;

  /**
   * When `true`, automatically triggers `window.print()` after an invoice is created.
   * Useful for setups where the invoice should immediately be sent to a printer.
   */
  @Prop() autoPrint: boolean = false;

  @State() selectedRecipient: string;

  /**
   * Emitted when the invoice drawer is opened.
   *
   * Fired when `openDrawer()` is called and the component
   * transitions into the open state.
   */
  @Event() invoiceOpen: EventEmitter<void>;

  /**
   * Emitted when the invoice drawer is closed.
   *
   * Fired when `closeDrawer()` is called, including when the
   * underlying drawer emits `onDrawerHide`.
   */
  @Event() invoiceClose: EventEmitter<void>;

  /**
   * Emitted when an invoice is created/confirmed.
   *
   * The event `detail` contains:
   * - `booking`: the booking associated with the invoice
   * - `recipientId`: the selected billing recipient
   * - `for`: whether the invoice is for `"room"` or `"booking"`
   * - `roomIdentifier`: the room identifier when invoicing a specific room
   * - `mode`: the current invoice mode
   */
  @Event() invoiceCreated: EventEmitter<{
    booking: Booking;
    recipientId: string;
    for: 'room' | 'booking';
    roomIdentifier?: string;
    mode: 'create' | 'check_in-create';
  }>;

  private invoiceFormRef: HTMLFormElement;
  private room: Booking['rooms'][0];

  componentWillLoad() {
    if (this.booking) {
      this.selectedRecipient = this.booking.guest.id.toString();
      if (this.for === 'room' && this.roomIdentifier) {
        this.room = this.booking.rooms.find(r => r.identifier === this.roomIdentifier);
      }
    }
  }

  @Watch('booking')
  handleBookingChange() {
    if (this.booking) {
      this.selectedRecipient = this.booking.guest.id.toString();
      if (this.for === 'room' && this.roomIdentifier) {
        this.room = this.booking.rooms.find(r => r.identifier === this.roomIdentifier);
      }
    }
  }

  /**
   * Opens the invoice drawer.
   *
   * This method sets the `open` property to `true`, making the drawer visible.
   * It can be called programmatically by parent components.
   *
   * Also emits the `invoiceOpen` event.
   *
   * @returns {Promise<void>} Resolves once the drawer state is updated.
   */
  @Method()
  async openDrawer(): Promise<void> {
    this.open = true;
    this.invoiceOpen.emit();
  }

  /**
   * Closes the invoice drawer.
   *
   * This method sets the `open` property to `false`, hiding the drawer.
   * Parent components can call this to close the drawer programmatically,
   * and it is also used internally when the drawer emits `onDrawerHide`.
   *
   * Also emits the `invoiceClose` event.
   *
   * @returns {Promise<void>} Resolves once the drawer state is updated.
   */
  @Method()
  async closeDrawer(): Promise<void> {
    this.open = false;
    this.invoiceFormRef.reset();
    this.selectedRecipient = this.booking?.guest?.id?.toString();
    this.invoiceClose.emit();
  }

  /**
   * Handles confirming/creating the invoice.
   *
   * Emits the `invoiceCreated` event with invoice context, and if
   * `autoPrint` is `true`, triggers `window.print()` afterwards.
   */
  private handleConfirmInvoice(isProforma: boolean = false) {
    if (!isProforma)
      this.invoiceCreated.emit({
        booking: this.booking,
        recipientId: this.selectedRecipient,
        for: this.for,
        roomIdentifier: this.roomIdentifier,
        mode: this.mode,
      });

    if (this.autoPrint) {
      try {
        // window.print();
      } catch (error) {
        // Fail silently but log for debugging
        console.error('Auto print failed:', error);
      }
    }
  }
  private getMinDate() {
    if (this.for === 'room') {
      return this.room.to_date;
    }
    const getMinCheckoutDate = () => {
      let minDate = moment();
      for (const room of this.booking.rooms) {
        const d = moment(room.to_date, 'YYYY-MM-DD');
        if (d.isBefore(minDate)) {
          minDate = d.clone();
        }
      }
      return minDate;
    };

    return getMinCheckoutDate().format('YYYY-MM-DD');
  }

  private getMaxDate() {
    return moment().format('YYYY-MM-DD');
  }
  private computeRoomGroups(rooms: Room[]) {
    const indexById = new Map<string, number>();
    rooms.forEach((room, idx) => indexById.set(room.identifier, idx));

    if (!rooms.length) {
      return { groups: [], indexById, hasSplitGroups: false };
    }

    const groupSortKey = (groupRooms: Room[]) => {
      let min = Number.MAX_SAFE_INTEGER;
      for (const r of groupRooms) {
        const ts = Date.parse(r?.from_date ?? '');
        if (!Number.isNaN(ts)) {
          min = Math.min(min, ts);
        }
      }
      return min;
    };

    const splitIndex = buildSplitIndex(rooms);
    if (!splitIndex) {
      const sortedRooms = [...rooms].sort((a, b) => {
        const diff = Date.parse(a?.from_date ?? '') - Date.parse(b?.from_date ?? '');
        if (!Number.isNaN(diff) && diff !== 0) {
          return diff;
        }
        return (indexById.get(a.identifier) ?? 0) - (indexById.get(b.identifier) ?? 0);
      });
      return { groups: [{ rooms: sortedRooms, order: 0, isSplit: false, sortKey: groupSortKey(sortedRooms) }], indexById, hasSplitGroups: false };
    }

    const roomsById = new Map<string, Room>(rooms.map(room => [room.identifier, room]));
    const grouped: { rooms: Room[]; order: number; sortKey: number; isSplit: boolean }[] = [];
    const visited = new Set<string>();

    for (const head of splitIndex.heads) {
      const chain = splitIndex.chainOf.get(head) ?? [head];
      const chainRooms = chain.map(id => roomsById.get(id)).filter((room): room is Room => Boolean(room));
      if (!chainRooms.length) continue;

      const chainHasSplitLink =
        chain.some(id => {
          const parent = splitIndex.parentOf.get(id);
          const children = splitIndex.childrenOf.get(id) ?? [];
          return Boolean(parent) || children.length > 0;
        }) || chainRooms.some(room => Boolean(room?.is_split));

      if (chainHasSplitLink) {
        chainRooms.forEach(room => visited.add(room.identifier));
        const order = Math.min(...chainRooms.map(room => indexById.get(room.identifier) ?? Number.MAX_SAFE_INTEGER));
        grouped.push({ rooms: chainRooms, order, sortKey: groupSortKey(chainRooms), isSplit: true });
      }
    }

    for (const room of rooms) {
      if (!visited.has(room.identifier)) {
        const order = indexById.get(room.identifier) ?? Number.MAX_SAFE_INTEGER;
        const singleGroup = [room];
        grouped.push({ rooms: singleGroup, order, sortKey: groupSortKey(singleGroup), isSplit: false });
      }
    }

    grouped.sort((a, b) => {
      if (a.sortKey !== b.sortKey) {
        return a.sortKey - b.sortKey;
      }
      return a.order - b.order;
    });
    const hasSplitGroups = grouped.some(group => group.isSplit);

    if (!hasSplitGroups) {
      const merged = grouped
        .map(group => group.rooms)
        .reduce<Room[]>((acc, curr) => acc.concat(curr), [])
        .sort((a, b) => {
          const diff = Date.parse(a?.from_date ?? '') - Date.parse(b?.from_date ?? '');
          if (!Number.isNaN(diff) && diff !== 0) {
            return diff;
          }
          return (indexById.get(a.identifier) ?? 0) - (indexById.get(b.identifier) ?? 0);
        });
      return { groups: [{ rooms: merged, order: 0, sortKey: groupSortKey(merged), isSplit: false }], indexById, hasSplitGroups: false };
    }

    return { groups: grouped, indexById, hasSplitGroups: true };
  }
  private renderRooms() {
    const rooms = this.booking?.rooms ?? [];
    if (!rooms.length) {
      return null;
    }

    const { groups, hasSplitGroups } = this.computeRoomGroups(rooms);

    if (!hasSplitGroups) {
      const groupRooms = groups[0].rooms;
      return groupRooms.map(room => (
        <div class="ir-invoice__service" key={room.identifier}>
          <wa-checkbox class="ir-invoice__checkbox" checked>
            <div class={'ir-invoice__room-checkbox-container'}>
              <b>{room.roomtype.name}</b>
              <span>{room.rateplan.short_name}</span>
              <span class="ir-invoice__checkbox-price">{formatAmount('$US', room.gross_total)}</span>
            </div>
          </wa-checkbox>
        </div>

        // {this.renderRoomItem(room, indexById.get(room.identifier) ?? idx)}
        // {idx < groupRooms.length - 1 ? <wa-divider></wa-divider> : null}
      ));
    }
    return groups.map(group => (
      <div class="ir-invoice__service" key={group.order}>
        <wa-checkbox class="ir-invoice__checkbox group" checked>
          <div class={'ir-invoice__room-checkbox-container group'}>
            {group.rooms.map(room => {
              return (
                <div class="d-flex align-items-center" style={{ gap: '0.5rem' }}>
                  <b>{room.roomtype.name}</b>
                  <span>{room.rateplan.short_name}</span>
                  <span class="ir-invoice__checkbox-price">{formatAmount('$US', room.gross_total)}</span>
                </div>
              );
            })}
          </div>
        </wa-checkbox>
      </div>
    ));
  }

  render() {
    return (
      <Host>
        <ir-drawer
          label="Invoice"
          open={this.open}
          onDrawerHide={e => {
            e.stopImmediatePropagation();
            e.stopPropagation();
            this.closeDrawer();
          }}
        >
          <form ref={el => (this.invoiceFormRef = el)} class="ir-invoice__container">
            <ir-custom-date-picker label="Date" date={moment().format('YYYY-MM-DD')} minDate={this.getMinDate()} maxDate={this.getMaxDate()}></ir-custom-date-picker>
            <ir-booking-billing-recipient onRecipientChange={e => (this.selectedRecipient = e.detail)} booking={this.booking}></ir-booking-billing-recipient>
            <div class={'ir-invoice__services'}>
              <p class="ir-invoice__form-control-label">Choose what to invoice</p>
              <div class="ir-invoice__services-container">
                {this.renderRooms()}
                {this.booking.pickup_info && (
                  <div class="ir-invoice__service">
                    <wa-checkbox class="ir-invoice__checkbox">
                      <div>Pickup</div>
                    </wa-checkbox>
                  </div>
                )}
                {this.booking.extra_services?.map(extra_service => (
                  <div key={extra_service.system_id} class="ir-invoice__service">
                    <wa-checkbox class="ir-invoice__checkbox">
                      <div></div>
                    </wa-checkbox>
                  </div>
                ))}
              </div>
            </div>
          </form>
          <div slot="footer" class="ir__drawer-footer">
            <ir-custom-button
              size="medium"
              appearance="filled"
              class="w-100 flex-fill"
              variant="neutral"
              onClickHandler={() => {
                this.closeDrawer();
              }}
            >
              Cancel
            </ir-custom-button>
            <ir-custom-button
              onClickHandler={() => {
                this.handleConfirmInvoice(true);
              }}
              size="medium"
              class="w-100 flex-fill"
              appearance="outlined"
              variant="brand"
            >
              Pro-forma invoice
            </ir-custom-button>
            <ir-custom-button
              onClickHandler={() => {
                this.handleConfirmInvoice();
              }}
              class="w-100 flex-fill"
              size="medium"
              variant="brand"
            >
              Confirm invoice
            </ir-custom-button>
          </div>
        </ir-drawer>
      </Host>
    );
  }
}

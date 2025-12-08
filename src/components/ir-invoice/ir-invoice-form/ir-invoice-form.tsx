import { Booking, Room } from '@/models/booking.dto';
import { BookingService } from '@/services/booking-service/booking.service';
import { buildSplitIndex } from '@/utils/booking';
import { formatAmount } from '@/utils/utils';
import { Component, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core';
import moment, { Moment } from 'moment';
import { BookingInvoiceInfo, InvoicableItem } from '../types';
import { IEntries } from '@/models/IBooking';
@Component({
  tag: 'ir-invoice-form',
  styleUrl: 'ir-invoice-form.css',
  scoped: true,
})
export class IrInvoiceForm {
  @Prop() formId: string;
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

  @Prop() invoiceInfo: BookingInvoiceInfo;

  @State() selectedRecipient: string;
  @State() isLoading: boolean;
  @State() selectedItemKeys: Set<number> = new Set();
  @State() invoicableKey: Map<InvoicableItem['key'], InvoicableItem>;
  @State() toBeInvoicedItems: InvoicableItem[];
  @State() invoiceDate: Moment = moment();

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

  private room: Booking['rooms'][0];

  private bookingService = new BookingService();
  private invoiceTarget: IEntries[];

  componentWillLoad() {
    this.init();
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
  @Watch('invoiceInfo')
  handleInvoiceInfoChange() {
    this.setupInvoicables(this.invoiceInfo);
  }

  private syncSelectedItems(selectedKeys: Set<number>) {
    this.selectedItemKeys = selectedKeys;
    const selectedItems: InvoicableItem[] = [];
    selectedKeys.forEach(key => {
      const item = this.invoicableKey?.get(key);
      if (item) {
        selectedItems.push(item);
      }
    });
    this.toBeInvoicedItems = selectedItems;
  }
  private canInvoiceRoom(room?: Room) {
    return Boolean(room && this.invoicableKey?.has(room.system_id));
  }
  private hasInvoiceableRooms(rooms: Room[]) {
    return rooms.some(room => this.canInvoiceRoom(room));
  }
  private getInvoiceableRoomIds(rooms: Room[]) {
    const ids: number[] = [];
    rooms.forEach(room => {
      if (this.canInvoiceRoom(room)) {
        ids.push(room.system_id);
      }
    });
    return ids;
  }
  private async init() {
    try {
      this.isLoading = true;
      let invoiceInfo = this.invoiceInfo;
      if (!this.invoiceInfo) {
        invoiceInfo = await this.bookingService.getBookingInvoiceInfo({ booking_nbr: this.booking.booking_nbr });
      }
      this.setupInvoicables(invoiceInfo);

      if (this.booking) {
        this.selectedRecipient = this.booking.guest.id.toString();
        if (this.for === 'room' && this.roomIdentifier) {
          this.room = this.booking.rooms.find(r => r.identifier === this.roomIdentifier);
        }
      }
      this.invoiceTarget = await this.bookingService.getSetupEntriesByTableName('_INVOICE_TARGET');
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }
  private setupInvoicables(invoiceInfo: BookingInvoiceInfo) {
    const invoiceableItems = (invoiceInfo.invoicable_items ?? []).filter(item => item.is_invoiceable);
    this.invoicableKey = new Map(invoiceableItems.map(item => [item.key, item]));
    this.syncSelectedItems(new Set(invoiceableItems.map(item => item.key)));
  }
  /**
   * Handles confirming/creating the invoice.
   *
   * Emits the `invoiceCreated` event with invoice context, and if
   * `autoPrint` is `true`, triggers `window.print()` afterwards.
   */
  private async handleConfirmInvoice(isProforma: boolean = false) {
    try {
      const billed_to_name = this.selectedRecipient?.startsWith('room__') ? this.selectedRecipient.replace('room__', '').trim() : '';
      let target: {};
      const setTarget = (code: string) => {
        let f = this.invoiceTarget.find(t => t.CODE_NAME === '001');
        if (!f) {
          throw new Error(`Invalid code ${code}`);
        }
        return {
          code: f.CODE_NAME,
          description: f.CODE_VALUE_EN,
        };
      };
      if (this.selectedRecipient === 'guest') {
        target = setTarget('002');
      } else {
        target = setTarget('001');
      }
      await this.bookingService.issueInvoice({
        is_proforma: isProforma,
        invoice: {
          booking_nbr: this.booking.booking_nbr,
          currency: { id: this.booking.currency.id },
          Date: this.invoiceDate.format('YYYY-MM-DD'),
          items: this.toBeInvoicedItems,
          target,
          billed_to_name,
        },
      });
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
      this.invoiceClose.emit();
    } catch (error) {
      console.error(error);
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
    if (!rooms.length || !this.invoicableKey?.size) {
      return null;
    }

    const { groups, hasSplitGroups } = this.computeRoomGroups(rooms);

    if (!hasSplitGroups) {
      const groupRooms = groups[0].rooms;
      const invoiceableRooms = groupRooms.filter(room => this.canInvoiceRoom(room));
      if (!invoiceableRooms.length) {
        return null;
      }
      return invoiceableRooms.map(room => {
        const isSelected = this.isSelected([room.system_id]);
        return (
          <div class="ir-invoice__service" key={room.identifier}>
            <wa-checkbox
              size="small"
              onchange={e => {
                const value = (e.target as any).checked;
                this.handleCheckChange({ checked: value, system_id: room.system_id });
              }}
              defaultChecked={isSelected}
              checked={isSelected}
              class="ir-invoice__checkbox"
            >
              <div class={'ir-invoice__room-checkbox-container'}>
                <b>{room.roomtype.name}</b>
                <span>{room.rateplan.short_name}</span>
                <span class="ir-invoice__checkbox-price">{formatAmount(this.booking.currency.symbol, room.gross_total)}</span>
              </div>
            </wa-checkbox>
          </div>

          // {this.renderRoomItem(room, indexById.get(room.identifier) ?? idx)}
          // {idx < groupRooms.length - 1 ? <wa-divider></wa-divider> : null}
        );
      });
    }
    return groups.map(group => {
      if (!this.hasInvoiceableRooms(group.rooms)) {
        return null;
      }
      const roomIds = this.getInvoiceableRoomIds(group.rooms);
      const isSelected = this.isSelected(roomIds);
      return (
        <div class="ir-invoice__service" key={group.order}>
          <wa-checkbox
            size="small"
            onchange={e => {
              const value = (e.target as any).checked;
              this.handleCheckChange({ checked: value, system_ids: roomIds });
            }}
            defaultChecked={isSelected}
            checked={isSelected}
            class="ir-invoice__checkbox group"
          >
            <div class={'ir-invoice__room-checkbox-container group'}>
              {group.rooms.map(room => {
                if (!this.canInvoiceRoom(room)) {
                  return null;
                }
                return (
                  <div class="d-flex align-items-center" style={{ gap: '0.5rem' }}>
                    <b>{room.roomtype.name}</b>
                    <span>{room.rateplan.short_name}</span>
                    <span class="ir-invoice__checkbox-price">{formatAmount(this.booking.currency.symbol, room.gross_total)}</span>
                  </div>
                );
              })}
            </div>
          </wa-checkbox>
        </div>
      );
    });
  }
  private handleCheckChange({ checked, system_id, system_ids }: { checked: boolean; system_id?: number; system_ids?: number[] }) {
    if (!this.invoicableKey) {
      return;
    }
    const ids = [...(Array.isArray(system_ids) ? system_ids : []), ...(typeof system_id === 'number' ? [system_id] : [])].filter((id): id is number => typeof id === 'number');

    if (!ids.length) {
      return;
    }

    const nextKeys = new Set(this.selectedItemKeys);
    let changed = false;

    ids.forEach(id => {
      if (!this.invoicableKey.has(id)) {
        return;
      }
      if (checked) {
        if (!nextKeys.has(id)) {
          nextKeys.add(id);
          changed = true;
        }
      } else if (nextKeys.delete(id)) {
        changed = true;
      }
    });

    if (changed) {
      this.syncSelectedItems(nextKeys);
    }
  }

  private isSelected(system_ids: (number | undefined)[] = []) {
    if (!system_ids?.length) {
      return false;
    }
    for (const id of system_ids) {
      if (typeof id === 'number' && this.selectedItemKeys.has(id)) {
        return true;
      }
    }
    return false;
  }
  private renderPickup() {
    const isSelected = this.isSelected([this.booking.pickup_info?.['system_id']]);

    return (
      <div class="ir-invoice__service">
        <wa-checkbox
          size="small"
          onchange={e => {
            const value = (e.target as any).checked;
            this.handleCheckChange({ checked: value, system_id: this.booking.pickup_info?.['system_id'] });
          }}
          defaultChecked={isSelected}
          checked={isSelected}
          class="ir-invoice__checkbox"
        >
          <div class="d-flex align-items-center" style={{ gap: '0.5rem' }}>
            <b>Pickup</b>
            <span class="ir-invoice__checkbox-price">{formatAmount(this.booking.currency.symbol, this.booking.pickup_info.selected_option.amount)}</span>
          </div>
        </wa-checkbox>
      </div>
    );
  }

  render() {
    if (this.isLoading) {
      return (
        <div class="drawer__loader-container">
          <ir-spinner></ir-spinner>
        </div>
      );
    }
    return (
      <Host size="small">
        <form
          id={this.formId}
          onSubmit={e => {
            e.preventDefault();
            const submitter = (e as SubmitEvent).submitter as any | null;
            if (submitter?.value === 'pro-forma') {
              this.handleConfirmInvoice(true);
            } else if (submitter?.value === 'invoice') {
              this.handleConfirmInvoice();
            }
          }}
          class="ir-invoice__container"
        >
          <ir-custom-date-picker
            onDateChanged={e => (this.invoiceDate = e.detail.start)}
            label="Date"
            date={this.invoiceDate.format('YYYY-MM-DD')}
            minDate={this.getMinDate()}
            maxDate={this.getMaxDate()}
          ></ir-custom-date-picker>
          <ir-booking-billing-recipient onRecipientChange={e => (this.selectedRecipient = e.detail)} booking={this.booking}></ir-booking-billing-recipient>
          <div class={'ir-invoice__services'}>
            <p class="ir-invoice__form-control-label">Choose what to invoice</p>
            <div class="ir-invoice__services-container">
              {this.renderRooms()}
              {this.booking.pickup_info && this.renderPickup()}
              {this.booking.extra_services?.map(extra_service => {
                if (!this.invoicableKey?.has(extra_service.system_id)) {
                  return null;
                }
                const isSelected = this.isSelected([extra_service.system_id]);
                return (
                  <div key={extra_service.system_id} class="ir-invoice__service">
                    <wa-checkbox
                      size="small"
                      onchange={e => {
                        const value = (e.target as any).checked;
                        this.handleCheckChange({ checked: value, system_id: extra_service.system_id });
                      }}
                      defaultChecked={isSelected}
                      class="ir-invoice__checkbox"
                      checked={isSelected}
                    >
                      <div class="d-flex align-items-center" style={{ gap: '0.5rem' }}>
                        <b>{extra_service.description}</b>
                        <span class="ir-invoice__checkbox-price">{formatAmount(this.booking.currency.symbol, extra_service.price)}</span>
                      </div>
                    </wa-checkbox>
                  </div>
                );
              })}
            </div>
          </div>
        </form>
      </Host>
    );
  }
}

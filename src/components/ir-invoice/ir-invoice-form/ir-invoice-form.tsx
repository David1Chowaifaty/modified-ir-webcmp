import { Booking, Room } from '@/models/booking.dto';
import { BookingService } from '@/services/booking-service/booking.service';
import { buildSplitIndex } from '@/utils/booking';
import { formatAmount } from '@/utils/utils';
import { Component, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core';
import moment, { Moment } from 'moment';
import { BookingInvoiceInfo, InvoiceableItem, ViewMode } from '../types';
import { IEntries } from '@/models/IBooking';
import { IssueInvoiceProps } from '@/services/booking-service/types';
@Component({
  tag: 'ir-invoice-form',
  styleUrl: 'ir-invoice-form.css',
  scoped: true,
})
export class IrInvoiceForm {
  /**
   * Controls how the invoice form behaves (e.g., "invoice", "proforma", "preview").
   */
  @Prop() viewMode: ViewMode = 'invoice';

  /**
   * Unique ID applied to the underlying <form> element.
   */
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
  @Prop({ mutable: true }) booking: Booking;

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
  @State() invoicableKey: Map<InvoiceableItem['key'], InvoiceableItem>;
  @State() toBeInvoicedItems: InvoiceableItem[];
  @State() invoiceDate: Moment = moment();
  @State() notInvoiceableItemKeys: Set<number> = new Set();

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
  @Event({ cancelable: true, composed: true, bubbles: true }) invoiceCreated: EventEmitter<BookingInvoiceInfo>;

  @Event() previewProformaInvoice: EventEmitter<IssueInvoiceProps>;

  @Event() loadingChange: EventEmitter<boolean>;

  private room: Booking['rooms'][0];
  private splitDisabledKeys: Set<number> = new Set();
  private confirmButtonRef: HTMLIrCustomButtonElement;
  private bookingService = new BookingService();
  private invoiceTarget: IEntries[];

  componentWillLoad() {
    this.init();
  }
  componentDidLoad() {
    this.confirmButtonRef = document.querySelector(`#confirm-btn_${this.formId}`);
  }
  @Watch('viewMode')
  handleViewModeChange() {
    this.enforceNonInvoiceableSelections();
  }
  @Watch('booking')
  handleBookingChange() {
    if (this.booking) {
      this.selectedRecipient = this.booking.guest.id.toString();
      if (this.for === 'room' && this.roomIdentifier) {
        this.room = this.booking.rooms.find(r => r.identifier === this.roomIdentifier);
      }
    }
    this.setUpDisabledItems();
  }
  @Watch('invoiceInfo')
  handleInvoiceInfoChange() {
    this.setupInvoicables(this.invoiceInfo);
  }

  private setUpDisabledItems() {
    if (!this.booking || !this.invoicableKey?.size) {
      this.notInvoiceableItemKeys = new Set();
      this.splitDisabledKeys = new Set();
      return;
    }

    const invoiceDate = (this.invoiceDate ?? moment()).clone().startOf('day');
    const disabledKeys = new Set<number>();
    this.splitDisabledKeys = new Set();
    const markIfBefore = (key: number | undefined, dateStr?: string | null, options?: { checkedOut?: boolean }) => {
      if (options?.checkedOut) {
        return;
      }
      if (typeof key !== 'number' || !this.invoicableKey.has(key) || !dateStr) {
        return;
      }
      const parsed = moment(dateStr, 'YYYY-MM-DD', true);
      if (parsed.isValid() && invoiceDate.isBefore(parsed.clone().startOf('day'))) {
        disabledKeys.add(key);
      }
    };

    const rooms = this.booking.rooms ?? [];
    rooms.forEach(room => {
      markIfBefore(room.system_id, room.to_date, { checkedOut: room?.in_out?.code === '002' });
    });

    const pickupInfo: any = this.booking.pickup_info;
    if (pickupInfo) {
      markIfBefore(pickupInfo?.system_id, pickupInfo?.from_date ?? pickupInfo?.date);
    }

    (this.booking.extra_services ?? []).forEach(extra => {
      markIfBefore(extra.system_id, (extra as any)?.from_date ?? extra.start_date ?? extra.end_date ?? this.booking.from_date);
    });

    const splitIndex = buildSplitIndex(rooms);
    if (splitIndex) {
      const roomsByIdentifier = new Map(rooms.map(room => [room.identifier, room]));
      splitIndex.heads.forEach(head => {
        const chain = splitIndex.chainOf.get(head) ?? [];
        if (chain.length <= 1) {
          return;
        }
        const tailIdentifier = chain[chain.length - 1];
        const tailRoom = roomsByIdentifier.get(tailIdentifier);
        if (!tailRoom) {
          return;
        }
        const tailCheckedOut = tailRoom.in_out?.code === '002';
        chain.forEach(identifier => {
          const room = roomsByIdentifier.get(identifier);
          if (!room || typeof room.system_id !== 'number' || !this.invoicableKey.has(room.system_id)) {
            return;
          }
          if (tailCheckedOut) {
            disabledKeys.delete(room.system_id);
            return;
          }
          disabledKeys.add(room.system_id);
          this.splitDisabledKeys.add(room.system_id);
        });
      });
    }

    this.notInvoiceableItemKeys = disabledKeys;
    this.enforceNonInvoiceableSelections(disabledKeys);
  }

  private enforceNonInvoiceableSelections(disabledKeys: Set<number> = this.notInvoiceableItemKeys ?? new Set()) {
    if (!disabledKeys.size) {
      return;
    }
    const nextKeys = new Set(this.selectedItemKeys);
    let changed = false;
    disabledKeys.forEach(key => {
      const isSplitDisabled = this.splitDisabledKeys.has(key);
      if (this.viewMode === 'proforma' && !isSplitDisabled) {
        if (!nextKeys.has(key)) {
          nextKeys.add(key);
          changed = true;
        }
        return;
      }
      if (nextKeys.delete(key)) {
        changed = true;
      }
    });

    if (changed) {
      this.syncSelectedItems(nextKeys);
    }
  }
  private syncSelectedItems(selectedKeys: Set<number>) {
    this.selectedItemKeys = selectedKeys;
    const selectedItems: InvoiceableItem[] = [];
    selectedKeys.forEach(key => {
      const item = this.invoicableKey?.get(key);
      if (item) {
        selectedItems.push(item);
      }
    });
    this.toBeInvoicedItems = selectedItems;
    if (!this.confirmButtonRef) {
      return;
    }
    if (this.toBeInvoicedItems.length === 0) {
      this.confirmButtonRef.disabled = true;
    } else {
      if (this.confirmButtonRef.disabled) {
        this.confirmButtonRef.disabled = false;
      }
    }
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
      // let invoiceInfo = this.invoiceInfo;
      // if (!this.invoiceInfo) {
      const [booking, invoiceInfo] = await Promise.all([
        this.bookingService.getExposedBooking(this.booking.booking_nbr, 'en', true),
        this.bookingService.getBookingInvoiceInfo({ booking_nbr: this.booking.booking_nbr }),
      ]);

      this.booking = { ...booking };
      // }

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
    const invoiceableItems = (invoiceInfo.invoiceable_items ?? []).filter(item => item.is_invoiceable);
    this.invoicableKey = new Map(invoiceableItems.map(item => [item.key, item]));
    this.syncSelectedItems(new Set(invoiceableItems.map(item => item.key)));
    this.setUpDisabledItems();
  }

  /**
   * Handles confirming/creating the invoice.
   *
   * Emits the `invoiceCreated` event with invoice context, and if
   * `autoPrint` is `true`, triggers `window.print()` afterwards.
   */
  private async handleConfirmInvoice(isProforma: boolean = false) {
    try {
      this.loadingChange.emit(true);
      const billed_to_name = this.selectedRecipient?.startsWith('room__') ? this.selectedRecipient.replace('room__', '').trim() : '';
      let target: {};
      const setTarget = (code: string) => {
        let f = this.invoiceTarget.find(t => t.CODE_NAME === code);
        if (!f) {
          throw new Error(`Invalid code ${code}`);
        }
        return {
          code: f.CODE_NAME,
          description: f.CODE_VALUE_EN,
        };
      };
      if (this.selectedRecipient === 'company') {
        target = setTarget('002');
      } else {
        target = setTarget('001');
      }
      const invoice = {
        booking_nbr: this.booking.booking_nbr,
        currency: { id: this.booking.currency.id },
        Date: this.invoiceDate.format('YYYY-MM-DD'),
        items: this.toBeInvoicedItems,
        target,
        billed_to_name,
      };
      if (isProforma) {
        this.previewProformaInvoice.emit({ invoice });
        return;
      }
      await this.bookingService.issueInvoice({
        is_proforma: isProforma,
        invoice,
      });
      const invoiceInfo = await this.bookingService.getBookingInvoiceInfo({
        booking_nbr: this.booking.booking_nbr,
      });
      if (this.autoPrint) {
        try {
          // window.print();
        } catch (error) {
          // Fail silently but log for debugging
          console.error('Auto print failed:', error);
        }
      }
      await this.openLastInvoice(invoiceInfo);
      this.invoiceCreated.emit(invoiceInfo);
      this.invoiceClose.emit();
    } catch (error) {
      console.error(error);
    } finally {
      this.loadingChange.emit(false);
    }
  }
  private async openLastInvoice(invoiceInfo: BookingInvoiceInfo) {
    const lastInvoice = invoiceInfo.invoices[invoiceInfo.invoices.length - 1];
    const { My_Result } = await this.bookingService.printInvoice({ mode: lastInvoice?.credit_note ? 'creditnote' : 'invoice', invoice_nbr: lastInvoice.nbr });
    window.open(My_Result);
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

  private getDateView(fromDate: string, toDate: string) {
    if (!fromDate) {
      return;
    }
    const from_date = moment(fromDate, 'YYYY-MM-DD').format('MMM DD, YYYY');
    if (!toDate) {
      return <span>{from_date}</span>;
    }
    const to_date = moment(toDate, 'YYYY-MM-DD').format('MMM DD, YYYY');
    return (
      <span>
        {from_date} <wa-icon name="arrow-right"></wa-icon> {to_date}
      </span>
    );
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
        const isDisabled = this.isDisabled([room.system_id]);
        return (
          <div class="ir-invoice__service" key={room.identifier}>
            <wa-checkbox
              disabled={isDisabled}
              size="small"
              onchange={e => {
                const value = (e.target as any).checked;
                this.handleCheckChange({ checked: value, system_id: room.system_id });
              }}
              defaultChecked={isSelected}
              checked={isSelected}
              class="ir-invoice__checkbox"
            >
              <div class={'ir-invoice__room-checkbox-container align-items-center'}>
                <div class="ir-invoice__room-info">
                  <span>
                    <b>{room.roomtype.name}</b>
                    <span style={{ paddingLeft: '0.5rem' }}>{room.rateplan.short_name}</span>
                  </span>
                  {this.getDateView(room.from_date, room.to_date)}
                </div>
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
      const isDisabled = this.isDisabled(roomIds);
      const isSelected = this.isSelected(roomIds);
      return (
        <div class="ir-invoice__service" key={group.order}>
          <wa-checkbox
            disabled={isDisabled}
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
                    <div class="ir-invoice__room-info">
                      <p>
                        <b>{room.roomtype.name}</b>
                        <span>{room.rateplan.short_name}</span>
                      </p>
                      {this.getDateView(room.from_date, room.to_date)}
                    </div>
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

    if (this.viewMode === 'invoice' && ids.some(id => this.notInvoiceableItemKeys.has(id))) {
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

  private isDisabled(systemIds: (number | undefined)[] = []) {
    if (this.viewMode === 'proforma' || !systemIds?.length) {
      return false;
    }
    return systemIds.some(id => typeof id === 'number' && this.notInvoiceableItemKeys.has(id));
  }

  private renderPickup() {
    const sysId = this.booking.pickup_info?.['system_id'];
    if (!this.invoicableKey?.has(sysId)) {
      return null;
    }
    const isSelected = this.isSelected([sysId]);
    const isDisabled = this.isDisabled([sysId]);

    return (
      <div class="ir-invoice__service">
        <wa-checkbox
          disabled={isDisabled}
          size="small"
          onchange={e => {
            const value = (e.target as any).checked;
            this.handleCheckChange({ checked: value, system_id: sysId });
          }}
          defaultChecked={isSelected}
          checked={isSelected}
          class="ir-invoice__checkbox"
        >
          <div class="ir-invoice__room-checkbox-container">
            <div class={'ir-invoice__room-info'}>
              <span>Pickup</span>
              {this.getDateView(this.booking.pickup_info.date, null)}
            </div>
            <span class="ir-invoice__checkbox-price">{formatAmount(this.booking.currency.symbol, this.booking.pickup_info.selected_option.amount)}</span>
          </div>
        </wa-checkbox>
      </div>
    );
  }

  private renderCancellationPenalty() {
    const cancellationPenalty = this.booking.financial.payments?.find(p => p.payment_type?.code === '013');
    if (!cancellationPenalty) {
      return null;
    }
    const sysId = cancellationPenalty.id;
    if (!this.invoicableKey.has(sysId)) {
      return null;
    }
    const item = this.invoicableKey.get(sysId);
    const isSelected = this.isSelected([sysId]);
    const isDisabled = this.isDisabled([sysId]);
    return (
      <div class="ir-invoice__service">
        <wa-checkbox
          disabled={isDisabled}
          size="small"
          onchange={e => {
            const value = (e.target as any).checked;
            this.handleCheckChange({ checked: value, system_id: sysId });
          }}
          defaultChecked={isSelected}
          checked={isSelected}
          class="ir-invoice__checkbox"
        >
          <div class="ir-invoice__room-checkbox-container">
            <div class={'ir-invoice__room-info'}>
              <span>Cancellation penalty</span>
              {this.getDateView(cancellationPenalty.date, null)}
            </div>
            <span class="ir-invoice__checkbox-price">{formatAmount(this.booking.currency.symbol, item.amount)}</span>
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
            const shouldCreateProforma = this.viewMode === 'proforma' || submitter?.value === 'pro-forma';
            this.handleConfirmInvoice(shouldCreateProforma);
          }}
          class="ir-invoice__container"
        >
          <ir-custom-date-picker
            onDateChanged={e => {
              this.invoiceDate = e.detail.start;
              this.setUpDisabledItems();
            }}
            label="Date"
            date={this.invoiceDate.format('YYYY-MM-DD')}
            minDate={this.getMinDate()}
            maxDate={this.getMaxDate()}
          ></ir-custom-date-picker>
          <ir-booking-billing-recipient onRecipientChange={e => (this.selectedRecipient = e.detail)} booking={this.booking}></ir-booking-billing-recipient>
          <div class={'ir-invoice__services'}>
            <p class="ir-invoice__form-control-label">
              Choose what to invoice <span style={{ color: 'var(--wa-color-gray-60)', paddingLeft: '0.5rem' }}> (Disabled services are not eligible to be invoiced yet)</span>
            </p>

            <div class="ir-invoice__services-container">
              {this.invoicableKey.size === 0 && <ir-empty-state style={{ marginTop: '3rem' }}></ir-empty-state>}
              {this.renderRooms()}
              {this.booking.pickup_info && this.renderPickup()}
              {this.booking.extra_services?.map(extra_service => {
                const sysId = extra_service.system_id;
                if (!this.invoicableKey?.has(sysId)) {
                  return null;
                }
                const isSelected = this.isSelected([sysId]);
                const isDisabled = this.isDisabled([sysId]);
                return (
                  <div key={extra_service.system_id} class="ir-invoice__service">
                    <wa-checkbox
                      disabled={isDisabled}
                      size="small"
                      onchange={e => {
                        const value = (e.target as any).checked;
                        this.handleCheckChange({ checked: value, system_id: sysId });
                      }}
                      defaultChecked={isSelected}
                      class="ir-invoice__checkbox"
                      checked={isSelected}
                    >
                      <div class="ir-invoice__room-checkbox-container">
                        <div class={'ir-invoice__room-info'}>
                          <span>{extra_service.description}</span>
                          {this.getDateView(extra_service.start_date, extra_service.end_date)}
                        </div>
                        <span class="ir-invoice__checkbox-price">{formatAmount(this.booking.currency.symbol, extra_service.price)}</span>
                      </div>
                    </wa-checkbox>
                  </div>
                );
              })}
              {this.renderCancellationPenalty()}
            </div>
          </div>
        </form>
      </Host>
    );
  }
}

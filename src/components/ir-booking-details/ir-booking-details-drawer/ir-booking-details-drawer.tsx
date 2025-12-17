import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';

/**
 * Booking Details Drawer
 *
 * This component wraps the `ir-booking-details` component inside an `ir-drawer`.
 * It is responsible for handling drawer visibility and emitting a single
 * close event when the drawer is dismissed from any source.
 */
@Component({
  tag: 'ir-booking-details-drawer',
  styleUrl: 'ir-booking-details-drawer.css',
  scoped: true,
})
export class IrBookingDetailsDrawer {
  /**
   * Controls whether the drawer is open.
   */
  @Prop({ reflect: true }) open: boolean;

  /**
   * Property ID associated with the booking.
   */
  @Prop() propertyId: number;

  /**
   * Authentication or session ticket.
   */
  @Prop() ticket: string;

  /**
   * Language code used for localization.
   * Defaults to English (`en`).
   */
  @Prop() language: string = 'en';

  /**
   * Booking reference number.
   */
  @Prop() bookingNumber: string;

  /**
   * Emitted when the booking details drawer is closed.
   */
  @Event() bookingDetailsDrawerClosed: EventEmitter<void>;

  /**
   * Handles closing the drawer.
   *
   * This method is used for all close interactions (drawer hide,
   * close button, or programmatic close) to ensure a single source
   * of truth for the close behavior.
   */
  private handleClose = (e?: Event) => {
    if (e) {
      e.stopImmediatePropagation();
      e.stopPropagation();
    }
    this.bookingDetailsDrawerClosed.emit();
  };

  render() {
    return (
      <ir-drawer
        onDrawerHide={this.handleClose}
        withoutHeader
        open={this.open}
        style={{
          '--ir-drawer-width': '80rem',
          '--ir-drawer-background-color': '#F2F3F8',
          '--ir-drawer-padding-left': '0',
          '--ir-drawer-padding-right': '0',
          '--ir-drawer-padding-top': '0',
          '--ir-drawer-padding-bottom': '0',
        }}
      >
        {this.open && (
          <ir-booking-details
            hasPrint
            hasReceipt
            hasCloseButton
            onCloseSidebar={this.handleClose}
            is_from_front_desk
            propertyid={this.propertyId as any}
            hasRoomEdit
            hasRoomDelete
            bookingNumber={this.bookingNumber.toString()}
            ticket={this.ticket}
            language={this.language}
            hasRoomAdd
          />
        )}
      </ir-drawer>
    );
  }
}

import { _formatTime } from '@/components/ir-booking-details/functions';
import { Booking } from '@/models/booking.dto';
import { formatAmount } from '@/utils/utils';
import { Component, Prop, h } from '@stencil/core';
import moment from 'moment';

@Component({
  tag: 'ir-printing-pickup',
  styleUrl: 'ir-printing-pickup.css',
  shadow: true,
})
export class IrPrintingPickup {
  /** Pickup information attached to the booking */
  @Prop() pickup: Booking['pickup_info'];

  render() {
    if (!this.pickup) {
      return null;
    }

    return (
      <section class="ir-print-pickup">
        <p class="ir-print-pickup__title">Yes, from {this.pickup.selected_option.location.description}</p>

        <div class="ir-print-pickup__content">
          {/* Arrival info */}
          <div class="ir-print-pickup__row">
            <ir-printing-label label="Arrival date:" content={moment(this.pickup.date).format('dddd, DD MMM YYYY')} />

            <ir-printing-label label="Arrival time:" content={_formatTime(this.pickup.hour.toString(), this.pickup.minute.toString())} />

            <ir-printing-label label="Flight details:" content={this.pickup.details} />
          </div>

          {/* Vehicle & pricing */}
          <div class="ir-print-pickup__row ir-print-pickup__row--secondary">
            <p class="ir-print-pickup__vehicle">
              {this.pickup.selected_option.vehicle.description}
              <span class="ir-print-pickup__vehicle-separator"> – </span>
              {formatAmount(this.pickup.selected_option.currency.symbol, this.pickup.selected_option.amount)}
            </p>

            <ir-printing-label label="Number of vehicles:" content={this.pickup.nbr_of_units?.toString()} />

            <ir-printing-label label="Due upon booking:" content={formatAmount(this.pickup.currency.symbol, this.pickup.total)} />
          </div>
        </div>
      </section>
    );
  }
}

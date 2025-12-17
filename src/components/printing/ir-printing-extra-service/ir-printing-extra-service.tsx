import { Booking } from '@/models/booking.dto';
import { formatAmount } from '@/utils/utils';
import { Component, Fragment, Prop, h } from '@stencil/core';
import moment from 'moment';

@Component({
  tag: 'ir-printing-extra-service',
  styleUrl: 'ir-printing-extra-service.css',
  shadow: true,
})
export class IrPrintingExtraService {
  /** Extra services attached to the booking */
  @Prop() extraServices: Booking['extra_services'];

  /** Booking currency */
  @Prop() currency: Booking['currency'];

  @Prop() invocableKeys: Set<string | number>;

  render() {
    return (
      <section class="ir-print-extra-services">
        <h3 class="ir-print-extra-services__title">Extra services</h3>

        <div class="ir-print-extra-services__list">
          {this.extraServices?.map(service => {
            if (!this.invocableKeys.has(service.system_id)) {
              return null;
            }
            return (
              <div key={`service_${service.system_id}`} class="ir-print-extra-services__item">
                {/* Description + dates */}
                <div class="ir-print-extra-services__details">
                  <ir-printing-label display="inline" label="" class="ir-print-extra-services__description" content={service.description} />

                  {(service.start_date || service.end_date) && (
                    <div class="ir-print-extra-services__dates">
                      <span class="ir-print-extra-services__date-wrapper">
                        (
                        {service.start_date && (
                          <ir-printing-label class="ir-print-extra-services__date" label="" content={moment(service.start_date).format('dddd, DD MMM YYYY')} />
                        )}
                        {service.end_date && (
                          <Fragment>
                            <span class="ir-print-extra-services__date-separator">–</span>
                            <ir-printing-label class="ir-print-extra-services__date" label="" content={moment(service.end_date).format('dddd, DD MMM YYYY')} />
                          </Fragment>
                        )}
                        )
                      </span>
                    </div>
                  )}
                </div>

                {/* Price */}
                <div class="ir-print-extra-services__price">{formatAmount(this.currency?.symbol, service?.price || 0)}</div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }
}

import { isRequestPending } from '@/stores/ir-interceptor.store';
import { Component, Fragment, Prop, State, h } from '@stencil/core';
import { BookingService, ExposedBookingEvent } from '@/services/booking.service';
import locales from '@/stores/locales.store';

@Component({
  tag: 'ir-events-log',
  styleUrl: 'ir-events-log.css',
  scoped: true,
})
export class IrEventsLog {
  @Prop() bookingNumber: string;

  @State() bookingEvents: ExposedBookingEvent[];

  private bookingService = new BookingService();

  componentWillLoad() {
    this.init();
  }

  private async init() {
    try {
      this.bookingEvents = await this.bookingService.getExposedBookingEvents(this.bookingNumber);
    } catch (error) {
      console.error(error);
    }
  }

  render() {
    return (
      <div class="p-1">
        <div class="d-flex  align-items-center" style={{ gap: '0.5rem' }}>
          <h3 class=" text-left p-0 m-0  dialog-title ">{locales.entries.Lcz_EventsLog}</h3>
          {/* <span class="m-0 beta">Beta</span> */}
        </div>

        {isRequestPending('/Get_Exposed_Booking_Events') ? (
          <div class={'d-flex align-items-center justify-content-center dialog-container-height'}>
            <ir-spinner></ir-spinner>
          </div>
        ) : (
          <Fragment>
            <table class=" dialog-container-height">
              <thead style={{ opacity: '0' }}>
                <tr>
                  <th>date</th>
                  <th>user</th>
                  <th>status</th>
                </tr>
              </thead>
              <tbody>
                {this.bookingEvents?.map(e => (
                  <tr key={e.id} class="pb-1">
                    <td class="event-row dates-row">
                      <span>{e.date}</span>
                      <span>
                        {String(e.hour).padStart(2, '0')}:{String(e.minute).padStart(2, '0')}:{String(e.second).padStart(2, '0')}
                      </span>
                    </td>
                    <td class="pl-3 event-row ">{e.type}</td>
                    <td class="pl-1 event-row ">{e.user}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Fragment>
        )}
      </div>
    );
  }
}

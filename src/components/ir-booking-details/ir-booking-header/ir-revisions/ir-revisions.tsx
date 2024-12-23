import { isRequestPending } from '@/stores/ir-interceptor.store';
import { Component, Fragment, Prop, State, h } from '@stencil/core';
import { BookingService, ExposedBookingEvent } from '@/services/booking.service';

@Component({
  tag: 'ir-revisions',
  styleUrl: 'ir-revisions.css',
  scoped: true,
})
export class IrRevisions {
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
        <div class="d-flex mb-1 align-items-center" style={{ gap: '0.5rem' }}>
          <h3 class=" text-left p-0 m-0  dialog-title ">Revisions</h3>
          <span class="m-0 beta">Beta</span>
        </div>

        {isRequestPending('/Get_Exposed_Booking_Events') ? (
          <div class={'d-flex align-items-center justify-content-center dialog-container-height'}>
            <ir-spinner></ir-spinner>
          </div>
        ) : (
          <Fragment>
            <div class=" dialog-container-height">
              {this.bookingEvents?.length === 0 && <p>No Revisions Found</p>}
              {this.bookingEvents?.map(e => (
                <div key={e.id} class={'d-flex align-items-center justify-content-between'}>
                  <div class="d-flex align-items-center justify-content-between">
                    <p>{e.date}</p>
                    <p class="ml-1">
                      {String(e.hour).padStart(2, '0')}:{String(e.minute).padStart(2, '0')}:{String(e.second).padStart(2, '0')}
                    </p>
                  </div>
                  <p>{e.type}</p>
                </div>
              ))}
            </div>
          </Fragment>
        )}
      </div>
    );
  }
}

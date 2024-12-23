import { Component, h, Prop, State } from '@stencil/core';
import { _formatTime } from '../../functions';
import locales from '@/stores/locales.store';
import { IPmsLog } from '@/models/booking.dto';
import { isRequestPending } from '@/stores/ir-interceptor.store';
import { BookingService } from '@/services/booking.service';

@Component({
  tag: 'ir-pms-logs',
  styleUrl: 'ir-pms-logs.css',
  scoped: true,
})
export class IrPmsLogs {
  @Prop() bookingNumber: string;

  @State() pmsLogs: IPmsLog;

  private bookingService = new BookingService();

  componentWillLoad() {
    this.init();
  }

  private async init() {
    try {
      this.pmsLogs = await this.bookingService.fetchPMSLogs(this.bookingNumber);
    } catch (error) {
      console.error(error);
    }
  }

  render() {
    return (
      <div class="p-1">
        <h3 class=" text-left mb-1 dialog-title ">{locales.entries.Lcz_PMS_Logs}</h3>

        {isRequestPending('/Get_Exposed_PMS_Logs') ? (
          <div class={'d-flex align-items-center justify-content-center dialog-container-height'}>
            <ir-spinner></ir-spinner>
          </div>
        ) : (
          <div class={'dialog-container-height'}>
            <div class="d-flex align-items-center pb-1">
              <p class="list-title p-0 m-0">{locales.entries.Lcz_SentAt}</p>
              {this.pmsLogs?.sent_date ? (
                <p class="list-item">
                  {this.pmsLogs?.sent_date} {_formatTime(this.pmsLogs?.sent_hour.toString(), this.pmsLogs?.sent_minute.toString())}
                </p>
              ) : (
                <p class={`list-item ${this.pmsLogs?.sent_date ? 'green' : 'red'}`}>{this.pmsLogs?.is_acknowledged ? locales.entries.Lcz_YES : locales.entries.Lcz_NO}</p>
              )}
            </div>
            <div class="d-flex align-items-center p-0 m-0">
              <h4 class="list-title p-0 m-0">{locales.entries.Lcz_Acknowledged}</h4>
              <p class={`list-item  ${this.pmsLogs?.is_acknowledged ? 'green' : 'red'}`}>{this.pmsLogs?.is_acknowledged ? locales.entries.Lcz_YES : locales.entries.Lcz_NO}</p>
            </div>
          </div>
        )}
      </div>
    );
  }
}

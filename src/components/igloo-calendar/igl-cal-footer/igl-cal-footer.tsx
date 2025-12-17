import locales from '@/stores/locales.store';
import { isWeekend } from '@/utils/utils';
import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';
import moment from 'moment';

@Component({
  tag: 'igl-cal-footer',
  styleUrl: 'igl-cal-footer.css',
  scoped: true,
})
export class IglCalFooter {
  @Event() optionEvent: EventEmitter<{ [key: string]: any }>;
  @Prop() calendarData: { [key: string]: any };
  @Prop() isLegendOpen: boolean = false;
  @Prop() today: String;
  @Prop() highlightedDate: string;

  private _today = moment().format('YYYY-MM-DD');

  // private isOnline:boolean = false;

  handleOptionEvent(key, data = '') {
    this.optionEvent.emit({ key, data });
  }

  render() {
    return (
      <Host class="footerContainer">
        <div class="footerCell bottomLeftCell align-items-center preventPageScroll" style={{ paddingLeft: '10px' }}>
          <button class="m-0 p-0 btn btn-sm  legendBtn d-flex align-items-center" style={{ gap: '0.25rem' }} onClick={() => this.handleOptionEvent('showLegend')}>
            {this.isLegendOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" height={16} width={16}>
                <path
                  fill="currentColor"
                  d="M105.4 297.4C92.9 309.9 92.9 330.2 105.4 342.7L265.4 502.7C277.9 515.2 298.2 515.2 310.7 502.7C323.2 490.2 323.2 469.9 310.7 457.4L173.3 320L310.6 182.6C323.1 170.1 323.1 149.8 310.6 137.3C298.1 124.8 277.8 124.8 265.3 137.3L105.3 297.3zM457.4 137.4L297.4 297.4C284.9 309.9 284.9 330.2 297.4 342.7L457.4 502.7C469.9 515.2 490.2 515.2 502.7 502.7C515.2 490.2 515.2 469.9 502.7 457.4L365.3 320L502.6 182.6C515.1 170.1 515.1 149.8 502.6 137.3C490.1 124.8 469.8 124.8 457.3 137.3z"
                />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" height={16} width={16}>
                <path
                  fill="currentColor"
                  d="M535.1 342.6C547.6 330.1 547.6 309.8 535.1 297.3L375.1 137.3C362.6 124.8 342.3 124.8 329.8 137.3C317.3 149.8 317.3 170.1 329.8 182.6L467.2 320L329.9 457.4C317.4 469.9 317.4 490.2 329.9 502.7C342.4 515.2 362.7 515.2 375.2 502.7L535.2 342.7zM183.1 502.6L343.1 342.6C355.6 330.1 355.6 309.8 343.1 297.3L183.1 137.3C170.6 124.8 150.3 124.8 137.8 137.3C125.3 149.8 125.3 170.1 137.8 182.6L275.2 320L137.9 457.4C125.4 469.9 125.4 490.2 137.9 502.7C150.4 515.2 170.7 515.2 183.2 502.7z"
                />
              </svg>
            )}
            <span>{locales.entries.Lcz_Legend}</span>
            <span>v1.07</span>
            <ir-new-badge style={{ marginLeft: '0.25rem' }}></ir-new-badge>
          </button>
          {/* <div class={`${this.isOnline ? 'isOnline' : 'isOffline'}`}>
            <i class="la la-share-alt isOffline"></i><span>{this.isOnline ? "Connected": "Offline"}</span>
          </div> */}
        </div>

        {this.calendarData.days.map(dayInfo => (
          <div class="footerCell align-items-center">
            <div
              class={{
                'dayTitle full-height align-items-center': true,
                'weekend': isWeekend(dayInfo.value),
                'currentDay': dayInfo.value === this._today || this.highlightedDate === dayInfo.day,
              }}
            >
              {dayInfo.dayDisplayName}
            </div>

            {/* <div class="dayTitle">{dayInfo.dayDisplayName}</div>
              <div class="dayCapacityPercent">28.57%</div>
              <div class="preventPageScroll">
                <span class="badge badge-primary badge-pill">
                  {index}
                </span>
              </div> */}
          </div>
        ))}
      </Host>
    );
  }
}

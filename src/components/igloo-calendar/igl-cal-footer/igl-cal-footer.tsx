import locales from '@/stores/locales.store';
import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'igl-cal-footer',
  styleUrl: 'igl-cal-footer.css',
  scoped: true,
})
export class IglCalFooter {
  @Event() optionEvent: EventEmitter<{ [key: string]: any }>;
  @Prop() calendarData: { [key: string]: any };
  @Prop() today: String;
  @Prop() highlightedDate: string;

  // private isOnline:boolean = false;

  handleOptionEvent(key, data = '') {
    this.optionEvent.emit({ key, data });
  }

  render() {
    return (
      <Host class="footerContainer">
        <div class="footerCell bottomLeftCell align-items-center preventPageScroll">
          <div class="legendBtn" onClick={() => this.handleOptionEvent('showLegend')}>
            <i class="la la-square"></i>
            <u>{locales.entries.Lcz_Legend}</u>
            <span> - v24</span>
          </div>
          {/* <div class={`${this.isOnline ? 'isOnline' : 'isOffline'}`}>
            <i class="la la-share-alt isOffline"></i><span>{this.isOnline ? "Connected": "Offline"}</span>
          </div> */}
        </div>
        {this.calendarData.days.map(dayInfo => (
          <div class="footerCell align-items-center">
            <div class={`dayTitle full-height align-items-center ${dayInfo.day === this.today || this.highlightedDate === dayInfo.day ? 'currentDay' : ''}`}>
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

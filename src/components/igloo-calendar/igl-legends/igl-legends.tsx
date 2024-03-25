import locales from '@/stores/locales.store';
import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';

@Component({
  tag: 'igl-legends',
  styleUrl: 'igl-legends.css',
  scoped: true,
})
export class IglLegends {
  @Event() optionEvent: EventEmitter<{ [key: string]: any }>;
  @Prop() legendData: { [key: string]: any };
  handleOptionEvent(key, data = '') {
    this.optionEvent.emit({ key, data });
  }

  render() {
    return (
      <Host class="legendContainer pr-1 text-left">
        <div class={'w-full'}>
          <div class={'w-full'}>
            <div class="stickyHeader pt-1 ">
              <p class="legendHeader">{locales.entries.Lcz_Legend}</p>
              <div class="legendCloseBtn" onClick={() => this.handleOptionEvent('closeSideMenu')}>
                {/* <i class="ft-chevrons-left"></i> */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" height={18} width={18}>
                  <path
                    fill="#6b6f82"
                    d="M41.4 233.4c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L109.3 256 246.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-160 160zm352-160l-160 160c-12.5 12.5-12.5 32.8 0 45.3l160 160c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L301.3 256 438.6 118.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0z"
                  />
                </svg>
              </div>
              <hr />
            </div>
            <div class="mt-2 pl-1">
              {this.legendData.map(legendInfo => (
                <div class="legendRow ">
                  <div class={`legend_${legendInfo.design} mr-1`} style={{ backgroundColor: legendInfo.color }}></div>
                  <span class="font-small-3">{legendInfo.name}</span>
                </div>
              ))}
            </div>
            <hr />
            <div class="mt-2">
              <div class="legendCalendar">
                <div class="legendRow align-items-center">
                  <div class="legendCal br-t br-s br-bt">
                    <strong>MAR 2022</strong>
                  </div>
                  <div class="highphenLegend">{locales.entries.Lcz_MonthAndYear}</div>
                </div>
                <div class="legendRow">
                  <div class="legendCal headerCell align-items-center br-s">
                    <span class="badge badge-info  badge-pill">3</span>
                  </div>
                  <div class="highphenLegend">
                    <div>{locales.entries.Lcz_UnassignedUnits}</div>
                  </div>
                </div>
                <div class="legendRow">
                  <div class="legendCal dayTitle br-s">Fri 18</div>
                  <div class="highphenLegend">{locales.entries.Lcz_Date}</div>
                </div>
                <div class="legendRow">
                  <div class="legendCal br-s br-bt dayCapacityPercent">15%</div>
                  <div class="highphenLegend">{locales.entries.Lcz_Occupancy}</div>
                </div>
                <div class="legendRow">
                  <div class="legendCal br-s br-bt  font-weight-bold total-availability">20</div>
                  <div class="highphenLegend">{locales.entries.Lcz_TotalAvailability}</div>
                </div>
                {/* <div class="legendRow align-items-center">
                  <div class="legendCal br-s br-bt font-small-2">15</div>
                  <div class="highphenLegend">
                    <div>{locales.entries.Lcz_OfflineAvailability}</div>
                  </div>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </Host>
    );
  }
}

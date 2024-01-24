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
        <div>
          <div>
            <div class="stickyHeader">
              <div class="legendHeader pt-1">{locales.entries.Lcz_Legend}</div>
              <div class="legendCloseBtn pt-1" onClick={() => this.handleOptionEvent('closeSideMenu')}>
                <i class="ft-chevrons-left"></i>
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
                  <div class="legendCal pl-2 pr-2 br-s">
                    <span class="badge badge-info pointer badge-pill">3</span>
                  </div>
                  <div class="highphenLegend">
                    <div>{locales.entries.Lcz_UnassignedUnits}</div>
                  </div>
                </div>
                <div class="legendRow">
                  <div class="legendCal br-s">FRI 18</div>
                  <div class="highphenLegend">{locales.entries.Lcz_Date}</div>
                </div>
                <div class="legendRow">
                  <div class="legendCal br-s br-bt font-small-3">15%</div>
                  <div class="highphenLegend">{locales.entries.Lcz_Occupancy}</div>
                </div>
                <div class="legendRow">
                  <div class="legendCal br-s br-bt font-small-3">20</div>
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

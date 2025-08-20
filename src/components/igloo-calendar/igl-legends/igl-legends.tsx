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
              <table>
                {this.legendData.map(legendInfo => {
                  console.log(legendInfo);
                  return (
                    <tr key={`legend_${legendInfo.id}`} class="legendRow ">
                      <td>
                        {legendInfo.design === 'broom' ? (
                          <svg xmlns="http://www.w3.org/2000/svg" height="12" width="13.5" viewBox="0 0 576 512" style={{ display: 'block' }}>
                            <path
                              fill="black"
                              d="M566.6 54.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192-34.7-34.7c-4.2-4.2-10-6.6-16-6.6c-12.5 0-22.6 10.1-22.6 22.6l0 29.1L364.3 320l29.1 0c12.5 0 22.6-10.1 22.6-22.6c0-6-2.4-11.8-6.6-16l-34.7-34.7 192-192zM341.1 353.4L222.6 234.9c-42.7-3.7-85.2 11.7-115.8 42.3l-8 8C76.5 307.5 64 337.7 64 369.2c0 6.8 7.1 11.2 13.2 8.2l51.1-25.5c5-2.5 9.5 4.1 5.4 7.9L7.3 473.4C2.7 477.6 0 483.6 0 489.9C0 502.1 9.9 512 22.1 512l173.3 0c38.8 0 75.9-15.4 103.4-42.8c30.6-30.6 45.9-73.1 42.3-115.8z"
                            />
                          </svg>
                        ) : legendInfo.design === 'check' ? (
                          <svg height={14} width={14} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                            <path
                              fill="green"
                              d="M530.8 134.1C545.1 144.5 548.3 164.5 537.9 178.8L281.9 530.8C276.4 538.4 267.9 543.1 258.5 543.9C249.1 544.7 240 541.2 233.4 534.6L105.4 406.6C92.9 394.1 92.9 373.8 105.4 361.3C117.9 348.8 138.2 348.8 150.7 361.3L252.2 462.8L486.2 141.1C496.6 126.8 516.6 123.6 530.9 134z"
                            />
                          </svg>
                        ) : (
                          <div class={`legend_${legendInfo.design}`} style={{ backgroundColor: legendInfo.color }}></div>
                        )}
                      </td>
                      <td>
                        <span class="font-small-3">{legendInfo.name}</span>
                      </td>
                    </tr>
                  );
                })}
              </table>
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

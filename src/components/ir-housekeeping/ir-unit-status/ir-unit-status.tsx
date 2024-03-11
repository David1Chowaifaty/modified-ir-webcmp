import { IInspectionMode } from '@/models/housekeeping';
import { HouseKeepingService } from '@/services/housekeeping.service';
import housekeeping_store from '@/stores/housekeeping.store';
import locales from '@/stores/locales.store';
import { Component, Event, EventEmitter, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-unit-status',
  styleUrl: 'ir-unit-status.css',
  scoped: true,
})
export class IrUnitStatus {
  private housekeepingService = new HouseKeepingService();
  @Event() resetData: EventEmitter<null>;
  componentWillLoad() {
    this.housekeepingService.setToken(housekeeping_store.default_properties.token);
  }
  async handleSelectChange(e: CustomEvent) {
    try {
      e.stopPropagation();
      e.stopImmediatePropagation();
      const window = e.detail;
      let mode: IInspectionMode;
      if (window === '') {
        mode = {
          is_active: true,
          window: -1,
        };
      } else {
        mode = {
          is_active: true,
          window: +window,
        };
      }
      await this.housekeepingService.setExposedInspectionMode(housekeeping_store.default_properties.property_id, mode);
      this.resetData.emit(null);
    } catch (error) {
      console.error(error);
    }
  }
  render() {
    return (
      <Host class="card p-1">
        <ir-title label={locales.entries.Lcz_RoomOrUnitStatus}></ir-title>
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>{locales.entries.Lcz_Status}</th>
                <th class={'text-center'}>{locales.entries.Lcz_Code}</th>
                <th>{locales.entries.Lcz_Action}</th>
              </tr>
            </thead>
            <tbody>
              {housekeeping_store.hk_criteria.statuses?.map(status => (
                <tr key={status.code}>
                  <td>
                    <div class="status-container">
                      <span class={`circle ${status.style.shape} ${status.style.color}`}></span>
                      <p>{status.description}</p>
                    </div>
                  </td>
                  <td>{status.code}</td>
                  <td>
                    <div class="action-container">
                      <p class={'m-0'}>{status.action}</p>
                      {status.inspection_mode?.is_active && (
                        <div>
                          <ir-select
                            selectedValue={status.inspection_mode?.window.toString()}
                            LabelAvailable={false}
                            firstOption={locales.entries.Lcz_No}
                            onSelectChange={this.handleSelectChange.bind(this)}
                            data={Array.from(Array(7 + 1), (_, i) => i).map(i => {
                              const text =
                                i === 0
                                  ? locales.entries.Lcz_YesOnTheSameDay
                                  : i === 1
                                  ? locales.entries.Lcz_DayPrior.replace('%1', i.toString())
                                  : locales.entries.Lcz_DaysPrior.replace('%1', i.toString());
                              return {
                                text,
                                value: i.toString(),
                              };
                            })}
                          ></ir-select>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Host>
    );
  }
}

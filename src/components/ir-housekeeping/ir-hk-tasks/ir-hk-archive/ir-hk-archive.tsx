// import { HouseKeepingService } from '@/services/housekeeping.service';
// import housekeeping_store from '@/stores/housekeeping.store';
import { ArchivedTask } from '@/models/housekeeping';
import { HouseKeepingService } from '@/services/housekeeping.service';
import calendar_data from '@/stores/calendar-data';
import housekeeping_store from '@/stores/housekeeping.store';
import { isRequestPending } from '@/stores/ir-interceptor.store';
import locales from '@/stores/locales.store';
import { downloadFile } from '@/utils/utils';
import { Component, Fragment, Host, Listen, Prop, State, h } from '@stencil/core';
import moment from 'moment';
import { v4 } from 'uuid';
export type ArchivesFilters = {
  from_date: string;
  to_date: string;
  filtered_by_hkm?: number[];
  filtered_by_unit?: number[];
};
@Component({
  tag: 'ir-hk-archive',
  styleUrl: 'ir-hk-archive.css',
  scoped: true,
})
export class IrHkArchive {
  @Prop() propertyId: string | number;
  @Prop() language: string = 'en';
  @Prop() ticket: string;

  @State() filters: ArchivesFilters = {
    from_date: null,
    to_date: null,
    filtered_by_hkm: [],
    filtered_by_unit: [],
  };
  @State() data: (ArchivedTask & { id: string })[] = [];
  @State() isLoading: 'search' | 'excel' | null = null;
  @State() fetchedData: boolean = false;
  @State() selectedBooking: number | string | null;
  private minSelectableDate = moment().subtract(90, 'days').toDate();
  private houseKeepingService = new HouseKeepingService();
  private units: { id: number; name: string }[] = [];
  private handleSideBarToggle(e) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.selectedBooking = null;
  }

  componentWillLoad() {
    this.setUpUnits();
  }
  private setUpUnits() {
    const units = [];
    calendar_data.roomsInfo.forEach(r => {
      r.physicalrooms.forEach(room => {
        units.push({ id: room.id, name: room.name });
      });
    });
    this.units = units;
  }

  private async getArchivedTasks(export_to_excel: boolean = false) {
    const res = await this.houseKeepingService.getArchivedHKTasks({ property_id: Number(this.propertyId), ...this.filters, is_export_to_excel: export_to_excel });
    this.data = [...(res?.tasks || [])]?.map(t => ({ ...t, id: v4() }));
    this.fetchedData = true;
    return { tasks: res?.tasks, url: res?.url };
  }

  @Listen('dateRangeChanged')
  handleDateRangeChange(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const { fromDate, toDate } = e.detail;
    this.updateFilters({
      from_date: fromDate ? fromDate.format('YYYY-MM-DD') : null,
      to_date: toDate ? toDate.format('YYYY-MM-DD') : null,
    });
  }

  private updateFilters(props: Partial<ArchivesFilters>) {
    this.filters = { ...this.filters, ...props };
  }
  async searchArchive(e: CustomEvent) {
    try {
      e.stopImmediatePropagation();
      e.stopPropagation();
      this.isLoading = 'search';
      await this.getArchivedTasks();
    } catch (error) {
      console.log(error);
    } finally {
      this.isLoading = null;
    }
  }

  async exportArchive(e: CustomEvent) {
    try {
      e.stopImmediatePropagation();
      e.stopPropagation();
      this.isLoading = 'excel';
      const { url } = await this.getArchivedTasks(true);
      downloadFile(url);
    } catch (error) {
      console.log(error);
    } finally {
      this.isLoading = null;
    }
  }

  render() {
    return (
      <Host>
        <ir-title class="px-1" label="Cleaning Archives (90 days)" displayContext="sidebar"></ir-title>
        <section class="px-1">
          <div class="d-flex">
            <ir-select
              class="w-100"
              showFirstOption={false}
              LabelAvailable={false}
              data={[
                { text: 'All units', value: '000' },
                ,
                ...this.units
                  ?.map(v => ({
                    text: v.name,
                    value: v.id.toString(),
                  }))
                  .sort((a, b) => a.text.toLowerCase().localeCompare(b.text.toLowerCase())),
              ]}
              onSelectChange={e => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                if (e.detail === '000') {
                  this.updateFilters({ filtered_by_unit: [] });
                } else {
                  this.updateFilters({ filtered_by_unit: [e.detail] });
                }
              }}
            ></ir-select>
            {housekeeping_store?.hk_criteria?.housekeepers.length > 1 && (
              <ir-select
                class="ml-1 w-100"
                selectedValue={this.filters?.filtered_by_hkm?.length === housekeeping_store.hk_criteria.housekeepers.length ? '000' : this.filters?.filtered_by_hkm[0]?.toString()}
                LabelAvailable={false}
                showFirstOption={false}
                data={[
                  { text: 'All housekeepers', value: '000' },
                  ...housekeeping_store?.hk_criteria?.housekeepers
                    .map(v => ({
                      text: v.name,
                      value: v.id.toString(),
                    }))
                    .sort((a, b) => a.text.toLowerCase().localeCompare(b.text.toLowerCase())),
                ]}
                onSelectChange={e => {
                  if (e.detail === '000') {
                    this.updateFilters({ filtered_by_hkm: [] });
                  } else {
                    this.updateFilters({ filtered_by_hkm: [e.detail] });
                  }
                }}
              ></ir-select>
            )}
          </div>
          <div class="d-flex mt-1 align-items-center">
            {/* <igl-date-range
              class="mr-1"
              dateLabel={locales.entries.Lcz_Dates}
              minDate={moment().add(-90, 'days').format('YYYY-MM-DD')}
              defaultData={{
                fromDate: this.filters.from_date,
                toDate: this.filters.to_date,
              }}
            ></igl-date-range> */}
            <ir-range-picker
              minDate={this.minSelectableDate}
              class="mr-1"
              fromDate={this.filters.from_date ? moment(this.filters.from_date, 'YYYY-MM-DD') : null}
              toDate={this.filters.to_date ? moment(this.filters.to_date, 'YYYY-MM-DD') : null}
            ></ir-range-picker>
            <ir-button
              title={locales.entries?.Lcz_Search}
              variant="icon"
              icon_name="search"
              class="mr-1"
              isLoading={this.isLoading === 'search'}
              onClickHandler={e => this.searchArchive(e)}
            ></ir-button>
            <ir-button
              title={locales.entries?.Lcz_ExportToExcel}
              variant="icon"
              icon_name="file"
              isLoading={this.isLoading === 'excel'}
              onClickHandler={e => this.exportArchive(e)}
            ></ir-button>
          </div>
          {this.fetchedData && (
            <Fragment>
              {this.data?.length === 0 && !isRequestPending('/Get_Archived_HK_Tasks') ? (
                <p class={'text-center mt-2'}>{locales.entries.Lcz_NoResultsFound}</p>
              ) : (
                <table class="mt-2 table">
                  <thead>
                    <th class="pl-0">{locales.entries.Lcz_Period}</th>
                    <th>{locales.entries.Lcz_Housekeeper}</th>
                    <th>{locales.entries.Lcz_Unit}</th>
                    <th>{locales.entries.Lcz_BookingNumber}</th>
                  </thead>
                  <tbody>
                    {this.data?.map(d => (
                      <tr key={d.id}>
                        <td class="pl-0">{d.date}</td>
                        <td>{d.house_keeper}</td>
                        <td>
                          <ir-tooltip message={d.unit} customSlot containerStyle={{ width: 'fit-content' }}>
                            <span slot="tooltip-trigger" class={`unit-name`}>
                              {d.unit}
                            </span>
                          </ir-tooltip>
                        </td>
                        <td>
                          {d.booking_nbr ? (
                            <ir-button
                              btn_color="link"
                              btnStyle={{
                                width: 'fit-content',
                                padding: '0',
                                margin: '0',
                              }}
                              labelStyle={{
                                padding: '0',
                              }}
                              text={d.booking_nbr.toString()}
                              onClick={() => {
                                this.selectedBooking = d.booking_nbr;
                                // window.open(`https://x.igloorooms.com/manage/acbookingeditV2.aspx?BN=${d.booking_nbr}`, '_blank');
                              }}
                            ></ir-button>
                          ) : (
                            locales.entries.Lcz_WasVacant
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Fragment>
          )}
        </section>
        <ir-sidebar
          onIrSidebarToggle={this.handleSideBarToggle.bind(this)}
          open={!!this.selectedBooking}
          showCloseButton={false}
          sidebarStyles={{
            width: '80rem',
            background: '#F2F3F8',
          }}
        >
          {this.selectedBooking && (
            <ir-booking-details
              slot="sidebar-body"
              hasPrint
              hasReceipt
              hasCloseButton
              onCloseSidebar={() => (this.selectedBooking = null)}
              is_from_front_desk
              propertyid={Number(this.propertyId)}
              hasRoomEdit
              hasRoomDelete
              bookingNumber={this.selectedBooking?.toString()}
              language={this.language}
              hasRoomAdd
              ticket={this.ticket}
            ></ir-booking-details>
          )}
        </ir-sidebar>
      </Host>
    );
  }
}

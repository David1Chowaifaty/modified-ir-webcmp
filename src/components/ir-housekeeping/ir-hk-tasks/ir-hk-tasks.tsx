import { IPendingActions } from '@/models/housekeeping';
import Token from '@/models/Token';
import { HouseKeepingService } from '@/services/housekeeping.service';
import { RoomService } from '@/services/room.service';
import housekeeping_store from '@/stores/housekeeping.store';
import { isRequestPending } from '@/stores/ir-interceptor.store';
import locales from '@/stores/locales.store';
import { Component, Host, Prop, State, h, Element, Watch, Event, EventEmitter, Listen } from '@stencil/core';
import moment from 'moment';
import { v4 } from 'uuid';
import { TaskFilters } from './types';
import { downloadFile } from '@/utils/utils';
import { updateTasks as updateTasksStore, updateSelectedTasks, clearSelectedTasks, hkTasksStore, setLoading, updateTaskList } from '@/stores/hk-tasks.store';

@Component({
  tag: 'ir-hk-tasks',
  styleUrl: 'ir-hk-tasks.css',
  scoped: true,
})
export class IrHkTasks {
  @Element() el: HTMLElement;

  @Prop() language: string = '';
  @Prop() ticket: string = '';
  @Prop() propertyid: number;
  @Prop() p: string;
  @Prop() baseUrl: string;

  @State() isLoading = false;
  @State() selectedDuration = '';
  @State() selectedHouseKeeper = '0';
  @State() selectedRoom: IPendingActions | null = null;
  @State() archiveOpened = false;
  @State() property_id: number;
  @State() isSidebarOpen: boolean;
  @State() isApplyFiltersLoading: boolean;
  @State() filters: TaskFilters;

  @Event({ bubbles: true, composed: true }) clearSelectedHkTasks: EventEmitter<void>;

  private hkNameCache: Record<number, string> = {};
  private roomService = new RoomService();
  private houseKeepingService = new HouseKeepingService();
  private token = new Token();
  private table_sorting: Map<string, 'ASC' | 'DESC'> = new Map();
  private modal: HTMLIrModalElement;

  componentWillLoad() {
    if (this.baseUrl) {
      this.token.setBaseUrl(this.baseUrl);
    }
    if (this.ticket !== '') {
      this.token.setToken(this.ticket);
      this.init();
    }
  }

  @Watch('ticket')
  ticketChanged(newValue: string, oldValue: string) {
    if (newValue === oldValue) {
      return;
    }
    this.token.setToken(this.ticket);
    this.init();
  }

  @Listen('closeSideBar')
  handleCloseSidebar(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.isSidebarOpen = false;
  }
  @Listen('sortingChanged')
  handleSortingChanged(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const { field, direction } = e.detail;
    console.log(e.detail);
    if (field === 'date') {
      return;
    }
    this.table_sorting.set(field, direction);
  }

  private async init() {
    try {
      this.isLoading = true;
      setLoading(true);
      let propertyId = this.propertyid;
      if (!this.propertyid && !this.p) {
        throw new Error('Property ID or username is required');
      }
      // let roomResp = null;
      if (!propertyId) {
        console.log(propertyId);
        const propertyData = await this.roomService.getExposedProperty({
          id: 0,
          aname: this.p,
          language: this.language,
          is_backend: true,
          include_units_hk_status: true,
        });
        // roomResp = propertyData;
        propertyId = propertyData.My_Result.id;
      }
      this.property_id = propertyId;
      const requests = [
        this.houseKeepingService.getHkTasks({ property_id: this.property_id, from_date: moment().format('YYYY-MM-DD'), to_date: moment().format('YYYY-MM-DD') }),
        this.houseKeepingService.getExposedHKSetup(this.property_id),
        this.roomService.fetchLanguage(this.language),
      ];
      if (this.propertyid) {
        requests.push(
          this.roomService.getExposedProperty({
            id: this.propertyid,
            language: this.language,
            is_backend: true,
            include_units_hk_status: true,
          }),
        );
      }

      const results = await Promise.all(requests);
      const tasksResult = results[0] as any;
      updateTaskList();
      if (tasksResult?.tasks) {
        this.updateTasks(tasksResult.tasks);
      }
    } catch (error) {
      console.log(error);
    } finally {
      this.isLoading = false;
      setLoading(false);
    }
  }

  private buildHousekeeperNameCache() {
    this.hkNameCache = {};
    housekeeping_store.hk_criteria?.housekeepers?.forEach(hk => {
      if (hk.id != null && hk.name != null) {
        this.hkNameCache[hk.id] = hk.name;
      }
    });
  }

  private updateTasks(tasks: any[]) {
    this.buildHousekeeperNameCache();
    updateTasksStore(
      tasks.map(t => ({
        ...t,
        id: v4(),
        housekeeper: (() => {
          const name = this.hkNameCache[t.hkm_id];
          if (name) {
            return name;
          }
          const hkName = housekeeping_store.hk_criteria?.housekeepers?.find(hk => hk.id === t.hkm_id)?.name;
          this.hkNameCache[t.hkm_id] = hkName;
          return hkName;
        })(),
      })),
    );
  }
  @Listen('headerButtonPress')
  async handleHeaderButtonPress(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const { name } = e.detail;
    switch (name) {
      case 'cleaned':
        this.modal?.openModal();
        break;
      case 'export':
        const sortingArray: { key: string; value: string }[] = Array.from(this.table_sorting.entries()).map(([key, value]) => ({
          key,
          value,
        }));
        console.log(sortingArray);
        const { url } = await this.fetchTasksWithFilters(true);
        downloadFile(url);
        break;
      case 'archive':
        this.isSidebarOpen = true;
        break;
    }
  }

  private async handleModalConfirmation(e: CustomEvent) {
    try {
      e.stopImmediatePropagation();
      e.stopPropagation();
      if (hkTasksStore.selectedTasks.length === 0) {
        return;
      }
      await this.houseKeepingService.executeHKAction({
        actions: hkTasksStore.selectedTasks.map(t => ({ description: 'Cleaned', hkm_id: t.hkm_id === 0 ? null : t.hkm_id, unit_id: t.unit.id, booking_nbr: t.booking_nbr })),
      });
      await this.fetchTasksWithFilters();
    } finally {
      clearSelectedTasks();
      // this.clearSelectedTasks.emit();
      this.modal.closeModal();
    }
  }

  private async applyFilters(e: CustomEvent) {
    try {
      this.isApplyFiltersLoading = true;
      e.stopImmediatePropagation();
      e.stopPropagation();
      this.filters = { ...e.detail };
      await this.fetchTasksWithFilters();
    } catch (error) {
      console.log(error);
    } finally {
      this.isApplyFiltersLoading = false;
    }
  }

  private async fetchTasksWithFilters(export_to_excel: boolean = false) {
    const { cleaning_periods, housekeepers, cleaning_frequencies, dusty_units, highlight_check_ins } = this.filters ?? {};

    const { tasks, url } = await this.houseKeepingService.getHkTasks({
      housekeepers,
      cleaning_frequency: cleaning_frequencies?.code,
      dusty_window: dusty_units?.code,
      highlight_window: highlight_check_ins?.code,
      property_id: this.property_id,
      from_date: moment().format('YYYY-MM-DD'),
      to_date: cleaning_periods?.code || moment().format('YYYY-MM-DD'),
      is_export_to_excel: export_to_excel,
    });
    console.log(tasks);
    if (tasks) {
      this.updateTasks(tasks);
    }
    return { tasks, url };
  }

  render() {
    if (this.isLoading) {
      return <ir-loading-screen></ir-loading-screen>;
    }
    return (
      <Host data-testid="hk_tasks_base">
        <ir-toast></ir-toast>
        <ir-interceptor></ir-interceptor>
        <section class="p-1 d-flex flex-column" style={{ gap: '1rem' }}>
          <h3>Housekeeping Tasks</h3>
          <div class="tasks-view " style={{ gap: '1rem' }}>
            <ir-tasks-filters
              isLoading={this.isApplyFiltersLoading}
              onApplyFilters={e => {
                this.applyFilters(e);
              }}
            ></ir-tasks-filters>
            <div class="d-flex w-100 flex-column" style={{ gap: '1rem' }}>
              <ir-tasks-table
                onRowSelectChange={e => {
                  e.stopImmediatePropagation();
                  e.stopPropagation();
                  updateSelectedTasks(e.detail);
                }}
                class="flex-grow-1 w-100"
              ></ir-tasks-table>
              {/* <ir-tasks-table-pagination></ir-tasks-table-pagination> */}
            </div>
          </div>
        </section>
        <ir-modal
          autoClose={false}
          ref={el => (this.modal = el)}
          isLoading={isRequestPending('/Execute_HK_Action')}
          onConfirmModal={this.handleModalConfirmation.bind(this)}
          iconAvailable={true}
          icon="ft-alert-triangle danger h1"
          leftBtnText={locales.entries.Lcz_Cancel}
          rightBtnText={locales.entries.Lcz_Confirm}
          leftBtnColor="secondary"
          rightBtnColor={'primary'}
          modalTitle={locales.entries.Lcz_Confirmation}
          modalBody={'Update selected unit(s) to Clean'}
        ></ir-modal>
        <ir-sidebar
          open={this.isSidebarOpen}
          id="editGuestInfo"
          onIrSidebarToggle={e => {
            e.stopImmediatePropagation();
            e.stopPropagation();
            this.isSidebarOpen = false;
          }}
          // sidebarStyles={{
          //   width: '80vw',
          // }}
          showCloseButton={false}
        >
          {this.isSidebarOpen && <ir-hk-archive ticket={this.token.getToken()} propertyId={this.property_id} slot="sidebar-body"></ir-hk-archive>}
        </ir-sidebar>
        {/* <ir-title class="d-none d-md-flex" label={locales.entries.Lcz_HousekeepingTasks} justifyContent="space-between">
            <ir-button slot="title-body" text={locales.entries.Lcz_Archive} size="sm"></ir-button>
          </ir-title> */}
      </Host>
    );
  }
}

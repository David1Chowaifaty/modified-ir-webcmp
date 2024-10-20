import { Component, EventEmitter, Listen, Method, Prop, State, h, Event } from '@stencil/core';
import housekeeping_store from '@/stores/housekeeping.store';
import { HouseKeepingService } from '@/services/housekeeping.service';
import { IHouseKeepers } from '@/models/housekeeping';
import locales from '@/stores/locales.store';

@Component({
  tag: 'ir-delete-modal',
  styleUrl: 'ir-delete-modal.css',
  scoped: true,
})
export class IrDeleteModal {
  @Prop() user: IHouseKeepers;

  @State() isOpen: boolean = false;
  @State() selectedId: string = '';
  @State() loadingBtn: 'confirm' | null = null;

  @Event() modalClosed: EventEmitter<null>;
  @Event() resetData: EventEmitter<string>;

  private housekeepingService = new HouseKeepingService();

  @Method()
  async closeModal() {
    this.isOpen = false;
    this.modalClosed.emit(null);
  }
  @Method()
  async openModal() {
    this.isOpen = true;
  }

  @Listen('clickHanlder')
  async btnClickHandler(event: CustomEvent) {
    let target = event.target as HTMLInputElement;
    let name = target.name;
    try {
      if (name === 'confirm') {
        this.loadingBtn = 'confirm';
        if (this.selectedId === '') {
          await this.housekeepingService.editExposedHKM(this.user, true);
        } else {
          const newAssignedUnits = this.user.assigned_units.map(u => ({ hkm_id: +this.selectedId, is_to_assign: true, unit_id: u.id }));
          await this.housekeepingService.manageExposedAssignedUnitToHKM(housekeeping_store.default_properties.property_id, newAssignedUnits);
          const { assigned_units, is_soft_deleted, is_active, ...user } = this.user;
          await this.housekeepingService.editExposedHKM(user, true);
        }
        this.resetData.emit(null);
      }
      if (name === 'cancel') {
        this.closeModal();
      }
    } catch (error) {
      console.error(error);
    } finally {
      if (this.loadingBtn) {
        this.loadingBtn = null;
        this.closeModal();
      }
    }
  }
  render() {
    if (!this.user) {
      return null;
    }
    return [
      <div
        class={`backdropModal ${this.isOpen ? 'active' : ''}`}
        onClick={() => {
          this.closeModal();
        }}
      ></div>,
      <div data-state={this.isOpen ? 'opened' : 'closed'} class={`ir-modal`} tabindex="-1">
        {this.isOpen && (
          <div class={`ir-alert-content p-2`}>
            <div class={`ir-alert-header align-items-center border-0 py-0 m-0 `}>
              <p class="p-0 my-0 mb-1">{this.user.assigned_units.length > 0 ? locales.entries.Lcz_AssignUnitsTo : locales.entries.Lcz_ConfirmDeletion}</p>
              <ir-icon
                class="exit-icon"
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  this.closeModal();
                }}
              >
                <svg slot="icon" xmlns="http://www.w3.org/2000/svg" height="14" width="10.5" viewBox="0 0 384 512">
                  <path
                    fill="currentColor"
                    d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
                  />
                </svg>
              </ir-icon>
            </div>
            {this.user.assigned_units.length > 0 && (
              <div class="modal-body text-left p-0 mb-2">
                <ir-select
                  firstOption={locales.entries.Lcz_nobody}
                  selectedValue={this.selectedId}
                  onSelectChange={e => (this.selectedId = e.detail)}
                  LabelAvailable={false}
                  data={housekeeping_store.hk_criteria.housekeepers
                    .filter(hk => hk.id !== this.user.id)
                    .map(m => ({
                      value: m.id.toString(),
                      text: m.name,
                    }))}
                ></ir-select>
              </div>
            )}

            <div class={`ir-alert-footer border-0 d-flex justify-content-end`}>
              <ir-button icon={''} btn_color={'secondary'} btn_block text={locales.entries.Lcz_Cancel} name={'cancel'}></ir-button>
              <ir-button isLoading={this.loadingBtn === 'confirm'} icon={''} btn_color={'primary'} btn_block text={locales.entries.Lcz_Confirm} name={'confirm'}></ir-button>
            </div>
          </div>
        )}
      </div>,
    ];
  }
}

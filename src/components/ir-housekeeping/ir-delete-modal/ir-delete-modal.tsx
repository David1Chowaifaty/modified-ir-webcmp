import { Component, EventEmitter, Listen, Method, Prop, State, h, Event } from '@stencil/core';
import housekeeping_store from '@/stores/housekeeping.store';
import { HouseKeepingService } from '@/services/housekeeping.service';
import { IHouseKeepers } from '@/models/housekeeping';
import locales from '@/stores/locales.store';

@Component({
  tag: 'ir-delete-modal',
  styleUrl: 'ir-delete-modal.css',
  shadow: false,
})
export class IrDeleteModal {
  @Prop() user: IHouseKeepers;

  @State() isOpen: boolean = false;
  @State() selectedId: string = '';
  @State() loadingBtn: 'confirm' | null = null;

  @Event() modalClosed: EventEmitter<null>;
  @Event() resetData: EventEmitter<string>;

  private housekeepingService = new HouseKeepingService();
  private modalEl: HTMLDivElement;

  @Method()
  async closeModal() {
    if (this.modalEl) {
      $(this.modalEl).modal('hide');
      this.isOpen = false;
      this.modalClosed.emit(null);
    }
  }
  @Method()
  async openModal() {
    if (this.modalEl) {
      $(this.modalEl).modal({
        focus: true,
        backdrop: true,
        keyboard: true,
      });
      $(this.modalEl).modal('show');
      this.isOpen = true;
    }
  }

  @Listen('clickHandler')
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
      return;
    }
    return (
      <div aria-modal={this.isOpen ? 'true' : 'false'} class="modal fade" ref={el => (this.modalEl = el)} tabindex="-1">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-body">
              <div class={`ir-alert-header mb-1 d-flex align-items-center justify-content-between border-0 py-0 m-0 `}>
                <p class="p-0 my-0 modal-title">{this.user.assigned_units.length > 0 ? locales.entries.Lcz_AssignUnitsTo : locales.entries.Lcz_ConfirmDeletion}</p>
                <ir-button class="exit-icon" variant="icon" icon_name="xmark" onClickHandler={() => this.closeModal()}></ir-button>
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
                      }))
                      .sort((a, b) => a.text.toLowerCase().localeCompare(b.text.toLowerCase()))}
                  ></ir-select>
                </div>
              )}

              <div class={`ir-alert-footer border-0 d-flex justify-content-end`}>
                <ir-button icon={''} btn_color={'secondary'} btn_block text={locales.entries.Lcz_Cancel} name={'cancel'}></ir-button>
                <ir-button isLoading={this.loadingBtn === 'confirm'} icon={''} btn_color={'primary'} btn_block text={locales.entries.Lcz_Confirm} name={'confirm'}></ir-button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

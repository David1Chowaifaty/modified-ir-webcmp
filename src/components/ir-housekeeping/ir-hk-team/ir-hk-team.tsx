import { IHouseKeepers, THousekeepingTrigger } from '@/models/housekeeping';
import housekeeping_store from '@/stores/housekeeping.store';
import locales from '@/stores/locales.store';
import { Component, Host, Listen, State, h, Element } from '@stencil/core';

@Component({
  tag: 'ir-hk-team',
  styleUrl: 'ir-hk-team.css',
  scoped: true,
})
export class IrHkTeam {
  @Element() el: HTMLElement;
  @State() currentTrigger: THousekeepingTrigger | null = null;

  private deletionTimout: NodeJS.Timeout;
  renderAssignedUnits(hk: IHouseKeepers) {
    if (hk.assigned_units.length === 0) {
      return (
        <span>
          0 -{' '}
          <button class="outline-btn" onClick={() => (this.currentTrigger = { type: 'unassigned_units', user: hk })}>
            {locales.entries.Lcz_Assign}
          </button>
        </span>
      );
    }
    return (
      <span>
        {hk.assigned_units.length} -{' '}
        <button onClick={() => (this.currentTrigger = { type: 'unassigned_units', user: hk })} class="outline-btn">
          {locales.entries.Lcz_Edit}
        </button>
      </span>
    );
  }
  renderCurrentTrigger() {
    switch (this.currentTrigger?.type) {
      case 'unassigned_units':
        return <ir-hk-unassigned-units slot="sidebar-body" user={this.currentTrigger.user}></ir-hk-unassigned-units>;
      case 'user':
        return <ir-hk-user slot="sidebar-body" user={this.currentTrigger.user} isEdit={this.currentTrigger.isEdit}></ir-hk-user>;
      default:
        return null;
    }
  }

  @Listen('closeSideBar')
  handleCloseSideBar(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.currentTrigger = null;
  }
  handleDeletion(user) {
    this.currentTrigger = { type: 'delete', user };
    this.deletionTimout = setTimeout(() => {
      const modal = this.el.querySelector('ir-delete-modal');
      if (!modal) return;
      modal.openModal();
    }, 100);
  }
  disconnectedCallback() {
    clearTimeout(this.deletionTimout);
  }
  render() {
    if (!housekeeping_store.hk_criteria) {
      return null;
    }
    const { assigned, total, un_assigned } = housekeeping_store.hk_criteria.units_assignments;

    return (
      <Host class="card p-1">
        <section>
          <ir-title label={locales.entries.Lcz_HousekeepingTeam} justifyContent="space-between">
            <div slot="title-body" class="assignments-container gap-16 m-0">
              <p class="font-weight-bold m-0 p-0">
                {total} {locales.entries.Lcz_TotalUnits}
              </p>
              <p class={'m-0 p-0'}>
                {assigned} <span>{locales.entries.Lcz_Assigned}</span>
              </p>
              {un_assigned > 0 && (
                <button class="outline-btn" onClick={() => (this.currentTrigger = { type: 'unassigned_units', user: null })}>
                  {un_assigned} {locales.entries.Lcz_Unassigned}
                </button>
              )}
            </div>
          </ir-title>
          <p class={'m-0 p-0'}>{locales.entries.Lcz_AsAnOption}</p>
        </section>

        <section class=" table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th class="text-left">{locales.entries.Lcz_Name}</th>
                <th>{locales.entries.Lcz_Mobile}</th>
                <th>{locales.entries.Lcz_Username}</th>
                <th>{locales.entries.Lcz_Note}</th>
                <th>{locales.entries.Lcz_UnitsAssigned}</th>
                <th class="text-center">
                  <ir-icon
                    title={locales.entries.Lcz_CreateHousekeeper}
                    onIconClickHandler={() => {
                      this.currentTrigger = {
                        type: 'user',
                        isEdit: false,
                        user: null,
                      };
                    }}
                  >
                    <svg slot="icon" xmlns="http://www.w3.org/2000/svg" height="20" width="17.5" viewBox="0 0 448 512">
                      <path
                        fill="currentColor"
                        d="M256 80c0-17.7-14.3-32-32-32s-32 14.3-32 32V224H48c-17.7 0-32 14.3-32 32s14.3 32 32 32H192V432c0 17.7 14.3 32 32 32s32-14.3 32-32V288H400c17.7 0 32-14.3 32-32s-14.3-32-32-32H256V80z"
                      />
                    </svg>
                  </ir-icon>
                </th>
              </tr>
            </thead>
            <tbody>
              {housekeeping_store.hk_criteria.housekeepers.map(hk => (
                <tr key={hk.id}>
                  <td class="text-left">{hk.name}</td>
                  <td>
                    {hk.phone_prefix} {hk.mobile}
                  </td>
                  <td>{hk.username}</td>
                  <td>
                    {!hk.note ? (
                      'N/A'
                    ) : hk.note.length > 50 ? (
                      <ir-popover content={hk.note}>
                        <span>{hk.note.slice(0, 50)}...</span>
                      </ir-popover>
                    ) : (
                      hk.note
                    )}
                  </td>
                  <td>{this.renderAssignedUnits(hk)}</td>
                  <td class="text-center">
                    <div class="icons-container">
                      <ir-icon
                        title={locales.entries.Lcz_EditHousekeeper}
                        onIconClickHandler={() => {
                          const { assigned_units, is_soft_deleted, is_active, ...user } = hk;
                          this.currentTrigger = {
                            type: 'user',
                            isEdit: true,
                            user,
                          };
                        }}
                        icon="ft-save color-ir-light-blue-hover h5 pointer sm-margin-right"
                      >
                        <svg slot="icon" xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 512 512">
                          <path
                            fill="#6b6f82"
                            d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z"
                          />
                        </svg>
                      </ir-icon>
                      <span> &nbsp;</span>
                      <ir-icon title={locales.entries.Lcz_DeleteHousekeeper} icon="ft-trash-2 danger h5 pointer" onIconClickHandler={() => this.handleDeletion(hk)}>
                        <svg slot="icon" fill="#ff2441" xmlns="http://www.w3.org/2000/svg" height="16" width="14.25" viewBox="0 0 448 512">
                          <path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0H284.2c12.1 0 23.2 6.8 28.6 17.7L320 32h96c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 96 0 81.7 0 64S14.3 32 32 32h96l7.2-14.3zM32 128H416V448c0 35.3-28.7 64-64 64H96c-35.3 0-64-28.7-64-64V128zm96 64c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16V432c0 8.8 7.2 16 16 16s16-7.2 16-16V208c0-8.8-7.2-16-16-16z" />
                        </svg>
                      </ir-icon>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <ir-sidebar
          showCloseButton={false}
          open={this.currentTrigger !== null && this.currentTrigger.type !== 'delete'}
          onIrSidebarToggle={() => (this.currentTrigger = null)}
          style={{
            '--sidebar-width': this.currentTrigger ? (this.currentTrigger.type === 'unassigned_units' ? 'max-content' : '40rem') : 'max-content',
          }}
        >
          {this.renderCurrentTrigger()}
        </ir-sidebar>
        {this.currentTrigger?.type === 'delete' && <ir-delete-modal user={this.currentTrigger.user}></ir-delete-modal>}
      </Host>
    );
  }
}

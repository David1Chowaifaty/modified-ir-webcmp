import { Component, Event, EventEmitter, Host, Prop, h } from '@stencil/core';
import { Task } from '@/models/housekeeping';
import { toggleTaskSelection } from '@/stores/hk-tasks.store';

@Component({
  tag: 'ir-tasks-card',
  styleUrls: ['ir-tasks-card.css'],
  scoped: true,
})
export class IrTasksCard {
  @Prop() task: Task;
  @Prop() isCheckable: boolean;

  @Event() headerButtonPress: EventEmitter<{ name: 'cleaned' | 'export' | 'archive' }>;

  render() {
    const baseText = 'Mark as clean';
    const btnText = this.task.housekeeper ? `${baseText} for ${this.task.housekeeper.slice(0, 20)}` : baseText;
    return (
      <Host class="card p-1 flex-fill m-0" style={{ gap: '0.5rem' }}>
        <div class="d-flex align items-center p-0 m-0 justify-content-between" style={{ gap: '0.5rem' }}>
          <div class="d-flex align items-center p-0 m-0" style={{ gap: '0.5rem', fontWeight: 'bold' }}>
            <p class="m-0 p-0">{this.task.formatted_date}</p>
            <span>-</span>
            <p class="m-0 p-0">
              Unit <b>{this.task.unit.name}</b>
            </p>
          </div>
          <span>{this.task.status.description}</span>
        </div>
        <p class="m-0 p-0" style={{ fontSize: '12px' }}>
          {this.task.hint}
        </p>
        <p class="m-0 p-0 d-flex align-items-center mb-1" style={{ gap: '1rem' }}>
          <span class="m-0 p-0 d-flex align-items-center" style={{ gap: '0.5rem' }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-user-icon lucide-user"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>{this.task.adult} Adults</span>
          </span>
          <span class="m-0 p-0 d-flex align-items-center" style={{ gap: '0.5rem' }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-users-icon lucide-users"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <path d="M16 3.128a4 4 0 0 1 0 7.744" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            <span>{this.task.child} Children</span>
          </span>
          <span class="m-0 p-0 d-flex align-items-center" style={{ gap: '0.5rem' }}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="lucide lucide-baby-icon lucide-baby"
            >
              <path d="M10 16c.5.3 1.2.5 2 .5s1.5-.2 2-.5" />
              <path d="M15 12h.01" />
              <path d="M19.38 6.813A9 9 0 0 1 20.8 10.2a2 2 0 0 1 0 3.6 9 9 0 0 1-17.6 0 2 2 0 0 1 0-3.6A9 9 0 0 1 12 3c2 0 3.5 1.1 3.5 2.5s-.9 2.5-2 2.5c-.8 0-1.5-.4-1.5-1" />
              <path d="M9 12h.01" />
            </svg>
            <span>{this.task.infant} Infants</span>
          </span>
        </p>
        {this.isCheckable && (
          <div>
            <ir-button
              onClickHandler={() => {
                toggleTaskSelection(this.task);
                this.headerButtonPress.emit({ name: 'cleaned' });
              }}
              size="sm"
              text={btnText}
              labelStyle={{ textAlign: 'left !important' }}
              btn_styles="text-left"
            ></ir-button>
          </div>
        )}
      </Host>
    );
  }
}

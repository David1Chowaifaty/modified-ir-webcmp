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
  @Prop() isSkippable: boolean;

  @Event() cleanSelectedTask: EventEmitter<Task>;
  @Event() skipSelectedTask: EventEmitter<Task>;

  render() {
    const baseText = 'Mark as clean';
    const btnText = this.task.housekeeper ? `${baseText} for ${this.task.housekeeper.slice(0, 20)}` : baseText;
    return (
      <Host class="card p-1 flex-fill m-0" style={{ gap: '0.5rem' }}>
        <div class="d-flex align items-center p-0 m-0 justify-content-between" style={{ gap: '0.5rem' }}>
          <div class="d-flex align items-center p-0 m-0" style={{ gap: '0.5rem' }}>
            <p class="m-0 p-0">{this.task.formatted_date}</p>
            <span>-</span>
            <p class="m-0 p-0">
              Unit <b>{this.task.unit.name}</b>
            </p>
          </div>
          {/* <span></span> */}
        </div>
        <p class="m-0 p-0">
          {this.task.status.description} <span style={{ marginLeft: '0.5rem' }}>{this.task.hint}</span>
        </p>
        <p class="m-0 p-0 d-flex align-items-center mb-1" style={{ gap: '1rem' }}>
          <span class="m-0 p-0 d-flex align-items-center" style={{ gap: '0.5rem' }}>
            {/* <svg
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
            </svg> */}
            <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <path
                fill="currentColor"
                d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512l388.6 0c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304l-91.4 0z"
              />
            </svg>
            <span>
              <b>{this.task.adult}</b> Adults
            </span>
          </span>
          <span class="m-0 p-0 d-flex align-items-center" style={{ gap: '0.5rem' }}>
            {/* <svg
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
            </svg> */}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 320 512">
              <path
                fill="currentColor"
                d="M96 64a64 64 0 1 1 128 0A64 64 0 1 1 96 64zm48 320l0 96c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-192.2L59.1 321c-9.4 15-29.2 19.4-44.1 10S-4.5 301.9 4.9 287l39.9-63.3C69.7 184 113.2 160 160 160s90.3 24 115.2 63.6L315.1 287c9.4 15 4.9 34.7-10 44.1s-34.7 4.9-44.1-10L240 287.8 240 480c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-96-32 0z"
              />
            </svg>
            <span>
              <b>{this.task.child}</b> Children
            </span>
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
            <span>
              <b>{this.task.infant}</b> Infants
            </span>
          </span>
        </p>
        {this.isCheckable && (
          <div>
            <ir-button
              onClickHandler={() => {
                toggleTaskSelection(this.task);
                this.cleanSelectedTask.emit(this.task);
              }}
              size="sm"
              text={btnText}
              labelStyle={{ textAlign: 'left !important' }}
              btn_styles="text-left"
            ></ir-button>
          </div>
        )}
        {this.isSkippable && (
          <div>
            <ir-button
              onClickHandler={() => {
                // toggleTaskSelection(this.task);
                this.skipSelectedTask.emit(this.task);
              }}
              size="sm"
              text={'Skip'}
              labelStyle={{ textAlign: 'left !important' }}
              btn_styles="text-left"
            ></ir-button>
          </div>
        )}
      </Host>
    );
  }
}

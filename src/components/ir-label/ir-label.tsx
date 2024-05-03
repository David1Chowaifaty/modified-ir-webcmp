import { Component, Prop, h, EventEmitter, Event, Host } from '@stencil/core';

@Component({
  tag: 'ir-label',
  styleUrl: 'ir-label.css',
  scoped: true,
})
export class IrLabel {
  // Properties
  @Prop() label: string;
  @Prop() value: string;
  @Prop() iconShown = false;
  @Prop() imageSrc: string;
  @Prop() country: boolean = false;
  @Prop() imageStyle: string = '';

  // Events
  @Event() editSidebar: EventEmitter;

  openEditSidebar() {
    this.editSidebar.emit();
  }

  render() {
    if (!this.value) {
      return null;
    }

    return (
      <Host class={this.imageSrc ? 'align-items-center' : ''}>
        <strong>{this.label}</strong>
        {this.imageSrc && <img src={this.imageSrc} class={`p-0 m-0 ${this.country ? 'country' : ''} ${this.imageStyle}`} />}
        <p>{this.value}</p>
        {this.iconShown && (
          <div class="icon-container">
            <ir-icon
              class="pointer icon"
              id="pickup"
              onIconClickHandler={e => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                this.openEditSidebar();
              }}
            >
              <svg slot="icon" xmlns="http://www.w3.org/2000/svg" height="15" width="15" viewBox="0 0 512 550">
                <path
                  fill="#6b6f82"
                  d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z"
                />
              </svg>
            </ir-icon>
          </div>
        )}
      </Host>
    );
  }
}

import { Component, Prop, h, EventEmitter, Event, Host } from '@stencil/core';
import { colorVariants, TIcons } from '../ir-icons/icons';

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
  @Prop() image: { src: string; alt: string; style?: string } | null;
  @Prop() country: boolean = false;
  @Prop() imageStyle: string = '';
  @Prop() icon_name: TIcons = 'edit';
  @Prop() icon_style: string;
  @Prop() ignore_value: boolean = false;
  @Prop() placeholder: string;

  // Events
  @Event() editSidebar: EventEmitter;

  openEditSidebar() {
    this.editSidebar.emit();
  }
  å;
  render() {
    if (!this.placeholder && !this.value && !this.ignore_value) {
      return null;
    }

    return (
      <Host class={this.image ? 'align-items-center' : ''}>
        <strong class="label_title">{this.label}</strong>

        {this.image && <img src={this.image.src} class={`p-0 m-0 ${this.country ? 'country' : 'logo'} ${this.image.style}`} alt={this.image.src} />}
        {this.value ? <p class={'label_message'}>{this.value}</p> : <p class={'label_placeholder'}>{this.placeholder}</p>}
        {this.iconShown && (
          <div class="icon-container">
            <ir-button
              variant="icon"
              icon_name={this.icon_name}
              style={{ ...colorVariants.secondary, '--icon-size': '1.1rem' }}
              onClickHanlder={e => {
                e.stopImmediatePropagation();
                e.stopPropagation();
                this.openEditSidebar();
              }}
            ></ir-button>
          </div>
        )}
      </Host>
    );
  }
}

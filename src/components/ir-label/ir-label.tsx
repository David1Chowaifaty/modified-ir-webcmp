import { Component, Prop, h, EventEmitter, Event, Host } from '@stencil/core';
import { colorVariants, TIcons } from '../ui/ir-icons/icons';

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
      <Host class={this.image ? 'align-items-center' : ''}>
        <strong>{this.label}</strong>
        {this.image && <img src={this.image.src} class={`p-0 m-0 ${this.country ? 'country' : 'logo'} ${this.image.style}`} alt={this.image.src} />}
        <p>{this.value}</p>
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

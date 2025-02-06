import { Component, Element, Event, EventEmitter, Host, Prop, Watch, h } from '@stencil/core';

@Component({
  tag: 'ir-title',
  styleUrl: 'ir-title.css',
  scoped: true,
})
export class IrTitle {
  @Prop() label: string;
  @Prop({ reflect: true }) borderShown: boolean;
  @Prop({ reflect: true }) displayContext: 'default' | 'sidebar' = 'default';
  @Prop({ reflect: true }) justifyContent:
    | 'center'
    | 'start'
    | 'end'
    | 'flex-start'
    | 'flex-end'
    | 'left'
    | 'right'
    | 'normal'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
    | 'stretch'
    | 'safe center'
    | 'unsafe center' = 'start';
  @Event() closeSideBar: EventEmitter<null>;
  @Element() el: HTMLElement;

  componentDidLoad() {
    this.el.style.justifyContent = this.justifyContent;
  }
  @Watch('justifyContent')
  handleJustifyContentChange(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      this.el.style.justifyContent = newValue;
    }
  }
  render() {
    return (
      <Host>
        <h4 class="text-left font-medium-2 py-0 my-0">{this.label}</h4>
        {this.displayContext === 'sidebar' && (
          <ir-icon
            class={'close'}
            onIconClickHandler={() => {
              this.closeSideBar.emit(null);
            }}
          >
            <svg slot="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" height={20} width={20}>
              <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z" />
            </svg>
          </ir-icon>
        )}
        {this.displayContext !== 'sidebar' && (
          <div class={'title-body'}>
            <slot name="title-body"></slot>
          </div>
        )}
      </Host>
    );
  }
}

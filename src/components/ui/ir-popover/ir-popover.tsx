import { Component, Host, Prop, h, Element } from '@stencil/core';

@Component({
  tag: 'ir-popover',
  styleUrl: 'ir-popover.css',
  shadow: false,
})
export class IrPopover {
  @Element() el: HTMLElement;

  @Prop() content: string;
  @Prop() irPopoverLeft: string = '10px';
  @Prop() placement: 'top' | 'bottom' | 'left' | 'right' | 'auto' = 'auto';
  @Prop() trigger: 'focus' | 'click' | 'hover' = 'focus';
  @Prop() renderContentAsHtml: boolean = false;

  private initialized: boolean = false;
  private popoverTrigger: HTMLElement;

  componentDidLoad() {
    if (this.initialized) {
      return;
    }
    this.initializePopover();
  }

  initializePopover() {
    $(this.popoverTrigger).popover({
      trigger: this.trigger,
      content: this.content,
      placement: this.placement,
      html: this.renderContentAsHtml,
    });
    this.initialized = true;
  }

  disconnectedCallback() {
    $(this.popoverTrigger).popover('dispose');
  }

  render() {
    return (
      <Host style={{ '--ir-popover-left': this.irPopoverLeft }}>
        {this.trigger !== 'focus' ? (
          <p
            ref={el => (this.popoverTrigger = el)}
            class="popover-title m-0 p-0"
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              cursor: 'pointer',
            }}
          >
            <slot />
          </p>
        ) : (
          <button tabindex="0" class="popover-trigger" ref={el => (this.popoverTrigger = el)}>
            <slot />
          </button>
        )}
      </Host>
    );
  }
}

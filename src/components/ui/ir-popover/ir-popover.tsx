import { Component, Host, Prop, h, Element } from '@stencil/core';

@Component({
  tag: 'ir-popover',
  styleUrl: 'ir-popover.css',
  scoped: true,
})
export class IrPopover {
  @Element() el: HTMLElement;

  @Prop() content: string;
  @Prop() irPopoverLeft: string = '10px';
  @Prop() placement: 'top' | 'bottom' | 'left' | 'right' | 'auto' = 'auto';
  @Prop() trigger: 'focus' | 'click' | 'hover' = 'focus';

  private initialized: boolean = false;
  private popoverTrigger: HTMLElement;

  componentDidLoad() {
    if (this.initialized) {
      return;
    }
    this.initializePopover();
  }

  initializePopover() {
    ($(this.popoverTrigger) as any).popover({
      trigger: this.trigger,
      content: this.content,
      placement: this.placement,
    });
    this.initialized = true;
  }

  disconnectedCallback() {
    ($(this.popoverTrigger) as any).popover('dispose');
  }

  render() {
    return (
      <Host style={{ '--ir-popover-left': this.irPopoverLeft }}>
        {this.trigger !== 'focus' ? (
          <p
            ref={el => (this.popoverTrigger = el)}
            class="popover-title"
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
          <button class="popover-trigger" ref={el => (this.popoverTrigger = el)}>
            <slot />
          </button>
        )}
      </Host>
    );
  }
}

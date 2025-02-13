import { Component, Host, Prop, State, h, Element } from '@stencil/core';

@Component({
  tag: 'ir-popover',
  styleUrl: 'ir-popover.css',
  scoped: true,
})
export class IrPopover {
  @Element() el: HTMLElement;
  @Prop() popoverTitle: string;
  @State() isHovered: boolean = false;
  @State() showPopover: boolean = false;
  @Prop() irPopoverLeft: string = '10px';

  componentWillLoad() {
    this.checkTitleWidth();
  }
  handleMouseEnter = () => {
    if (!this.showPopover) {
      return;
    }
    if (this.showPopover) {
      this.isHovered = true;
    }
  };

  handleMouseLeave = () => {
    if (!this.showPopover) {
      return;
    }
    this.isHovered = false;
  };

  checkTitleWidth() {
    requestAnimationFrame(() => {
      const titleElement = this.el.querySelector('.popover-title');
      if (titleElement) {
        const width = titleElement.scrollWidth;
        this.showPopover = width > 150; // Show popover if title width exceeds 170px
      }
    });
  }

  render() {
    return (
      <Host style={{ '--ir-popover-left': this.irPopoverLeft }}>
        <p class="popover-title" onMouseLeave={this.handleMouseLeave} onMouseEnter={this.handleMouseEnter}>
          {this.popoverTitle}
        </p>
        {this.showPopover && this.isHovered && (
          <div data-state="show" class="popover-container">
            {this.popoverTitle}
          </div>
        )}
      </Host>
    );
  }
}

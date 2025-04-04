import { Component, Host, Prop, h, Element } from '@stencil/core';

@Component({
  tag: 'ir-interactive-title',
  styleUrl: 'ir-interactive-title.css',
  scoped: true,
})
export class IrInteractiveTitle {
  @Element() el: HTMLElement;

  @Prop() popoverTitle: string;
  @Prop() irPopoverLeft: string = '10px';
  @Prop() hkStatus: boolean;
  @Prop() cropSize: number = 15;

  private croppedTitle: string;
  private croppedTitleEl: HTMLSpanElement;

  // private hkStatusColors = {
  //   green: '#57f707',
  //   red: 'rgb(199, 139, 36)',
  //   orange: '#ff9149',
  //   black: '#ff4961',
  // };
  componentWillLoad() {
    this.croppedTitle = this.popoverTitle;
  }
  componentDidLoad() {
    this.initializePopover();
  }

  initializePopover() {
    const titleElement = this.el.querySelector('.popover-title') as HTMLElement;

    if (titleElement) {
      const isOverflowing = titleElement.scrollWidth + 10 > titleElement.offsetWidth;

      if (isOverflowing) {
        this.croppedTitle = this.popoverTitle.slice(0, this.cropSize) + '...';
        this.croppedTitleEl.innerHTML = this.croppedTitle;
        ($(titleElement) as any).popover({
          trigger: 'hover',
          content: this.popoverTitle,
          placement: 'top',
        });
      } else {
        ($(titleElement) as any).popover('dispose');
      }
    }
  }

  render() {
    return (
      <Host style={{ '--ir-popover-left': this.irPopoverLeft }}>
        <p
          class="popover-title"
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          <span ref={el => (this.croppedTitleEl = el)} class="croppedTitle">
            {this.croppedTitle}
          </span>
          {/* {this.hkStatus && this.hkStatusColors[this.hkStatus] && <div title="occupied" style={{ '--dot-color': this.hkStatusColors[this.hkStatus] }} class={`hk-dot`}></div>} */}
          {this.hkStatus && (
            <div title="This unit is dirty" class={`hk-dot`}>
              <svg xmlns="http://www.w3.org/2000/svg" height="12" width="13.5" viewBox="0 0 576 512">
                <path
                  // fill="currentColor"
                  d="M566.6 54.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0l-192 192-34.7-34.7c-4.2-4.2-10-6.6-16-6.6c-12.5 0-22.6 10.1-22.6 22.6l0 29.1L364.3 320l29.1 0c12.5 0 22.6-10.1 22.6-22.6c0-6-2.4-11.8-6.6-16l-34.7-34.7 192-192zM341.1 353.4L222.6 234.9c-42.7-3.7-85.2 11.7-115.8 42.3l-8 8C76.5 307.5 64 337.7 64 369.2c0 6.8 7.1 11.2 13.2 8.2l51.1-25.5c5-2.5 9.5 4.1 5.4 7.9L7.3 473.4C2.7 477.6 0 483.6 0 489.9C0 502.1 9.9 512 22.1 512l173.3 0c38.8 0 75.9-15.4 103.4-42.8c30.6-30.6 45.9-73.1 42.3-115.8z"
                />
              </svg>
            </div>
          )}
        </p>
      </Host>
    );
  }
}

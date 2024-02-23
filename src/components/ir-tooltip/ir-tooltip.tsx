import { Component, Host, Prop, State, h } from '@stencil/core';

@Component({
  tag: 'ir-tooltip',
  styleUrl: 'ir-tooltip.css',
  scoped: true,
})
export class IrTooltip {
  @Prop({ reflect: true }) message: string;
  @State() open: boolean;
  tooltipTimeout: any;
  toggleOpen(shouldOpen: boolean) {
    if (this.tooltipTimeout) {
      clearTimeout(this.tooltipTimeout);
    }

    if (shouldOpen) {
      this.tooltipTimeout = setTimeout(() => {
        this.open = true;
      }, 300);
    } else {
      this.open = false;
    }
  }
  render() {
    return (
      <Host class="m-0 p-0">
        <span onMouseEnter={() => this.toggleOpen(true)} onMouseLeave={() => this.toggleOpen(false)}>
          {/* <i
            class="ml-1 ft-info"
            data-toggle="tooltip"
            data-placement="top"
            data-original-title="Info popup"
          ></i> */}
          <svg data-toggle="tooltip" data-placement="top" xmlns="http://www.w3.org/2000/svg" height="16" width="16" class="tooltip-icon" viewBox="0 0 512 512">
            <path
              fill="#6b6f82"
              d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336h24V272H216c-13.3 0-24-10.7-24-24s10.7-24 24-24h48c13.3 0 24 10.7 24 24v88h8c13.3 0 24 10.7 24 24s-10.7 24-24 24H216c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"
            />
          </svg>
        </span>
        {this.open && (
          <div class="tooltip bottom show position-absolute" role="tooltip">
            <div class="tooltip-arrow"></div>
            <div class="tooltip-inner fit">
              <span innerHTML={this.message}></span>
            </div>
          </div>
        )}
      </Host>
    );
  }
}

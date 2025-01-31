import { Component, h, Listen, Prop } from '@stencil/core';

@Component({
  tag: 'ir-tasks-header',
  styleUrl: 'ir-tasks-header.css',
  scoped: true,
})
export class IrTasksHeader {
  @Prop() isCleanedEnabled: boolean = false;

  private btnRef: HTMLIrButtonElement;

  @Listen('animateCleanedButton', { target: 'body' })
  handleCleanedButtonAnimation(e: CustomEvent) {
    console.log('here');
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.btnRef.bounce();
  }
  render() {
    return (
      <div class="d-flex align-items-center justify-content-between">
        <h4>Housekeeping Tasks</h4>
        <div class="d-flex align-items-center" style={{ gap: '1rem' }}>
          <ir-button size="sm" btn_color="outline" text="Export"></ir-button>
          <ir-button size="sm" btn_disabled={!this.isCleanedEnabled} text="Cleaned" ref={el => (this.btnRef = el)}></ir-button>
        </div>
      </div>
    );
  }
}

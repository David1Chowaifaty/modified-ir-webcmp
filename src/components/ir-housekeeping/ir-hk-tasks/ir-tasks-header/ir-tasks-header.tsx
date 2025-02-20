import { Component, Event, EventEmitter, h, Listen, Prop } from '@stencil/core';

@Component({
  tag: 'ir-tasks-header',
  styleUrl: 'ir-tasks-header.css',
  scoped: true,
})
export class IrTasksHeader {
  @Prop() isCleanedEnabled: boolean = false;

  private btnRef: HTMLIrButtonElement;

  @Event() headerButtonPress: EventEmitter<{ name: 'cleaned' | 'export' | 'archive' }>;

  @Listen('animateCleanedButton', { target: 'body' })
  handleCleanedButtonAnimation(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    this.btnRef.bounce();
  }
  render() {
    return (
      <div class="d-flex align-items-center justify-content-between">
        <h3>Housekeeping Tasks</h3>
        <div class="d-flex align-items-center" style={{ gap: '1rem' }}>
          <ir-button
            size="sm"
            btn_color="outline"
            text="Export"
            onClickHandler={e => {
              e.stopImmediatePropagation();
              e.stopPropagation();
              this.headerButtonPress.emit({ name: 'export' });
            }}
          ></ir-button>
          {/* <ir-button
            size="sm"
            btn_color="outline"
            text="Archive"
            onClickHandler={e => {
              e.stopImmediatePropagation();
              e.stopPropagation();
              this.headerButtonPress.emit({ name: 'archive' });
            }}
          ></ir-button> */}
          <ir-button
            onClickHandler={e => {
              e.stopImmediatePropagation();
              e.stopPropagation();
              this.headerButtonPress.emit({ name: 'cleaned' });
            }}
            size="sm"
            btn_disabled={!this.isCleanedEnabled}
            text="Cleaned"
            ref={el => (this.btnRef = el)}
          ></ir-button>
        </div>
      </div>
    );
  }
}

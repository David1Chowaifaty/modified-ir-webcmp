import { Component, Event, EventEmitter, Fragment, Host, Prop, h } from '@stencil/core';
import { FooterButtonType, TPropertyButtonsTypes } from '../../../../models/igl-book-property';

@Component({
  tag: 'igl-book-property-footer',
  styleUrl: 'igl-book-property-footer.css',
  scoped: true,
})
export class IglBookPropertyFooter {
  @Prop() eventType: string;
  @Prop() disabled: boolean = true;
  @Event() buttonClicked: EventEmitter<{ key: TPropertyButtonsTypes }>;
  private isEventType(event: string) {
    return event === this.eventType;
  }
  editNext(label) {
    if (this.isEventType('EDIT_BOOKING')) {
      if (label === 'Cancel') {
        return 'col-12 col-md-6';
      } else {
        return 'd-none d-md-block col-md-6';
      }
    }
    return 'col-6';
  }

  private renderButton(type: FooterButtonType, label: string, disabled = false) {
    return (
      <div class={this.shouldRenderTwoButtons() ? ` ${this.editNext(label)}` : 'col-12'}>
        <button class={`btn btn-${type === 'cancel' ? 'secondary' : 'primary'} full-width`} onClick={() => this.buttonClicked.emit({ key: type })} disabled={disabled}>
          {label}
        </button>
      </div>
    );
  }

  private shouldRenderTwoButtons() {
    return this.isEventType('PLUS_BOOKING') || this.isEventType('ADD_ROOM') || this.isEventType('EDIT_BOOKING');
  }

  render() {
    return (
      <Host>
        <div class="d-flex justify-content-between align-items-center">
          {this.isEventType('EDIT_BOOKING') ? (
            <Fragment>
              {this.renderButton('cancel', 'Cancel')}
              {this.shouldRenderTwoButtons() && this.renderButton('next', 'Next >>')}
            </Fragment>
          ) : (
            <Fragment>
              {this.renderButton('cancel', 'Cancel')}
              {this.shouldRenderTwoButtons() && this.renderButton('next', 'Next >>', this.disabled)}
            </Fragment>
          )}
        </div>
      </Host>
    );
  }
}

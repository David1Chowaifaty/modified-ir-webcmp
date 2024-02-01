import { Component, Event, EventEmitter, Fragment, Host, Prop, h } from '@stencil/core';
import { FooterButtonType, TPropertyButtonsTypes } from '../../../../models/igl-book-property';
import locales from '@/stores/locales.store';

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
        return 'flex-fill';
      } else {
        return 'd-none d-md-block  flex-fill';
      }
    }
    return 'flex-fill';
  }

  private renderButton(type: FooterButtonType, label: string, disabled = false) {
    return (
      <div class={this.shouldRenderTwoButtons() ? ` ${this.editNext(label)}` : 'flex-fill'}>
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
        <div class="d-flex justify-content-between gap-30 align-items-center">
          {this.isEventType('EDIT_BOOKING') ? (
            <Fragment>
              {this.renderButton('cancel', locales.entries.Lcz_Cancel)}
              {this.shouldRenderTwoButtons() && this.renderButton('next', `${locales.entries.Lcz_Next} >>`)}
            </Fragment>
          ) : (
            <Fragment>
              {this.renderButton('cancel', locales.entries.Lcz_Cancel)}
              {this.shouldRenderTwoButtons() && this.renderButton('next', `${locales.entries.Lcz_Next} >>`, this.disabled)}
            </Fragment>
          )}
        </div>
      </Host>
    );
  }
}

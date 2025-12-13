import { Component, Event, EventEmitter, Fragment, Host, Prop, h } from '@stencil/core';
import { TPropertyButtonsTypes } from '../../../../models/igl-book-property';
import locales from '@/stores/locales.store';
import { TIcons } from '@/components/ui/ir-icons/icons';
import calendar_data from '@/stores/calendar-data';
import moment from 'moment';
import { NativeButton } from '@/components/ui/ir-custom-button/ir-custom-button';

@Component({
  tag: 'igl-book-property-footer',
  styleUrl: 'igl-book-property-footer.css',
  scoped: true,
})
export class IglBookPropertyFooter {
  @Prop() eventType: string;
  @Prop() page: string;
  @Prop({ reflect: true }) isEditOrAddRoomEvent: boolean;
  @Prop() dateRangeData: { [key: string]: any };
  @Prop() isLoading: string;

  @Event() buttonClicked: EventEmitter<{ key: TPropertyButtonsTypes }>;

  private isEventType(event: string) {
    return event === this.eventType;
  }
  private editNext(label) {
    if (this.isEventType('EDIT_BOOKING')) {
      if (label === 'Cancel') {
        return 'flex-fill';
      } else {
        return 'd-none d-md-block  flex-fill';
      }
    }
    return 'flex-fill';
  }

  private renderButton({
    label,
    type,
    disabled = false,
    // icon_name,
    isLoading,
    appearance,
    variant,
  }: // icon_position = 'right',
  {
    type: TPropertyButtonsTypes;
    label: string;
    disabled?: boolean;
    icon_name?: TIcons;
    isLoading?: boolean;
    icon_position?: 'right' | 'left';
    appearance: NativeButton['appearance'];
    variant: NativeButton['variant'];
  }) {
    return (
      <div class={this.shouldRenderTwoButtons() ? ` ${this.editNext(label)}` : 'flex-fill'}>
        {/* <button class={`btn btn-${type === 'cancel' ? 'secondary' : 'primary'} full-width`} onClick={() => this.buttonClicked.emit({ key: type })} disabled={disabled}>
          {label}
        </button> */}
        <ir-custom-button
          size={'medium'}
          loading={isLoading}
          appearance={appearance}
          variant={variant}
          disabled={disabled}
          onClickHandler={() => {
            this.buttonClicked.emit({ key: type });
          }}
          class="full-width"

          // icon_name={icon_name}
          // iconPosition={icon_position}
          // style={{ '--icon-size': '1rem' }}
          // icon_style={{ paddingBottom: '1.9px' }}
        >
          {label}
        </ir-custom-button>
      </div>
    );
  }

  private shouldRenderTwoButtons() {
    return this.isEventType('PLUS_BOOKING') || this.isEventType('ADD_ROOM') || this.isEventType('EDIT_BOOKING');
  }

  render() {
    if (this.page === 'page_one') {
      return (
        <Host>
          {/* <div class="d-flex justify-content-between gap-30 align-items-center full-width"> */}
          {this.isEventType('EDIT_BOOKING') ? (
            <Fragment>
              {this.renderButton({ type: 'cancel', label: locales.entries.Lcz_Cancel, appearance: 'filled', variant: 'neutral' })}
              {this.shouldRenderTwoButtons() &&
                this.renderButton({
                  type: 'next',
                  label: `${locales.entries.Lcz_Next}`,

                  icon_name: 'angles_right',
                  variant: 'brand',
                  appearance: 'accent',
                })}
            </Fragment>
          ) : (
            <Fragment>
              {this.renderButton({ type: 'cancel', label: locales.entries.Lcz_Cancel, appearance: 'filled', variant: 'neutral' })}
              {this.shouldRenderTwoButtons() &&
                this.renderButton({ type: 'next', label: `${locales.entries.Lcz_Next}`, icon_name: 'angles_right', variant: 'brand', appearance: 'accent' })}
            </Fragment>
          )}
          {/* </div> */}
        </Host>
      );
    }
    const showBookAndCheckin = calendar_data.checkin_enabled && moment(new Date(this.dateRangeData?.fromDate)).isSame(new Date(), 'day');
    return (
      <Fragment>
        {this.isEditOrAddRoomEvent ? (
          <Fragment>
            {this.renderButton({ type: 'back', icon_position: 'left', label: locales.entries.Lcz_Back, icon_name: 'angles_left', appearance: 'filled', variant: 'neutral' })}
            {this.renderButton({ type: 'save', label: locales.entries.Lcz_Save, isLoading: this.isLoading === 'save', variant: 'brand', appearance: 'accent' })}
          </Fragment>
        ) : (
          <Fragment>
            {this.renderButton({ type: 'back', icon_position: 'left', label: locales.entries.Lcz_Back, icon_name: 'angles_left', appearance: 'filled', variant: 'neutral' })}
            {this.renderButton({
              type: 'book',
              label: locales.entries.Lcz_Book,
              isLoading: this.isLoading === 'book',
              variant: 'brand',
              appearance: showBookAndCheckin ? 'outlined' : 'accent',
            })}
            {showBookAndCheckin &&
              this.renderButton({
                type: 'bookAndCheckIn',
                label: locales.entries.Lcz_BookAndChekcIn,
                isLoading: this.isLoading === 'bookAndCheckIn',
                variant: 'brand',
                appearance: 'accent',
              })}
          </Fragment>
        )}
      </Fragment>
    );
  }
}

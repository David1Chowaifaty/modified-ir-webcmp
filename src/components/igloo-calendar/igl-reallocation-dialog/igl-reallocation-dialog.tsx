import { EventsService } from '@/services/events.service';
import { Component, Element, Event, EventEmitter, Fragment, Prop, State, Watch, h } from '@stencil/core';
import type { IReallocationPayload } from '@/models/property-types';
import type { SelectOption } from '@/utils/utils';
import { isRequestPending } from '@/stores/ir-interceptor.store';

@Component({
  tag: 'igl-reallocation-dialog',
  styleUrl: 'igl-reallocation-dialog.css',
  scoped: true,
})
export class IglReallocationDialog {
  @Element() hostEl!: HTMLElement;

  @Prop() data?: IReallocationPayload;

  @State() selectedRateplan?: string;
  @State() showRateplanError = false;

  @Event() dialogClose: EventEmitter<boolean>;
  @Event() revertBooking: EventEmitter<string>;
  @Event() resetModalState: EventEmitter<void>;

  private dialogEl?: HTMLIrDialogElement;
  private rateplanSelectEl?: HTMLIrSelectElement;
  private eventsService = new EventsService();

  @Watch('data')
  handleDataChange(newData: IReallocationPayload | undefined) {
    this.resetState(newData);
    if (newData) {
      this.dialogEl?.openModal();
    } else {
      this.dialogEl?.closeModal();
    }
  }

  private async reallocateUnit() {
    if (!this.data) {
      return;
    }

    if (!this.validateRateplanSelection()) {
      return;
    }

    const { pool, toRoomId, from_date, to_date } = this.data;
    try {
      await this.eventsService.reallocateEvent(pool, toRoomId, from_date, to_date, this.data.rateplans ? Number(this.selectedRateplan) : undefined);
    } catch (error) {
      console.log(error);
      this.revertBooking.emit(pool);
    } finally {
      this.dialogEl?.closeModal();
      this.resetModalState.emit();
    }
  }

  private get rateplanOptions(): SelectOption[] {
    if (!Array.isArray(this.data?.rateplans)) {
      return [];
    }

    return this.data.rateplans.map(option => ({
      ...option,
      text: this.formatRateplanLabel(option),
    }));
  }

  private formatRateplanLabel(option: SelectOption): string {
    if (!option) {
      return '';
    }

    const suffix = option.custom_text ? ` | ${option.custom_text}` : '';
    return `${option.text}${suffix}`.trim();
  }

  private hasRateplanRequirement(): boolean {
    return this.rateplanOptions.length > 0;
  }

  private validateRateplanSelection(): boolean {
    if (!this.hasRateplanRequirement()) {
      return true;
    }

    if (!this.selectedRateplan) {
      this.showRateplanError = true;
      this.focusRateplanSelect();
      return false;
    }

    return true;
  }

  private focusRateplanSelect() {
    const selectEl = this.rateplanSelectEl?.shadowRoot?.querySelector('select') ?? this.rateplanSelectEl?.querySelector('select');
    if (selectEl) {
      selectEl.focus();
    }
  }

  private resetState(data?: IReallocationPayload) {
    if (!data) {
      this.selectedRateplan = undefined;
      this.showRateplanError = false;
      return;
    }

    this.selectedRateplan = undefined;
    this.showRateplanError = false;
  }

  private handleDialogVisibilityChange = (_: CustomEvent) => {
    this.dialogClose.emit(false);
  };

  private handleRateplanChange = (value: string) => {
    this.selectedRateplan = value;
    this.showRateplanError = false;
  };

  private handleCancelClick = () => {
    this.dialogEl?.closeModal();
    this.dialogClose.emit(false);
  };

  render() {
    const hasRateplans = this.hasRateplanRequirement();

    return (
      <ir-dialog label={'Alert'} ref={el => (this.dialogEl = el)} onIrDialogHide={this.handleDialogVisibilityChange}>
        {this.data && (
          <Fragment>
            <div class="dialog-body">
              <p class="text-left dialog-body__description m-0 p-0">{this.data.description}</p>
              {hasRateplans && (
                // <ir-select
                //   ref={el => (this.rateplanSelectEl = el)}
                //   required
                //   firstOption="Select rate plan..."
                //   data={this.rateplanOptions.map(option => ({ text: option.text, value: option.value }))}
                //   error={this.showRateplanError}
                //   onSelectChange={this.handleRateplanChange}
                // ></ir-select>
                <wa-select
                  onwa-hide={e => {
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                  }}
                  defaultValue={''}
                  onwa-show={e => {
                    e.stopImmediatePropagation();
                    e.stopPropagation();
                  }}
                  aria-invalid={String(this.showRateplanError)}
                  onchange={e => this.handleRateplanChange((e.target as any).value)}
                >
                  <wa-option value="">Select rate plan...</wa-option>
                  {this.rateplanOptions.map(option => (
                    <wa-option key={option.value} value={option.value}>
                      {option.text}
                    </wa-option>
                  ))}
                </wa-select>
              )}
            </div>
            <div class="dialog-footer" slot="footer">
              <ir-custom-button appearance="filled" variant="neutral" onClickHandler={this.handleCancelClick} size="medium">
                Cancel
              </ir-custom-button>
              <ir-custom-button variant="brand" onClickHandler={() => this.reallocateUnit()} size="medium" loading={isRequestPending('/ReAllocate_Exposed_Room')}>
                Confirm
              </ir-custom-button>
            </div>
          </Fragment>
        )}
      </ir-dialog>
    );
  }
}

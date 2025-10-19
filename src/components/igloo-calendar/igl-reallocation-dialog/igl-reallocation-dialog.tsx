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

    const suffix = option.custom_text ? ` ${option.custom_text}` : '';
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

  private handleDialogVisibilityChange = (event: CustomEvent<boolean>) => {
    if (!event.detail) {
      this.dialogClose.emit(false);
    }
  };

  private handleRateplanChange = (event: CustomEvent<string>) => {
    this.selectedRateplan = event.detail;
    this.showRateplanError = false;
  };

  private handleCancelClick = () => {
    this.dialogEl?.closeModal();
    this.dialogClose.emit(false);
  };

  render() {
    const hasRateplans = this.hasRateplanRequirement();

    return (
      <ir-dialog ref={el => (this.dialogEl = el)} onOpenChange={this.handleDialogVisibilityChange}>
        {this.data && (
          <Fragment>
            {this.data.title && <div slot="modal-title">{this.data.title}</div>}
            <div slot="modal-body" class="dialog-body">
              <p class="text-left dialog-body__description">{this.data.description}</p>
              {hasRateplans && (
                <ir-select
                  ref={el => (this.rateplanSelectEl = el)}
                  required
                  firstOption="Select rate plan"
                  data={this.rateplanOptions.map(option => ({ text: option.text, value: option.value }))}
                  error={this.showRateplanError}
                  onSelectChange={this.handleRateplanChange}
                ></ir-select>
              )}
            </div>
            <div class="dialog-footer" slot="modal-footer">
              <ir-button onClick={this.handleCancelClick} text="Cancel" size="md" btn_color="secondary"></ir-button>
              <ir-button text="Confirm" onClick={() => this.reallocateUnit()} size="md" isLoading={isRequestPending('/ReAllocate_Exposed_Room')}></ir-button>
            </div>
          </Fragment>
        )}
      </ir-dialog>
    );
  }
}

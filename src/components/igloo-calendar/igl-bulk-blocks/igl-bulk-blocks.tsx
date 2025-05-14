import { isRequestPending } from '@/stores/ir-interceptor.store';
import { Component, h } from '@stencil/core';

@Component({
  tag: 'igl-bulk-blocks',
  styleUrls: ['igl-bulk-blocks.css', '../../../common/sheet.css'],
  scoped: true,
})
export class IglBulkBlocks {
  render() {
    return (
      <div class={'sheet-container'}>
        <div class="sheet-header d-flex align-items-center">
          {/* <h4>Bulk Blocks</h4>
          <igl-date-range
            data-testid="date_picker"
            variant="booking"
            // dateLabel={locales.entries.Lcz_Dates}
            // minDate={this.isEventType('PLUS_BOOKING') ? moment().add(-1, 'months').startOf('month').format('YYYY-MM-DD') : this.minDate}
            // disabled={this.isEventType('BAR_BOOKING') || this.isEventType('SPLIT_BOOKING')}
            // defaultData={this.bookingDataDefaultDateRange}
          ></igl-date-range>
          <ir-button
            btn_id="check_availability"
            isLoading={isRequestPending('/Check_Availability')}
            icon=""
            size="sm"
            class="ml-2"
            text={'Check'}
            // text={locales.entries.Lcz_Check}
            onClickHandler={() => {}}
          ></ir-button> */}
          <ir-title class="px-1" label="Bulk Block Dates" displayContext="sidebar"></ir-title>
        </div>
        <div class="sheet-body px-1">
          {1 === 1 ? <p>Select the listings that you want to block.</p> : <p>Select the roomtypes and units that you want to block.</p>}

          <fieldset class="d-flex">
            <ir-checkbox label="All properties"></ir-checkbox>
          </fieldset>
        </div>
        <div class={'sheet-footer'}></div>
      </div>
    );
  }
}

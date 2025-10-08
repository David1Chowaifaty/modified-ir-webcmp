import { Component, Prop, State, Watch, h } from '@stencil/core';
import { ChannelReportResult } from '../types';
import { formatAmount } from '@/utils/utils';
import { AllowedProperties } from '@/services/property.service';

@Component({
  tag: 'ir-sales-by-channel-table',
  styleUrls: ['ir-sales-by-channel-table.css', '../../../common/table.css'],
  scoped: true,
})
export class IrSalesByChannelTable {
  @Prop() records: ChannelReportResult;
  @Prop() allowedProperties: AllowedProperties;

  @State() visibleCount: number = 10;
  @State() properties: Map<number, string> = new Map();

  componentWillLoad() {
    this.setupProperties();
  }

  @Watch('allowedProperties')
  handlePropertiesChange() {
    this.setupProperties();
  }
  private setupProperties() {
    const map: Map<number, string> = new Map();
    for (const property of this.allowedProperties) {
      map.set(property.id, property.name);
    }
    this.properties = new Map(map);
  }

  private handleLoadMore = () => {
    this.visibleCount = Math.min(this.visibleCount + 10, this.records.length);
  };
  render() {
    const visibleRecords = this.records.slice(0, this.visibleCount);

    return (
      <div class="table-container h-100 p-1 m-0 mb-2 table-responsive">
        <table class="table" data-testid="hk_tasks_table">
          <thead class="table-header">
            <tr>
              <th class="text-center">Channel</th>
              <th class="text-center">Room nights</th>
              <th class="text-right">Room Revenue</th>
              <th class=""></th>
            </tr>
          </thead>

          <tbody>
            {this.records.length === 0 && (
              <tr>
                <td colSpan={5} style={{ height: '300px' }}>
                  No data found.
                </td>
              </tr>
            )}
            {visibleRecords.map(record => {
              const mainPercentage = `${parseFloat(record.PCT.toString()).toFixed(2)}%`;
              const secondaryPercentage = record.last_year ? `${parseFloat(record.last_year.PCT.toString()).toFixed(2)}%` : null;

              return (
                <tr data-testid={`record_row`} class={{ 'task-table-row ir-table-row': true }}>
                  <td class="text-center">
                    <div class="d-flex flex-column" style={{ gap: '0.25rem' }}>
                      <p class={`p-0 m-0 ${record.last_year?.SOURCE ? 'font-weight-bold' : ''}`}>{record.SOURCE}</p>
                      {record.last_year?.SOURCE && (
                        <p class="p-0 mx-0" style={{ marginTop: '0.25rem', marginBottom: '0' }}>
                          {record.last_year.SOURCE}
                        </p>
                      )}
                    </div>
                  </td>
                  <td class="text-center">
                    <div class="d-flex flex-column" style={{ gap: '0.25rem' }}>
                      <p class={`p-0 m-0 ${record.last_year?.NIGHTS ? 'font-weight-bold' : ''}`}>{record.NIGHTS}</p>
                      {record.last_year?.NIGHTS && (
                        <p class="p-0 mx-0" style={{ marginTop: '0.25rem', marginBottom: '0' }}>
                          {record.last_year.NIGHTS}
                        </p>
                      )}
                    </div>
                  </td>
                  <td class="text-right">
                    <div class="d-flex flex-column" style={{ gap: '0.25rem' }}>
                      <p class={`p-0 m-0 ${record.last_year?.REVENUE ? 'font-weight-bold' : ''}`}>{formatAmount(record.currency.symbol, record.REVENUE)}</p>
                      {record.last_year?.REVENUE && (
                        <p class="p-0 mx-0" style={{ marginTop: '0.25rem', marginBottom: '0' }}>
                          {formatAmount(record.currency.symbol, record.last_year.REVENUE)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td>
                    <div class="d-flex flex-column" style={{ gap: '0.5rem' }}>
                      <ir-progress-indicator percentage={mainPercentage}></ir-progress-indicator>
                      {record.last_year?.PCT && <ir-progress-indicator percentage={secondaryPercentage} color="secondary"></ir-progress-indicator>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr style={{ fontSize: '12px' }}>
              <td colSpan={4}>
                <div class={'d-flex align-items-center justify-content-end'} style={{ gap: '1rem', paddingTop: '0.5rem' }}>
                  <div class="d-flex align-items-center" style={{ gap: '0.5rem' }}>
                    <div class="legend bg-primary"></div>
                    <p class="p-0 m-0">Selected period </p>
                  </div>
                  <div class="d-flex align-items-center" style={{ gap: '0.5rem' }}>
                    <div class="legend secondary"></div>
                    <p class="p-0 m-0">Previous year</p>
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
        {this.visibleCount < this.records.length && (
          <div class={'d-flex mx-auto'}>
            <ir-button class="mx-auto" size="sm" text="Load More" onClickHandler={this.handleLoadMore}></ir-button>
          </div>
        )}
      </div>
    );
  }
}

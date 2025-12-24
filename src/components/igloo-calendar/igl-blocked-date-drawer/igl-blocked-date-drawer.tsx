import { BookingService } from '@/services/booking-service/booking.service';
import { getReleaseHoursString } from '@/utils/utils';
import { Component, Event, EventEmitter, h, Prop, State } from '@stencil/core';

@Component({
  tag: 'igl-blocked-date-drawer',
  styleUrl: 'igl-blocked-date-drawer.css',
  scoped: true,
})
export class IglBlockedDateDrawer {
  /**
   * Controls whether the blocked date drawer is open or closed.
   * Reflected to the DOM so it can be styled or toggled externally.
   */
  @Prop({ reflect: true }) open: boolean;

  /**
   * Label text displayed at the top of the drawer.
   * Typically used as the drawer title.
   */
  @Prop() label: string;

  /**
   * Start date of the blocked date range.
   * Expected to be an ISO date string (YYYY-MM-DD).
   */
  @Prop() fromDate: string;

  /**
   * End date of the blocked date range.
   * Expected to be an ISO date string (YYYY-MM-DD).
   */
  @Prop() toDate: string;

  /**
   * Identifier of the unit being blocked.
   * Used when sending block requests to the booking service.
   */
  @Prop() unitId: number;

  @State() isLoading = false;
  @State() blockDatesData: any = {
    from_date: '',
    to_date: '',
    NOTES: '',
    pr_id: null,
    STAY_STATUS_CODE: null,
    DESCRIPTION: null,
    BLOCKED_TILL_DATE: null,
    BLOCKED_TILL_HOUR: null,
    BLOCKED_TILL_MINUTE: null,
  };

  @Event() blockedDateDrawerClosed: EventEmitter<void>;

  private bookingService = new BookingService();

  private async handleBlockDate() {
    try {
      this.isLoading = true;
      const props: any = (() => {
        const releaseData = getReleaseHoursString(this.blockDatesData.RELEASE_AFTER_HOURS !== null ? Number(this.blockDatesData.RELEASE_AFTER_HOURS) : null);
        return {
          from_date: this.fromDate,
          to_date: this.toDate,
          NOTES: this.blockDatesData.OPTIONAL_REASON || '',
          pr_id: this.unitId.toString(),
          STAY_STATUS_CODE: this.blockDatesData.OUT_OF_SERVICE ? '004' : this.blockDatesData.RELEASE_AFTER_HOURS === 0 ? '002' : '003',
          DESCRIPTION: this.blockDatesData.RELEASE_AFTER_HOURS || '',
          ...releaseData,
        };
      })();
      await this.bookingService.blockUnit(props);
      this.closeDrawer();
    } catch (error) {
    } finally {
      this.isLoading = false;
    }
  }

  private closeDrawer() {
    this.blockedDateDrawerClosed.emit();
    this.blockDatesData = {
      from_date: '',
      to_date: '',
      NOTES: '',
      pr_id: null,
      STAY_STATUS_CODE: null,
      DESCRIPTION: null,
      BLOCKED_TILL_DATE: null,
      BLOCKED_TILL_HOUR: null,
      BLOCKED_TILL_MINUTE: null,
    };
  }

  render() {
    return (
      <ir-drawer
        label={this.label}
        onDrawerHide={e => {
          e.stopImmediatePropagation();
          e.stopPropagation();
          this.closeDrawer();
        }}
        open={this.open}
      >
        {this.open && (
          <igl-block-dates-view onDataUpdateEvent={e => (this.blockDatesData = { ...e.detail.data })} fromDate={this.fromDate} toDate={this.toDate}></igl-block-dates-view>
        )}
        <div slot="footer" class="ir__drawer-footer">
          <ir-custom-button data-drawer="close" size="medium" appearance="filled" variant="neutral">
            Cancel
          </ir-custom-button>
          <ir-custom-button
            loading={this.isLoading}
            onClickHandler={() => {
              this.handleBlockDate();
            }}
            size="medium"
            appearance="accent"
            variant="brand"
          >
            Save
          </ir-custom-button>
        </div>
      </ir-drawer>
    );
  }
}

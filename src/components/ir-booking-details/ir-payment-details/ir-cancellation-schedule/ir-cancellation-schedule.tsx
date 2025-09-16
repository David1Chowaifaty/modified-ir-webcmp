import { Booking } from '@/models/reservation.dto';
import { BookingService, ExposedApplicablePolicy } from '@/services/booking.service';
import { Component, Host, Prop, State, Watch, h } from '@stencil/core';
import { CancellationStatement } from '../../types';
import moment from 'moment';
import { formatAmount } from '@/utils/utils';
import calendar_data from '@/stores/calendar-data';

@Component({
  tag: 'ir-cancellation-schedule',
  styleUrl: 'ir-cancellation-schedule.css',
  scoped: true,
})
export class IrCancellationSchedule {
  @Prop() booking: Booking;
  @Prop() propertyId: number;
  @Prop() language: string = 'en';

  @State() cancellationStatements: CancellationStatement[] = [];
  @State() isLoading: boolean = false;

  private bookingService = new BookingService();

  componentWillLoad() {
    this.loadApplicablePolicies();
  }
  @Watch('booking')
  handleBookingChange(newBooking: Booking, oldBooking: Booking) {
    if (oldBooking.rooms.length !== newBooking.rooms.length) {
      this.loadApplicablePolicies();
    }
  }
  private async loadApplicablePolicies() {
    this.isLoading = true;

    try {
      const policies = await Promise.all(
        this.booking.rooms.map(room =>
          this.bookingService.getExposedApplicablePolicies({
            booking_nbr: this.booking.booking_nbr,
            currency_id: this.booking.currency.id,
            property_id: this.propertyId,
            rate_plan_id: room.rateplan.id,
            room_type_id: room.roomtype.id,
            language: this.language,
          }),
        ),
      );
      const getCancellationPolicies = (policies: ExposedApplicablePolicy[]) => {
        return policies.find(p => p.type === 'cancelation');
      };
      const statements: CancellationStatement[] = [];
      this.booking.rooms.forEach((room, idx) => {
        const policy = getCancellationPolicies(policies[idx]);
        if (policy) {
          statements.push({
            ...policy,
            roomType: room.roomtype,
            ratePlan: room.rateplan,
          });
        }
      });
      this.cancellationStatements = [...statements];
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }
  private formatPreviousBracketDueOn(prev: string, current: string) {
    const MPrev = moment(prev, 'YYYY-MM-DD');
    const MCurr = moment(current, 'YYYY-MM-DD');
    if (MPrev.isSame(MCurr, 'year')) {
      return MPrev.format('MMM DD');
    }
    return MPrev.format('MMM DD, YYYY');
  }
  render() {
    if (this.isLoading) {
      return null;
    }
    return (
      <Host>
        <div class="cancellation-schedule__container">
          <p class="cancellation-schedule__title font-size-large p-0 m-0">Cancellation Schedule</p>
          <p class="cancellation-schedule__no-penalty">No penalty charge</p>
        </div>

        <div class="cancellation-schedule__statements">
          {this.cancellationStatements?.map(statement => (
            <div class="cancellation-schedule__statement">
              <p class="cancellation-schedule__room">
                <b>{statement.roomType.name}</b> {statement.ratePlan['short_name']}
              </p>
              <div class="cancellation-schedule__brackets">
                {statement.brackets.map((bracket, idx) => {
                  const previousBracketDueOn = idx === 0 ? null : statement.brackets[idx - 1]?.due_on;
                  return (
                    <div class="cancellation-schedule__bracket">
                      <p class="cancellation-schedule__bracket-dates">
                        {idx === 0 ? 'Until' : previousBracketDueOn ? this.formatPreviousBracketDueOn(previousBracketDueOn, bracket.due_on) : null}{' '}
                        {idx > 0 && previousBracketDueOn && <ir-icons name="arrow_right" class="cancellation-schedule__icon" style={{ '--icon-size': '0.875rem' }}></ir-icons>}{' '}
                        {moment(bracket.due_on, 'YYYY-MM-DD').format('MMM DD, YYYY')}
                      </p>
                      <p class="cancellation-schedule__amount">{formatAmount(calendar_data.currency.symbol, bracket.amount)}</p>

                      <p class="cancellation-schedule__statement-text">{bracket.statement}</p>
                    </div>
                  );
                })}
              </div>
              <div class="cancellation-schedule__brackets-table">
                <table>
                  <tbody>
                    {statement.brackets.map((bracket, idx) => {
                      const previousBracketDueOn = idx === 0 ? null : statement.brackets[idx - 1]?.due_on;
                      return (
                        <tr>
                          <td class="cancellation-schedule__bracket-dates">
                            {idx === 0 ? 'Until' : previousBracketDueOn ? this.formatPreviousBracketDueOn(previousBracketDueOn, bracket.due_on) : null}{' '}
                            {idx > 0 && previousBracketDueOn && <ir-icons name="arrow_right" class="cancellation-schedule__icon" style={{ '--icon-size': '0.875rem' }}></ir-icons>}{' '}
                            {moment(bracket.due_on, 'YYYY-MM-DD').format('MMM DD, YYYY')}
                          </td>

                          <td class="cancellation-schedule__amount px-1">{formatAmount(calendar_data.currency.symbol, bracket.amount)}</td>

                          <td class="cancellation-schedule__statement-text">{bracket.statement}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </Host>
    );
  }
}

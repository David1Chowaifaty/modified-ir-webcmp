import { Booking, Bracket, ExposedApplicablePolicy } from '@/models/booking.dto';
import { Component, Event, EventEmitter, Host, Prop, State, Watch, h } from '@stencil/core';
import { CancellationStatement } from '../../types';
import moment, { Moment } from 'moment';
import { formatAmount } from '@/utils/utils';
import calendar_data from '@/stores/calendar-data';
import { IPaymentAction } from '@/services/payment.service';

@Component({
  tag: 'ir-applicable-policies',
  styleUrl: 'ir-applicable-policies.css',
  scoped: true,
})
export class IrApplicablePolicies {
  @Prop() booking: Booking;
  @Prop() propertyId: number;
  @Prop() language: string = 'en';

  @State() cancellationStatements: CancellationStatement[] = [];
  @State() isLoading: boolean = false;
  @State() guaranteeAmount: number;

  @Event() generatePayment: EventEmitter<IPaymentAction>;

  componentWillLoad() {
    this.loadApplicablePolicies();
  }

  @Watch('booking')
  handleBookingChange() {
    this.loadApplicablePolicies();
  }
  private async loadApplicablePolicies() {
    this.isLoading = true;
    try {
      const getPoliciesByType = (policies: ExposedApplicablePolicy[], type: ExposedApplicablePolicy['type']) => {
        return policies.find(p => p.type === type);
      };
      const statements: CancellationStatement[] = [];
      let total = 0;
      this.booking.rooms.forEach(room => {
        const cancellationPolicy = getPoliciesByType(room.applicable_policies, 'cancelation');
        const guaranteePolicy = getPoliciesByType(room.applicable_policies, 'guarantee');
        if (cancellationPolicy) {
          statements.push({
            ...cancellationPolicy,
            roomType: room.roomtype,
            ratePlan: room.rateplan,
            brackets: cancellationPolicy.brackets.filter(b => b.amount > 0),
            checkInDate: room.from_date,
          });
        }
        if (guaranteePolicy) {
          total += this.getCurrentBracket(guaranteePolicy.brackets)?.amount ?? 0;
        }
      });

      this.guaranteeAmount = total;
      this.cancellationStatements = [...statements];
    } catch (error) {
      console.error(error);
    } finally {
      this.isLoading = false;
    }
  }
  private formatPreviousBracketDueOn(d1: Moment, d2: Moment) {
    if (d1.isSame(d2, 'year')) {
      return d1.format('MMM DD');
    }

    return d1.format('MMM DD, YYYY');
  }
  // private getBracketLabelsAndArrowState({ bracket, index, brackets }: { index: number; bracket: Bracket; brackets: Bracket[]; }): {
  //   leftLabel: string;
  //   showArrow: boolean;
  //   rightLabel: string;
  // } {
  //   let leftLabel = '';
  //   let showArrow = true;
  //   let rightLabel = '';
  //   const MCheckInDate = moment(this.booking.booked_on.date, 'YYYY-MM-DD');
  //   if (brackets.length === 1) {
  //     const d1 = moment(bracket.due_on, 'YYYY-MM-DD');
  //     const isSameDay = d1.isSame(MCheckInDate, 'dates');
  //     const isDueAfterBookedOn = d1.isAfter(MCheckInDate, 'dates');
  //     leftLabel = isSameDay ? null : this.formatPreviousBracketDueOn(d1, MCheckInDate);
  //     showArrow = !isSameDay && !isDueAfterBookedOn;
  //     rightLabel = isDueAfterBookedOn ? null : MCheckInDate.format('MMM DD, YYYY');
  //   } else if (brackets.length > 1) {
  //     if (index === 0) {
  //       leftLabel = 'Until';
  //       showArrow = false;
  //       rightLabel = moment(brackets[index + 1]?.due_on, 'YYYY-MM-DD').format('MMM DD, YYYY');
  //     } else if (index === brackets.length - 1) {
  //       leftLabel = moment(bracket.due_on, 'YYYY-MM-DD').format('MMM DD, YYYY');
  //       showArrow = false;
  //       rightLabel = null;
  //     } else {
  //       const d1 = moment(bracket.due_on, 'YYYY-MM-DD');
  //       const d2 = moment(brackets[index + 1].due_on, 'YYYY-MM-DD').add(-1, 'days');
  //       leftLabel = this.formatPreviousBracketDueOn(d1, d2);
  //       rightLabel = d2.format('MMM DD, YYYY');
  //     }
  //   }
  //   return { leftLabel, rightLabel, showArrow };
  // }
  private getBracketLabelsAndArrowState({ bracket, index, brackets }: { index: number; bracket: Bracket; brackets: Bracket[] }): {
    leftLabel: string | null;
    showArrow: boolean;
    rightLabel: string | null;
  } {
    // Validate inputs
    if (!bracket || !brackets || index < 0 || index >= brackets.length) {
      return { leftLabel: null, rightLabel: null, showArrow: false };
    }

    // Parse dates with validation
    const checkInDate = moment(this.booking.booked_on.date, 'YYYY-MM-DD');
    const bracketDueDate = moment(bracket.due_on, 'YYYY-MM-DD');

    if (!checkInDate.isValid() || !bracketDueDate.isValid()) {
      console.warn('Invalid date encountered in getBracketLabelsAndArrowState');
      return { leftLabel: null, rightLabel: null, showArrow: false };
    }

    // Single bracket case
    if (brackets.length === 1) {
      return this.handleSingleBracket(bracketDueDate, checkInDate);
    }

    // Multiple brackets case
    return this.handleMultipleBrackets(bracket, index, brackets);
  }

  private handleSingleBracket(
    bracketDueDate: moment.Moment,
    checkInDate: moment.Moment,
  ): {
    leftLabel: string | null;
    showArrow: boolean;
    rightLabel: string | null;
  } {
    const isSameDay = bracketDueDate.isSame(checkInDate, 'day');
    const isDueBeforeCheckIn = bracketDueDate.isBefore(checkInDate, 'day');
    // const isDueAfterCheckIn = bracketDueDate.isAfter(checkInDate, 'day');

    if (isSameDay) {
      // Due date is same as check-in date
      return {
        leftLabel: null,
        showArrow: false,
        rightLabel: checkInDate.format('MMM DD, YYYY'),
      };
    } else if (isDueBeforeCheckIn) {
      // Due date is before check-in (overdue scenario)
      return {
        leftLabel: this.formatPreviousBracketDueOn(bracketDueDate, checkInDate),
        showArrow: true,
        rightLabel: checkInDate.format('MMM DD, YYYY'),
      };
    } else {
      // Due date is after check-in (future due date)
      return {
        leftLabel: checkInDate.format('MMM DD, YYYY'),
        showArrow: true,
        rightLabel: bracketDueDate.format('MMM DD, YYYY'),
      };
    }
  }

  private handleMultipleBrackets(
    bracket: Bracket,
    index: number,
    brackets: Bracket[],
  ): {
    leftLabel: string | null;
    showArrow: boolean;
    rightLabel: string | null;
  } {
    const bracketDueDate = moment(bracket.due_on, 'YYYY-MM-DD');

    // First bracket
    if (index === 0) {
      const nextBracket = brackets[index + 1];
      if (!nextBracket) {
        return { leftLabel: null, rightLabel: null, showArrow: false };
      }

      const nextBracketDueDate = moment(nextBracket.due_on, 'YYYY-MM-DD');
      if (!nextBracketDueDate.isValid()) {
        return { leftLabel: null, rightLabel: null, showArrow: false };
      }

      return {
        leftLabel: 'Until',
        showArrow: false,
        rightLabel: nextBracketDueDate.format('MMM DD, YYYY'),
      };
    }

    // Last bracket
    if (index === brackets.length - 1) {
      return {
        leftLabel: bracketDueDate.format('MMM DD, YYYY'),
        showArrow: false,
        rightLabel: 'onwards',
      };
    }

    // Middle brackets
    const nextBracket = brackets[index + 1];
    if (!nextBracket) {
      return { leftLabel: null, rightLabel: null, showArrow: false };
    }

    const nextBracketDueDate = moment(nextBracket.due_on, 'YYYY-MM-DD');
    if (!nextBracketDueDate.isValid()) {
      return { leftLabel: null, rightLabel: null, showArrow: false };
    }

    // Calculate the end of current bracket period (day before next bracket starts)
    const periodEndDate = nextBracketDueDate.clone().subtract(1, 'day');

    return {
      leftLabel: this.formatPreviousBracketDueOn(bracketDueDate, periodEndDate),
      showArrow: true,
      rightLabel: periodEndDate.format('MMM DD, YYYY'),
    };
  }
  private getCurrentBracket(brackets: Bracket[]) {
    const today = moment();
    for (const bracket of brackets) {
      if (today.isSameOrAfter(moment(bracket.due_on, 'YYYY-MM-DD'), 'days')) {
        return bracket;
      }
    }
    return null;
  }

  private generateCancellationStatement() {
    const label = 'if cancelled today';
    const { cancelation_penality_as_if_today } = this.booking.financial;
    if (cancelation_penality_as_if_today === 0) {
      return `No penalty ${label}`;
    }
    return `${cancelation_penality_as_if_today < 0 ? 'Refund' : 'Charge'} ${formatAmount(calendar_data.currency.symbol, Math.abs(cancelation_penality_as_if_today))} ${label}`;
  }

  render() {
    if (this.isLoading) {
      return null;
    }
    const remainingGuaranteeAmount = this.booking.financial.collected - this.guaranteeAmount;
    return (
      <Host>
        {this.guaranteeAmount !== 0 && (
          <section>
            <div class="applicable-policies__guarantee">
              <div class="applicable-policies__guarantee-info">
                <p class="applicable-policies__guarantee-date">{moment(this.booking.booked_on.date, 'YYYY-MM-DD').format('MMM DD, YYYY')}</p>
                <p class="applicable-policies__guarantee-amount">{formatAmount(calendar_data.currency.symbol, this.guaranteeAmount)}</p>
                <p class="applicable-policies__guarantee-label">Guarantee</p>
              </div>
              {remainingGuaranteeAmount < 0 && (
                <div class="applicable-policies__guarantee-action">
                  <ir-button
                    btn_color="dark"
                    text="Pay"
                    size="sm"
                    onClickHandler={() => {
                      this.generatePayment.emit({
                        amount: Math.abs(remainingGuaranteeAmount),

                        currency: calendar_data.currency,
                        due_on: moment().format('YYYY-MM-DD'),
                        pay_type_code: null,
                        reason: '',
                        type: 'OVERDUE',
                      });
                    }}
                  ></ir-button>
                </div>
              )}
            </div>
          </section>
        )}
        <section>
          <div class="applicable-policies__container">
            <p class="applicable-policies__title font-size-large p-0 m-0">Cancellation Schedule</p>
            <p class="applicable-policies__no-penalty">{this.generateCancellationStatement()}</p>
          </div>

          <div class="applicable-policies__statements">
            {this.cancellationStatements?.map(statement => (
              <div class="applicable-policies__statement">
                {this.cancellationStatements.length > 1 && (
                  <p class="applicable-policies__room">
                    <b>{statement.roomType.name}</b> {statement.ratePlan['short_name']}
                  </p>
                )}
                <div class="applicable-policies__brackets">
                  {statement.brackets.map((bracket, idx) => {
                    const { leftLabel, rightLabel, showArrow } = this.getBracketLabelsAndArrowState({
                      index: idx,
                      bracket,
                      brackets: statement.brackets,
                      // checkIn: statement.checkInDate,
                    });
                    return (
                      <div class="applicable-policies__bracket">
                        <p class="applicable-policies__bracket-dates">
                          {leftLabel} {showArrow && <ir-icons name="arrow_right" class="applicable-policies__icon" style={{ '--icon-size': '0.875rem' }}></ir-icons>} {rightLabel}
                        </p>
                        <p class="applicable-policies__amount">{formatAmount(calendar_data.currency.symbol, bracket.amount)}</p>

                        <p class="applicable-policies__statement-text">{bracket.statement}</p>
                      </div>
                    );
                  })}
                </div>
                <div class="applicable-policies__brackets-table">
                  <table>
                    <tbody>
                      {statement.brackets.map((bracket, idx) => {
                        const { leftLabel, rightLabel, showArrow } = this.getBracketLabelsAndArrowState({
                          index: idx,
                          bracket,
                          brackets: statement.brackets,
                          // checkIn: statement.checkInDate,
                        });
                        return (
                          <tr>
                            <td class="applicable-policies__bracket-dates">
                              {leftLabel} {showArrow && <ir-icons name="arrow_right" class="applicable-policies__icon" style={{ '--icon-size': '0.875rem' }}></ir-icons>}{' '}
                              {rightLabel}
                            </td>

                            <td class="applicable-policies__amount px-1">{formatAmount(calendar_data.currency.symbol, bracket.amount)}</td>

                            <td class="applicable-policies__statement-text">{bracket.statement}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>
      </Host>
    );
  }
}

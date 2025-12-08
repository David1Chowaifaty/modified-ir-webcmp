import moment from 'moment';

import { Booking, ExposedApplicablePolicy, Room } from '@/models/booking.dto';
import { BookingService } from '@/services/booking-service/booking.service';

export type ApplicablePoliciesByType = Partial<Record<ExposedApplicablePolicy['type'], ExposedApplicablePolicy[]>>;

export interface ApplicablePolicyStatement extends ExposedApplicablePolicy {
  roomType: Room['roomtype'];
  ratePlan: Room['rateplan'];
  checkInDate: Room['from_date'];
  grossTotal: Room['gross_total'];
}

export interface ApplicablePoliciesResult {
  policiesByType: ApplicablePoliciesByType;
  cancellationStatements: ApplicablePolicyStatement[];
  guaranteeAmount: number;
}

interface GroupedRoomPayload {
  identifiers: string[];
  ratePlanId: number;
  roomTypeId: number;
  rooms: Room[];
}

type BookingServiceDependency = Readonly<Pick<BookingService, 'getExposedApplicablePolicies'>>;

interface ApplicablePoliciesRequest {
  language?: string;
}

interface GroupedPoliciesResponse {
  grouping: GroupedRoomPayload;
  policies: ExposedApplicablePolicy[] | null;
}

/**
 * Coordinates retrieval of applicable policies for a booking by delegating to
 * {@link BookingService} while providing light data preparation utilities.
 */
export class ApplicablePoliciesService {
  private _booking: Booking | null = null;

  constructor(private readonly bookingService: BookingServiceDependency) {}

  /**
   * Returns the booking reference used to scope applicable policy requests.
   */
  public get booking(): Booking | null {
    return this._booking;
  }

  /**
   * Assigns the booking reference that downstream requests rely on.
   */
  public set booking(value: Booking | null) {
    this._booking = value;
  }

  /**
   * Fetches the exposed applicable policies for the active booking and groups
   * them by policy type to simplify consumption within UI layers. Requests for
   * each unique room grouping are executed in parallel. The response includes
   * the grouped policies alongside prebuilt cancellation statements and the
   * aggregate guarantee amount.
   *
   * @throws If a booking is not configured prior to invocation.
   */
  public async fetchGroupedApplicablePolicies(params: ApplicablePoliciesRequest): Promise<ApplicablePoliciesResult> {
    if (!this._booking) {
      throw new Error('Booking must be defined before fetching applicable policies.');
    }
    if (['003', '004'].includes(this._booking.status.code) || !this._booking.is_direct) {
      return;
    }
    const { rooms, booking_nbr, currency, property } = this._booking;
    const groupedRooms = this.groupRoomsForRequest(rooms ?? []);

    try {
      const requests: Promise<GroupedPoliciesResponse>[] = [];

      groupedRooms.forEach(grouping => {
        const basePayload = {
          booking_nbr,
          currency_id: currency.id,
          language: params.language,
          property_id: property.id,
          rate_plan_id: grouping.ratePlanId,
          room_type_id: grouping.roomTypeId,
          is_preserve_history: true,
        };

        if (grouping.identifiers.length > 1) {
          grouping.identifiers.forEach(roomIdentifier => {
            requests.push(
              this.bookingService
                .getExposedApplicablePolicies({ ...basePayload, room_identifier: roomIdentifier })
                .then(policies => ({ grouping: { ...grouping, rooms: rooms.filter(r => r.identifier === roomIdentifier) }, policies })),
            );
          });
        } else {
          requests.push(this.bookingService.getExposedApplicablePolicies(basePayload).then(policies => ({ grouping, policies })));
        }
      });

      const groupedPolicies = await Promise.all(requests);

      const policiesByType = this.buildPoliciesByType(groupedPolicies);
      const cancellationStatements = this.buildCancellationStatements(groupedPolicies);
      const guaranteeAmount = this.calculateGuaranteeAmount(groupedPolicies);

      return { policiesByType, cancellationStatements, guaranteeAmount };
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to fetch applicable policies: ${detail}`);
    }
  }

  /**
   * Creates a list of unique room groupings keyed by rate plan and room type.
   * Each grouping tracks the identifiers of the rooms it represents.
   *
   * @param rooms - The rooms attached to the active booking.
   */
  private groupRoomsForRequest(rooms: Room[]): GroupedRoomPayload[] {
    if (!rooms.length) {
      throw new Error('Cannot request applicable policies without booking rooms.');
    }

    const groupMap = new Map<string, GroupedRoomPayload>();

    rooms.forEach(room => {
      if (!room.rateplan?.id || !room.roomtype?.id) {
        throw new Error('Room is missing rate plan or room type information.');
      }

      const key = `${room.roomtype.id}-${room.rateplan.id}`;
      const identifier = typeof room.identifier === 'string' ? room.identifier : null;

      if (!groupMap.has(key)) {
        groupMap.set(key, {
          ratePlanId: room.rateplan.id,
          roomTypeId: room.roomtype.id,
          identifiers: identifier ? [identifier] : [],
          rooms: [room],
        });
        return;
      }

      const group = groupMap.get(key)!;
      group.rooms.push(room);
      if (identifier && !group.identifiers.includes(identifier)) {
        group.identifiers.push(identifier);
      }
    });

    return [...groupMap.values()];
  }

  private buildPoliciesByType(groupedPolicies: GroupedPoliciesResponse[]): ApplicablePoliciesByType {
    const flattened = groupedPolicies.flatMap(group => group.policies ?? []);
    return this.groupPoliciesByType(flattened);
  }

  /**
   * Organizes the raw policies returned from the API by their logical type so
   * consumers can access grouped guarantees or cancellations effortlessly.
   */
  private groupPoliciesByType(policies: ExposedApplicablePolicy[]): ApplicablePoliciesByType {
    return policies.reduce<ApplicablePoliciesByType>((acc, policy) => {
      acc[policy.type] = acc[policy.type] ? [...acc[policy.type]!, policy] : [policy];
      return acc;
    }, {});
  }

  /**
   * Builds the cancellation statements derived from the fetched policies and
   * booking rooms.
   */
  private buildCancellationStatements(groupedPolicies: GroupedPoliciesResponse[]): ApplicablePolicyStatement[] {
    if (!this._booking) {
      return [];
    }

    const statements: ApplicablePolicyStatement[] = [];

    groupedPolicies.forEach(({ grouping, policies }) => {
      if (!policies?.length) {
        return;
      }

      const cancellationPolicy = policies.find(policy => policy.type === 'cancelation');
      if (!cancellationPolicy) {
        return;
      }

      grouping.rooms.forEach(room => {
        const checkInDate = moment(room.from_date, 'YYYY-MM-DD', true);
        if (!checkInDate.isValid()) {
          return;
        }
        // const checkInDateStr = checkInDate.format('YYYY-MM-DD');
        //Remove check-in dates and above from brackets
        const oldBrackets = cancellationPolicy.brackets.filter(bracket => {
          const bracketDate = moment(bracket.due_on, 'YYYY-MM-DD', true);
          return bracketDate.isValid() && bracketDate.isBefore(checkInDate, 'day');
        });
        // if (!oldBrackets.length) {
        //   return;
        // }
        //check if at least one bracket have a amount > 0
        const hasPositiveBracket = oldBrackets.some(bracket => bracket.amount > 0);

        let filteredBrackets: typeof oldBrackets;

        if (hasPositiveBracket) {
          filteredBrackets = oldBrackets
            .map((bracket, index) => {
              if (bracket.amount > 0) {
                return bracket;
              }
              const nextBracket = oldBrackets[index + 1];
              if (nextBracket?.amount && nextBracket.amount > 0) {
                return bracket;
              }
              return undefined;
            })
            .filter((bracket): bracket is (typeof oldBrackets)[number] => Boolean(bracket));
        } else {
          filteredBrackets = [...oldBrackets];
        }

        filteredBrackets = [...this.mergeBracketsByAmount(filteredBrackets)];

        if (!room.rateplan.is_non_refundable) {
          const inDate = moment(room.from_date, 'YYYY-MM-DD', true);
          const outDate = moment(room.to_date, 'YYYY-MM-DD', true);
          const stayNights = outDate.isValid() && inDate.isValid() ? outDate.diff(inDate, 'days') : 0;
          const fullChargeDate = stayNights > 1 ? inDate.clone().add(1, 'day').format('YYYY-MM-DD') : inDate.format('YYYY-MM-DD');
          filteredBrackets.push({
            amount: room.total,
            amount_formatted: '',
            code: '',
            currency_id: this._booking.currency.id,
            due_on: fullChargeDate,
            due_on_formatted: '',
            gross_amount: room.gross_total,
            gross_amount_formatted: '',
            statement: '100% of total price',
          });

          filteredBrackets.sort((a, b) => {
            const aDate = moment(a.due_on, 'YYYY-MM-DD', true);
            const bDate = moment(b.due_on, 'YYYY-MM-DD', true);
            return aDate.valueOf() - bDate.valueOf();
          });
        }

        statements.push({
          ...cancellationPolicy,
          brackets: filteredBrackets,
          roomType: room.roomtype,
          ratePlan: room.rateplan,
          checkInDate: room.from_date,
          grossTotal: room.gross_total,
        });
      });
    });

    return statements;
  }

  /**
   * Aggregates the guarantee commitments across the booking rooms using the
   * freshly retrieved policy data.
   */
  private calculateGuaranteeAmount(groupedPolicies: GroupedPoliciesResponse[]): number {
    return groupedPolicies.reduce((total, { grouping, policies }) => {
      if (!policies?.length) {
        return total;
      }

      const guaranteePolicy = policies.find(policy => policy.type === 'guarantee');
      if (!guaranteePolicy) {
        return total;
      }

      const currentBracket = this.selectCurrentBracket(guaranteePolicy.brackets);
      if (!currentBracket) {
        return total;
      }

      const roomsTotal = grouping.rooms.length * (currentBracket.gross_amount ?? 0);
      return total + roomsTotal;
    }, 0);
  }

  private selectCurrentBracket(brackets: ExposedApplicablePolicy['brackets']): ExposedApplicablePolicy['brackets'][number] | null {
    const today = moment().startOf('day');

    for (const bracket of brackets) {
      const dueDate = moment(bracket.due_on, 'YYYY-MM-DD', true);
      if (!dueDate.isValid()) {
        continue;
      }

      if (today.isSameOrAfter(dueDate, 'day')) {
        return bracket;
      }
    }

    return null;
  }

  /**
   * Collapses consecutive brackets that share the same gross amount so only
   * price changes are surfaced.
   */
  private mergeBracketsByAmount(brackets: ExposedApplicablePolicy['brackets']): ExposedApplicablePolicy['brackets'] {
    if (brackets.length <= 1) {
      return [...brackets];
    }

    return brackets.reduce<ExposedApplicablePolicy['brackets']>((acc, bracket) => {
      const last = acc[acc.length - 1];
      if (!last || last.gross_amount !== bracket.gross_amount) {
        acc.push(bracket);
      }
      return acc;
    }, []);
  }
}

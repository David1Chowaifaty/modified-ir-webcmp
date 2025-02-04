import { Booking, Room } from '@/models/booking.dto';
import { TSourceOption } from '@/models/igl-book-property';
import VariationService from '@/services/variation.service';
import booking_store, { IRatePlanSelection } from '@/stores/booking.store';
import { calculateDaysBetweenDates } from '@/utils/booking';
import { extras } from '@/utils/utils';
import moment from 'moment';

export class IglBookPropertyService {
  private variationService: VariationService;
  public setBookingInfoFromAutoComplete(context, res) {
    context.bookedByInfoData = {
      id: res.guest.id,
      email: res.guest.email,
      firstName: res.guest.first_name,
      lastName: res.guest.last_name,
      countryId: res.guest.country_id,
      isdCode: res.guest?.country_phone_prefix ?? res.guest?.country_id.toString(),
      contactNumber: res.guest.mobile,
      selectedArrivalTime: res.arrival,
      emailGuest: res.guest.subscribe_to_news_letter,
      message: res.remark,
      cardNumber: '',
      cardHolderName: '',
      expiryMonth: '',
      expiryYear: '',
      bookingNumber: res.booking_nbr,
      rooms: res.rooms,
      from_date: res.from_date,
      to_date: res.to_date,
    };
  }

  public resetRoomsInfoAndMessage(context) {
    context.defaultData.roomsInfo = [];
    context.message = '';
  }

  public onDataRoomUpdate(event: CustomEvent, selectedUnits: Map<string, Map<string, any>>, isEdit: boolean, isEditBooking: boolean, name: string) {
    let units = selectedUnits;
    const { data, key, changedKey } = event.detail;
    const roomCategoryKey = `c_${data.roomCategoryId}`;
    const ratePlanKey = `p_${data.ratePlanId}`;

    if (this.shouldClearData(key)) {
      units = new Map();
    }

    this.initializeRoomCategoryIfNeeded(roomCategoryKey, units);

    if (isEditBooking) {
      if (changedKey === 'rate') {
        if (units.has(roomCategoryKey) && units.get(roomCategoryKey).has(ratePlanKey)) {
          this.applyBookingEditToSelectedRoom(roomCategoryKey, ratePlanKey, data, units, name, isEdit);
        }
      } else {
        if (changedKey !== 'rateType') {
          if (changedKey === 'adult_child_offering') {
            if (units.has(roomCategoryKey) && selectedUnits.get(roomCategoryKey).has(ratePlanKey)) {
              this.applyBookingEditToSelectedRoom(roomCategoryKey, ratePlanKey, data, units, name, isEdit);
            }
          } else {
            this.applyBookingEditToSelectedRoom(roomCategoryKey, ratePlanKey, data, units, name, isEdit);
          }
        }
      }
    } else {
      this.setSelectedRoomData(roomCategoryKey, ratePlanKey, data, units);
    }
    this.cleanupEmptyData(roomCategoryKey, units);
    return units;
  }

  private shouldClearData(key: string | undefined): boolean {
    return key === 'clearData' || key === 'EDIT_BOOKING';
  }

  private initializeRoomCategoryIfNeeded(roomCategoryKey: string, selectedUnits: Map<string, Map<string, any>>) {
    if (!selectedUnits.has(roomCategoryKey)) {
      selectedUnits.set(roomCategoryKey, new Map());
    }
  }
  private setSelectedRoomData(roomCategoryKey: string, ratePlanKey: string, data: any, selectedUnits: Map<string, Map<string, any>>) {
    let selectedRatePlans = selectedUnits.get(roomCategoryKey);
    if (data.totalRooms === 0 || data.inventory === 0) {
      selectedRatePlans.delete(ratePlanKey);
    } else {
      selectedUnits.set(roomCategoryKey, selectedRatePlans.set(ratePlanKey, { ...data, selectedUnits: Array(data.totalRooms).fill(-1) }));
    }
  }

  private cleanupEmptyData(roomCategoryKey: string, selectedUnits: Map<string, Map<string, any>>) {
    if (selectedUnits.has(roomCategoryKey)) {
      let selectedRatePlans = selectedUnits.get(roomCategoryKey);
      if (selectedRatePlans.size === 0) {
        selectedUnits.delete(roomCategoryKey);
      }
    }
  }
  private applyBookingEditToSelectedRoom(roomCategoryKey: string, ratePlanKey: string, data, selectedUnits: Map<string, Map<string, any>>, name: string, isEdit: boolean) {
    selectedUnits.clear();
    let res = {};
    if (isEdit) {
      res = { ...data, guestName: name || '', roomId: '' };
    } else {
      res = { ...data };
    }
    selectedUnits.set(roomCategoryKey, new Map().set(ratePlanKey, res));
  }

  private generateDailyRates(from_date: Date, to_date: Date, amount: number) {
    const endDate = new Date(to_date);
    endDate.setDate(endDate.getDate() - 1);

    let currentDate = new Date(from_date);
    const days: {
      date: string;
      amount: number;
      cost: null;
    }[] = [];

    while (currentDate <= endDate) {
      days.push({
        date: moment(currentDate).format('YYYY-MM-DD'),
        amount: amount,
        cost: null,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return days;
  }

  // private extractFirstNameAndLastName(name: string) {
  //   const names = name.split(' ');
  //   return { first_name: names[0] || null, last_name: names[1] || null };
  // }

  private getBookedRooms({
    check_in,
    check_out,
    notes,
    identifier,
    override_unit,
    unit,
    auto_check_in,
  }: {
    identifier: string | null;
    check_in: Date;
    check_out: Date;
    override_unit: boolean;
    unit: string;
    notes: string | null;
    auto_check_in: boolean;
  }) {
    const rooms = [];
    const total_days = calculateDaysBetweenDates(moment(check_in).format('YYYY-MM-DD'), moment(check_out).format('YYYY-MM-DD'));
    const calculateAmount = ({ is_amount_modified, selected_variation, view_mode, rp_amount, ratePlan }: IRatePlanSelection, infants: number) => {
      if (is_amount_modified) {
        return view_mode === '002' ? rp_amount : rp_amount / total_days;
      }
      let variation = selected_variation;
      if (infants > 0) {
        if (!this.variationService) {
          this.variationService = new VariationService();
        }
        variation = this.variationService.getVariationBasedOnInfants({ variations: ratePlan.variations, baseVariation: selected_variation, infants });
      }
      return Number(variation.discounted_amount) / total_days;
    };
    for (const roomTypeId in booking_store.ratePlanSelections) {
      const roomtype = booking_store.ratePlanSelections[roomTypeId];
      for (const rateplanId in roomtype) {
        const rateplan = roomtype[rateplanId];
        if (rateplan.reserved > 0) {
          for (let i = 0; i < rateplan.reserved; i++) {
            const { first_name, last_name } = rateplan.guest[i];
            rooms.push({
              identifier,
              roomtype: rateplan.roomtype,
              rateplan: rateplan.ratePlan,
              prepayment_amount_gross: 0,
              unit: override_unit ? { id: unit } : rateplan.guest[i].unit ? { id: rateplan.guest[i].unit } : null,
              occupancy: {
                adult_nbr: rateplan.selected_variation.adult_nbr,
                children_nbr: rateplan.selected_variation.child_nbr - Math.max(rateplan.guest[i].infant_nbr, 0),
                infant_nbr: rateplan.guest[i].infant_nbr,
              },
              bed_preference: rateplan.guest[i].bed_preference,
              from_date: moment(check_in).format('YYYY-MM-DD'),
              to_date: moment(check_out).format('YYYY-MM-DD'),
              notes,
              check_in: auto_check_in,
              days: this.generateDailyRates(check_in, check_out, calculateAmount(rateplan, rateplan.guest[i].infant_nbr)),
              guest: {
                email: null,
                first_name,
                last_name,
                country_id: null,
                city: null,
                mobile: null,
                address: null,
                dob: null,
                subscribe_to_news_letter: null,
                cci: null,
              },
            });
          }
        }
      }
    }
    return rooms;
  }

  async prepareBookUserServiceParams({ context, sourceOption, check_in }: { context: any; sourceOption: TSourceOption; check_in: boolean }) {
    try {
      // Validate context structure
      if (!context || !context.dateRangeData) {
        throw new Error('Invalid context: Missing date range data.');
      }

      const fromDate = new Date(context.dateRangeData.fromDate);
      const toDate = new Date(context.dateRangeData.toDate);

      const generateNewRooms = (identifier = null, check_in: boolean = false) => {
        return this.getBookedRooms({
          check_in: fromDate,
          check_out: toDate,
          identifier,
          notes: '',
          override_unit: context.isEventType('BAR_BOOKING') ? true : false,
          unit: context.isEventType('BAR_BOOKING') ? context.bookingData.PR_ID : null,
          auto_check_in: check_in,
        });
      };

      const modifyBookingDetails = ({ pickup_info, extra_services, is_direct, is_in_loyalty_mode, promo_key, extras, ...rest }: Booking, rooms: Room[]) => {
        return {
          assign_units: true,
          is_pms: true,
          is_direct,
          is_in_loyalty_mode,
          promo_key,
          extras,
          booking: {
            ...rest,
            rooms,
          },
          extra_services,
          pickup_info,
        };
      };

      let newBooking = null;

      switch (context.defaultData.event_type) {
        case 'EDIT_BOOKING': {
          const { booking, currentRoomType } = context.defaultData;

          const filteredRooms = booking.rooms.filter(r => r.identifier !== currentRoomType.identifier);
          console.log('currentRoomType', currentRoomType);
          const newRooms = generateNewRooms(currentRoomType.identifier, currentRoomType.in_out?.code === '001');
          newBooking = modifyBookingDetails(booking, [...filteredRooms, ...newRooms]);
          break;
        }
        case 'ADD_ROOM':
        case 'SPLIT_BOOKING': {
          const { booking } = context.defaultData;
          if (!booking) {
            throw new Error('Missing booking');
          }
          console.log(booking);
          const newRooms = generateNewRooms();
          newBooking = modifyBookingDetails(booking, [...booking?.rooms, ...newRooms]);
          break;
        }
        default: {
          const newRooms = generateNewRooms(null, check_in);
          const { bookedByInfoData } = context;
          const isAgent = sourceOption.type === 'TRAVEL_AGENCY';
          newBooking = {
            assign_units: true,
            is_pms: true,
            is_direct: true,
            is_in_loyalty_mode: false,
            promo_key: null,
            extras,
            agent: isAgent ? { id: sourceOption.tag } : null,
            booking: {
              from_date: moment(fromDate).format('YYYY-MM-DD'),
              to_date: moment(toDate).format('YYYY-MM-DD'),
              remark: bookedByInfoData.message || null,
              booking_nbr: '',
              property: {
                id: context.propertyid,
              },
              booked_on: {
                date: moment().format('YYYY-MM-DD'),
                hour: new Date().getHours(),
                minute: new Date().getMinutes(),
              },
              source: isAgent ? '' : sourceOption,
              rooms: newRooms,
              currency: context.currency,
              arrival: { code: bookedByInfoData.selectedArrivalTime },
              guest: {
                email: bookedByInfoData.email === '' ? null : bookedByInfoData.email || null,
                first_name: bookedByInfoData.firstName,
                last_name: bookedByInfoData.lastName,
                country_id: bookedByInfoData.countryId === '' ? null : bookedByInfoData.countryId,
                city: null,
                mobile: bookedByInfoData.contactNumber === null ? '' : bookedByInfoData.contactNumber,
                country_phone_prefix: bookedByInfoData?.isdCode ?? null,
                address: '',
                dob: null,
                subscribe_to_news_letter: bookedByInfoData.emailGuest || false,
                cci: bookedByInfoData.cardNumber
                  ? {
                      nbr: bookedByInfoData.cardNumber,
                      holder_name: bookedByInfoData.cardHolderName,
                      expiry_month: bookedByInfoData.expiryMonth,
                      expiry_year: bookedByInfoData.expiryYear,
                    }
                  : null,
              },
            },
            pickup_info: null,
          };
          break;
        }
      }
      return newBooking;
    } catch (error) {
      console.error(error);
    }
  }

  private getRoomCategoryByRoomId(bookingData) {
    return bookingData.roomsInfo?.find(roomCategory => {
      return roomCategory.id === bookingData.RATE_TYPE;
    });
  }
  public setEditingRoomInfo(bookingData, selectedUnits) {
    const category = this.getRoomCategoryByRoomId(bookingData);
    const room_id = !category ? '' : `c_${category?.id}`;
    const ratePlanId = `p_${bookingData.RATE_PLAN_ID}`;
    const data = {
      adultCount: bookingData.ADULTS_COUNT,
      rate: bookingData.RATE,
      rateType: bookingData.RATE_TYPE,
      ratePlanId: bookingData.RATE_PLAN_ID,
      roomCategoryId: category ? category.id : '',
      roomCategoryName: category ? category.name : '',
      totalRooms: 1,
      ratePlanName: bookingData.RATE_PLAN,
      roomId: bookingData.PR_ID,
      guestName: bookingData.NAME,
      cancelation: bookingData.cancelation,
      guarantee: bookingData.guarantee,
      adult_child_offering: bookingData.adult_child_offering,
    };
    selectedUnits.set(room_id, new Map().set(ratePlanId, data));
  }
}

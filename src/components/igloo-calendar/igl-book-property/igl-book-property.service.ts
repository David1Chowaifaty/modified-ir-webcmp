import { BookUserParams } from '../../../models/igl-book-property';
//import { BookingService } from '../../../services/booking.service';

export class IglBookPropertyService {
  public setBookingInfoFromAutoComplete(context, res) {
    context.bookedByInfoData = {
      id: res.guest.id,
      email: res.guest.email,
      firstName: res.guest.first_name,
      lastName: res.guest.last_name,
      countryId: res.guest.country_id,
      isdCode: res.guest.country_id.toString(),
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
  async prepareBookUserServiceParams(context, check_in, sourceOption): Promise<BookUserParams> {
    try {
      const arrivalTime = context.isEventType('EDIT_BOOKING')
        ? context.getArrivalTimeForBooking()
        : context.isEventType('ADD_ROOM')
        ? context.bookingData.ARRIVAL.code
        : context.isEventType('SPLIT_BOOKING')
        ? context.bookedByInfoData.selectedArrivalTime.code
        : '';
      const pr_id = context.isEventType('BAR_BOOKING') ? context.bookingData.PR_ID : undefined;
      const bookingNumber =
        context.isEventType('EDIT_BOOKING') || context.isEventType('ADD_ROOM')
          ? context.bookingData.BOOKING_NUMBER
          : context.isEventType('SPLIT_BOOKING')
          ? context.bookedByInfoData.bookingNumber
          : undefined;
      let rooms = [];
      if (context.isEventType('ADD_ROOM')) {
        // const result = await (context.bookingService as BookingService).getExoposedBooking(bookingNumber, context.language);
        //rooms = result.rooms;
        rooms = context.bookingData.ROOMS;
      } else if (context.isEventType('SPLIT_BOOKING')) {
        rooms = context.bookedByInfoData.rooms;
      } else if (context.isEventType('EDIT_BOOKING')) {
        rooms = context.defaultData.ROOMS.filter(room => room.identifier !== context.bookingData.IDENTIFIER);
      }
      console.log('rooms', rooms);

      return [
        context.bookedByInfoData,
        check_in,
        new Date(context.dateRangeData.fromDate),
        new Date(context.dateRangeData.toDate),
        context.guestData,
        context.dateRangeData.dateDifference,
        sourceOption,
        context.propertyid,
        rooms,
        context.currency,
        bookingNumber,
        context.bookingData.GUEST,
        arrivalTime,
        pr_id,
        context.bookingData.IDENTIFIER,
      ];
    } catch (error) {
      console.log(error);
    }
  }
  // private getBookingPreferenceRoomId(bookingData) {
  //   return (bookingData.hasOwnProperty('PR_ID') && bookingData.PR_ID) || null;
  // }
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

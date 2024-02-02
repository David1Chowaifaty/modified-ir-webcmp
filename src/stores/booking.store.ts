import { BookingDetails, ISelectedRatePlan } from '@/models/IBooking';
import { TAdultChildConstraints } from '..';
import { ISource } from './../../dist/types/models/IBooking.d';
import { createStore } from '@stencil/store';

export interface IDates {
  fromDate: string;
  toDate: string;
}
export interface IBookingDetails {
  source: ISource | null;
  guests: TAdultChildConstraints;
  dates: IDates;
  bookingDetails: BookingDetails;
  roomsDistrubution: { key: string; value: number }[];
  userSelections: SelectedRatePlan[];
}
export interface SelectedRatePlan extends ISelectedRatePlan {
  roomTypeId: number;
  ratePlanId: number;
  variationIndex: number;
  numberSelected: number;
}
const initialState: IBookingDetails = {
  source: null,
  guests: {
    adult_max_nbr: 0,
    child_max_nbr: 0,
    child_max_age: 0,
  },
  dates: {
    fromDate: '',
    toDate: '',
  },
  bookingDetails: {
    roomtypes: [],
    tax_statement: '',
  },
  roomsDistrubution: [],
  userSelections: [],
};
const { state: booking_details, onChange } = createStore<IBookingDetails>(initialState);

export function selectRatePlan(roomTypeId: number, ratePlanData: ISelectedRatePlan, key?: keyof ISelectedRatePlan) {
  const roomType = booking_details.bookingDetails.roomtypes.find(rt => rt.id === roomTypeId);
  if (roomType) {
    // Find the existing user selection for this room type and rate plan
    const existingSelectionIndex = booking_details.userSelections.findIndex(sel => sel.roomTypeId === roomTypeId && sel.ratePlanId === ratePlanData.ratePlanId);
    const existingSelection = booking_details.userSelections[existingSelectionIndex];

    // If there is an existing selection and the totalRooms is zero, remove the selection
    if (existingSelection && ratePlanData.totalRooms === 0) {
      booking_details.userSelections.splice(existingSelectionIndex, 1);
      roomType.inventory += existingSelection.numberSelected; // Restoring the inventory
    } else if (existingSelection) {
      if (key === 'totalRooms') {
        // Adjust inventory based on the new and old number selected
        const inventoryAdjustment = existingSelection.numberSelected - ratePlanData.totalRooms;
        roomType.inventory += inventoryAdjustment;
        // Update the existing selection
        existingSelection.numberSelected = ratePlanData.totalRooms;
        existingSelection.variationIndex = ratePlanData.index;
      } else if (key === 'rate') {
        existingSelection.rate = ratePlanData.rate;
      } else if (key === 'adult_child_offering') {
        existingSelection.rate = ratePlanData.adultCount;
        existingSelection.adult_child_offering = ratePlanData.adult_child_offering;
      }
    } else {
      if (ratePlanData.totalRooms > 0 && key === 'totalRooms') {
        if (roomType.inventory >= ratePlanData.totalRooms) {
          booking_details.userSelections.push({
            roomTypeId: roomTypeId,
            ratePlanId: ratePlanData.ratePlanId,
            variationIndex: ratePlanData.index,
            numberSelected: ratePlanData.totalRooms,
            ...ratePlanData,
          });
          // Update room inventory
          roomType.inventory -= ratePlanData.totalRooms;
        } else {
          console.error('Not enough inventory for the selected rate plan');
        }
      }
    }
  } else {
    console.error('Room type not found');
  }
  console.log('bookingDetails', booking_details.bookingDetails);
  console.log('user selection', booking_details.userSelections);
}
onChange('bookingDetails', newValue => {
  console.log('new Value', newValue);
});

onChange('bookingDetails', newValue => {
  console.log('new Value', newValue);
});

export function deselectRatePlan(roomTypeId: number, ratePlanId: number, variationIndex: number, numberSelected: number) {
  const roomType = booking_details.bookingDetails.roomtypes.find(rt => rt.id === roomTypeId);
  if (roomType) {
    const ratePlan = roomType.rateplans.find(rp => rp.id === ratePlanId);
    if (ratePlan) {
      const variation = ratePlan.variations[variationIndex];
      if (variation && variation.amount - numberSelected >= 0) {
        variation.amount -= numberSelected;
        roomType.inventory += numberSelected;
      } else {
        console.error('Cannot deselect more than the number selected');
      }
    }
  }
}

export default booking_details;

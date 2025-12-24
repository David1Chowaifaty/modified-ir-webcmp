import { z } from 'zod';

/**
 * Defines the operating mode of the Booking Editor.
 *
 * Each mode determines how the editor initializes data,
 * which fields are editable, and how rooms and dates are handled.
 *
 * Modes:
 *
 * - SPLIT_BOOKING
 *   Add a room to an existing booking **without explicitly selecting it**.
 *   The editor follows the dates of the target booking.
 *
 * - BAR_BOOKING
 *   Create a booking for a **specific room** with **predefined dates**
 *   (Best Available Rate flow).
 *
 * - ADD_ROOM
 *   Add one or more rooms to an **existing booking**.
 *   Dates are inherited from the booking.
 *
 * - EDIT_BOOKING
 *   Edit an existing booking.
 *   Allows modifying guest details, rooms, and dates.
 *
 * - PLUS_BOOKING
 *   Create a **new booking from scratch** with no predefined
 *   rooms or dates.
 */
export type BookingEditorMode = 'SPLIT_BOOKING' | 'BAR_BOOKING' | 'ADD_ROOM' | 'EDIT_BOOKING' | 'PLUS_BOOKING';

export type BookingStep = 'details' | 'confirm';

export const RoomsGuestsSchema = z.array(
  z
    .object({
      first_name: z.string().nonempty(),
      last_name: z.string().nonempty(),
      bed_preference: z.string().optional().nullable(),
      requires_bed_preference: z.boolean().nullable(),
    })
    .superRefine((data, ctx) => {
      if (data.requires_bed_preference && !data.bed_preference) {
        ctx.addIssue({
          path: ['bed_preference'],
          message: 'Bed preference is required',
          code: z.ZodIssueCode.custom,
        });
      }
    }),
);
export const BookedByGuestSchema = z.object({
  firstName: z.string().nonempty(),
  lastName: z.string().nonempty(),
});

export type BlockedDatePayload = {
  RELEASE_AFTER_HOURS: string;
  ENTRY_DATE: string;
  ENTRY_HOUR: number;
  ENTRY_MINUTE: number;
  OPTIONAL_REASON: string;
  STATUS_CODE: string;
  OUT_OF_SERVICE: boolean;
};

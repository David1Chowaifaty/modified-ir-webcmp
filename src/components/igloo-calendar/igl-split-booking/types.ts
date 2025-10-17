import { Moment } from 'moment';
import { z } from 'zod';

export type RoomDates = { from_date: Moment; to_date: Moment };

export const SelectedUnitSchema = z.object({
  roomtype_id: z.coerce.number(),
  unit_id: z.coerce.number(),
  rateplan_id: z.coerce.number(),
});

export type SelectedUnit = z.infer<typeof SelectedUnitSchema>;

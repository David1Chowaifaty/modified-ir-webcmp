import { IChannel } from '@/models/calendarData';

export class IrMappingService {
  public checkMappingExists(id: string, selected_channel: IChannel) {
    return selected_channel.map.find(m => m.foreign_id === id);
  }
}

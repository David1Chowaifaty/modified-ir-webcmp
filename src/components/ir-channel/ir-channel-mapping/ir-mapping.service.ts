import { IChannel } from '@/models/calendarData';
// import calendar_data from '@/stores/calendar-data';

export class IrMappingService {
  public checkMappingExists(id: string, selected_channel: IChannel) {
    return selected_channel.map.find(m => m.foreign_id === id);
  }
  // public getAppropriateRooms(isRoomType:boolean,room_type_id:string,selected_channel:IChannel) {
  //   if (isRoomType) {
  //     return calendar_data.roomsInfo.filter(room=>selected_channel.map.find(m=>m.ir_id===room.id.toString()))
  //   }
  //   const

  // }
}

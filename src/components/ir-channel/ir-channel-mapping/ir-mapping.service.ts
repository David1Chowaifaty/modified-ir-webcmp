import channels_data from '@/stores/channel.store';

export class IrMappingService {
  public checkMappingExists(id: string) {
    return channels_data.mappedChannel.find(m => m.channel_id === id);
  }
  // public getAppropriateRooms(isRoomType:boolean,room_type_id:string,selected_channel:IChannel) {
  //   if (isRoomType) {
  //     return calendar_data.roomsInfo.filter(room=>selected_channel.map.find(m=>m.ir_id===room.id.toString()))
  //   }
  //   const

  // }
}

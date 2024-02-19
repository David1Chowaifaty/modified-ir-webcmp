import calendar_data from '@/stores/calendar-data';
import channels_data from '@/stores/channel.store';

export class IrMappingService {
  public checkMappingExists(id: string, isRoomType: boolean, roomTypeId?: string) {
    const mapped_id = channels_data.mappedChannel.find(m => m.channel_id === id);
    if (!mapped_id) {
      return undefined;
    }
    if (!isRoomType) {
      console.log('object');
      return undefined;
    }
    if (isRoomType) {
      return calendar_data.roomsInfo.find(room => room.id.toString() === mapped_id.ir_id);
    }
    if (!roomTypeId) {
      throw new Error('Missing room type id');
    }
    const room_type = calendar_data.roomsInfo.find(room => room.id.toString() === roomTypeId);
    console.log(room_type);
    if (!room_type) {
      throw new Error('Invalid Room type');
    }
    console.log(room_type);
    return room_type.rateplans.find(r => r.id.toString() === mapped_id.ir_id);
  }
  public getAppropriateRooms(isRoomType: boolean, roomTypeId?: string) {
    if (isRoomType) {
      const filteredRoomTypes = calendar_data.roomsInfo.filter(
        room => channels_data.mappedChannel.find(m => m.ir_id.toString() === room.id.toString()) === undefined && room.is_active,
      );
      return filteredRoomTypes.map(room => ({ id: room.id.toString(), name: room.name }));
    }
    if (!roomTypeId) {
      throw new Error('Missing roomType id');
    }
    console.log(roomTypeId);
    const selectedRoomType = calendar_data.roomsInfo.filter(room => channels_data.mappedChannel.find(m => m.channel_id.toString() === roomTypeId) && room.is_active);
    console.log(selectedRoomType);

    // console.log(filteredRoomTypes);
    //filter all the room types that are taken
  }
}

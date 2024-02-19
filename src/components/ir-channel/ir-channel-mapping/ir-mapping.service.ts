import calendar_data from '@/stores/calendar-data';
import channels_data from '@/stores/channel.store';

export class IrMappingService {
  public checkMappingExists(id: string, isRoomType: boolean, roomTypeId?: string) {
    const mapped_id = channels_data.mappedChannel.find(m => m.channel_id === id);
    if (!mapped_id) {
      return undefined;
    }
    if (isRoomType) {
      return calendar_data.roomsInfo.find(room => room.id.toString() === mapped_id.ir_id);
    }
    if (!roomTypeId) {
      throw new Error('Missing room type id');
    }
    const findRoomTypeId = channels_data.mappedChannel.find(m => m.channel_id.toString() === roomTypeId);

    const room_type = calendar_data.roomsInfo.find(room => room.id.toString() === findRoomTypeId.ir_id);
    if (!room_type) {
      throw new Error('Invalid Room type');
    }
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
    const findRoomTypeId = channels_data.mappedChannel.find(m => m.channel_id.toString() === roomTypeId);
    if (!findRoomTypeId) {
      throw new Error('Invalid room type id');
    }
    const selectedRoomType = calendar_data.roomsInfo.find(room => room.id.toString() === findRoomTypeId.ir_id);
    return selectedRoomType.rateplans
      .filter(rate_plan => channels_data.mappedChannel.find(r => rate_plan.id.toString() === r.ir_id) === undefined)
      .map(rate_plan => ({
        id: rate_plan.id.toString(),
        name: rate_plan.name,
      }));
  }
}

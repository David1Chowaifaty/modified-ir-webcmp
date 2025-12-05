import type { RatePlanDetail, RoomDetail } from '@/models/IBooking';
import type { IMap } from '@/models/calendarData';
import calendar_data from '@/stores/calendar-data';
import channels_data from '@/stores/channel.store';

export class IrMappingService {
  public removedMapping(ir_id: string, isRoomType: boolean) {
    let selectedChannels = [...channels_data.mappedChannels];
    if (isRoomType) {
      const toBeRemovedRoomType = calendar_data.roomsInfo.find(room => room.id.toString() === ir_id);
      selectedChannels = selectedChannels.filter(c => toBeRemovedRoomType.rateplans.find(rate_plan => rate_plan.id.toString() === c.ir_id) === undefined);
    }
    channels_data.mappedChannels = selectedChannels.filter(c => c.ir_id !== ir_id);
  }
  public checkMappingExists(id: string, isRoomType: boolean, roomTypeId?: string) {
    const channelId = id.toString();
    const parentChannelId = roomTypeId?.toString();

    if (isRoomType) {
      const mappedRoomType = channels_data.mappedChannels.find(mapping => mapping.type === 'room_type' && mapping.channel_id.toString() === channelId);

      if (!mappedRoomType) {
        return { hide: false, result: undefined, occupancy: undefined };
      }

      const room = calendar_data.roomsInfo.find(roomInfo => roomInfo.id.toString() === mappedRoomType.ir_id);
      if (!room) {
        throw new Error('Invalid Room type');
      }
      return { hide: false, occupancy: room.occupancy_default.adult_nbr, result: room };
    }

    if (!parentChannelId) {
      throw new Error('Missing room type id');
    }

    const parentMapping = channels_data.mappedChannels.find(mapping => mapping.type === 'room_type' && mapping.channel_id.toString() === parentChannelId);
    if (!parentMapping) {
      return { hide: true, result: undefined, occupancy: undefined };
    }

    const parentRoom = calendar_data.roomsInfo.find(roomInfo => roomInfo.id.toString() === parentMapping.ir_id);
    if (!parentRoom) {
      throw new Error('Invalid Room type');
    }

    let matchedContext: RatePlanContext | undefined;
    for (const mapping of channels_data.mappedChannels) {
      if (mapping.type !== 'rate_plan' || mapping.channel_id.toString() !== channelId) {
        continue;
      }
      const context = this.resolveRatePlanContext(mapping);
      if (context && context.parentChannelId === parentChannelId) {
        matchedContext = context;
        break;
      }
    }

    if (!matchedContext) {
      return { hide: false, result: undefined, occupancy: undefined };
    }

    if (matchedContext.room.id.toString() !== parentRoom.id.toString()) {
      return { hide: false, result: undefined, occupancy: undefined };
    }

    return {
      hide: false,
      occupancy: parentRoom.occupancy_default.adult_nbr,
      result: matchedContext.ratePlan,
    };
  }
  private resolveRatePlanContext(ratePlanMapping: IMap): RatePlanContext | undefined {
    if (ratePlanMapping.type !== 'rate_plan') {
      return undefined;
    }
    const room = calendar_data.roomsInfo.find(roomInfo => roomInfo.rateplans.some(ratePlan => ratePlan.id.toString() === ratePlanMapping.ir_id));
    if (!room) {
      return undefined;
    }
    const ratePlan = room.rateplans.find(rp => rp.id.toString() === ratePlanMapping.ir_id);
    if (!ratePlan) {
      return undefined;
    }
    const parentMapping = channels_data.mappedChannels.find(mapping => mapping.type === 'room_type' && mapping.ir_id === room.id.toString());
    return {
      room,
      ratePlan,
      parentChannelId: parentMapping?.channel_id?.toString(),
    };
  }
  // public checkMappingExists(id: string, isRoomType: boolean, roomTypeId?: string) {
  //   const mapped_id = channels_data.mappedChannels.find(m => m.channel_id === id);
  //   if (!mapped_id) {
  //     if (!isRoomType) {
  //       const matchingRoomType = channels_data.mappedChannels.find(m => m.channel_id.toString() === roomTypeId);
  //       if (!matchingRoomType) {
  //         return { hide: true, result: undefined, occupancy: undefined };
  //       }
  //     }
  //     return { hide: false, result: undefined, occupancy: undefined };
  //   }
  //   if (isRoomType) {
  //     const room_type = calendar_data.roomsInfo.find(room => room.id.toString() === mapped_id.ir_id);
  //     return { hide: false, occupancy: room_type.occupancy_default.adult_nbr, result: room_type };
  //   }
  //   if (!roomTypeId) {
  //     throw new Error('Missing room type id');
  //   }
  //   const matchingRoomType = channels_data.mappedChannels.find(m => m.channel_id.toString() === roomTypeId);
  //   const room_type = calendar_data.roomsInfo.find(room => room.id.toString() === matchingRoomType.ir_id);
  //   if (!room_type) {
  //     throw new Error('Invalid Room type');
  //   }
  //   return { hide: false, occupancy: room_type.occupancy_default.adult_nbr, result: room_type.rateplans.find(r => r.id.toString() === mapped_id.ir_id) };
  // }
  public getAppropriateRooms(isRoomType: boolean, roomTypeId?: string) {
    if (isRoomType) {
      const filteredRoomTypes = calendar_data.roomsInfo.filter(
        room => channels_data.mappedChannels.find(m => m.ir_id.toString() === room.id.toString()) === undefined && room.is_active,
      );
      return filteredRoomTypes.map(room => ({ id: room.id.toString(), name: room.name, occupancy: room.occupancy_default.adult_nbr }));
    }
    if (!roomTypeId) {
      throw new Error('Missing roomType id');
    }
    const matchingRoomType = channels_data.mappedChannels.find(m => m.channel_id.toString() === roomTypeId);
    if (!matchingRoomType) {
      throw new Error('Invalid room type id');
    }
    const selectedRoomType = calendar_data.roomsInfo.find(room => room.id.toString() === matchingRoomType.ir_id);
    return selectedRoomType.rateplans
      .filter(rate_plan => channels_data.mappedChannels.find(r => rate_plan.id.toString() === r.ir_id) === undefined && rate_plan['is_active'])
      .map(rate_plan => ({
        id: rate_plan.id.toString(),
        name: `${rate_plan['short_name']} ${rate_plan['is_non_refundable'] ? 'Non-refundable' : ''}`,
        occupancy: selectedRoomType.occupancy_default.adult_nbr,
      }));
  }
}

type RatePlanContext = {
  room: RoomDetail;
  ratePlan: RatePlanDetail;
  parentChannelId?: string;
};

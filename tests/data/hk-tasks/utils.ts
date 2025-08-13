function transformProperty(roomtypes) {
  const result: any[] = [];
  for (const room of roomtypes) {
    for (const unit of room.physicalrooms) {
      if (!unit['is_active']) {
        continue;
      }
      result.push({
        room: unit.name,
        total: 0,
        statuses: {
          INHOUSE: [],
          VACANT: [],
          TURNOVER: [],
          CHECKIN: [],
          CHECKOUT: [],
          BLOCKED: [],
        },
      });
    }
  }
  return result;
}

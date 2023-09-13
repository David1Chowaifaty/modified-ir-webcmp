export const MappingModal: RoomType[] = [
  {
    id: '1',
    name: 'Room Type 1',
    value: 'RT1',
    roomCapacity: 2,
    mapped: 'notMapped',
    mappedId: '',
    mappedName: '',
    ratePlans: [
      {
        id: '1',
        name: 'Rate Plan 1',
        value: '1RP1',
        price: '100',
        mapped: 'notMapped',
        mappedId: '',
        mappedName: '',
      },
      {
        id: '2',
        name: 'Rate Plan 2',
        value: '1RP2',
        price: '200',
        mapped: 'notMapped',
        mappedId: '',
        mappedName: '',
      },
    ],
  },
  {
    id: '2',
    name: 'Room Type 2',
    roomCapacity: 4,
    value: 'RT2',
    mapped: 'notMapped',
    mappedId: '',
    mappedName: '',
    ratePlans: [
      {
        id: '1',
        name: 'Rate Plan 1',
        value: '2RP1',
        price: '100',
        mapped: 'notMapped',
        mappedId: '',
        mappedName: '',
      },
      {
        id: '2',
        name: 'Rate Plan 2',
        price: '200',
        value: '2RP2',
        mapped: 'notMapped',
        mappedId: '',
        mappedName: '',
      },
    ],
  },
  {
    id: '3',
    name: 'Room Type 3',
    roomCapacity: 5,
    value: 'RT3',
    mapped: 'notMapped',
    mappedId: '',
    mappedName: '',
    ratePlans: [
      {
        id: '1',
        name: 'Rate Plan 1',
        price: '100',
        value: '3RP1',
        mapped: 'notMapped',
        mappedId: '',
        mappedName: '',
      },
      {
        id: '2',
        name: 'Rate Plan 2',
        price: '200',
        value: '3RP2',
        mapped: 'notMapped',
        mappedId: '',
        mappedName: '',
      },
    ],
  },
];

export const Map: RoomType[] = [
  {
    id: '1',
    name: 'Map Room Type 1',
    value: 'RT1',
    roomCapacity: 2,
    ratePlans: [
      {
        id: 'MAPROOOMTYPE1_1',
        name: 'Rate Plan Type 1 Type 1',
        value: '1RP1',
        price: '100',
      },
      {
        id: 'MAPROOMTYPE1_2',
        name: 'Rate Plan Type 1 Type 2',
        value: '1RP2',
        price: '200',
      },
    ],
  },
  {
    id: '2',
    name: 'Map Room Type 2',
    value: 'RT2',
    roomCapacity: 4,
    ratePlans: [
      {
        id: 'MAPROOMTYPE2_1',
        name: 'Rate Plan Type 2 Type 1',
        value: '2RP1',
        price: '100',
      },
      {
        id: 'MAPROOMTYPE2_2',
        name: 'Rate Plan Type 2 Type 2',
        value: '2RP2',
        price: '200',
      },
    ],
  },
  {
    id: '3',
    name: 'Map Room Type 3',
    value: 'RT3',
    roomCapacity: 5,
    ratePlans: [
      {
        id: 'MAPROOMTYPE3_1',
        name: 'Rate Plan Type 3 Type 1',
        value: '3RP1',
        price: '100',
      },
      {
        id: 'MAPROOMTYPE3_2',
        name: 'Rate Plan Type 3 Type 2',
        value: '3RP2',
        price: '200',
      },
    ],
  },
];

export class ChannelManager {
  id: string = '';
  //group: string = '';
  title: string = '';
  channel: string = '';
  property: string = '';
  hotelId: string = null;
  status: 'Active' | 'Disabled' = 'Disabled';
  minimumStay: string = '';
  RoomsMapping: RoomType[] = [];
}

export class RoomType {
  id: string;
  name: string;
  value: any;
  roomCapacity: number;
  mapped?: 'notMapped' | 'mapping' | 'mapped';
  mappedId?: string;
  mappedName?: string;
  ratePlans: RatePlan[];
  selectedPlans?: any[] = [];
}

export class RatePlan {
  id: string;
  name: string;
  value: any;
  price: string;
  mapped?: 'notMapped' | 'mapping' | 'mapped';
  mappedId?: string;
  mappedName?: string;
}

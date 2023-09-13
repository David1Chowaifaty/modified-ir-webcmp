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
  id: string = null;
  group: string = null;
  title: string = null;
  property: string = null;
  hotelId: string = null;
  minimumStay: number = null;
  RoomsMapping: RoomType[] = null;
}

export class RoomType {
  id: string;
  name: string;
  value: string;
  roomCapacity: number;
  mapped?: 'notMapped' | 'mapping' | 'mapped';
  mappedId?: string;
  mappedName?: string;
  ratePlans: RatePlan[];
}

export class RatePlan {
  id: string;
  name: string;
  value: string;
  price: string;
  mapped?: 'notMapped' | 'mapping' | 'mapped';
  mappedId?: string;
  mappedName?: string;
}

// OLD
// {/* <div class="col-12 mb-1">
//             <div class="row mb-1">
//               <div class="col-6 d-flex justify-content-between align-items-center">
//                 Room Type 1<ir-icon icon="la la-long-arrow-right"></ir-icon>
//               </div>
//               <div class="col-6">
//                 <select class="form-control form-control-sm"></select>
//               </div>
//             </div>

//           </div>
//           <div class="col-12 mb-1">
//             <div class="row mb-1">
//               <div class="col-6 d-flex justify-content-between align-items-center">
//                 Room Type 1<ir-icon icon="la la-long-arrow-right"></ir-icon>
//               </div>
//               <div class="col-6">
//                 <div class="text-danger">Not Mapped</div>
//               </div>
//             </div>
//             <div class="col-12">
//               <div class="row ">
//                 <div class="col-6 d-flex justify-content-between align-items-center">
//                   <div>
//                     Service Type<ir-icon icon="ft-user"></ir-icon>2
//                   </div>
//                   <ir-icon icon="la la-long-arrow-right"></ir-icon>
//                 </div>
//                 <div class="col-6 d-flex justify-content-between">
//                   <div class="text-primary">
//                     Premium Suites <ir-icon icon="ft-user"></ir-icon>2
//                   </div>
//                   <ir-icon icon="text-primary ft-trash"></ir-icon>
//                 </div>
//               </div>
//             </div>
//           </div> */}

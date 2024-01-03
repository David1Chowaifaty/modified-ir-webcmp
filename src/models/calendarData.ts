import { RoomDetail, STATUS } from "./IBooking";
import { TAdultChildConstraints } from "./igl-book-property";

export interface CalendarDataDetails{
    adultChildConstraints:TAdultChildConstraints;
    allowedBookingSources:IAllowedBookingSources[];
    currency:ICurrency;
    endingDate:number;
    formattedLegendData:IFormattedLegendData;
    is_vacation_rental:boolean;
    legendData:ILegendData[];
    roomsInfo:RoomDetail[];
    startingDate:number;
    language:string;
    toBeAssignedEvents:[]
}
export interface IAllowedBookingSources{
    code:string;
    description:string;
    id:string;
    tag:string;
    type:string;
}
export interface ICurrency{
    code:string;
    id:number;
}
export interface IFormattedLegendData{
   legendData:ILegendData[];
   statusId:Record<STATUS,IStatusName>;
}
export interface ILegendData{
    color:string;
    design:string;
    id:string;
    name:string;
}
export interface IStatusName{
id:number;
clsName:string;
}


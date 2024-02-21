import { IsNotEmpty, IsNumber, IsArray, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class ParkingLotDto {
    @IsNotEmpty()
    name: string;
  
    @IsNumber()
    totalFloors: number;
  
    @IsArray()
    @ArrayMinSize(4, { message: 'floorConfig must have at least 4 elements' })
    @ArrayMaxSize(4, { message: 'floorConfig must have at most 4 elements' })
    floorConfig: string[];
}

export class AllocateSlotDto {
    @IsNotEmpty()
    carType: string;
}

export class DeallocateSlotDto {
    @IsNotEmpty()
    slotNumber: string;
}
import { Controller, Get, Post, Query, BadRequestException, Body, Delete } from '@nestjs/common';
import { AppService } from './app.service';
import { ParkingLotDto, AllocateSlotDto } from './app.dto';

@Controller("api/1")
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Post("/parking-lots")
  async onboardParkingLot(@Body() parkingLotDto: ParkingLotDto): Promise<any> {
    try {
      const result = await this.appService.onboardParkingLot(parkingLotDto);
      return { success: true, data: result };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post("/slots/allocate")
  async allocateSlot(@Body() allocateSlotDto: AllocateSlotDto): Promise<any> {
    try {
      const slotNumber = await this.appService.allocateSlot(allocateSlotDto.carType);
      return { success: true, data: { slotNumber } };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete("/slots/deallocate/:slotNumber")
  async deallocateSlot(@Query('slotNumber') slotNumber: string): Promise<any> {
    try {
      await this.appService.deallocateSlot(slotNumber);
      return { success: true, data: { message: 'Slot freed successfully' } };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Get("/slots")
  async getAvailableSlots(): Promise<any> {
    try {     
      const availableSlots = await this.appService.getAvailableSlots();
      
      return { success: true, data: { availableSlots } };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ParkingLot, Slot, Floor } from './app.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MongoRepository, MoreThan } from 'typeorm';
import { ParkingLotDto } from './app.dto';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(ParkingLot)
    private readonly parkingLotRepository: Repository<ParkingLot>,
    @InjectRepository(Floor)
    private readonly floorRepository: Repository<Floor>,
    @InjectRepository(Slot)
    private readonly slotRepository: Repository<Slot>,
  ) { }

  async onboardParkingLot(parkingLotDto: ParkingLotDto): Promise<ParkingLot> {
    const { name, totalFloors, floorConfig } = parkingLotDto;

    const parkingLot = new ParkingLot();
    parkingLot.name = name;
    parkingLot.total_floors = totalFloors;

    const savedParkingLot = await this.parkingLotRepository.save(parkingLot);

    for (let floorNumber = 1; floorNumber <= totalFloors; floorNumber++) {
      const floor = new Floor();
      floor.floorNumber = floorNumber;
      floor.parking_lot_id = savedParkingLot;

      await this.floorRepository.save(floor);

      for (const config of floorConfig) {
        const slot = new Slot();
        slot.size = (config as any).size;
        slot.no_of_slots = (config as any).spaces;
        slot.floor = floor;

        await this.slotRepository.save(slot);
      }
    }

    return savedParkingLot;
  }


  async allocateSlot(carType: string): Promise<string> {
    const parkingLot = await this.parkingLotRepository.find();
    if (!parkingLot) {
      throw new NotFoundException("Parking lot not found");
    }
    const floors = await this.floorRepository.find({ where: { parking_lot_id: parkingLot } });

    for (const floor of floors) {
      const slots = await this.slotRepository.find({
        where: { floor: { floorNumber: floor.floorNumber }, size: carType, no_of_slots: MoreThan(0) },
      });
      if (slots.length > 0) {
        const allocatedSlot = slots[0];
        allocatedSlot.no_of_slots--;

        await this.slotRepository.save(allocatedSlot);
        return `${floor.floorNumber}:${allocatedSlot.slot_id}`;
      }
    }

    throw new NotFoundException("No available slot for this car type");
  }


  async deallocateSlot(slotNumber: string): Promise<void> {
    const [floorNumber, slotId] = slotNumber.split(':');

    const floor = await this.floorRepository.findOne({ where: { floorNumber: +floorNumber } });
    if (!floor) {
      throw new NotFoundException("Floor not found");
    }

    const slot = await this.slotRepository.findOne({ where: { slot_id: +slotId, floor: floor } });
    if (!slot) {
      throw new NotFoundException("Slot not found");
    }

    slot.no_of_slots++;

    await this.slotRepository.save(slot);
  }

  async getAvailableSlots(): Promise<any> {
    try {
      const parkingLots = await this.parkingLotRepository.find();

      if (!parkingLots || parkingLots.length === 0) {
        throw new NotFoundException("Parking lot not found");
      }

      const result = await Promise.all(parkingLots.map(async (parkingLot) => {
        const floors = await this.floorRepository.find({ where: { parking_lot_id: parkingLot } });
        const availableSlots = [];

        for (const floor of floors) {
          const slots = await this.slotRepository.find({ where: { floor: floor, no_of_slots: MoreThan(0) } });
          availableSlots.push({
            floorNumber: floor.floorNumber,
            slots: slots.map(s => ({ id: s.slot_id, size: s.size, available: s.no_of_slots })),
          });
        }

        return { parkingLotName: parkingLot.name, floors: availableSlots };
      }));

      return { success: true, data: result };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}

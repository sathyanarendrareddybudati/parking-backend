import { Entity, Column, ObjectIdColumn, PrimaryColumn, PrimaryGeneratedColumn, OneToMany, ManyToOne } from "typeorm";


@Entity()
export class ParkingLot {

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    total_floors: number

    @OneToMany(() => Floor, floor => floor.parking_lot_id)
    floors: Floor[];

}


@Entity()
export class Floor {

    @PrimaryGeneratedColumn()
    floor_id: number

    @Column()
    floorNumber: number;

    @ManyToOne(() => ParkingLot, parking_lot => parking_lot.floors)
    parking_lot_id: ParkingLot;

    @OneToMany(() => Slot, slot => slot.floor, { cascade: true })
    slots: Slot[];
}


@Entity()
export class Slot {

    @PrimaryGeneratedColumn()
    slot_id: number

    @Column()
    size: string

    @Column()
    no_of_slots: number

    @ManyToOne(() => Floor, floor => floor.slots)
    floor: Floor;
}
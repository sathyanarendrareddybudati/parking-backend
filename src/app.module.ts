import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ParkingLot, Floor, Slot } from './app.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        type: "mysql",
        host : configService.get("LOCAL_DB_HOST"),
        port: 18815,
        username: configService.get("LOCAL_DB_USER"),
        password: configService.get("LOCAL_DB_PASSWORD"),
        database: configService.get("LOCAL_DB_NAME"),
        entities: [ParkingLot, Floor, Slot],
        // logging: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([ParkingLot, Floor, Slot]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

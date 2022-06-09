import { Module } from '@nestjs/common';
import { LocationService } from 'src/modules/location/location.service';
import { LocationController } from 'src/modules/location/location.controller';

@Module({
  providers: [LocationService],
  controllers: [LocationController],
})
export class LocationModule {}

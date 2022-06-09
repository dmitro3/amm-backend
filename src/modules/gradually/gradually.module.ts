import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraduallyController } from 'src/modules/gradually/gradually.controller';
import { GraduallyService } from 'src/modules/gradually/gradually.service';
import { GraduallyRepository } from 'src/models/repositories/gradually.respository';

@Module({
  imports: [
    TypeOrmModule.forFeature([GraduallyRepository], 'master'),
    TypeOrmModule.forFeature([GraduallyRepository], 'report'),
  ],
  controllers: [GraduallyController],
  providers: [GraduallyService],
  exports: [GraduallyService, TypeOrmModule],
})
export class GraduallyModule {}

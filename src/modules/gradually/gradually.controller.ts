import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { GraduallyService } from 'src/modules/gradually/gradually.service';
import { GraduallyEntity } from 'src/models/entities/gradually.entity';
import { CreateGraduallyDto } from 'src/modules/gradually/dto/create-gradually.dto';
import { SearchGraduallyDto } from 'src/modules/gradually/dto/search-gradually.dto';
import { Response } from 'src/shares/interceptors/response.interceptor';

@Controller('gradually')
@ApiTags('Gradually')
export class GraduallyController {
  constructor(private readonly graduallyService: GraduallyService) {}

  @Post()
  async createUpdate(@Body() createGraduallyDto: CreateGraduallyDto): Promise<GraduallyEntity> {
    return await this.graduallyService.createUpdate(createGraduallyDto);
  }

  @Get()
  async get(@Query() search: SearchGraduallyDto): Promise<Response<Partial<GraduallyEntity[]>>> {
    return await this.graduallyService.get(search);
  }

  @Delete(':pool_address')
  async delete(@Param() param: { pool_address: string }): Promise<boolean> {
    return await this.graduallyService.delete(param.pool_address);
  }
}

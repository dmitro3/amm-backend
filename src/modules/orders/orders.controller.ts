import { BadRequestException, Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { OrdersService } from 'src/modules/orders/orders.service';
import { CreateOrderDto } from 'src/modules/orders/dto/create_order.dto';
import { ErrorCode } from 'src/shares/constants/errors.constant';
import { I18nLang, I18nService } from 'nestjs-i18n';
import { SearchOrderDto } from 'src/modules/orders/dto/search_order.dto';
import { Roles } from 'src/modules/roles/roles.decorator';
import { Role } from 'src/modules/roles/enums/role.enum';
import { OrderEntity } from 'src/models/entities/order.entity';
import { UserID } from 'src/shares/decorators/get-user-id.decorator';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/roles/roles.guard';
import { PaginationInput } from 'src/shares/pagination/pagination.dto';
import { SearchBalancesInOrderDto } from 'src/modules/orders/dto/balances-in-order.dto';
import { BalancesInOrderRes } from 'src/modules/orders/dto/res-balances.dto';

@Controller('order')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Order')
@ApiBearerAuth()
export class OrdersController {
  constructor(private readonly orderService: OrdersService, private readonly i18n: I18nService) {}

  @ApiOperation({
    description: 'Create new orders',
  })
  @Post()
  create(@Body() createOrderDto: CreateOrderDto, @UserID() id: number): Promise<OrderEntity> {
    createOrderDto.user_id = id;
    return this.orderService.create(createOrderDto);
  }

  @ApiOperation({
    description: 'Cancel an order',
  })
  @Put(':id/cancel')
  cancelOrder(@Param() param: { id }, @UserID() userIdCreated: number): Promise<OrderEntity> {
    return this.orderService.pushCancelOrder(param.id, userIdCreated);
  }

  @ApiOperation({
    description: 'Get list orders',
  })
  @Get('/list')
  async getListOrders(
    @Query() { page, limit }: PaginationInput,
    @Query() searchOrderDto: SearchOrderDto,
    @UserID() userId: number,
  ): Promise<{ data; metadata }> {
    searchOrderDto.userId = userId;
    return await this.orderService.getListOrders(searchOrderDto, page, limit);
  }

  @ApiOperation({
    description: 'Get balances in order by wallet',
    summary: 'get balances in order',
  })
  @Get('/balances-in-order')
  async getBalancesInOrders(
    @UserID() userId: number,
    @Query() { wallet }: SearchBalancesInOrderDto,
  ): Promise<BalancesInOrderRes[]> {
    return await this.orderService.getBalancesInOrders(userId, wallet);
  }

  // TODO:
  @ApiOperation({
    description: 'Throw an error (sample)',
  })
  @Roles(Role.SuperAdmin)
  @Get('error')
  throwNewError(): BadRequestException {
    throw new BadRequestException({ code: ErrorCode.ValidationFailed, message: 'an example message' });
  }

  @ApiOperation({
    description: 'Try i18n',
  })
  @Get('lang')
  // eslint-disable-next-line
  tryI18n(@I18nLang() lang: string): Promise<any> {
    return this.i18n.translate('user.HELLO_MESSAGE', {
      lang,
      args: { username: 'FCXv2' },
    });
  }
}

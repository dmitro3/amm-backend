import { Body, Controller, Get, Put, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationService } from 'src/modules/notifications/notification.service';
import { JwtAuthGuard } from 'src/modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/modules/roles/roles.guard';
import { UserID } from 'src/shares/decorators/get-user-id.decorator';
import { SearchNotificationDto } from 'src/modules/notifications/dto/search-notification.dto';
import { NotificationsWithStatus } from 'src/modules/notifications/dto/notifications-with-status.dto';
import { NotificationStatusTypeUpdate } from 'src/models/entities/notification_status.entity';
import { Response } from 'src/shares/interceptors/response.interceptor';

@Controller('notification')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiOperation({
    description: 'Count number of notification not read',
  })
  @Get('count-not-read')
  async count(@UserID() userId: number): Promise<number> {
    return await this.notificationService.countNotificationNotRead(userId);
  }

  @ApiOperation({
    description: 'Get show notification',
  })
  @Get('system')
  async getSystemNotification(
    @Query() searchNotificationDto: SearchNotificationDto,
    @UserID() userId: number,
  ): Promise<Response<Partial<NotificationsWithStatus[]>>> {
    return await this.notificationService.getSystemNotification(
      userId,
      searchNotificationDto,
      searchNotificationDto.page,
      searchNotificationDto.size,
    );
  }

  @ApiOperation({
    description: 'Get notifications of current user',
  })
  @Get()
  async get(
    @Query() searchNotificationDto: SearchNotificationDto,
    @UserID() id: number,
  ): Promise<Response<Partial<NotificationsWithStatus[]>>> {
    return await this.notificationService.getOwnNotifications(
      id,
      searchNotificationDto,
      searchNotificationDto.page,
      searchNotificationDto.size,
    );
  }

  @ApiOperation({
    description: 'Set a notification as read when user click',
  })
  @Put('read')
  async setNotificationRead(@Body() param: { ids: [] }, @UserID() id: number): Promise<boolean> {
    return await this.notificationService.setNotificationsStatus(param.ids, id, NotificationStatusTypeUpdate.Read);
  }

  @ApiOperation({
    description: 'Delete notification',
  })
  @Put('trash')
  async setNotificationToTrash(@Body() param: { ids: [] }, @UserID() id: number): Promise<boolean> {
    return await this.notificationService.setNotificationsStatus(param.ids, id, NotificationStatusTypeUpdate.Trash);
  }

  @ApiOperation({
    description: 'Hide notification',
  })
  @Put('hide')
  async hideSystemNotification(@Body() param: { id: number }, @UserID() id: number): Promise<boolean> {
    return await this.notificationService.setNotificationsStatus([param.id], id, NotificationStatusTypeUpdate.Hide);
  }
}

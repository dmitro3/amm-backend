import { HttpException } from '@nestjs/common';
import { CRON_ERROR_CODE } from 'src/shares/constants/constant';

export class CronException extends HttpException {
  constructor(message: string) {
    super(message, CRON_ERROR_CODE);
  }
}

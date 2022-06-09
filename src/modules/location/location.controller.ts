import geoip from 'geoip-lite-country-only';
import { Controller, Get, Request } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('location')
@ApiTags('Location')
export class LocationController {
  @Get('region-code')
  @ApiOperation({
    description: `Api lấy country code iso2 từ địa chỉ ip người dùng`,
  })
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async getCountryPhoneCode(@Request() req): Promise<string> {
    const userIP = req.connection.remoteAddress.toString();
    const geo = geoip.lookup(userIP);
    return geo || 'vn';
  }
}

// eslint-disable-next-line
const Web3 = require('web3');
import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { UserWallet } from 'src/models/entities/user-wallet.entity';
import { UserOptionalDto } from 'src/modules/admin/dto/user-optional.dto';
import { UpdateWalletDto } from 'src/modules/wallets/dto/update-wallet.dto';
import { UserID } from 'src/shares/decorators/get-user-id.decorator';
import { WalletStatus } from 'src/modules/wallets/enums/wallet.enum';
import { CreateUserWalletDto } from 'src/modules/wallets/dto/user-wallet.dto';
import { WalletService } from 'src/modules/wallets/wallet.service';
import { Response } from 'src/shares/interceptors/response.interceptor';
import { PaginationInput } from 'src/shares/pagination/pagination.dto';

@Controller('wallet')
@ApiTags('wallet')
@ApiBearerAuth()
export class WalletController {
  constructor(private readonly walletService: WalletService, private readonly i18n: I18nService) {}

  @ApiOperation({
    operationId: 'getAllWallets',
    summary: 'Get all wallets',
    description: 'Get all wallet',
  })
  @Get('/list')
  async findAllWallet(
    @Query() { page, limit }: PaginationInput,
    @Query() optional: UserOptionalDto,
  ): Promise<Response<Partial<UserWallet[]>>> {
    return this.walletService.findAllWallet(page, limit, optional);
  }

  @ApiOperation({
    operationId: 'GetDetailWallet',
    summary: 'Get detail wallet',
    description: 'Get detail wallet',
  })
  @Get(':id')
  async findOneWallet(@Param('id') id: number): Promise<Partial<UserWallet>> {
    return await this.walletService.findOneWallet(id);
  }

  // @ApiOperation({
  //   operationId: 'CreateUserWallet',
  //   summary: 'Create new wallet address',
  //   description: 'Create user wallet',
  // })
  // @ApiBody({
  //   type: UserWallet,
  // })
  // @Post()
  // postWallet(@Body() body: UserWallet[]): Promise<Partial<UserWallet[]>> {
  //   return this.walletService.postWallet(body);
  // }

  // @ApiOperation({
  //   operationId: 'UpdateUserWalletUser',
  //   summary: 'Submit wallet(admin)',
  //   description: 'update status user wallet',
  // })
  // @Put()
  // @ApiBody({
  //   type: UpdateWalletDto,
  // })
  // async updateWallet(@Body() updateWalletDto: UpdateWalletDto): Promise<string> {
  //   await this.walletService.updateWallet(updateWalletDto);
  //   return this.i18n.translate('success', {});
  // }

  @ApiOperation({
    operationId: 'UpdateUserWalletUser',
    summary: 'Submit wallet(user)',
    description: 'update status user wallet for user',
  })
  @Put()
  @ApiBody({
    type: UpdateWalletDto,
  })
  updateUserWallet(
    @Body('id') id: number,
    @Body('address') address: string,
    @UserID() userId: number,
  ): Promise<Partial<UserWallet>> {
    return this.walletService.updateUserWallet(id, address, userId);
  }

  @ApiOperation({
    operationId: 'DeleteUserWallet',
    summary: 'Delete wallet(Admin)',
    description: 'Delete user wallet',
  })
  @Delete(':id')
  deleteWallet(@Param('id') id: number): Promise<Partial<UserWallet>> {
    return this.walletService.deleteWallet(id);
  }

  @ApiOperation({
    operationId: 'Create user wallet',
    summary: 'Create user wallet (user)',
    description: 'Create user wallet',
  })
  // user create
  @Post('/user-create')
  @ApiOperation({
    description: 'Create user wallet, status: 2 - Submit, 3 - Pending ( Admin can see and whitelist )',
  })
  @ApiBody({
    type: CreateUserWalletDto,
  })
  async userCreateWallet(@Body() body: UserWallet, @UserID() id: number): Promise<Partial<UserWallet>> {
    const networkWallet = await this.walletService.checkWalletAddressNetwork(body.address);

    if (![WalletStatus.Pending, WalletStatus.Submit].includes(body.status)) {
      throw new HttpException({ key: 'user-wallet.INVALID_STATUS' }, HttpStatus.BAD_REQUEST);
    }

    const userWallet = {
      ...body,
      user_id: id,
      network: networkWallet,
    };
    return this.walletService.userCreateWallet(userWallet);
  }
}

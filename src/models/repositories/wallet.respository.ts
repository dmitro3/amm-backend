import { HttpException, HttpStatus } from '@nestjs/common';
import { UserWallet } from 'src/models/entities/user-wallet.entity';
import { Response } from 'src/shares/interceptors/response.interceptor';
// import { Response } from 'src/shares/interceptors/response.interceptor';
import { IsActive } from 'src/shares/constants/constant';
import { Brackets, EntityRepository, MoreThan, Repository, UpdateResult } from 'typeorm';
import { UpdateWalletDto } from 'src/modules/wallets/dto/update-wallet.dto';
import { ACTIVE_WALLET, DEFAULT_LIMIT, WalletStatus } from 'src/modules/wallets/enums/wallet.enum';
import { Network } from 'src/shares/enums/network';

@EntityRepository(UserWallet)
export class WalletRepository extends Repository<UserWallet> {
  async findAllWallet(
    page?: number,
    limit?: number,
    user_id?: number,
    user_type?: number,
    network?: string,
    status?: number,
    role?: number,
    create_at_sort?: 'ASC' | 'DESC',
  ): Promise<Response<Partial<UserWallet[]>>> {
    const qb = this.createQueryBuilder('user_wallets')
      .select([
        'user_wallets.id as id',
        'user_wallets.address as address',
        'user_wallets.network as network',
        'user_wallets.status as status',
        'user_wallets.created_at as created_at',
        'users.id as user_id',
        'users.email as user_email',
        'users.user_type as user_type',
      ])
      .innerJoin('users', 'users', 'user_wallets.user_id = users.id');
    if (user_id) {
      qb.andWhere(`user_wallets.user_id LIKE :userId`, { userId: `%${user_id}%` });
    }
    if (user_type || user_type === 0) {
      qb.andWhere(`users.user_type = :user_type`, { user_type });
    }
    if (status) {
      qb.andWhere(`user_wallets.status = :status`, { status });
    }
    if (network) {
      qb.andWhere(`user_wallets.network = :network`, { network });
    }
    if (role || role === 0) {
      qb.andWhere(`users.role = :role`, { role });
    }
    const [rs, total] = await Promise.all([
      qb
        .orderBy('created_at', create_at_sort)
        .limit(limit)
        .offset((page - 1) * limit)
        .getRawMany(),
      qb.getCount(),
    ]);

    return {
      data: rs,
      metadata: {
        page: Number(page),
        limit: Number(limit),
        totalItem: total,
        totalPage: Math.ceil(total / limit),
      },
    };
  }

  async findOneWallet(id: number): Promise<Partial<UserWallet>> {
    const rs = await this.createQueryBuilder('user_wallets')
      .select('*')
      .where('user_wallets.id = :id', { id })
      .getRawOne();
    if (!rs) {
      throw new HttpException({ key: 'user-wallet.WALLET_NOT_EXISTS' }, HttpStatus.BAD_REQUEST);
    }

    return rs;
  }

  async findOneWalletByUserId(id: number, address: string, userId: number): Promise<Partial<UserWallet>> {
    const rs = await this.createQueryBuilder('user_wallets')
      .select('*')
      .where('user_wallets.user_id = :userId', { userId })
      .andWhere(
        new Brackets((qb) => {
          qb.where('user_wallets.id = :id', { id }).orWhere('user_wallets.address = :address', { address });
        }),
      )
      .getRawOne();
    if (!rs) {
      throw new HttpException({ key: 'user-wallet.WALLET_NOT_EXISTS' }, HttpStatus.BAD_REQUEST);
    }

    return rs;
  }

  async findOneByUserWallet(walletAddress: string, userId: number): Promise<UserWallet> {
    return this.findOne({
      where: { address: walletAddress, user_id: userId },
    });
  }

  async findOneWalletByAddress(address: string): Promise<Partial<UserWallet>> {
    const rs = await this.createQueryBuilder('user_wallets')
      .select('*')
      .where('user_wallets.address = :address', { address })
      .getRawOne();
    return rs;
  }

  async findAllWalletByAddress(addresses: Array<string>): Promise<UserWallet[]> {
    const rs = await this.createQueryBuilder('user_wallets')
      .select('*')
      .where('user_wallets.address IN (:address)', { address: addresses })
      .getRawMany();
    return rs;
  }

  async updateWallet(updateWalletDto: UpdateWalletDto): Promise<UpdateResult> {
    if (updateWalletDto.ids.length != 0) {
      return this.createQueryBuilder('user_wallets')
        .update(UserWallet)
        .set({ status: updateWalletDto.status })
        .whereInIds({ id: updateWalletDto.ids })
        .execute();
    }
  }

  // update user wallet for user
  async updateUserWallet(id: number, address: string, userId: number): Promise<Partial<UserWallet>> {
    await this.findOneWalletByUserId(id, address, userId);
    await this.createQueryBuilder('user_wallets')
      .update(UserWallet)
      .set({ status: WalletStatus.Pending })
      .where('user_wallets.user_id = :userId', { userId })
      .andWhere(
        new Brackets((qb) => {
          qb.where('user_wallets.id = :id', { id }).orWhere('user_wallets.address = :address', { address });
        }),
      )
      .execute();

    return await this.findOneWalletByUserId(id, address, userId);
  }

  async deleteWallet(id: number): Promise<Partial<UserWallet>> {
    const rs = await this.findOneWallet(id);
    await this.createQueryBuilder('user_wallets')
      .delete()
      .from(UserWallet)
      .where('user_wallets.id = :id', { id })
      .execute();
    return rs;
  }

  // admin update status wallet address
  async approvedWhiteListAddress({ ids, status }: { ids: number[]; status: number }): Promise<Partial<UserWallet[]>> {
    const rs = await this.createQueryBuilder().where('id IN (:...ids)', { ids }).getRawMany();
    if (rs.length !== ids.length) {
      throw new HttpException({ key: 'user-wallet.WALLET_NOT_EXISTS' }, HttpStatus.BAD_REQUEST);
    }
    await this.createQueryBuilder('user_wallet')
      .update(UserWallet)
      .set({ status })
      .where('user_wallets.id IN (:ids)', { ids })
      .execute();
    return rs;
  }

  async getWalletByUserId(userIds: number[]): Promise<Partial<UserWallet>[]> {
    console.log(userIds);
    return this.createQueryBuilder('user_wallet')
      .select(['user_id', 'address', 'network'])
      .where('status = :status', { status: WalletStatus.Approved })
      .where('is_active =:is_active', { is_active: IsActive.Active })
      .where('user_id IN (:...userIds)', { userIds })
      .getRawMany();
  }

  async getWalletByAddress(address: string): Promise<UserWallet> {
    return await this.findOne({
      where: {
        address: address,
      },
    });
  }

  async getAllWalletApprove(): Promise<UserWallet[]> {
    return this.find({
      where: {
        status: WalletStatus.Approved,
        is_active: ACTIVE_WALLET,
      },
    });
  }

  async getListWalletApprove(fromId: string, limit = DEFAULT_LIMIT): Promise<UserWallet[]> {
    return this.find({
      where: {
        status: WalletStatus.Approved,
        is_active: ACTIVE_WALLET,
        id: MoreThan(fromId),
      },
      take: limit,
      order: {
        id: 'ASC',
      },
    });
  }

  async getListStellarAddressPending(): Promise<UserWallet[]> {
    return await this.find({
      where: {
        status: WalletStatus.Pending,
        network: Network.Stellar,
      },
    });
  }
}

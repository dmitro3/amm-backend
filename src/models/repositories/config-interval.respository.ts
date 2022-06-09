import { EntityRepository, Repository } from 'typeorm';
import { ConfigIntervalEntity, ConfigIntervalType } from 'src/models/entities/config-interval.entity';

@EntityRepository(ConfigIntervalEntity)
export class ConfigIntervalRepository extends Repository<ConfigIntervalEntity> {
  async getVolatilityByUserId(userId: number): Promise<ConfigIntervalEntity> {
    return this.findOne({
      where: {
        user_id: userId,
        type: ConfigIntervalType.Volatility,
      },
    });
  }

  async getConfidenceByUserId(userId: number): Promise<ConfigIntervalEntity> {
    return this.findOne({
      where: {
        user_id: userId,
        type: ConfigIntervalType.Confidence,
      },
    });
  }
}

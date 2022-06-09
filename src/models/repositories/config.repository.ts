import { EntityRepository, Repository } from 'typeorm';
import { ConfigEntity } from 'src/models/entities/config.entity';
@EntityRepository(ConfigEntity)
export class ConfigRepository extends Repository<ConfigEntity> {}

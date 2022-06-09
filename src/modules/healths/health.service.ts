import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { InjectConnection } from '@nestjs/typeorm';

@Injectable()
export class HealthService {
  constructor(
    @InjectConnection('report')
    private reportConnection: Connection,
    @InjectConnection('master')
    private masterConnection: Connection,
  ) {}

  async getHealth(): Promise<string> {
    const query = 'SELECT 1';
    try {
      Promise.all([this.masterConnection.query(query), this.reportConnection.query(query)]);
    } catch (e) {
      console.log(e);
      return 'Failed';
    }
    return 'Success';
  }
}

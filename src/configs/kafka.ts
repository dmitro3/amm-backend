import { Kafka } from 'kafkajs';
import { getConfig } from 'src/configs/index';

export const KAFKA_CONFIG = {
  host: getConfig().get<string>('kafka_host'),
  port: getConfig().get<number>('kafka_port'),
  host2: getConfig().get<string>('kafka_host2'),
  port2: getConfig().get<number>('kafka_port2'),
};

export const kafka = new Kafka({
  clientId: 'fcx',
  brokers: [`${KAFKA_CONFIG.host}:${KAFKA_CONFIG.port}`, `${KAFKA_CONFIG.host2}:${KAFKA_CONFIG.port2}`],
});

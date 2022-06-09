import { kafka } from 'src/configs/kafka';
import { Consumer } from 'kafkajs';

export async function subscribeKafka(group: string, topic: string, fromBeginning = false): Promise<Consumer> {
  const consumer = kafka.consumer({ groupId: group });
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning });
  return consumer;
}

import 'dotenv/config';
import { Queue, Worker } from 'bullmq';

const connection = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: Number(process.env.REDIS_PORT ?? 6379),
};

const queueName = process.env.QUEUE_NAME ?? 'poshpilot-jobs';

const queue = new Queue(queueName, { connection });

void queue.add('bootstrap', { message: 'worker online' });

const worker = new Worker(
  queueName,
  async (job) => {
    console.log(`processing job "${job.name}"`, job.data);
  },
  { connection },
);

worker.on('completed', (job) => {
  console.log(`job ${job.id as string} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`job ${job?.id as string} failed`, err);
});

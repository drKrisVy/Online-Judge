import { Queue } from 'bullmq';
import IORedis from 'ioredis';

// Connect to the local Redis server we just started
const connection = new IORedis({ maxRetriesPerRequest: null });

// Create the Queue
export const submissionQueue = new Queue('submissionQueue', { connection });

console.log("Redis Submission Queue initialized.");
import { Queue } from "bullmq";
import { SHARE_JOB_QUEUE } from "@poshpilot/shared";

const connection = {
  connection: {
    url: process.env.REDIS_URL ?? "redis://127.0.0.1:6379",
  },
};

export const shareQueue = new Queue(SHARE_JOB_QUEUE, connection);

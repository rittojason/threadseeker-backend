import { createStorage, type Storage } from "unstorage";
import redisDriver from "unstorage/drivers/redis";

// Create a singleton Redis storage instance
const redisStorage: Storage = createStorage({
  driver: redisDriver({
    url: process.env.REDIS_URL,
  }),
});

export const useRedis = (): Storage => {
  return redisStorage;
};

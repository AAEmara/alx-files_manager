import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.redisClient = createClient();
    this.isConnected = true;

    this.redisClient.on('error', (err) => {
      this.isConnected = false;
      console.log(err);
    });
    this.redisClient.on('connect', () => {
      this.isConnected = true;
    });

    this.getAsync = promisify(this.redisClient.get)
      .bind(this.redisClient);
    this.setAsync = promisify(this.redisClient.set)
      .bind(this.redisClient);
    this.delAsync = promisify(this.redisClient.del)
      .bind(this.redisClient);
  }

  isAlive() {
    return this.isConnected;
  }

  async get(key) {
    return this.getAsync(key);
  }

  async set(key, value, duration) {
    await this.setAsync(key, value, 'EX', duration);
  }

  async del(key) {
    await this.delAsync(key);
  }
}

const redisClient = new RedisClient();

module.exports = redisClient;

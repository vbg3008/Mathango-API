import { config } from 'dotenv';
import { createClient } from 'redis';
config()
const redisClient = createClient({
    username: process.env.REDIS_USERNAME ||'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_SOCKET,
        port: Number(process.env.REDIS_PORT)
    }
});

redisClient.on('error', err => console.log('Redis Client Error', err));

await redisClient.connect();

await redisClient.set('foo', 'bar');
const result = await redisClient.get('foo');
console.log(result)  // >>> bar

export  {redisClient}
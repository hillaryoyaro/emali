// lib/cache/redis.ts
import Redis from 'ioredis'

const redisUrl = process.env.REDIS_URL // e.g. redis://default:password@host:6379
if (!redisUrl) throw new Error('Missing REDIS_URL env var')

export const redis = new Redis(redisUrl)

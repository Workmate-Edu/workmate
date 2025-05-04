import { LRUCache } from 'lru-cache'
import type { NextApiResponse } from 'next'

export function rateLimit(options?: {
  uniqueTokenPerInterval?: number
  interval?: number
}) {
  const tokenCache = new LRUCache({
    max: options?.uniqueTokenPerInterval || 500,
    ttl: options?.interval || 60000,
  })

  return {
    check: (res: NextApiResponse, limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) as number[]) || [0]
        if (tokenCount[0] === 0) {
          tokenCache.set(token, [1])
        }
        tokenCount[0] += 1

        const currentUsage = tokenCount[0]
        if (currentUsage > limit) {
          return reject()
        }

        tokenCache.set(token, tokenCount)
        return resolve()
      }),
  }
}
